"use server"

import { searchPapers } from "@/lib/paperService"
import { generateResearchAnswer } from "@/lib/aiClient"
import { verifyAuth } from "@/lib/auth-utils"
import { adminDb } from "@/lib/firebase-admin"

export async function askAssistantAction(question: string) {
    try {
        // Step 1: Search for papers (handle rate limiting gracefully)
        let papers: any[] = []
        try {
            papers = await searchPapers(question, 8)
        } catch (searchError: any) {
            console.warn("Paper search failed (likely rate limited):", searchError.message)
            // If Semantic Scholar is rate limited, still try with the question alone
            // Return a helpful message instead of failing entirely
        }

        if (!papers || papers.length === 0) {
            // Try generating an answer without papers
            try {
                const answer = await generateResearchAnswer(question, [])
                return {
                    success: true,
                    answer,
                    sources: [],
                    note: "No papers found via Semantic Scholar (may be rate limited). Answer generated from AI knowledge."
                }
            } catch (aiError: any) {
                console.error("Gemini API Error:", aiError.message || aiError)
                const errorMsg = aiError.message || ''
                if (errorMsg.includes('API_KEY') || errorMsg.includes('API key') || errorMsg.includes('401') || errorMsg.includes('403')) {
                    return { success: false, error: "Gemini API key is invalid or expired. Please update GEMINI_API_KEY in your .env.local file." }
                }
                if (errorMsg.includes('404') || errorMsg.includes('not found')) {
                    return { success: false, error: "Gemini model not found. The AI model may need to be updated." }
                }
                return { success: false, error: "AI service is currently unavailable. Error: " + (aiError.message || 'Unknown error') }
            }
        }

        // Step 2: Generate answer with papers
        const answer = await generateResearchAnswer(question, papers)

        return {
            success: true,
            answer,
            sources: papers
        }
    } catch (error: any) {
        console.error("AI Assistant Server Action Error:", error)
        const errorMsg = error.message || ''
        if (errorMsg.includes('API_KEY') || errorMsg.includes('API key') || errorMsg.includes('401') || errorMsg.includes('403')) {
            return { success: false, error: "Gemini API key is invalid or expired. Please get a new free key from aistudio.google.com/apikey" }
        }
        return {
            success: false,
            error: "Failed to process your question. Error: " + (error.message || 'Unknown server error')
        }
    }
}

export async function savePaperAction(paper: {
    id: string
    title: string
    authors: string[]
    abstract: string | null
    year: number | null
    url: string | null
    source: string
}) {
    try {
        const user = await verifyAuth()
        if (!user || !adminDb) {
            return { success: false, error: "Not authenticated." }
        }

        const docId = `${user.uid}_${paper.id}`

        // Check for duplicates
        const existingDoc = await adminDb.collection('saved_papers').doc(docId).get()
        if (existingDoc.exists) {
            return { success: true, alreadySaved: true }
        }

        // Save paper metadata to papers collection
        await adminDb.collection('papers').doc(paper.id).set({
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            year: paper.year,
            source: paper.source,
            url: paper.url,
            updated_at: new Date()
        }, { merge: true })

        // Save to user's saved_papers
        await adminDb.collection('saved_papers').doc(docId).set({
            user_id: user.uid,
            paper_id: paper.id,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            year: paper.year,
            url: paper.url,
            saved_at: new Date()
        })

        return { success: true }
    } catch (error) {
        console.error("Save Paper Server Action Error:", error)
        return { success: false, error: "Failed to save paper." }
    }
}

export async function unsavePaperAction(paperId: string) {
    try {
        const user = await verifyAuth()
        if (!user || !adminDb) {
            return { success: false, error: "Not authenticated." }
        }

        const docId = `${user.uid}_${paperId}`
        await adminDb.collection('saved_papers').doc(docId).delete()

        return { success: true }
    } catch (error) {
        console.error("Unsave Paper Server Action Error:", error)
        return { success: false, error: "Failed to unsave paper." }
    }
}

export async function checkPaperSavedAction(paperId: string) {
    try {
        const user = await verifyAuth()
        if (!user || !adminDb) {
            return { saved: false }
        }

        const docId = `${user.uid}_${paperId}`
        const doc = await adminDb.collection('saved_papers').doc(docId).get()

        return { saved: doc.exists }
    } catch (error) {
        console.error("Check Paper Saved Error:", error)
        return { saved: false }
    }
}

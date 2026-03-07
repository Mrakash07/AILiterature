import { NextResponse } from 'next/server'
import { generateCitation } from '@/lib/aiClient'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { paper, format } = body // format: 'apa' | 'mla' | 'chicago' | 'ieee'

        if (!paper || !paper.id || !format) {
            return NextResponse.json({ error: 'paper and format are required' }, { status: 400 })
        }

        // Check if citation exists in Firestore (only if adminDb is available)
        if (adminDb) {
            const snapshot = await adminDb.collection('citations').where('paper_id', '==', paper.id).limit(1).get()
            if (!snapshot.empty) {
                const existingCitation = snapshot.docs[0].data()
                if (existingCitation[format]) {
                    return NextResponse.json({ citation: existingCitation[format], format })
                }
            }
        }

        // Generate citation via Gemini
        const citationString = await generateCitation(paper, format)

        // Upsert into Firestore (only if adminDb is available)
        if (adminDb) {
            const citationsRef = adminDb.collection('citations')
            const snapshot = await citationsRef.where('paper_id', '==', paper.id).limit(1).get()
            const upsertData: any = { paper_id: paper.id }
            upsertData[format] = citationString

            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update(upsertData)
            } else {
                await citationsRef.add(upsertData)
            }
        }

        return NextResponse.json({ citation: citationString, format })
    } catch (error: any) {
        console.error('API /api/citation error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

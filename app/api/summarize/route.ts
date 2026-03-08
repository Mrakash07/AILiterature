import { NextResponse } from 'next/server'
import { summarizePaper } from '@/lib/aiClient'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthFromRequest } from '@/lib/auth-utils'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, abstract, paperId } = body

        if (!title || !abstract || !paperId) {
            return NextResponse.json({ error: 'title, abstract, and paperId are required' }, { status: 400 })
        }

        const user = await verifyAuthFromRequest(request)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if summary already exists for this user and paper (only if adminDb is available)
        if (adminDb) {
            const summariesRef = adminDb.collection('summaries')
            const snapshot = await summariesRef
                .where('user_id', '==', user.uid)
                .where('paper_id', '==', paperId)
                .limit(1)
                .get()

            if (!snapshot.empty) {
                const summary = snapshot.docs[0].data() as any
                if (summary.is_mock || summary.objective?.includes('[MOCK]')) {
                    console.log('Found mock summary, deleting it and generating a real one.')
                    await snapshot.docs[0].ref.delete()
                } else {
                    return NextResponse.json({ summary })
                }
            }
        }

        // Generate new summary
        const aiSummary = await summarizePaper(title, abstract)

        // Save to Firestore (only if adminDb is available)
        const summaryData: any = {
            user_id: user.uid,
            paper_id: paperId,
            objective: aiSummary.objective,
            methodology: aiSummary.methodology,
            contributions: aiSummary.contributions,
            findings: aiSummary.findings,
            limitations: aiSummary.limitations,
            future_research: aiSummary.future_research,
            is_mock: !!aiSummary.is_mock,
            created_at: new Date().toISOString()
        }

        if (adminDb) {
            const docRef = await adminDb.collection('summaries').add(summaryData)
            summaryData.id = docRef.id
        } else {
            summaryData.id = 'temp-' + Date.now()
        }

        return NextResponse.json({ summary: summaryData })
    } catch (error: any) {
        console.error('API /api/summarize error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

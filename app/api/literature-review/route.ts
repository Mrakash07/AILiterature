import { NextResponse } from 'next/server'
import { generateLiteratureReview } from '@/lib/aiClient'
import { verifyAuthFromRequest } from '@/lib/auth-utils'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { papers, topic } = body

        if (!papers || papers.length === 0) {
            return NextResponse.json({ error: 'Array of papers is required' }, { status: 400 })
        }

        const user = await verifyAuthFromRequest(request)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Generate literature review markdown
        const reviewMarkdown = await generateLiteratureReview(papers)

        // Return the markdown content directly.
        // Storage of the review can be handled client-side with Firebase Storage if needed.
        return NextResponse.json({
            content: reviewMarkdown,
        })
    } catch (error: any) {
        console.error('API /api/literature-review error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

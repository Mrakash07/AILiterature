import { NextResponse } from 'next/server'
import { searchAndCachePapers } from '@/lib/paperService'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthFromRequest } from '@/lib/auth-utils'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
        const user = await verifyAuthFromRequest(request)
        const papers = await searchAndCachePapers(query, limit, user?.uid, adminDb)
        return NextResponse.json({ papers })
    } catch (error: any) {
        console.error('API /api/search error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

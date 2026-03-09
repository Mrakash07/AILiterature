export const dynamic = "force-dynamic";
import { verifyAuth } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase-admin'
import { ReviewGenerator } from '@/components/literature-review/review-generator'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Literature Review | AI Literature Review',
}

export default async function LiteratureReviewPage() {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    // Fetch papers that the user has summarized
    let savedPapers: any[] = []

    if (user) {
        try {
            const savedPapersSnapshot = await adminDb
                .collection('saved_papers')
                .where('user_id', '==', user.uid)
                .get()

            const paperIds = savedPapersSnapshot.docs.map((doc: any) => doc.data().paper_id).filter(Boolean)

            if (paperIds.length > 0) {
                // Fetch papers in chunks (Firebase limit is 30 for 'in' queries)
                const chunks = []
                for (let i = 0; i < paperIds.length; i += 30) {
                    chunks.push(paperIds.slice(i, i + 30))
                }

                const paperDocs = []
                for (const chunk of chunks) {
                    const snap = await adminDb.collection('papers').where('__name__', 'in', chunk).get()
                    paperDocs.push(...snap.docs)
                }

                savedPapers = paperDocs.map((doc) => {
                    const data = doc.data()
                    return JSON.parse(JSON.stringify({
                        id: doc.id,
                        ...data
                    }))
                })
            }
        } catch (error) {
            console.error('Error fetching literature review papers:', error)
        }
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4 animate-fade-in">
            <div className="flex flex-col space-y-3 pt-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                        Synthesis Engine v2.0
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Literature Review</h1>
                <p className="text-muted-foreground text-lg font-medium max-w-3xl">
                    Select the papers you wish to synthesize. Our AI will generate a comprehensive, structured literature review report based on your library.
                </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-1 shadow-soft border border-gray-50 overflow-hidden">
                <ReviewGenerator savedPapers={savedPapers} />
            </div>
        </div>
    )
}

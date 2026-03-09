export const dynamic = "force-dynamic";
import { verifyAuth } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase-admin'
import { redirect } from 'next/navigation'
import { Bookmark, Search, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PaperCard } from '@/components/search/paper-card'

export const metadata = {
    title: 'Research Library | AI Literature',
}

export default async function SavedPapersPage() {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    let savedPapers: any[] = []

    try {
        if (adminDb) {
            const savedSnapshot = await adminDb
                .collection('saved_papers')
                .where('user_id', '==', user.uid)
                .get()

            const savedItems = savedSnapshot.docs.map((doc: any) => doc.data().paper_id)

            if (savedItems.length > 0) {
                // Sort docs by saved_at descending before mapping
                const sortedDocs = savedSnapshot.docs.sort((a: any, b: any) => {
                    const timeA = a.data().saved_at?.toMillis?.() || 0
                    const timeB = b.data().saved_at?.toMillis?.() || 0
                    return timeB - timeA
                })

                // Map to plain objects (no Timestamp classes which can't be passed to Client Components)
                savedPapers = sortedDocs.map((doc: any) => ({
                    id: doc.data().paper_id || doc.id,
                    title: doc.data().title || 'Untitled Research',
                    authors: doc.data().authors || [],
                    abstract: doc.data().abstract || null,
                    year: doc.data().year || null,
                    source: doc.data().source || 'Database',
                    url: doc.data().url || null,
                }))
            }
        }
    } catch (error) {
        console.error('Error fetching saved papers:', error)
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4 pt-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Research Library</h1>
                        <p className="text-muted-foreground text-lg font-medium mt-2">
                            Manage and organize your curated academic collection.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <Bookmark className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold text-foreground">{savedPapers.length} Saved Papers</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2.5rem] p-12 shadow-soft border border-gray-50 min-h-[600px]">
                {savedPapers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedPapers.map((paper) => (
                            <PaperCard key={paper.id} paper={paper} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center mb-8 text-primary/20">
                            <Bookmark className="h-12 w-12" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-foreground mb-4">Your library is empty</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-10 font-medium">
                            Save papers from your search results to build your personalized research database.
                        </p>
                        <Link href="/search">
                            <button className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                                <Search className="h-5 w-5" /> Explore Academic Papers
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

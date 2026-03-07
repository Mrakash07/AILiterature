import { PaperCard } from '@/components/search/paper-card'
import { SearchBar } from '@/components/search/search-bar'
import { Paper, searchAndCachePapers } from '@/lib/paperService'
import { headers } from 'next/headers'
import { verifyAuth } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase-admin'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Clock, Search as SearchIcon, Layers, Filter, Sparkles, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
    title: 'Research Discovery | AI Literature',
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string; limit?: string }
}) {
    const query = searchParams.q || ''
    const limit = searchParams.limit || '10'
    let papers: Paper[] = []
    let errorStr = ''
    let searchHistory: string[] = []

    try {
        const user = await verifyAuth()

        if (user && adminDb) {
            const historySnapshot = await adminDb
                .collection('search_history')
                .where('user_id', '==', user.uid)
                .limit(30)
                .get()

            if (!historySnapshot.empty) {
                const historyData = historySnapshot.docs
                    .map((doc: any) => ({ id: doc.id, ...doc.data() }))
                    .sort((a: any, b: any) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))

                const queries = historyData.map((d: any) => d.query as string)
                const uniqueQueries = Array.from(new Set(queries))
                searchHistory = uniqueQueries.slice(0, 5) as string[]
            }
        }
    } catch (err) {
        console.error('Failed to fetch search history:', err)
    }

    if (query) {
        try {
            const user = await verifyAuth()
            papers = await searchAndCachePapers(query, parseInt(limit, 10), user?.uid, adminDb)
        } catch (err: any) {
            errorStr = err.message || 'An error occurred fetching papers.'
        }
    }

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto animate-fade-in px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                            Global Research Pulse
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        Research Discovery
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Search across 200M+ academic papers and datasets.
                    </p>
                </div>

            </div>

            {/* Search Input Container */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <SearchBar initialQuery={query} />

                    {searchHistory.length > 0 && !query && (
                        <div className="mt-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Queries</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {searchHistory.map((h, i) => (
                                    <Link key={i} href={`/search?q=${encodeURIComponent(h)}`}>
                                        <Badge variant="secondary" className="bg-primary/5 border-transparent hover:bg-primary/10 transition-all cursor-pointer text-sm py-2 px-5 text-muted-foreground hover:text-primary rounded-full">
                                            {h}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Area */}
            <div className="space-y-8 pt-4">
                {query && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-primary rounded-full" />
                            <div>
                                <h2 className="text-2xl font-extrabold text-foreground">Results for <span className="text-primary">"{query}"</span></h2>
                                <p className="text-sm text-muted-foreground mt-1 font-medium">Success — Academic index synchronized</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-muted-foreground">
                            <Cpu className="h-4 w-4 text-primary" /> {papers.length} Papers Found
                        </div>
                    </div>
                )}

                {errorStr && (
                    <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 text-red-600 flex items-start gap-6">
                        <div className="p-3 rounded-2xl bg-white border border-red-100 shadow-sm shrink-0">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">System Error</h3>
                            <p className="text-sm italic opacity-80">{errorStr}</p>
                        </div>
                    </div>
                )}

                {papers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                        {papers.map((paper, idx) => (
                            <div key={paper.id} style={{ animationDelay: `${idx * 100}ms` }}>
                                <PaperCard paper={paper} />
                            </div>
                        ))}
                    </div>
                ) : query && !errorStr ? (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 shadow-soft">
                        <div className="p-6 rounded-full bg-primary/5 w-20 h-20 flex items-center justify-center mx-auto mb-8">
                            <SearchIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <p className="text-foreground font-bold text-2xl mb-2">No matching results found.</p>
                        <p className="text-muted-foreground font-medium">Please refine your search terms or try a broader query.</p>
                    </div>
                ) : !query && (
                    <div className="py-32 text-center bg-white rounded-[2.5rem] shadow-soft border border-gray-50 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 w-24 h-24 flex items-center justify-center mx-auto mb-10 shadow-xl shadow-primary/20">
                                <Sparkles className="h-12 w-12 text-primary-foreground" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">Initializing Discovery</h2>
                            <p className="max-w-md mx-auto text-muted-foreground text-xl leading-relaxed font-medium mb-12 italic">
                                "Enter a research topic, academic field, or specific keyword above to start your exploration."
                            </p>
                            <div className="flex justify-center gap-12 text-sm font-bold text-muted-foreground uppercase tracking-widest px-8">
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 200M+ Papers</span>
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Global Database</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

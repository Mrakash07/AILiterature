import { verifyAuth } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase-admin'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    FileText,
    Search as SearchIcon,
    Clock,
    ArrowRight,
    Bookmark,
    Sparkles,
    TrendingUp,
    BrainCircuit,
    Cpu,
    Zap
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { PaperCard } from '@/components/search/paper-card'
import { getResearchRecommendations } from '@/lib/aiClient'

export const metadata = {
    title: 'Research Dashboard | AI Literature',
}

export default async function DashboardPage() {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    let searches: any[] = []
    let summaries: any[] = []
    let savedPapers: any[] = []
    let recommendations: any[] = []

    try {
        if (adminDb) {
            // Fetch recent searches
            const searchesSnapshot = await adminDb
                .collection('search_history')
                .where('user_id', '==', user.uid)
                .limit(20) // Fetch more to sort in-mem without index
                .get()

            searches = searchesSnapshot.docs
                .map((doc: any) => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        query: data.query || '',
                        created_at: data.created_at?.seconds ? { seconds: data.created_at.seconds, nanoseconds: data.created_at.nanoseconds } : null
                    }
                })
                .sort((a: any, b: any) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
                .slice(0, 4)

            // Fetch saved papers
            const savedSnapshot = await adminDb
                .collection('saved_papers')
                .where('user_id', '==', user.uid)
                .limit(30) // Increased limit but still safe for 'in'
                .get()

            const savedItems = savedSnapshot.docs.map((doc: any) => doc.data().paper_id).filter(Boolean)
            if (savedItems.length > 0) {
                // Firebase 'in' query limit is 30. For dashboard limit is small, but let's be safe.
                const chunks = []
                for (let i = 0; i < savedItems.length; i += 30) {
                    chunks.push(savedItems.slice(i, i + 30))
                }

                const paperDocs: any[] = []
                for (const chunk of chunks) {
                    const snap = await adminDb.collection('papers').where('__name__', 'in', chunk).get()
                    paperDocs.push(...snap.docs)
                }
                savedPapers = paperDocs.map((doc: any) => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        title: data.title || '',
                        authors: data.authors || [],
                        abstract: data.abstract || null,
                        year: data.year || null,
                        source: data.source || 'Unknown',
                        url: data.url || null
                    }
                })
            }

            // Fetch recent summaries
            const summariesSnapshot = await adminDb
                .collection('summaries')
                .where('user_id', '==', user.uid)
                .limit(20)
                .get()

            const summariesData = summariesSnapshot.docs
                .map((doc: any) => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        paper_id: data.paper_id,
                        user_id: data.user_id,
                        objective: data.objective,
                        methodology: data.methodology,
                        contributions: data.contributions,
                        findings: data.findings,
                        limitations: data.limitations,
                        future_research: data.future_research,
                        created_at: data.created_at?.seconds ? { seconds: data.created_at.seconds, nanoseconds: data.created_at.nanoseconds } : null
                    }
                })
                .sort((a: any, b: any) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
                .slice(0, 3)
            summaries = await Promise.all(summariesData.map(async (s: any) => {
                const paperId = s.paper_id
                if (!paperId || typeof paperId !== 'string') return { ...s, papers: { title: 'Unknown Title' }, displaySummary: s.objective || s.summary || 'Summary unavailable' }

                try {
                    // Sanitize paperId for Firestore (doc IDs cannot have /)
                    // If it has a slash, it's treated as a path. 
                    const paperDoc = await adminDb.collection('papers').doc(paperId).get()
                    const paperData = paperDoc.exists ? paperDoc.data() : { title: 'Unknown Title' }
                    return {
                        ...s,
                        papers: paperData,
                        displaySummary: s.objective || s.summary || 'Summary unavailable'
                    }
                } catch (e) {
                    console.error("Dashboard Summary Fetch Error:", e)
                    return { ...s, papers: { title: 'Unknown Title' }, displaySummary: s.objective || s.summary || 'Summary unavailable' }
                }
            }))

            // Fetch AI Recommendations based on saved papers
            if (savedPapers.length > 0) {
                try {
                    recommendations = await getResearchRecommendations(savedPapers)
                } catch (e) {
                    console.error("AI Recommendation error:", e)
                }
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
    }


    return (
        <div className="space-y-12 animate-fade-in pb-20 px-4 max-w-7xl mx-auto">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                            Research Session Alpha
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        Welcome, {user?.displayName || user?.email?.split('@')[0]?.replace(/[0-9]+$/, '') || 'Researcher'}
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        You have <span className="text-primary font-bold">{summaries.length} active analyses</span> and {savedPapers.length} saved papers.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/search">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                            <SearchIcon className="h-4 w-4" /> New Search
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Actions / Featured Insights */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-border relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <BrainCircuit className="h-20 w-20 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">AI Recommendation</h3>
                        {recommendations.length > 0 ? (
                            <>
                                <p className="text-xl font-bold text-foreground mb-4">{recommendations[0].topic}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                                    "{recommendations[0].reason}"
                                </p>
                                <Link href={`/search?q=${encodeURIComponent(recommendations[0].topic)}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                                    Explore Topic <ArrowRight className="h-3 w-3" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-[#1F2937] mb-4">Discovery Engine</p>
                                <p className="text-sm text-[#6B7C93] leading-relaxed mb-6 italic">
                                    "Save papers to unlock personalized research recommendations."
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-border relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-20 w-20 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Research Trends</h3>
                        <p className="text-xl font-bold text-foreground mb-6">Market Momentum</p>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                "Real-time analysis of global academic velocity."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary rounded-[2.5rem] p-8 shadow-lg shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10 text-primary-foreground">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Quick Synthesis</h3>
                        <p className="text-xl font-bold mb-4">Literature Review</p>
                        <p className="text-sm text-white/80 leading-relaxed mb-8 font-light">
                            Synthesize knowledge across your library and generate structured reviews.
                        </p>
                        <Link href="/literature-review">
                            <button className="w-full py-4 bg-white text-primary rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-1">
                                Create Review
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Saved Papers */}
                    <div className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                    <Bookmark className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-foreground">Saved Papers</h2>
                            </div>
                            <Link href="/saved" className="text-sm font-bold text-primary hover:underline">
                                View Library
                            </Link>
                        </div>

                        {savedPapers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {savedPapers.map((paper) => (
                                    <PaperCard key={paper.id} paper={paper} />
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-border rounded-[2.5rem] py-16 text-center bg-primary/5">
                                <p className="text-muted-foreground font-medium text-lg mb-6">Your research library is empty.</p>
                                <Link href="/search">
                                    <button className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
                                        Discover Research
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Analyses / Summaries */}
                    <div className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-foreground">Recent Analyses</h2>
                        </div>

                        <div className="space-y-6">
                            {summaries.length > 0 ? (
                                summaries.slice(0, 4).map((s) => (
                                    <Link key={s.id} href={`/paper/${s.paper_id}`} className="block group">
                                        <div className="p-6 rounded-2xl bg-primary/5 hover:bg-background border border-transparent hover:border-border hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-start gap-6">
                                                <div className="space-y-2 flex-1">
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{s.papers?.title}</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic font-light">
                                                        "{s.displaySummary}"
                                                    </p>
                                                </div>
                                                <div className="bg-background p-3 rounded-xl border border-border shadow-sm text-primary">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-10 font-medium">No recent analyses found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-12">

                    {/* Recent Searches */}
                    <div className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border">
                        <div className="flex items-center gap-3 mb-8">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">Query History</h2>
                        </div>
                        <div className="space-y-3">
                            {searches.map((search) => (
                                <Link key={search.id} href={`/search?q=${encodeURIComponent(search.query)}`} className="block group">
                                    <div className="px-5 py-4 rounded-xl bg-primary/5 border border-transparent hover:border-primary/20 hover:bg-background transition-all flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground truncate mr-4">
                                            {search.query}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

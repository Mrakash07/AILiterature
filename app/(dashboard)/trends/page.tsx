import { verifyAuth } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import {
    TrendingUp,
    Search as SearchIcon,
    FileText,
    Bookmark,
    BarChart3,
    ArrowLeft,
    Clock,
    Sparkles,
    BookOpen,
    Activity
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Research Trends | AI Literature',
}

export default async function TrendsPage() {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    let totalSearches = 0
    let totalSummaries = 0
    let totalSavedPapers = 0
    let totalReviews = 0
    let recentSearches: any[] = []
    let topSearchedTopics: { topic: string; count: number }[] = []
    let summariesByMonth: { month: string; count: number }[] = []

    try {
        if (adminDb) {
            // Fetch all searches
            const searchesSnapshot = await adminDb
                .collection('search_history')
                .where('user_id', '==', user.uid)
                .get()

            totalSearches = searchesSnapshot.size
            const allSearches = searchesSnapshot.docs.map((doc: any) => {
                const data = doc.data()
                return {
                    query: data.query || '',
                    created_at: data.created_at?.seconds ? data.created_at.seconds : 0
                }
            })

            // Get recent searches (last 5)
            recentSearches = allSearches
                .sort((a: { query: string; created_at: number }, b: { query: string; created_at: number }) => b.created_at - a.created_at)
                .slice(0, 5)

            // Calculate top searched topics
            const topicCounts: Record<string, number> = {}
            allSearches.forEach((s: { query: string; created_at: number }) => {
                const q = s.query.toLowerCase().trim()
                if (q) {
                    topicCounts[q] = (topicCounts[q] || 0) + 1
                }
            })
            topSearchedTopics = Object.entries(topicCounts)
                .map(([topic, count]) => ({ topic, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)

            // Fetch summaries count
            const summariesSnapshot = await adminDb
                .collection('summaries')
                .where('user_id', '==', user.uid)
                .get()
            totalSummaries = summariesSnapshot.size

            // Group summaries by month
            const monthCounts: Record<string, number> = {}
            summariesSnapshot.docs.forEach((doc: any) => {
                const data = doc.data()
                let date: Date | null = null

                if (data.created_at?.seconds) {
                    date = new Date(data.created_at.seconds * 1000)
                } else if (data.created_at && typeof data.created_at === 'string') {
                    date = new Date(data.created_at)
                } else if (data.created_at instanceof Date) {
                    date = data.created_at
                }

                if (date && !isNaN(date.getTime())) {
                    const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
                    monthCounts[key] = (monthCounts[key] || 0) + 1
                }
            })
            summariesByMonth = Object.entries(monthCounts)
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => {
                    const dateA = new Date(a.month)
                    const dateB = new Date(b.month)
                    return dateA.getTime() - dateB.getTime()
                })
                .slice(-6)

            // Fetch saved papers count
            const savedSnapshot = await adminDb
                .collection('saved_papers')
                .where('user_id', '==', user.uid)
                .get()
            totalSavedPapers = savedSnapshot.size

            // Fetch literature reviews count
            const reviewsSnapshot = await adminDb
                .collection('literature_reviews')
                .where('user_id', '==', user.uid)
                .get()
            totalReviews = reviewsSnapshot.size
        }
    } catch (error) {
        console.error('Error fetching analytics:', error)
    }

    const maxTopicCount = topSearchedTopics.length > 0 ? topSearchedTopics[0].count : 1
    const maxMonthCount = summariesByMonth.length > 0 ? Math.max(...summariesByMonth.map(s => s.count)) : 1

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4 pt-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7C93] uppercase tracking-widest hover:text-[#1B5FA7] transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Research Analytics</h1>
                        <p className="text-[#6B7C93] text-lg font-medium mt-2">
                            Your research activity and insights at a glance.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-soft">
                        <Activity className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-bold text-[#1F2937]">{totalSearches + totalSummaries + totalSavedPapers} Total Activities</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Searches', value: totalSearches, icon: SearchIcon, color: '#1B5FA7', bg: '#E6EEF6' },
                    { label: 'Papers Analyzed', value: totalSummaries, icon: FileText, color: '#2C6AA6', bg: '#E6EEF6' },
                    { label: 'Saved Papers', value: totalSavedPapers, icon: Bookmark, color: '#4F8FCC', bg: '#EBF2FA' },
                    { label: 'Literature Reviews', value: totalReviews, icon: BookOpen, color: '#0F4C81', bg: '#E0EAF4' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-soft relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <stat.icon className="h-16 w-16" style={{ color: stat.color }} />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 rounded-xl w-fit mb-6" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-extrabold text-[#1F2937] mb-2">{stat.value}</p>
                            <p className="text-xs font-bold text-[#6B7C93] uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="bg-[#012340] rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1B5FA7]/20 to-transparent pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Top Searched Topics */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2">Top Searched Topics</h2>
                            <p className="text-white/60 font-medium max-w-md">
                                Your most frequently searched research areas.
                            </p>
                        </div>
                        <div className="space-y-5">
                            {topSearchedTopics.length > 0 ? topSearchedTopics.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/50">
                                        <span className="truncate mr-4 normal-case text-white/70 text-sm">{item.topic}</span>
                                        <span className="whitespace-nowrap">{item.count} {item.count === 1 ? 'search' : 'searches'}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#1B5FA7] to-[#4F8FCC] rounded-full transition-all duration-700"
                                            style={{ width: `${(item.count / maxTopicCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-white/40 text-sm italic">No searches yet. Start exploring research papers!</p>
                            )}
                        </div>
                    </div>

                    {/* Analysis Activity */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2">Analysis Activity</h2>
                            <p className="text-white/60 font-medium">
                                Papers analyzed over time.
                            </p>
                        </div>
                        {summariesByMonth.length > 0 ? (
                            <div className="flex items-end gap-4 h-[200px]">
                                {summariesByMonth.map((item, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <span className="text-white/80 text-sm font-bold">{item.count}</span>
                                        <div
                                            className="w-full bg-gradient-to-t from-[#1B5FA7] to-[#4F8FCC] rounded-t-xl transition-all duration-700"
                                            style={{ height: `${(item.count / maxMonthCount) * 160}px`, minHeight: '20px' }}
                                        />
                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{item.month}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-sm">
                                <div className="text-center space-y-4">
                                    <BarChart3 className="h-12 w-12 text-[#1B5FA7] mx-auto" />
                                    <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Analyze papers to see activity</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Search History */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-2 bg-[#F3F7FC] rounded-lg text-[#1B5FA7]">
                        <Clock className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#1F2937]">Recent Searches</h2>
                </div>
                {recentSearches.length > 0 ? (
                    <div className="space-y-3">
                        {recentSearches.map((search, i) => (
                            <Link key={i} href={`/search?q=${encodeURIComponent(search.query)}`} className="block group">
                                <div className="px-6 py-4 rounded-xl bg-[#F3F7FC]/80 border border-transparent hover:border-[#1B5FA7]/20 hover:bg-white transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <SearchIcon className="h-4 w-4 text-[#6B7C93]" />
                                        <span className="text-sm font-bold text-[#6B7C93] group-hover:text-[#1F2937] transition-colors">{search.query}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">
                                        {search.created_at ? new Date(search.created_at * 1000).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-[#6B7C93] text-center py-10 font-medium">No searches yet. Start exploring!</p>
                )}
            </div>
        </div>
    )
}

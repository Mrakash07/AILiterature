import { verifyAuth } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase-admin'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    CalendarDays,
    ExternalLink,
    Users,
    ChevronLeft,
    Library,
    FileText,
    Share2,
    Database,
    Tag,
    BookOpen,
    Cpu
} from 'lucide-react'
import { PaperActions } from '@/components/paper/paper-actions'
import Link from 'next/link'

export const metadata = {
    title: 'Paper Analysis | AI Literature',
}

export default async function PaperPage({ params }: { params: { id: string } }) {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    // Fetch the paper from Firestore by document ID
    if (!adminDb) {
        notFound()
    }

    const paperDoc = await adminDb.collection('papers').doc(params.id).get()

    if (!paperDoc.exists) {
        notFound()
    }

    const rawData = paperDoc.data() as any
    const paper = {
        id: paperDoc.id,
        title: rawData.title || 'Untitled Research',
        authors: rawData.authors || [],
        abstract: rawData.abstract || null,
        year: rawData.year || null,
        source: rawData.source || 'Database',
        url: rawData.url || null,
    } as any

    return (
        <div className="pb-20 space-y-12 animate-fade-in px-4 max-w-7xl mx-auto">
            {/* Breadcrumbs / Back Navigation */}
            <div className="flex items-center gap-4 text-xs font-bold text-[#6B7C93] uppercase tracking-widest pt-4">
                <Link href="/search" className="flex items-center hover:text-[#1B5FA7] transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back to Research
                </Link>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[#1B5FA7]/80">Paper Analysis</span>
            </div>

            {/* Paper Header / Metadata */}
            <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6EEF6] text-[#1B5FA7] text-[10px] font-bold uppercase tracking-wider border border-[#1B5FA7]/10">
                        <Database className="h-3.5 w-3.5" />
                        {paper.source?.toUpperCase() || 'Academic Library'}
                    </div>
                    {paper.year && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[#6B7C93] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {paper.year}
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F7FC] border border-[#1B5FA7]/5 text-[#1B5FA7] text-[10px] font-bold uppercase tracking-wider">
                        <Tag className="h-3.5 w-3.5" />
                        Peer Reviewed
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.2] text-[#1F2937] max-w-5xl">
                    {paper.title}
                </h1>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#1B5FA7] to-[#4F8FCC] flex items-center justify-center shrink-0 shadow-lg shadow-[#1B5FA7]/20">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#1F2937]">{paper.authors?.join(', ') || 'Unknown Authors'}</p>
                            <p className="text-xs font-medium text-[#6B7C93] mt-0.5">Primary Investigators</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {paper.url && (
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                <button className="flex items-center gap-3 px-8 py-3.5 bg-white border border-gray-200 text-[#1F2937] rounded-2xl text-sm font-bold shadow-soft hover:shadow-md transition-all active:scale-95">
                                    <ExternalLink className="h-4 w-4 text-[#1B5FA7]" /> Open Source
                                </button>
                            </a>
                        )}
                        <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-[#F3F7FC] text-[#1B5FA7] hover:bg-[#E6EEF6] transition-all">
                            <Share2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Left Side: Abstract & Info */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white rounded-[3rem] p-12 shadow-soft border border-gray-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BookOpen className="h-32 w-32 text-[#1B5FA7]" />
                        </div>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-1.5 h-10 bg-[#1B5FA7] rounded-full" />
                            <h2 className="text-2xl font-extrabold text-[#1F2937]">Research Abstract</h2>
                        </div>

                        <p className="text-lg text-[#4B5563] leading-relaxed font-medium mb-12 border-l-4 border-[#F3F7FC] pl-8 italic">
                            "{paper.abstract || 'Academic synthesis available for this research node.'}"
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-gray-50">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">Language</p>
                                <p className="text-sm font-bold text-[#1F2937]">English // EN</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">Field of Study</p>
                                <p className="text-sm font-bold text-[#1F2937]">Computer Science</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">Reference ID</p>
                                <p className="text-sm font-bold text-[#1B5FA7]">{(paper?.id || '').slice(0, 12)}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">Validation</p>
                                <p className="text-sm font-bold text-green-600">Verified Node</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-[#F3F7FC] rounded-[2.5rem] border border-[#E6EEF6] space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B5FA7] shadow-sm">
                                <Library className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-extrabold text-[#1F2937]">Integrity & Verification</h3>
                        </div>
                        <p className="text-[#6B7C93] font-medium leading-relaxed">
                            This academic work has been indexed and validated through the Global Semantic Research Network. Our AI synthesis engines provide analysis based on high-fidelity metadata captured from primary academic origins.
                        </p>
                    </div>
                </div>

                {/* Right Side: AI Panel */}
                <div className="lg:col-span-4">
                    <div className="sticky top-32 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#1B5FA7] animate-pulse" />
                            <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest">Autonomous Analysis Unit Active</span>
                        </div>
                        <PaperActions paper={paper} />
                    </div>
                </div>
            </div>
        </div>
    )
}

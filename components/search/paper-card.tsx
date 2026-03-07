'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookMarked, CalendarDays, ExternalLink, ArrowRight, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
import { Paper } from '@/lib/paperService'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { savePaperAction, unsavePaperAction, checkPaperSavedAction } from '@/app/actions'

export function PaperCard({ paper }: { paper: Paper }) {
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    function showToast(message: string, type: 'success' | 'error' = 'success') {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        async function checkSavedStatus() {
            const result = await checkPaperSavedAction(paper.id)
            setIsSaved(result.saved)
        }
        checkSavedStatus()
    }, [paper.id])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative"
        >
            {/* In-page Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold whitespace-nowrap ${toast.type === 'success'
                            ? 'bg-primary text-primary-foreground shadow-primary/30'
                            : 'bg-destructive text-destructive-foreground shadow-destructive/30'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <XCircle className="h-4 w-4 shrink-0" />
                        )}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-soft hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group overflow-hidden relative">
                <CardHeader className="pb-3 relative z-10 px-8 pt-8">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <CardTitle className="text-xl font-extrabold leading-tight line-clamp-2 text-[#1F2937] group-hover:text-primary transition-colors">
                            <Link href={`/paper/${paper?.id || '#'}`}>
                                {paper?.title || 'Untitled Research'}
                            </Link>
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                        {paper.year && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                <CalendarDays className="h-3 w-3" />
                                {paper.year}
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Reference ID: {(paper?.id || 'N/A').slice(0, 6)}</span>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 px-8 relative z-10 py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <BookMarked className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-[#6B7C93] line-clamp-1 truncate">{paper?.authors?.join(', ') || 'Unknown Authors'}</span>
                    </div>
                    <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-3 font-medium opacity-80 italic border-l-2 border-gray-100 pl-4">
                        "{paper.abstract || 'Academic synthesis available for this research node.'}"
                    </p>
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-6 flex items-center gap-3 border-t border-gray-50 relative z-10 bg-gray-50/30">
                    <Link href={`/paper/${paper.id}`} className="flex-1">
                        <button className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold tracking-widest uppercase shadow-md shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group/btn">
                            Analyze <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </Link>

                    <button
                        disabled={isSaving}
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSaving(true);

                            try {
                                if (isSaved) {
                                    const result = await unsavePaperAction(paper.id);
                                    if (result.success) {
                                        setIsSaved(false);
                                        showToast("Paper removed from library.");
                                    } else {
                                        showToast(result.error || "Failed to remove paper.", 'error');
                                    }
                                } else {
                                    const result = await savePaperAction({
                                        id: paper.id,
                                        title: paper.title,
                                        authors: paper.authors,
                                        abstract: paper.abstract,
                                        year: paper.year,
                                        url: paper.url,
                                        source: paper.source,
                                    });
                                    if (result.success) {
                                        setIsSaved(true);
                                        showToast(result.alreadySaved ? "Paper already in library." : "Paper saved to library.");
                                    } else {
                                        showToast(result.error || "Failed to save paper.", 'error');
                                    }
                                }
                            } catch (err) {
                                console.error("Error saving paper:", err);
                                showToast("An unexpected error occurred.", 'error');
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${isSaved ? 'bg-primary border-primary text-primary-foreground shadow-lg' : 'bg-white border-gray-200 text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-lg'}`}
                        title={isSaved ? "Remove from Library" : "Save to Library"}
                    >
                        <BookMarked className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>

                    {paper.url && (
                        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all">
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        </a>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    )
}

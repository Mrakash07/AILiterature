'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Paper } from '@/lib/paperService'
import { Loader2, Sparkles, Copy, Check, Info, Library, Quote, Zap, Cpu, CheckCircle2, XCircle, FileDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { savePaperAction, unsavePaperAction, checkPaperSavedAction } from '@/app/actions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function PaperActions({ paper }: { paper: Paper }) {
    const [loadingSummary, setLoadingSummary] = useState(false)
    const [summaryError, setSummaryError] = useState<string | null>(null)
    const [summary, setSummary] = useState<any>(null)

    const [loadingCitation, setLoadingCitation] = useState(false)
    const [citation, setCitation] = useState<string>('')
    const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'chicago' | 'ieee'>('apa')
    const [copied, setCopied] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
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

    async function handleSummarize() {
        if (!paper.abstract) {
            setSummaryError("Cannot analyze paper: Abstract is missing.")
            return
        }
        setLoadingSummary(true)
        setSummaryError(null)
        try {
            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: paper?.title || 'Untitled',
                    abstract: paper?.abstract || '',
                    paperId: paper?.id || ''
                })
            })
            const data = await res.json()
            if (data.summary) {
                setSummary(data.summary)
            } else if (data.error) {
                setSummaryError(data.error)
            }
        } catch (error) {
            console.error(error)
            setSummaryError("Analysis could not be completed. Please try again.")
        } finally {
            setLoadingSummary(false)
        }
    }

    async function handleCitation(format: 'apa' | 'mla' | 'chicago' | 'ieee') {
        setLoadingCitation(true)
        setCitationFormat(format)
        try {
            const res = await fetch('/api/citation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    paper,
                    format
                })
            })
            const data = await res.json()
            if (data.citation) {
                setCitation(data.citation)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingCitation(false)
            setCopied(false)
        }
    }

    function copyToClipboard() {
        if (!citation) return
        navigator.clipboard.writeText(citation)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleExportPDF() {
        if (!summary) return
        setIsExporting(true)
        try {
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const margin = 20
            const contentWidth = pageWidth - (margin * 2)
            let yPos = 25

            // --- HEADER ---
            // Branding
            pdf.setFont("times", "bold")
            pdf.setFontSize(22)
            pdf.setTextColor(27, 95, 167) // #1B5FA7
            pdf.text('NEXUS', margin, yPos)

            pdf.setFont("times", "normal")
            pdf.setFontSize(10)
            pdf.setTextColor(107, 124, 147) // #6B7C93
            pdf.text('AI RESEARCH SYNTHESIS UNIT', margin + 30, yPos - 1)

            yPos += 15

            // Paper Title
            pdf.setFont("times", "bold")
            pdf.setFontSize(14)
            pdf.setTextColor(31, 41, 55) // #1F2937
            const splitTitle = pdf.splitTextToSize(paper.title.toUpperCase(), contentWidth)
            pdf.text(splitTitle, margin, yPos)
            yPos += (splitTitle.length * 8) + 5 // Increased spacing

            // Metadata Line
            pdf.setFont("times", "normal")
            pdf.setFontSize(9)
            pdf.setTextColor(156, 163, 175) // #9CA3AF
            pdf.text(`REPORT ID: ${paper.id || 'N/A'}`, margin, yPos)
            pdf.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, margin + 120, yPos)

            yPos += 5
            pdf.setDrawColor(243, 247, 252) // #F3F7FC
            pdf.setLineWidth(0.5)
            pdf.line(margin, yPos, pageWidth - margin, yPos)
            yPos += 15

            // --- SUMMARY SECTIONS ---
            const sections = [
                { label: 'RESEARCH OBJECTIVE', content: summary.objective },
                { label: 'METHODOLOGY', content: summary.methodology },
                { label: 'KEY CONTRIBUTIONS', content: summary.contributions },
                { label: 'FINDINGS', content: summary.findings },
                { label: 'LIMITATIONS', content: summary.limitations },
                { label: 'FUTURE RESEARCH', content: summary.future_research }
            ]

            sections.forEach((section) => {
                // Check if we need a new page
                if (yPos > 240) {
                    pdf.addPage()
                    yPos = 25
                }

                // Section Label - BOLD
                pdf.setFont("times", "bold")
                pdf.setFontSize(10)
                pdf.setTextColor(107, 124, 147)
                pdf.text(section.label, margin, yPos)
                yPos += 8

                // Section Content - TIMES NORMAL with 1.5 Spacing
                pdf.setFont("times", "italic")
                pdf.setFontSize(11)
                pdf.setTextColor(55, 65, 81) // #374151
                const splitContent = pdf.splitTextToSize(`"${section.content}"`, contentWidth - 10)

                // Draw a colored accent line
                pdf.setDrawColor(27, 95, 167)
                pdf.setLineWidth(1)
                pdf.line(margin, yPos, margin, yPos + (splitContent.length * 7.5) - 3) // Adjusted for 1.5 spacing

                // 1.5 Line Spacing (Approx 7.5mm for 11pt font)
                pdf.text(splitContent, margin + 5, yPos + 4, { lineHeightFactor: 1.5 })
                yPos += (splitContent.length * 7.5) + 12
            })

            // --- FOOTER ---
            const totalPages = (pdf as any).internal.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFont("times", "normal")
                pdf.setFontSize(8)
                pdf.setTextColor(156, 163, 175)
                pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: 'center' })
                pdf.text('Generated by Nexus AI Literature Platform', margin, 285)
            }

            pdf.save(`${paper.title.substring(0, 30)}_Academic_Report.pdf`)
            showToast("Professional Report Exported")
        } catch (error) {
            console.error(error)
            showToast("Failed to export PDF", "error")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-8 relative">
            {/* In-page Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold whitespace-nowrap ${toast.type === 'success'
                            ? 'bg-[#1B5FA7] text-white shadow-[#1B5FA7]/30'
                            : 'bg-red-500 text-white shadow-red-500/30'
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

            {/* AI Action Header */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-soft relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="h-16 w-16 text-[#1B5FA7]" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6 bg-[#1B5FA7] rounded-full" />
                        <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-[0.2em]">Research Intelligence Unit</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#1F2937] mb-6">AI Synthesis</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSummarize}
                            disabled={loadingSummary}
                            className="flex-1 py-4.5 bg-gradient-to-r from-[#1B5FA7] to-[#1E6FB5] hover:to-[#4F8FCC] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1B5FA7]/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loadingSummary ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Zap className="h-5 w-5 fill-white" />
                            )}
                            {loadingSummary ? 'Synthesizing...' : 'Initialize Analysis'}
                        </button>

                        <button
                            disabled={isSaving}
                            onClick={async () => {
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
                            className={`h-[58px] w-[58px] flex items-center justify-center rounded-xl border-2 transition-all ${isSaved ? 'bg-[#1B5FA7] border-[#1B5FA7] text-white shadow-lg' : 'bg-white border-[#F3F7FC] text-[#6B7C93] hover:border-[#E6EEF6] shadow-sm'}`}
                            title={isSaved ? "Remove from Library" : "Save to Library"}
                        >
                            <Library className={`h-6 w-6 ${isSaved ? 'fill-white' : ''}`} />
                        </button>

                        {summary && (
                            <button
                                disabled={isExporting}
                                onClick={handleExportPDF}
                                className="h-[58px] w-[58px] flex items-center justify-center rounded-xl border-2 bg-white border-[#F3F7FC] text-[#1B5FA7] hover:border-[#E6EEF6] shadow-sm transition-all active:scale-95"
                                title="Export as PDF"
                            >
                                {isExporting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <FileDown className="h-6 w-6" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#F3F7FC] p-1.5 rounded-2xl mb-8 border border-[#E6EEF6]">
                    <TabsTrigger value="analysis" className="rounded-xl font-bold text-xs uppercase tracking-widest py-3 data-[state=active]:bg-white data-[state=active]:text-[#1B5FA7] data-[state=active]:shadow-sm">
                        <Info className="mr-2 h-4 w-4" /> Summary
                    </TabsTrigger>
                    <TabsTrigger value="citation" className="rounded-xl font-bold text-xs uppercase tracking-widest py-3 data-[state=active]:bg-white data-[state=active]:text-[#1B5FA7] data-[state=active]:shadow-sm">
                        <Library className="mr-2 h-4 w-4" /> Citations
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="analysis" className="mt-0">
                        {summary ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                                id="ai-summary-content"
                            >
                                <div className="space-y-6">
                                    {[
                                        { label: 'Research Objective', content: summary?.objective || 'N/A', color: 'bg-blue-500' },
                                        { label: 'Methodology', content: summary?.methodology || 'N/A', color: 'bg-[#1B5FA7]' },
                                        { label: 'Key Contributions', content: summary?.contributions || 'N/A', color: 'bg-emerald-500' },
                                        { label: 'Results and Findings', content: summary?.findings || 'N/A', color: 'bg-amber-500' },
                                        { label: 'Limitations', content: summary?.limitations || 'N/A', color: 'bg-rose-500' },
                                        { label: 'Future Research Directions', content: summary?.future_research || 'N/A', color: 'bg-violet-500' },
                                    ].map((section) => (
                                        <div key={section.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${section.color}`} />
                                            <h4 className="text-[10px] font-bold text-[#6B7C93] mb-3 tracking-[0.2em] uppercase">{section.label}</h4>
                                            <p className="text-[13px] font-medium text-[#4B5563] leading-relaxed italic border-l-2 border-gray-50 pl-4 py-1">
                                                "{section.content}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center bg-[#F3F7FC] rounded-[2rem] border-2 border-dashed border-[#E6EEF6] px-6">
                                <p className="text-[#6B7C93] font-bold text-sm italic">
                                    {loadingSummary ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#1B5FA7]" />
                                            <span>Analyzing paper using AI synthesis engine...</span>
                                        </div>
                                    ) : summaryError ? (
                                        <span className="text-rose-500 font-extrabold">{summaryError}</span>
                                    ) : (
                                        <>No synthesis report found. <br /> Use the control unit above to begin.</>
                                    )}
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="citation" className="mt-0 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-soft">
                            <h4 className="text-[10px] font-bold text-[#6B7C93] mb-6 tracking-[0.2em] uppercase">Citation Standards</h4>
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-3">
                                    {['APA', 'MLA', 'Chicago', 'IEEE'].map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => handleCitation(fmt.toLowerCase() as any)}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${citationFormat === fmt.toLowerCase() ? 'bg-[#1B5FA7] text-white border-[#1B5FA7]' : 'bg-gray-50 text-[#6B7C93] border-gray-100 hover:border-gray-200'}`}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 bg-gray-50 rounded-2xl relative min-h-[180px] flex flex-col border border-gray-100 group">
                                    <div className="absolute top-4 right-4">
                                        <Quote className="h-5 w-5 text-[#1B5FA7] opacity-10" />
                                    </div>

                                    {loadingCitation ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-[#6B7C93]">
                                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#1B5FA7]" />
                                            <span className="text-xs font-bold tracking-widest uppercase opacity-60">Formatting...</span>
                                        </div>
                                    ) : citation ? (
                                        <div className="flex-1 flex flex-col">
                                            <p className="text-sm font-medium text-[#4B5563] leading-relaxed pr-8 italic mb-8">
                                                {citation}
                                            </p>
                                            <button
                                                className="mt-auto w-full py-3.5 bg-white border border-gray-200 text-[#1B5FA7] rounded-xl text-xs font-bold tracking-widest uppercase shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                                                onClick={copyToClipboard}
                                            >
                                                {copied ? (
                                                    <><Check className="h-4 w-4 mr-2" /> Copied to Buffer</>
                                                ) : (
                                                    <><Copy className="h-4 w-4 mr-2" /> Copy Reference</>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                                            <Library className="h-8 w-8 text-gray-200 mb-4" />
                                            <p className="text-[#6B7C93] font-bold text-xs uppercase tracking-widest">Select standard format</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

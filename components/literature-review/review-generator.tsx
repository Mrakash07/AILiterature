'use client'

import { useState } from 'react'
import { Paper } from '@/lib/paperService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileText, Check, Download } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import jsPDF from 'jspdf'

export function ReviewGenerator({ savedPapers }: { savedPapers: Paper[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<string | null>(null)
    const [reportUrl, setReportUrl] = useState<string | null>(null)

    function togglePaper(id: string) {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    async function handleGenerate() {
        if (selectedIds.size < 1) return

        setLoading(true)
        const papersToReview = savedPapers.filter(p => selectedIds.has(p.id))

        try {
            const res = await fetch('/api/literature-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ papers: papersToReview })
            })
            const data = await res.json()
            if (data.content) {
                setReport(data.content)
                setReportUrl(data.pdfUrl || null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleExportPDF() {
        if (!report) return
        setLoading(true)
        try {
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const margin = 20
            const contentWidth = pageWidth - (margin * 2)
            let yPos = 25

            // --- HEADER ---
            pdf.setFont("times", "bold")
            pdf.setFontSize(22)
            pdf.setTextColor(27, 95, 167)
            pdf.text('NEXUS', margin, yPos)

            pdf.setFont("times", "normal")
            pdf.setFontSize(10)
            pdf.setTextColor(107, 124, 147)
            pdf.text('AI LITERATURE REVIEW SYNTHESIS', margin + 30, yPos - 1)

            yPos += 15

            pdf.setFont("times", "bold")
            pdf.setFontSize(14)
            pdf.setTextColor(31, 41, 55)
            pdf.text('SYNTHESIS REPORT', margin, yPos)
            yPos += 10

            pdf.setFont("times", "normal")
            pdf.setFontSize(9)
            pdf.setTextColor(156, 163, 175)
            pdf.text(`PAPERS SYNTHESIZED: ${selectedIds.size}`, margin, yPos)
            pdf.text(`DATE: ${new Date().toLocaleDateString()}`, margin + 120, yPos)

            yPos += 5
            pdf.setDrawColor(243, 247, 252)
            pdf.setLineWidth(0.5)
            pdf.line(margin, yPos, pageWidth - margin, yPos)
            yPos += 15

            // --- CONTENT ---
            const rawLines = report.split('\n')

            rawLines.forEach((line) => {
                const isHeading = line.trim().startsWith('#')

                if (isHeading) {
                    const headingText = line.replace(/#+\s+/, '').trim()
                    if (!headingText) return

                    pdf.setFont("times", "bold")
                    pdf.setFontSize(12)
                    pdf.setTextColor(17, 24, 39) // Darker color (#111827)

                    const wrappedHeading = pdf.splitTextToSize(headingText, contentWidth)

                    if (yPos + (wrappedHeading.length * 8) > 270) {
                        pdf.addPage()
                        yPos = 25
                    }

                    yPos += 5 // Extra space before heading
                    pdf.text(wrappedHeading, margin, yPos)
                    yPos += (wrappedHeading.length * 6) + 4
                } else {
                    const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '').trim()
                    if (!cleanText) {
                        yPos += 4 // Space for empty lines
                        return
                    }

                    pdf.setFont("times", "normal")
                    pdf.setFontSize(11)
                    pdf.setTextColor(55, 65, 81)

                    const wrappedText = pdf.splitTextToSize(cleanText, contentWidth)

                    wrappedText.forEach((tLine: string) => {
                        if (yPos > 275) {
                            pdf.addPage()
                            yPos = 25
                        }
                        pdf.text(tLine, margin, yPos, { lineHeightFactor: 1.5 })
                        yPos += 7.5 // 1.5 line spacing
                    })
                    yPos += 2 // Paragraph spacing
                }
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

            pdf.save(`Literature_Review_${new Date().getTime()}.pdf`)
        } catch (error) {
            console.error('PDF Export Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-[2rem] h-full flex flex-col border border-gray-100 shadow-soft overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-end">
                        <div className="space-y-1">
                            <h3 className="text-xl font-extrabold text-foreground">Select Library</h3>
                            <p className="text-sm font-medium text-muted-foreground">Choose at least 1 paper</p>
                        </div>
                        {savedPapers.length > 0 && (
                            <button
                                onClick={() => {
                                    if (selectedIds.size === savedPapers.length) {
                                        setSelectedIds(new Set())
                                    } else {
                                        setSelectedIds(new Set(savedPapers.map(p => p.id)))
                                    }
                                }}
                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            >
                                {selectedIds.size === savedPapers.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-[500px] px-8 py-6">
                            {savedPapers.length > 0 ? (
                                <div className="space-y-4 pb-6">
                                    {savedPapers.map((paper) => {
                                        const isSelected = selectedIds.has(paper.id)
                                        return (
                                            <div
                                                key={paper.id}
                                                onClick={() => togglePaper(paper.id)}
                                                className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex shrink-0 items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-gray-200 group-hover:border-gray-300'}`}>
                                                        {isSelected && <Check className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm leading-tight line-clamp-2 mb-2 transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{paper.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">{paper.authors?.[0] || 'Academic Source'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 px-4">
                                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="w-8 h-8 text-muted-foreground opacity-20" />
                                    </div>
                                    <p className="text-muted-foreground font-bold text-sm max-w-[180px] mx-auto">No saved papers available. Save papers from Search first.</p>
                                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-4">Library empty</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <div className="p-8 border-t border-gray-50 bg-primary/5">
                        <button
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${selectedIds.size < 1 || loading ? 'bg-gray-100 text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5'}`}
                            disabled={selectedIds.size < 1 || loading}
                            onClick={handleGenerate}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing...</>
                            ) : (
                                <><FileText className="w-5 h-5" /> Generate Review ({selectedIds.size})</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] h-full flex flex-col min-h-[600px] border border-gray-50 shadow-soft overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-2xl font-extrabold text-foreground">Synthesis Report</h3>
                            <p className="text-sm font-medium text-muted-foreground">Cross-paper methodology & analysis</p>
                        </div>
                        {report && (
                            <button
                                onClick={handleExportPDF}
                                disabled={loading}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Export PDF
                            </button>
                        )}
                        {reportUrl && (
                            <a href={reportUrl} target="_blank" rel="noopener noreferrer">
                                <button className="px-5 py-2.5 bg-white border border-gray-200 text-[#1F2937] rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                            </a>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full bg-white">
                            <div className="p-10 prose prose-slate max-w-none">
                                {report ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold text-foreground mb-8" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-foreground mt-12 mb-6" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-foreground mt-8 mb-4" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-6 font-medium" {...props} />,
                                            li: ({ node, ...props }) => <li className="text-muted-foreground font-medium" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-2xl text-primary font-bold italic" {...props} />,
                                        }}
                                    >
                                        {report}
                                    </ReactMarkdown>
                                ) : loading ? (
                                    <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/10">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-foreground font-bold text-xl animate-pulse">Analyzing methodologies...</p>
                                            <p className="text-muted-foreground font-medium">Constructing holistic research narrative</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[500px] text-center">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center mb-8 border-2 border-dashed border-gray-100">
                                            <FileText className="w-12 h-12 text-gray-200" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-400 mb-2">No Report Generated</h4>
                                        <p className="text-muted-foreground font-medium max-w-xs">Select your papers and click generate to start the synthesis process.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    )
}

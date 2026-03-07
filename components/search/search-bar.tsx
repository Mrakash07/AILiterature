'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Cpu, Zap, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
    const router = useRouter()
    const [query, setQuery] = useState(initialQuery)
    const [loading, setLoading] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setTimeout(() => setLoading(false), 800)
    }

    return (
        <form onSubmit={onSubmit} className="relative w-full">
            <div className={`relative flex items-center gap-3 p-2 rounded-2xl transition-all duration-500 bg-white border ${isFocused ? 'border-primary ring-4 ring-primary/5' : 'border-gray-100 shadow-soft'}`}>
                <div className="pl-4 flex items-center justify-center shrink-0">
                    <SearchIcon className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                <Input
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg font-medium text-foreground placeholder:text-gray-300"
                    placeholder="Search topics, authors, or DOIs..."
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <div className="hidden md:flex items-center gap-2 pr-2">
                    {loading ? (
                        <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
                            <Cpu className="h-4 w-4 text-primary animate-spin" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Searching</span>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            Search
                        </button>
                    )}
                </div>
            </div>

            <div className="md:hidden mt-4">
                <button
                    type="submit"
                    className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search Engine'}
                </button>
            </div>
        </form>
    )
}

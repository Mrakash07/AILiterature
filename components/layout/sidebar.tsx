'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, Search, FileText, BarChart3, Bookmark, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Search Papers', href: '/search', icon: Search },
    { name: 'Literature Review', href: '/literature-review', icon: FileText },
    { name: 'Research Trends', href: '/trends', icon: BarChart3 },
    { name: 'Saved Papers', href: '/saved', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-72 flex-col bg-card border-r border-border shadow-xl relative z-30 transition-colors duration-300">
            <div className="flex h-24 shrink-0 items-center px-8">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <BookOpen className="h-6 w-6 text-blue-200" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground uppercase tracking-widest">Nexus</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 px-4">
                    Research Modules
                </p>
                {navigation.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                isActive
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                'group flex items-center px-4 py-3.5 text-sm font-bold transition-all duration-200 rounded-xl relative'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-4 h-5 w-5 flex-shrink-0 transition-colors'
                                )}
                                aria-hidden="true"
                            />
                            <span className="tracking-wide">{item.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-dot"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-primary/10 rounded-2xl p-4 border border-border">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">System Logic</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground">Neural Core Active</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

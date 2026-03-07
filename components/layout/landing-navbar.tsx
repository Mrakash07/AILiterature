'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'

export function LandingNavbar({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 lg:px-20 bg-white/10 backdrop-blur-xl border-b border-white/10"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                    <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">
                    Nexus
                </span>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                <Link href="/login" className="text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest">
                    Login
                </Link>
                <Link href="/login">
                    <button className="px-6 py-2.5 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-white/10 hover:shadow-white/20 transition-all active:scale-95">
                        Sign Up
                    </button>
                </Link>
            </div>
        </motion.nav>
    )
}

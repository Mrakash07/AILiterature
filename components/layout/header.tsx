'use client'

import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header({ email }: { email?: string }) {
    const router = useRouter()

    async function handleSignOut() {
        await signOut(auth)
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-20 flex h-20 items-center border-b border-border bg-background/80 backdrop-blur-md px-8">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-6 ml-auto">

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-card p-1 pr-4 rounded-full border border-border shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs font-bold text-foreground line-clamp-1 max-w-[100px]">
                                    {email?.split('@')[0]}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expert</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

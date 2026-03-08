"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, Settings, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>
                        <p className="text-muted-foreground text-lg font-medium mt-2">
                            Customize your research environment and preferences.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Info Sidebar */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#012340] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
                        <h3 className="text-2xl font-extrabold mb-6 leading-tight">Research Intelligence</h3>
                        <p className="text-white/80 font-medium mb-8">
                            Your research environment is optimized for academic excellence. Advanced configuration options will be available in future updates.
                        </p>
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Active Protocol</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                                <p className="text-sm font-bold">Dynamic Refresh Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

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
                {/* Appearance Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Settings className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-foreground">Appearance</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { id: 'light', name: 'Light Mode', icon: Sun, desc: 'Clean and bright' },
                                { id: 'dark', name: 'Dark Mode', icon: Moon, desc: 'Protects your eyes' },
                                { id: 'system', name: 'System', icon: Laptop, desc: 'Follows device' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTheme(item.id)}
                                    className={`relative flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all duration-300 group ${theme === item.id
                                            ? 'border-primary bg-primary/5 shadow-premium shadow-primary/5'
                                            : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-6 transition-colors ${theme === item.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <span className="font-bold text-lg mb-2 text-foreground">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">{item.desc}</span>

                                    {theme === item.id && (
                                        <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Interface Preferences</h3>
                                <p className="text-sm text-muted-foreground font-medium italic">Advanced UI configurations coming soon</p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-muted-foreground opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-8">
                    <div className="bg-primary rounded-[2.5rem] p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
                        <h3 className="text-2xl font-extrabold mb-6 leading-tight">Theme Sync</h3>
                        <p className="text-primary-foreground/80 font-medium mb-8">
                            Your preferences are automatically saved to your browser's local storage for a consistent experience across sessions.
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

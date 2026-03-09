export const dynamic = "force-dynamic";
import { verifyAuth } from '@/lib/auth-utils'
import { LandingNavbar } from '@/components/layout/landing-navbar'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Sparkles, FileText, TrendingUp, Search, Activity, Cpu } from 'lucide-react'

export default async function Home() {
    const user = await verifyAuth()
    const isLoggedIn = !!user

    return (
        <main className="relative min-h-screen bg-white">
            <LandingNavbar isLoggedIn={isLoggedIn} />
            {/* Dynamic Background Gradient Hero */}
            <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6 lg:px-16 overflow-hidden bg-gradient-to-br from-[#012340] via-[#003D73] to-[#012340]">
                {/* Abstract Blobs & Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 opacity-30 blur-[80px] animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/30 opacity-40 blur-[100px]" />
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                </div>

                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-4 animate-fade-in shadow-lg">
                            <Sparkles className="h-4 w-4 text-blue-200" />
                            <span className="text-xs font-semibold text-white tracking-widest uppercase">
                                AI-Powered Research Discovery
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                            AI Literature <br />
                            <span className="text-blue-200">Research Platform</span>
                        </h1>

                        <p className="max-w-xl text-xl text-white/90 mx-auto lg:mx-0 font-light leading-relaxed">
                            Search, analyze, and summarize millions of research papers instantly. Our AI engine identifies patterns and research gaps so you can focus on discovery.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                            <Link href="/signup">
                                <button className="px-10 py-4 bg-white text-primary rounded-xl font-bold hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1">
                                    Get Started
                                </button>
                            </Link>
                        </div>

                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-white/70 font-medium">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-300" /> Professional Grade AI</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-300" /> Real-time Synthesis</span>
                        </div>
                    </div>

                    {/* Dashboard Preview Representation */}
                    <div className="hidden lg:block relative">
                        <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-[2.5rem]" />
                        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                                <Image
                                    src="/ai-research-hero.png"
                                    alt="AI Literature Research Platform"
                                    width={600}
                                    height={420}
                                    className="w-full h-auto object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Precision Tools</h2>
                        <h3 className="text-4xl font-extrabold text-foreground">Research redefined for teams.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { title: 'Smart Search', desc: 'Navigate through millions of publications with semantic logic.', icon: Search },
                            { title: 'AI Summaries', desc: 'Instantly condense 50-page papers into key mathematical insights.', icon: FileText },
                            { title: 'Gap Discovery', desc: 'Uncover missing links in current literature to find your next thesis.', icon: TrendingUp },
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h4 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h4>
                                <p className="text-muted-foreground leading-relaxed text-lg font-light italic">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-12">
                    <div className="flex items-center gap-3 mb-8 md:mb-0">
                        <BookOpen className="h-6 w-6 text-blue-300" />
                        <span className="text-2xl font-bold tracking-tight">AI Literature</span>
                    </div>

                    <div className="flex gap-10 text-sm text-white/60 font-medium">
                        <Link href="/search" className="hover:text-white transition-colors">Search</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                        <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
                    </div>

                    <p className="mt-8 md:mt-0 text-xs text-white/40">
                        &copy; {new Date().getFullYear()} AI Literature Research Platform.
                    </p>
                </div>
            </footer>
        </main>
    )
}

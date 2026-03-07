import { LoginForm } from '@/components/auth/login-form'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { LandingNavbar } from '@/components/layout/landing-navbar'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F4C81] via-[#1E6FB5] to-[#4F8FCC] p-6 relative overflow-hidden">
            <LandingNavbar isLoggedIn={false} />
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-5 blur-[120px]" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-white/10 rounded-full -ml-10 -mb-10" />
            </div>

            <div className="w-full max-w-[440px] relative z-10 transition-all duration-500 animate-slide-up">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-[#1B5FA7]" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white uppercase tracking-widest">Nexus Research</span>
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] p-10 shadow-soft border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-[#1F2937]">Welcome Back</h1>
                        <p className="text-[#6B7C93] text-sm mt-2">Enter your credentials to access your research.</p>
                    </div>

                    <LoginForm />

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-[#6B7C93]">
                            Don't have an account? <Link href="/signup" className="text-[#1B5FA7] font-bold hover:underline">Create account</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-white/60 text-xs font-medium">
                    &copy; {new Date().getFullYear()} AI Literature Research Platform.
                </p>
            </div>
        </div>
    )
}

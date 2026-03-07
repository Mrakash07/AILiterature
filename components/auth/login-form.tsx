'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { loginRedirect } from '@/app/login/actions'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const setSessionCookie = async (user: any) => {
        const idToken = await user.getIdToken()
        document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`
    }

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            await setSessionCookie(userCredential.user)
            await loginRedirect()
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.')
            setLoading(false)
        }
    }

    async function handleGoogleSignIn() {
        setLoading(true)
        setError(null)
        const provider = new GoogleAuthProvider()
        try {
            const userCredential = await signInWithPopup(auth, provider)
            await setSessionCookie(userCredential.user)
            await loginRedirect()
        } catch (err: any) {
            setError(err.message || 'Google sign in failed')
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {error && (
                <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-12 text-sm font-bold text-[#1F2937] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-100"
            >
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
            </button>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-[#6B7C93]">
                    <span className="bg-white px-4">Secure Email Login</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-[#6B7C93] uppercase tracking-wider px-1">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="researcher@university.edu"
                        required
                        disabled={loading}
                        className="w-full h-12 bg-[#F3F7FC] border border-transparent rounded-xl px-4 text-[#1F2937] text-sm focus:outline-none focus:bg-white focus:border-[#1B5FA7] transition-all placeholder:text-[#6B7C93]/50"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-xs font-bold text-[#6B7C93] uppercase tracking-wider">Password</label>
                        <Link href="/forgot-password" className="text-xs text-[#1B5FA7] font-bold hover:underline">Forgot?</Link>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="w-full h-12 bg-[#F3F7FC] border border-transparent rounded-xl px-4 text-[#1F2937] text-sm focus:outline-none focus:bg-white focus:border-[#1B5FA7] transition-all placeholder:text-[#6B7C93]/50"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-[#1B5FA7] hover:bg-[#0F4C81] text-white font-bold rounded-xl shadow-lg shadow-[#1B5FA7]/20 transition-all flex items-center justify-center gap-2 mt-4"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            Sign In <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}

import { redirect } from 'next/navigation'
import { verifyAuth } from '@/lib/auth-utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await verifyAuth()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white text-[#1F2937] transition-colors duration-500 relative">
            {/* Clean White Aesthetic - Removed Ambient Gradients */}

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0 relative z-30">
                <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative z-10">
                <Header email={user.email} />
                <main className="flex-1 overflow-y-auto focus:outline-none custom-scrollbar pb-12">
                    <div className="py-10">
                        <div className="mx-auto max-w-7xl px-4 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

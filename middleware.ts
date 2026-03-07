import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const protectedRoutes = ['/dashboard', '/search', '/paper', '/literature-review']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Check for Firebase session cookie
    const sessionCookie = request.cookies.get('__session')?.value

    if (isProtectedRoute && !sessionCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

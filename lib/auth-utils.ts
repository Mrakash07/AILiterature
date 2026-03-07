import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'
import type { DecodedIdToken } from 'firebase-admin/auth'

/**
 * Verifies the Firebase ID token stored in the '__session' cookie.
 * Returns the decoded token (contains uid, email, etc.) or null if invalid/missing.
 */
export async function verifyAuth(): Promise<DecodedIdToken | null> {
    try {
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get('__session')?.value

        if (!sessionCookie || !adminAuth) {
            return null
        }

        const decodedToken = await adminAuth.verifyIdToken(sessionCookie)
        return decodedToken
    } catch (error) {
        console.error('Auth verification failed:', error)
        return null
    }
}

/**
 * Verifies Firebase ID token from the Authorization header (Bearer token).
 * Used for API routes.
 */
export async function verifyAuthFromRequest(request: Request): Promise<DecodedIdToken | null> {
    try {
        // Try Authorization header first
        const authHeader = request.headers.get('Authorization')
        if (authHeader?.startsWith('Bearer ') && adminAuth) {
            const token = authHeader.split('Bearer ')[1]
            return await adminAuth.verifyIdToken(token)
        }

        // Fallback to cookie
        const cookieHeader = request.headers.get('cookie') || ''
        const sessionMatch = cookieHeader.match(/__session=([^;]+)/)
        if (sessionMatch && adminAuth) {
            return await adminAuth.verifyIdToken(sessionMatch[1])
        }

        return null
    } catch (error) {
        console.error('Auth verification from request failed:', error)
        return null
    }
}

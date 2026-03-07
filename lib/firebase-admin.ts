import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase Admin credentials missing. Server-side auth features will be disabled.')
    }
}

const adminApp = getApps().length === 0
    ? (serviceAccount.clientEmail && serviceAccount.privateKey
        ? initializeApp({ credential: cert(serviceAccount) })
        : null)
    : getApps()[0]

export const adminAuth = adminApp ? getAuth(adminApp) : null as any
export const adminDb = adminApp ? getFirestore(adminApp) : null as any

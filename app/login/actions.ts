'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// NOTE: Firebase Auth is handled client-side.
// These server actions are thin wrappers that just handle
// the post-login redirect/revalidation. The actual auth
// (signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup)
// happens in the client-side login page component.

export async function loginRedirect() {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signupRedirect() {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

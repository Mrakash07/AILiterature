import { NextResponse } from 'next/server'

// This route is no longer needed with Firebase Auth.
// Firebase handles OAuth callbacks directly on the client side.
// Keeping this as a simple redirect in case any old links point here.

export async function GET(request: Request) {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/dashboard`)
}

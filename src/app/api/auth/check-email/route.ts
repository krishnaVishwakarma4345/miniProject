import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/firebase/firestore/users.repository'
import { ApiError } from '@/types/api.types'

/**
 * POST /api/auth/check-email
 * Checks if an email is already registered
 * Client calls this during registration form to prevent duplicate registration
 * 
 * Request body: { email: string }
 * Response: { exists: boolean, available: boolean }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing email', code: 'INVALID_EMAIL' } as ApiError,
        { status: 400 }
      )
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email exists in Firestore
    const existingUser = await getUserByEmail(normalizedEmail)

    const response = {
      email: normalizedEmail,
      exists: existingUser !== null,
      available: existingUser === null
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Don't leak information about internal errors; just return false
    const message = error instanceof Error ? error.message : 'Email check failed'
    console.error('Email check error:', message)

    // Even on error, return a safe response (assume email is available)
    return NextResponse.json(
      {
        email: '',
        exists: false,
        available: true,
        warning: 'Could not verify email availability; proceed with caution'
      },
      { status: 200 }
    )
  }
}

/**
 * OPTIONS /api/auth/check-email
 * CORS preflight support
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

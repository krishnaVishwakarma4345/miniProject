import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/auth/verifySessionCookie'
import { createSessionCookie, generateSetCookieHeader } from '@/lib/firebase/auth/createSessionCookie'
import { ApiError } from '@/types/api.types'

/**
 * POST /api/auth/session
 * Creates a secure session cookie from Firebase ID token
 * Client calls this after successful Firebase auth (signIn/signUp)
 * 
 * Request body: { idToken: string }
 * Response: { success: true, userId: string, role: UserRole } with Set-Cookie header
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      const apiError = new ApiError('Invalid or missing idToken', 'INVALID_TOKEN', 400)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
    }

    // Verify the ID token is valid (will throw if expired/invalid)
    const decodedToken = await verifyIdToken(idToken, true)

    // Extract user info from token
    const userId = decodedToken.uid
    const userRole = decodedToken.custom_claims?.role || 'student'
    const userEmail = decodedToken.email

    if (!userEmail) {
      const apiError = new ApiError('Token missing email claim', 'MISSING_EMAIL', 400)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
    }

    // Create session cookie (valid for 5 days by default)
    const sessionCookie = await createSessionCookie(idToken)

    // Build Set-Cookie header
    const setCookieHeader = generateSetCookieHeader(sessionCookie)

    // Return success response with Set-Cookie header
    const response = NextResponse.json(
      {
        success: true,
        userId,
        email: userEmail,
        role: userRole,
        message: 'Session created successfully'
      },
      { status: 200 }
    )

    // Set secure session cookie on response
    response.headers.set('Set-Cookie', setCookieHeader)

    return response
  } catch (error) {
    // Handle Firebase auth errors
    if (error instanceof ApiError) {
      return NextResponse.json(error, { status: error.statusCode ?? 401 })
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'Session creation failed'
    const apiError = new ApiError(message, 'SESSION_CREATE_ERROR', 500)

    return NextResponse.json(apiError, { status: apiError.statusCode ?? 500 })
  }
}

/**
 * OPTIONS /api/auth/session
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

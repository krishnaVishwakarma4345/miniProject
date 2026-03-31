import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthIfInitialized } from '@/lib/firebase/admin'
import { ApiError } from '@/types/api.types'

/**
 * POST /api/auth/logout
 * Revokes user's session and clears session cookie
 * Client calls this before calling firebaseSignOut()
 * 
 * Response: { success: true } with Set-Cookie: session=; Max-Age=0
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract session cookie from request headers
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader?.includes('session=')) {
      // No session cookie, just clear it anyway
      const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
      )

      // Clear session cookie by setting Max-Age=0
      response.headers.set(
        'Set-Cookie',
        'session=; Path=/; Max-Age=0; HttpOnly; SameSite=strict'
      )

      return response
    }

    // Parse session cookie value
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const sessionCookie = cookies.find(c => c.startsWith('session='))?.split('=')[1]

    if (sessionCookie) {
      try {
        const adminAuth = getAdminAuthIfInitialized()
        if (adminAuth) {
          // Verify token and extract UID to revoke refresh tokens
          const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
          const uid = decodedToken.uid

          // Revoke all refresh tokens for this user (invalidate all sessions)
          await adminAuth.revokeRefreshTokens(uid)
        }
      } catch (verifyError) {
        // Token may already be invalid, but still clear the cookie
        console.warn('Session verification error during logout:', verifyError)
      }
    }

    // Return success and clear session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear session cookie by setting Max-Age=0
    response.headers.set(
      'Set-Cookie',
      'session=; Path=/; Max-Age=0; HttpOnly; SameSite=strict'
    )

    return response
  } catch (error) {
    // Even on error, attempt to clear the cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout completed',
        warning: error instanceof Error ? error.message : 'Session revocation failed but cookie cleared'
      },
      { status: 200 }
    )

    response.headers.set(
      'Set-Cookie',
      'session=; Path=/; Max-Age=0; HttpOnly; SameSite=strict'
    )

    return response
  }
}

/**
 * OPTIONS /api/auth/logout
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

import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/auth/verifySessionCookie'
import { createSessionCookie, generateSetCookieHeader } from '@/lib/firebase/auth/createSessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { ApiError } from '@/types/api.types'
import { UserRole, UserStatus } from '@/types/user.types'

interface SessionProfilePayload {
  fullName?: string
  displayName?: string
  role?: string
  institutionId?: string
  signUpMethod?: string
}

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
    const { idToken, userProfile } = body as { idToken?: string; userProfile?: SessionProfilePayload }

    if (!idToken || typeof idToken !== 'string') {
      const apiError = new ApiError('Invalid or missing idToken', 'INVALID_TOKEN', 400)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
    }

    // Verify the ID token is valid (will throw if expired/invalid)
    const decodedToken = await verifyIdToken(idToken, true)

    // Extract user info from token
    const userId = decodedToken.uid
    const roleFromProfile = userProfile?.role
    const roleFromClaims = decodedToken.custom_claims?.role
    const requestedRole = roleFromProfile || roleFromClaims || UserRole.STUDENT
    const userEmail = decodedToken.email

    if (!userEmail) {
      const apiError = new ApiError('Token missing email claim', 'MISSING_EMAIL', 400)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
    }

    // Ensure Firestore profile document exists for every authenticated user.
    const adminDb = getAdminFirestore()
    const userRef = adminDb.collection('users').doc(userId)
    const existingUser = await userRef.get()
    const existingRole = existingUser.exists ? existingUser.data()?.role : undefined
    const existingInstitutionId = existingUser.exists ? existingUser.data()?.institutionId : undefined
    const resolvedRoleSource = existingRole || requestedRole
    const userRole = Object.values(UserRole).includes(resolvedRoleSource as UserRole)
      ? (resolvedRoleSource as UserRole)
      : UserRole.STUDENT
    const resolvedInstitutionId = existingInstitutionId || userProfile?.institutionId || null

    if (userRole !== UserRole.MASTER_ADMIN) {
      if (!resolvedInstitutionId && !existingUser.exists) {
        const apiError = new ApiError('Institution is required for this role', 'MISSING_INSTITUTION', 400)
        return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
      }

      if (resolvedInstitutionId) {
        const institutionRef = adminDb.collection('institutions').doc(resolvedInstitutionId)
        const institutionSnapshot = await institutionRef.get()
        const isActiveInstitution = institutionSnapshot.exists && institutionSnapshot.data()?.isActive !== false

        if (!isActiveInstitution) {
          const apiError = new ApiError('Institution is invalid or inactive', 'INVALID_INSTITUTION', 400)
          return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
        }
      }
    }

    const derivedName = userProfile?.fullName || userProfile?.displayName || decodedToken.name || userEmail.split('@')[0]

    const userPayload = {
      uid: userId,
      id: userId,
      fullName: derivedName,
      displayName: userProfile?.displayName || decodedToken.name || derivedName,
      email: userEmail,
      role: userRole,
      status: UserStatus.ACTIVE,
      language: 'en',
      mfaEnabled: false,
      institutionId: resolvedInstitutionId,
      photoURL: decodedToken.picture || null,
      isActive: true,
      emailVerified: Boolean(decodedToken.email_verified),
      lastLogin: new Date(),
      updatedAt: new Date(),
      ...(existingUser.exists
        ? {}
        : {
            createdAt: new Date(),
            metadata: {
              signUpMethod: userProfile?.signUpMethod || 'email',
              loginCount: 1,
            },
          }),
    }

    await userRef.set(
      userPayload,
      { merge: true }
    )

    // Keep institution-scoped copy for tenant-local queries.
    if (resolvedInstitutionId) {
      await adminDb
        .collection('institutions')
        .doc(resolvedInstitutionId)
        .collection('users')
        .doc(userId)
        .set(userPayload, { merge: true })
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
        institutionId: resolvedInstitutionId,
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

import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/auth/verifySessionCookie'
import { createSessionCookie, generateSetCookieHeader } from '@/lib/firebase/auth/createSessionCookie'
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin'
import { ApiError } from '@/types/api.types'
import { UserRole, UserStatus } from '@/types/user.types'

interface SessionProfilePayload {
  fullName?: string
  displayName?: string
  role?: string
  institutionId?: string
  signUpMethod?: string
}

const MASTER_ADMIN_BOOTSTRAP_EMAILS = new Set([
  'krishnavishwakarma4345@gmail.com',
])

type ProfileRecord = {
  role?: string
  institutionId?: string
  fullName?: string
  displayName?: string
}

const extractInstitutionFromPath = (path: string): string | undefined => {
  const parts = path.split('/')
  const institutionsIndex = parts.indexOf('institutions')
  if (institutionsIndex === -1) return undefined
  return parts[institutionsIndex + 1]
}

const normalizeRole = (value: unknown): UserRole | null => {
  if (typeof value !== 'string') return null
  return Object.values(UserRole).includes(value as UserRole) ? (value as UserRole) : null
}

/**
 * POST /api/auth/session
 * Creates a secure session cookie from Firebase ID token
 * Client calls this after successful Firebase auth (signIn/signUp)
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
    const signInProvider = decodedToken.firebase?.sign_in_provider
    const roleFromTokenClaims = (decodedToken.role as string | undefined) || (decodedToken.custom_claims?.role as string | undefined)
    const institutionFromTokenClaims = (decodedToken.institutionId as string | undefined) || (decodedToken.org as string | undefined) || (decodedToken.custom_claims?.institutionId as string | undefined) || (decodedToken.custom_claims?.org as string | undefined)
    const userEmail = decodedToken.email
    const normalizedEmail = userEmail?.trim().toLowerCase()
    const isBootstrapMasterAdmin = Boolean(normalizedEmail && MASTER_ADMIN_BOOTSTRAP_EMAILS.has(normalizedEmail))

    if (signInProvider === 'password' && !decodedToken.email_verified) {
      const apiError = new ApiError('Email must be verified before login', 'EMAIL_NOT_VERIFIED', 403)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 403 })
    }

    if (!userEmail) {
      const apiError = new ApiError('Token missing email claim', 'MISSING_EMAIL', 400)
      return NextResponse.json(apiError, { status: apiError.statusCode ?? 400 })
    }

    // Ensure Firestore profile document exists for every authenticated user.
    const adminDb = getAdminFirestore()
    const adminAuth = getAdminAuth()
    const authUserRecord = await adminAuth.getUser(userId)
    const roleFromAuthClaims = authUserRecord.customClaims?.role as string | undefined
    const institutionFromAuthClaims = (authUserRecord.customClaims?.institutionId as string | undefined) || (authUserRecord.customClaims?.org as string | undefined)

    const userRef = adminDb.collection('users').doc(userId)
    const existingUser = await userRef.get()
    const existingData = existingUser.exists ? (existingUser.data() as ProfileRecord) : null

    let scopedUserData: ProfileRecord | null = null
    let scopedInstitutionId: string | undefined
    try {
      const scopedByUid = await adminDb
        .collectionGroup('users')
        .where('uid', '==', userId)
        .limit(1)
        .get()

      if (!scopedByUid.empty) {
        scopedUserData = scopedByUid.docs[0].data() as ProfileRecord
        scopedInstitutionId = scopedUserData.institutionId || extractInstitutionFromPath(scopedByUid.docs[0].ref.path)
      }
    } catch {
      // Ignore collection group issues and continue with available sources.
    }

    if (!scopedUserData && normalizedEmail) {
      try {
        const scopedByEmail = await adminDb
          .collectionGroup('users')
          .where('email', '==', normalizedEmail)
          .limit(1)
          .get()

        if (!scopedByEmail.empty) {
          scopedUserData = scopedByEmail.docs[0].data() as ProfileRecord
          scopedInstitutionId = scopedUserData.institutionId || extractInstitutionFromPath(scopedByEmail.docs[0].ref.path)
        }
      } catch {
        // Ignore collection group issues and continue with available sources.
      }
    }

if (signInProvider === 'google.com' && normalizedEmail) {
      const emailMatches = await adminDb
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(2)
        .get()

      const hasDifferentUidForSameEmail = emailMatches.docs.some((doc) => doc.id !== userId)
      if (hasDifferentUidForSameEmail) {
        const apiError = new ApiError(
          'This email is already attached to another account. Please sign in with your password for this email to keep credentials consistent.',
          'EMAIL_PROVIDER_CONFLICT',
          409
        )
        return NextResponse.json(apiError, { status: apiError.statusCode ?? 409 })
      }
    }

    const resolvedRole = isBootstrapMasterAdmin
      ? UserRole.MASTER_ADMIN
      : normalizeRole(existingData?.role)
        || normalizeRole(scopedUserData?.role)
        || normalizeRole(roleFromAuthClaims)
        || normalizeRole(roleFromTokenClaims)
        || UserRole.STUDENT

    const resolvedInstitutionId =
      existingData?.institutionId
      || scopedInstitutionId
      || institutionFromAuthClaims
      || institutionFromTokenClaims
      || userProfile?.institutionId
      || null

    if (resolvedRole !== UserRole.MASTER_ADMIN) {
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

    const derivedName = userProfile?.fullName || userProfile?.displayName || existingData?.fullName || scopedUserData?.fullName || decodedToken.name || userEmail.split('@')[0]

    const userPayload = {
      uid: userId,
      id: userId,
      fullName: derivedName,
      displayName: userProfile?.displayName || existingData?.displayName || scopedUserData?.displayName || decodedToken.name || derivedName,
      email: userEmail,
      role: resolvedRole,
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

    const existingClaims = authUserRecord.customClaims || {}
    const shouldUpdateClaims =
      existingClaims.role !== resolvedRole ||
      (resolvedInstitutionId && existingClaims.institutionId !== resolvedInstitutionId)

    if (shouldUpdateClaims) {
      try {
        await adminAuth.setCustomUserClaims(userId, {
          ...existingClaims,
          role: resolvedRole,
          ...(resolvedInstitutionId
            ? { institutionId: resolvedInstitutionId, org: resolvedInstitutionId }
            : {}),
        })
      } catch (claimsError) {
        console.error('Failed to sync custom claims:', claimsError)
      }
    }

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
        role: resolvedRole,
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

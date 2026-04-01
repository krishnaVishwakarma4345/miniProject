import { NextRequest, NextResponse } from 'next/server'
import { Activity, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'
import { getInstitutionActivityDoc } from '@/lib/firebase/firestore/activity-tenant.utils'

interface UserProfile {
  uid?: string
  role?: string
  institutionId?: string
}

const resolveUserProfile = async (uid: string, adminDb: FirebaseFirestore.Firestore): Promise<UserProfile | null> => {
  const userDoc = await adminDb.collection('users').doc(uid).get()
  if (userDoc.exists) {
    return userDoc.data() as UserProfile
  }

  const scoped = await adminDb
    .collectionGroup('users')
    .where('uid', '==', uid)
    .limit(1)
    .get()

  if (scoped.empty) {
    return null
  }

  return scoped.docs[0].data() as UserProfile
}

export async function GET(request: NextRequest) {
  try {
    const session = parseSessionCookie(request.headers)
    if (!session) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
    }

    const decoded = await verifySessionCookie(session, true)
    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('activityId')

    if (!activityId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
    }

    const adminDb = getAdminFirestore()
    const userProfile = await resolveUserProfile(decoded.uid, adminDb)
    const institutionId = userProfile?.institutionId || (decoded.custom_claims?.institutionId as string | undefined) || (decoded.custom_claims?.org as string | undefined)
    const activityDoc = institutionId
      ? await getInstitutionActivityDoc(adminDb, institutionId, activityId).get()
      : await adminDb.collection('activities').doc(activityId).get()

    const fallbackDoc = !activityDoc.exists ? await adminDb.collection('activities').doc(activityId).get() : null

    if (!activityDoc.exists && !fallbackDoc?.exists) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
    }

    const sourceDoc = activityDoc.exists ? activityDoc : fallbackDoc!
    const activity = { id: sourceDoc.id, ...sourceDoc.data() } as Activity

    const userRole = userProfile?.role || (decoded.custom_claims?.role as string | undefined) || UserRole.STUDENT
    if (userRole === UserRole.STUDENT && activity.studentId !== decoded.uid) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
    }

    if ((userRole === UserRole.FACULTY || userRole === UserRole.ADMIN) && userProfile?.institutionId !== activity.institutionId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
    }

    return NextResponse.json<ApiResponse<Activity>>({
      success: true,
      data: activity,
      message: 'Activity fetched',
      timestamp: Date.now(),
      statusCode: 200,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Failed to fetch activity')
          : 'Failed to fetch activity'

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      message,
      timestamp: Date.now(),
      statusCode: 500,
    }, { status: 500 })
  }
}

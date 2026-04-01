import { NextRequest, NextResponse } from 'next/server'
import { Activity, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'

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
    const activityDoc = await adminDb.collection('activities').doc(activityId).get()

    if (!activityDoc.exists) {
      return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
    }

    const activity = { id: activityDoc.id, ...activityDoc.data() } as Activity

    const userRole = (decoded.custom_claims?.role as string | undefined) || UserRole.STUDENT
    if (userRole === UserRole.STUDENT && activity.studentId !== decoded.uid) {
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

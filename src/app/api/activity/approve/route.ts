import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getActivityById, updateActivity } from '@/lib/firebase/firestore/activities.repository'
import { getUserById } from '@/lib/firebase/firestore/users.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

interface ApproveBody {
	activityId: string
	remarks?: string
	pointsAwarded?: number
	score?: number
}

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const facultyProfile = await getUserById(decoded.uid)
		const role = ((decoded as any)?.role as string) || (facultyProfile as any)?.role

		if (role && role !== 'faculty' && role !== 'admin') {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const body = (await request.json()) as ApproveBody
		if (!body.activityId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const activity = await getActivityById(body.activityId)
		if (!activity) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const reviewerName =
			(facultyProfile as any)?.displayName ??
			(facultyProfile as any)?.fullName ??
			(decoded.name as string) ??
			'Faculty Reviewer'

		const now = Date.now()

		await updateActivity(body.activityId, {
			status: ActivityStatus.APPROVED,
			review: {
				reviewedBy: decoded.uid,
				reviewerName,
				remarks: body.remarks || 'Approved',
				reviewedAt: now,
				score: body.score,
				pointsAwarded: body.pointsAwarded ?? activity.pointsAwarded ?? 0,
			},
			pointsAwarded: body.pointsAwarded ?? activity.pointsAwarded ?? 0,
			assignedTo: decoded.uid,
			assignedToName: reviewerName,
			reviewedAt: now,
		})

		const updated = await getActivityById(body.activityId)

		return NextResponse.json<ApiResponse<Activity | null>>({
			success: true,
			data: updated,
			message: 'Activity approved',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to approve activity',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

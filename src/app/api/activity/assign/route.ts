import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getActivityById, updateActivity } from '@/lib/firebase/firestore/activities.repository'
import { getUserById } from '@/lib/firebase/firestore/users.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

interface AssignBody {
	activityId?: string
	activityIds?: string[]
	assigneeId?: string
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

		const body = (await request.json()) as AssignBody
		const targetIds = body.activityIds?.length ? body.activityIds : body.activityId ? [body.activityId] : []

		if (!targetIds.length) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId or activityIds is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const assigneeId = body.assigneeId || decoded.uid
		const assigneeProfile = await getUserById(assigneeId)

		if (!assigneeProfile) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Assignee not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const assigneeName =
			(assigneeProfile as any)?.displayName ??
			(assigneeProfile as any)?.fullName ??
			'Faculty Reviewer'

		await Promise.all(
			targetIds.map(async (activityId) => {
				const activity = await getActivityById(activityId)
				if (!activity) return

				await updateActivity(activityId, {
					status: ActivityStatus.UNDER_REVIEW,
					assignedTo: assigneeId,
					assignedToName: assigneeName,
				})
			})
		)

		const refreshedResults = await Promise.all(targetIds.map((id) => getActivityById(id)))
		const sanitized = refreshedResults.filter((activity): activity is Activity => Boolean(activity))

		return NextResponse.json<ApiResponse<Activity | Activity[] | null>>({
			success: true,
			data: targetIds.length === 1 ? sanitized[0] ?? null : sanitized,
			message: 'Activities assigned',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to assign activities',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

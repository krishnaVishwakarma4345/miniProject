import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getActivityById, updateActivity, updateActivityStatus } from '@/lib/firebase/firestore/activities.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

export async function PATCH(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		await verifySessionCookie(session, true)
		const body = (await request.json()) as {
			activityId: string
			updates?: Partial<Activity>
			status?: ActivityStatus
			remarks?: string
		}

		if (!body.activityId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		if (body.status) {
			await updateActivityStatus(body.activityId, body.status, body.remarks)
		} else if (body.updates) {
			await updateActivity(body.activityId, body.updates)
		}

		const updated = await getActivityById(body.activityId)

		return NextResponse.json<ApiResponse<Activity | null>>({
			success: true,
			data: updated,
			message: 'Activity updated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to update activity',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

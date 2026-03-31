import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getActivitiesByStudent } from '@/lib/firebase/firestore/activities.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const body = (await request.json()) as { studentId?: string }
		const studentId = body.studentId || decoded.uid

		const result = await getActivitiesByStudent(studentId, 200)
		const approvedActivities = (result.items as Activity[]).filter((activity) => activity.status === ActivityStatus.APPROVED)

		const payload = {
			studentId,
			generatedAt: Date.now(),
			approvedActivities,
			totalApproved: approvedActivities.length,
			shareUrl: `/student/portfolio/${studentId}`,
		}

		return NextResponse.json<ApiResponse<typeof payload>>({
			success: true,
			data: payload,
			message: 'Portfolio generated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to generate portfolio',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

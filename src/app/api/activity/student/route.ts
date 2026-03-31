import { NextRequest, NextResponse } from 'next/server'
import { Activity, ApiResponse } from '@/types'
import { getActivitiesByStudent } from '@/lib/firebase/firestore/activities.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

export async function GET(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const { searchParams } = new URL(request.url)
		const requestedStudentId = searchParams.get('studentId')
		const studentId = requestedStudentId || decoded.uid
		const pageSize = Number(searchParams.get('pageSize') || 50)

		const result = await getActivitiesByStudent(studentId, pageSize)

		return NextResponse.json<ApiResponse<Activity[]>>({
			success: true,
			data: result.items as Activity[],
			message: 'Activities fetched',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to fetch activities',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

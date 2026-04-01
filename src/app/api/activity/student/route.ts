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
		const requestedStudentId = searchParams.get('studentId')
		const role = (decoded.custom_claims?.role as UserRole | undefined) || UserRole.STUDENT
		const studentId = requestedStudentId || decoded.uid
		const rawPageSize = Number(searchParams.get('pageSize') || 50)
		const pageSize = Number.isFinite(rawPageSize) ? Math.min(Math.max(rawPageSize, 1), 100) : 50

		if (role === UserRole.STUDENT && studentId !== decoded.uid) {
			return NextResponse.json<ApiResponse<null>>({
				success: false,
				data: null,
				message: 'Forbidden',
				timestamp: Date.now(),
				statusCode: 403,
			}, { status: 403 })
		}

		const adminDb = getAdminFirestore()
		const querySnapshot = await adminDb
			.collection('activities')
			.where('studentId', '==', studentId)
			.orderBy('createdAt', 'desc')
			.limit(pageSize)
			.get()

		const activities = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Activity[]

		return NextResponse.json<ApiResponse<Activity[]>>({
			success: true,
			data: activities,
			message: 'Activities fetched',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: typeof error === 'object' && error !== null && 'message' in error
					? String((error as { message?: unknown }).message ?? 'Failed to fetch activities')
					: 'Failed to fetch activities'

		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message,
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

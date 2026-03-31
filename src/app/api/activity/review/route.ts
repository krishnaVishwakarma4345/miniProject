import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { getActivitiesByStatus } from '@/lib/firebase/firestore/activities.repository'
import { getUserById } from '@/lib/firebase/firestore/users.repository'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'

interface ReviewQueueResponse {
	items: Activity[]
	stats: {
		pending: number
		assignedToMe: number
		unassigned: number
	}
}

const DEFAULT_PAGE_SIZE = 25

export async function GET(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const userRecord = await getUserById(decoded.uid)
		const role = ((decoded as any)?.role as string) || (userRecord as any)?.role

		if (role && role !== 'faculty' && role !== 'admin') {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const status = (searchParams.get('status') as ActivityStatus) || ActivityStatus.UNDER_REVIEW
		const category = searchParams.get('category')
		const assignment = searchParams.get('assignment')
		const search = (searchParams.get('search') || '').toLowerCase()
		const pageSize = Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE)

		const baseResult = await getActivitiesByStatus((userRecord as any)?.institutionId, status, pageSize)
		let items = baseResult.items as Activity[]

		if (category && category !== 'all') {
			items = items.filter((item) => item.category === category)
		}

		if (search) {
			items = items.filter((item) =>
				item.title.toLowerCase().includes(search) ||
				item.description.toLowerCase().includes(search)
			)
		}

		if (assignment === 'mine') {
			items = items.filter((item) => item.assignedTo === decoded.uid)
		} else if (assignment === 'unassigned') {
			items = items.filter((item) => !item.assignedTo)
		}

		const stats: ReviewQueueResponse['stats'] = {
			pending: baseResult.items.length,
			assignedToMe: baseResult.items.filter((item) => item.assignedTo === decoded.uid).length,
			unassigned: baseResult.items.filter((item) => !item.assignedTo).length,
		}

		const payload: ApiResponse<ReviewQueueResponse> = {
			success: true,
			data: { items, stats },
			message: 'Review queue fetched',
			timestamp: Date.now(),
			statusCode: 200,
		}

		return NextResponse.json(payload)
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to fetch review queue',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'

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
		const adminDb = getAdminFirestore()

		const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
		let userRecord = userDoc.exists ? (userDoc.data() as { role?: string; institutionId?: string }) : null

		if (!userRecord) {
			const scoped = await adminDb
				.collectionGroup('users')
				.where('uid', '==', decoded.uid)
				.limit(1)
				.get()

			if (!scoped.empty) {
				userRecord = scoped.docs[0].data() as { role?: string; institutionId?: string }
			}
		}

		const role =
			userRecord?.role ||
			(decoded.custom_claims?.role as string | undefined) ||
			UserRole.STUDENT

		if (role !== UserRole.FACULTY && role !== UserRole.ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const institutionId = userRecord?.institutionId
		if (!institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for user', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const status = (searchParams.get('status') as ActivityStatus) || ActivityStatus.UNDER_REVIEW
		const category = searchParams.get('category')
		const assignment = searchParams.get('assignment')
		const search = (searchParams.get('search') || '').toLowerCase()
		const parsedPageSize = Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE)
		const pageSize = Number.isFinite(parsedPageSize)
			? Math.min(Math.max(parsedPageSize, 1), 100)
			: DEFAULT_PAGE_SIZE

		// Keep this query index-safe while composite indexes are still building.
		const snapshot = await adminDb
			.collection('activities')
			.where('institutionId', '==', institutionId)
			.limit(Math.max(pageSize * 5, 100))
			.get()

		const baseItems = snapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.filter((item) => item.status === status)
			.sort((a, b) => {
				const left = typeof a.createdAt === 'number' ? a.createdAt : 0
				const right = typeof b.createdAt === 'number' ? b.createdAt : 0
				return right - left
			}) as Activity[]
		let items = [...baseItems]

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

		items = items.slice(0, pageSize)

		const stats: ReviewQueueResponse['stats'] = {
			pending: baseItems.length,
			assignedToMe: baseItems.filter((item) => item.assignedTo === decoded.uid).length,
			unassigned: baseItems.filter((item) => !item.assignedTo).length,
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

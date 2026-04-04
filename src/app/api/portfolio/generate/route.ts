import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'
import { ensureInstitutionActivityMirror, getInstitutionActivitiesCollection } from '@/lib/firebase/firestore/activity-tenant.utils'

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

	try {
		const scoped = await adminDb
			.collectionGroup('users')
			.where('uid', '==', uid)
			.limit(1)
			.get()

		if (!scoped.empty) {
			return scoped.docs[0].data() as UserProfile
		}
	} catch {
		// Fallback to global-only access if collection group indexing is unavailable.
	}

	return null
}

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const role = (decoded.custom_claims?.role as UserRole | undefined) || UserRole.STUDENT
		const body = (await request.json()) as { studentId?: string }
		const studentId = body.studentId || decoded.uid
		const adminDb = getAdminFirestore()
		const profile = await resolveUserProfile(decoded.uid, adminDb)
		const institutionId = profile?.institutionId || (decoded.custom_claims?.institutionId as string | undefined) || (decoded.custom_claims?.org as string | undefined)

		if (role === UserRole.STUDENT && studentId !== decoded.uid) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (!institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for user', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		await ensureInstitutionActivityMirror(adminDb, institutionId)

		const querySnapshot = await getInstitutionActivitiesCollection(adminDb, institutionId)
			.where('studentId', '==', studentId)
			.orderBy('createdAt', 'desc')
			.limit(200)
			.get()

		const activities = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Activity[]

		const approvedActivities = activities.filter((activity) => activity.status === ActivityStatus.APPROVED)

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

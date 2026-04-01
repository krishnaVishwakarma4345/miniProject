import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'
import { getInstitutionActivityDoc } from '@/lib/firebase/firestore/activity-tenant.utils'

interface RejectBody {
	activityId: string
	remarks: string
}

interface UserProfile {
	uid?: string
	role?: string
	institutionId?: string
	displayName?: string
	fullName?: string
}

const resolveUserProfile = async (uid: string, adminDb: FirebaseFirestore.Firestore): Promise<UserProfile | null> => {
	const userDoc = await adminDb.collection('users').doc(uid).get()
	if (userDoc.exists) {
		return userDoc.data() as UserProfile
	}

	const scoped = await adminDb
		.collectionGroup('users')
		.where('uid', '==', uid)
		.limit(1)
		.get()

	if (scoped.empty) {
		return null
	}

	return scoped.docs[0].data() as UserProfile
}

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const adminDb = getAdminFirestore()
		const reviewerProfile = await resolveUserProfile(decoded.uid, adminDb)
		const role = reviewerProfile?.role || (decoded.custom_claims?.role as string | undefined) || UserRole.STUDENT

		if (role !== UserRole.FACULTY && role !== UserRole.ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (!reviewerProfile?.institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for user', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const body = (await request.json()) as RejectBody
		if (!body.activityId || !body.remarks) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId and remarks are required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const activityDoc = await adminDb.collection('activities').doc(body.activityId).get()
		if (!activityDoc.exists) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const activity = { id: activityDoc.id, ...activityDoc.data() } as Activity

		if (activity.institutionId !== reviewerProfile.institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'You can only review activities from your institution', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const reviewerName =
			reviewerProfile.displayName ??
			reviewerProfile.fullName ??
			(decoded.name as string) ??
			'Faculty Reviewer'

		const now = Date.now()

		await adminDb.collection('activities').doc(body.activityId).set({
			status: ActivityStatus.REJECTED,
			review: {
				reviewedBy: decoded.uid,
				reviewerName,
				remarks: body.remarks,
				reviewedAt: now,
			},
			assignedTo: decoded.uid,
			assignedToName: reviewerName,
			reviewedAt: now,
			updatedAt: now,
		}, { merge: true })
		await getInstitutionActivityDoc(adminDb, reviewerProfile.institutionId, body.activityId).set({
			id: body.activityId,
			status: ActivityStatus.REJECTED,
			review: {
				reviewedBy: decoded.uid,
				reviewerName,
				remarks: body.remarks,
				reviewedAt: now,
			},
			assignedTo: decoded.uid,
			assignedToName: reviewerName,
			reviewedAt: now,
			updatedAt: now,
		}, { merge: true })

		const updatedDoc = await adminDb.collection('activities').doc(body.activityId).get()
		const updated = updatedDoc.exists ? ({ id: updatedDoc.id, ...updatedDoc.data() } as Activity) : null

		return NextResponse.json<ApiResponse<Activity | null>>({
			success: true,
			data: updated,
			message: 'Activity rejected',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to reject activity',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

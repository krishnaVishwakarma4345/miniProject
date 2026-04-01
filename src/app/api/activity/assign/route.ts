import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { UserRole } from '@/types/user.types'
import { getInstitutionActivityDoc } from '@/lib/firebase/firestore/activity-tenant.utils'

interface AssignBody {
	activityId?: string
	activityIds?: string[]
	assigneeId?: string
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
		const actorProfile = await resolveUserProfile(decoded.uid, adminDb)
		const role = actorProfile?.role || (decoded.custom_claims?.role as string | undefined) || UserRole.STUDENT

		if (role !== UserRole.FACULTY && role !== UserRole.ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (!actorProfile?.institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for user', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const body = (await request.json()) as AssignBody
		const targetIds = body.activityIds?.length ? body.activityIds : body.activityId ? [body.activityId] : []

		if (!targetIds.length) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'activityId or activityIds is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const assigneeId = body.assigneeId || decoded.uid
		const assigneeProfile = await resolveUserProfile(assigneeId, adminDb)

		if (!assigneeProfile) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Assignee not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		if (assigneeProfile.institutionId !== actorProfile.institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Assignee must belong to your institution', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (assigneeProfile.role !== UserRole.FACULTY && assigneeProfile.role !== UserRole.ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Assignee must be faculty or admin', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const assigneeName =
			assigneeProfile.displayName ??
			assigneeProfile.fullName ??
			'Faculty Reviewer'

		const activityDocs = await Promise.all(
			targetIds.map((activityId) => adminDb.collection('activities').doc(activityId).get())
		)

		const missingActivity = activityDocs.find((doc) => !doc.exists)
		if (missingActivity) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Activity not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const outOfInstitution = activityDocs.find((doc) => {
			const data = doc.data() as { institutionId?: string } | undefined
			return data?.institutionId !== actorProfile.institutionId
		})

		if (outOfInstitution) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'One or more activities do not belong to your institution', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const now = Date.now()

		await Promise.all(
			targetIds.map(async (activityId) => {
				const payload = {
					status: ActivityStatus.UNDER_REVIEW,
					assignedTo: assigneeId,
					assignedToName: assigneeName,
					updatedAt: now,
				}
				await adminDb.collection('activities').doc(activityId).set(payload, { merge: true })
				await getInstitutionActivityDoc(adminDb, actorProfile.institutionId!, activityId).set({ id: activityId, ...payload }, { merge: true })
			})
		)

		const refreshedResults = await Promise.all(targetIds.map((id) => adminDb.collection('activities').doc(id).get()))
		const sanitized = refreshedResults
			.filter((doc) => doc.exists)
			.map((doc) => ({ id: doc.id, ...doc.data() } as Activity))

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

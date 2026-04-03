import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityCategory, ActivityCreateRequest, ActivityStatus, ActivityType, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { mirrorActivityDocument } from '@/lib/firebase/firestore/activity-tenant.utils'
import { findCategoryFacultyReviewer } from '@/lib/review/facultyCategoryAccess'

export async function POST(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const body = (await request.json()) as ActivityCreateRequest

		const adminDb = getAdminFirestore()
		const userSnapshot = await adminDb.collection('users').doc(decoded.uid).get()
		let userRecord = userSnapshot.exists ? (userSnapshot.data() as { institutionId?: string; displayName?: string; fullName?: string }) : null
		let institutionId = userRecord?.institutionId

		if (!institutionId) {
			const scopedUserSnapshot = await adminDb
				.collectionGroup('users')
				.where('uid', '==', decoded.uid)
				.limit(1)
				.get()

			if (!scopedUserSnapshot.empty) {
				const scopedData = scopedUserSnapshot.docs[0].data() as { institutionId?: string; displayName?: string; fullName?: string }
				institutionId = scopedData.institutionId
				userRecord = {
					...scopedData,
					...userRecord,
				}
			}
		}

		if (!institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for user', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const submitterName =
			userRecord?.displayName ??
			userRecord?.fullName ??
			(decoded.name as string) ??
			'Student'

		const now = Date.now()
		const categoryReviewer = await findCategoryFacultyReviewer(adminDb, institutionId, body.category as ActivityCategory)
		const normalizedProofFiles = (body.proofFiles || []).map((file, index) => ({
			...file,
			order: file.order ?? index,
			uploadedAt: file.uploadedAt ?? now,
		}))

		const document: Omit<Activity, 'id'> = {
			institutionId,
			studentId: decoded.uid,
			submittedBy: decoded.uid,
			submittedByName: submitterName,
			title: body.title,
			description: body.description,
			category: body.category as ActivityCategory,
			type: body.type as ActivityType,
			activityDate: body.activityDate,
			location: body.location,
			organization: body.organization,
			durationHours: body.durationHours,
			certificatesAwards: body.certificatesAwards,
			status: ActivityStatus.SUBMITTED,
			proofFiles: normalizedProofFiles,
			assignedTo: categoryReviewer?.uid,
			assignedToName: categoryReviewer?.name,
			isFeatured: false,
			tags: body.tags || [],
			createdAt: now,
			updatedAt: now,
			submittedAt: now,
		}

		const activityRef = adminDb.collection('activities').doc()
		const payload = {
			...document,
			id: activityRef.id,
		}

		await activityRef.set(payload)
		await mirrorActivityDocument(adminDb, institutionId, activityRef.id, payload)

		const id = activityRef.id

		return NextResponse.json<ApiResponse<{ id: string }>>({
			success: true,
			data: { id },
			message: 'Activity created successfully',
			timestamp: Date.now(),
			statusCode: 201,
		}, { status: 201 })
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: typeof error === 'object' && error !== null && 'message' in error
					? String((error as { message?: unknown }).message ?? 'Failed to create activity')
					: 'Failed to create activity'

		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message,
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

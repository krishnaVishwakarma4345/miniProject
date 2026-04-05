import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityCategory, ActivityCreateRequest, ActivityStatus, ActivityType, ApiResponse } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { mirrorActivityDocument } from '@/lib/firebase/firestore/activity-tenant.utils'
import { findCategoryFacultyReviewer } from '@/lib/review/facultyCategoryAccess'
import { activityCreateSchema } from '@/schemas/activity.schema'
import { StudentProfile } from '@/types/user.types'

type UserRecord = {
	institutionId?: string
	displayName?: string
	fullName?: string
	studentProfile?: Partial<StudentProfile>
}

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
		let userRecord = userSnapshot.exists ? (userSnapshot.data() as UserRecord) : null
		let institutionId = userRecord?.institutionId

		if (!institutionId) {
			const scopedUserSnapshot = await adminDb
				.collectionGroup('users')
				.where('uid', '==', decoded.uid)
				.limit(1)
				.get()

			if (!scopedUserSnapshot.empty) {
				const scopedData = scopedUserSnapshot.docs[0].data() as UserRecord
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

		const studentProfile = userRecord?.studentProfile as
			| {
				studentId?: string
				year?: number
				semester?: number
				division?: string
				rollNo?: string
				branch?: string
			}
			| undefined

		if (!studentProfile?.studentId || !studentProfile?.year || !studentProfile?.semester || !studentProfile?.division || !studentProfile?.rollNo || !studentProfile?.branch) {
			return NextResponse.json<ApiResponse<null>>({
				success: false,
				data: null,
				message: 'Complete your student profile with year, semester, division, student ID, roll number, and branch before submitting an activity',
				timestamp: Date.now(),
				statusCode: 400,
			}, { status: 400 })
		}

		const submissionPayload = {
			...body,
			studentId: studentProfile.studentId,
			year: studentProfile.year,
			semester: studentProfile.semester,
			division: studentProfile.division,
			rollNo: studentProfile.rollNo,
			branch: studentProfile.branch,
		}

		const validation = activityCreateSchema.safeParse(submissionPayload)
		if (!validation.success) {
			const firstIssue = validation.error.issues[0]
			return NextResponse.json<ApiResponse<null>>({
				success: false,
				data: null,
				message: firstIssue?.message || 'Invalid activity payload',
				timestamp: Date.now(),
				statusCode: 400,
			}, { status: 400 })
		}

		const submitterName =
			userRecord?.displayName ??
			userRecord?.fullName ??
			(decoded.name as string) ??
			'Student'

		const now = Date.now()
		const categoryReviewer = await findCategoryFacultyReviewer(adminDb, institutionId, validation.data.category as ActivityCategory)
		const normalizedProofFiles = (validation.data.proofFiles || []).map((file, index) => ({
			...file,
			order: file.order ?? index,
			uploadedAt: file.uploadedAt ?? now,
		}))

		const document: Omit<Activity, 'id'> = {
			institutionId,
			studentId: decoded.uid,
			year: validation.data.year,
			semester: validation.data.semester,
			division: validation.data.division,
			rollNo: validation.data.rollNo,
			branch: validation.data.branch,
			submittedBy: decoded.uid,
			submittedByName: submitterName,
			title: validation.data.title,
			description: validation.data.description,
			category: validation.data.category as ActivityCategory,
			type: validation.data.type as ActivityType,
			activityDate: validation.data.activityDate,
			location: validation.data.location,
			organization: validation.data.organization,
			durationHours: validation.data.durationHours,
			certificatesAwards: validation.data.certificatesAwards,
			status: ActivityStatus.SUBMITTED,
			proofFiles: normalizedProofFiles,
			isFeatured: false,
			tags: validation.data.tags || [],
			createdAt: now,
			updatedAt: now,
			submittedAt: now,
		}

		const activityRef = adminDb.collection('activities').doc()
		const payload = {
			...document,
			id: activityRef.id,
			...(categoryReviewer ? { assignedTo: categoryReviewer.uid, assignedToName: categoryReviewer.name } : {}),
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

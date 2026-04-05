import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse, UserRole, UserStatus } from '@/types'
import { StudentProfile } from '@/types/user.types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { AnalyticsOverview, AnalyticsRange, StudentProgressDatum } from '@/features/analytics/types/analytics.types'
import { ensureInstitutionActivityMirror, getInstitutionActivitiesCollection } from '@/lib/firebase/firestore/activity-tenant.utils'
import { BRANCH_OPTIONS } from '@/constants/filterOptions'

interface UserProfile {
	uid?: string
	fullName?: string
	email?: string
	role?: UserRole
	status?: UserStatus
	institutionId?: string
	profileCompletion?: number
	studentProfile?: Partial<StudentProfile> & { academicYear?: number }
}

const extractInstitutionFromPath = (path: string): string | undefined => {
	const parts = path.split('/')
	const institutionsIndex = parts.indexOf('institutions')
	if (institutionsIndex === -1) return undefined
	return parts[institutionsIndex + 1]
}

const resolveUserProfile = async (uid: string, email: string | undefined, adminDb: FirebaseFirestore.Firestore): Promise<UserProfile | null> => {
	const userRef = adminDb.collection('users').doc(uid)
	const userDoc = await userRef.get()
	const globalUser = userDoc.exists ? (userDoc.data() as UserProfile) : null

	let scopedDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null

	try {
		const scopedByUid = await adminDb
			.collectionGroup('users')
			.where('uid', '==', uid)
			.limit(1)
			.get()

		if (!scopedByUid.empty) {
			scopedDoc = scopedByUid.docs[0]
		}
	} catch {
		// Ignore collection group index/bootstrap issues and continue with global user fallback.
	}

	if (!scopedDoc && email) {
		try {
			const scopedByEmail = await adminDb
				.collectionGroup('users')
				.where('email', '==', email)
				.limit(1)
				.get()

			if (!scopedByEmail.empty) {
				scopedDoc = scopedByEmail.docs[0]
			}
		} catch {
			// Ignore collection group index/bootstrap issues and continue with global user fallback.
		}
	}

	if (!scopedDoc) {
		return globalUser ? { ...globalUser, uid } : null
	}

	const scopedData = scopedDoc.data() as UserProfile
	const scopedInstitutionId = scopedData.institutionId || extractInstitutionFromPath(scopedDoc.ref.path)
	const merged: UserProfile = {
		...globalUser,
		...scopedData,
		uid,
		institutionId: globalUser?.institutionId || scopedInstitutionId,
	}

	if (!globalUser?.institutionId && merged.institutionId) {
		await userRef.set({ institutionId: merged.institutionId, updatedAt: Date.now() }, { merge: true })
	}

	return merged
}

const getRangeDays = (range: AnalyticsRange): number => {
	if (range === '7d') return 7
	if (range === '90d') return 90
	return 30
}

const normalizeBreakdownLabel = (value?: string) => {
	const trimmed = value?.trim()
	if (!trimmed) return 'General'

	const matchedBranch = BRANCH_OPTIONS.find((branch) => branch.toLowerCase() === trimmed.toLowerCase())
	if (matchedBranch) return matchedBranch

	return trimmed
		.toLowerCase()
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export async function GET(request: NextRequest) {
	try {
		const session = parseSessionCookie(request.headers)
		if (!session) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 })
		}

		const decoded = await verifySessionCookie(session, true)
		const adminDb = getAdminFirestore()
		const adminProfile = await resolveUserProfile(decoded.uid, decoded.email, adminDb)
		const claimInstitutionId = (decoded.institutionId as string | undefined) || (decoded.org as string | undefined) || (decoded.custom_claims?.institutionId as string | undefined) || (decoded.custom_claims?.org as string | undefined)
		const resolvedAdminProfile = adminProfile ? { ...adminProfile, institutionId: adminProfile.institutionId || claimInstitutionId } : null
		const role = adminProfile?.role || (decoded.role as UserRole | undefined) || (decoded.custom_claims?.role as UserRole | undefined) || UserRole.STUDENT

		if (role !== UserRole.ADMIN && role !== UserRole.FACULTY) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const institutionId = resolvedAdminProfile?.institutionId
		if (!institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for admin', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		await ensureInstitutionActivityMirror(adminDb, institutionId)

		if (adminProfile && !adminProfile.institutionId && institutionId) {
			await adminDb.collection('users').doc(decoded.uid).set({ institutionId, updatedAt: Date.now() }, { merge: true })
		}

		const rangeValue = (new URL(request.url).searchParams.get('range') || '30d') as AnalyticsRange
		const range = rangeValue === '7d' || rangeValue === '90d' ? rangeValue : '30d'
		const now = Date.now()
		const rangeStart = now - getRangeDays(range) * 24 * 60 * 60 * 1000

		const [usersSnapshot, activitiesSnapshot] = await Promise.all([
			adminDb.collection('users').where('institutionId', '==', institutionId).get(),
			getInstitutionActivitiesCollection(adminDb, institutionId).get(),
		])

		const users = usersSnapshot.docs.map((doc) => doc.data() as UserProfile)
		const activities = activitiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Activity))

		const activeUsers = users.filter((user) => (user.status || UserStatus.ACTIVE) === UserStatus.ACTIVE).length
		const pendingReviews = activities.filter((activity) => activity.status === ActivityStatus.SUBMITTED || activity.status === ActivityStatus.UNDER_REVIEW).length
		const approved = activities.filter((activity) => activity.status === ActivityStatus.APPROVED).length
		const approvedRate = activities.length ? (approved / activities.length) * 100 : 0

		const metrics: AnalyticsOverview['metrics'] = [
			{ id: 'total-users', label: 'Registered users', value: users.length, trendLabel: 'institution total', positive: true },
			{ id: 'active-users', label: 'Active users', value: activeUsers, trendLabel: 'current status', positive: true },
			{ id: 'pending-reviews', label: 'Pending reviews', value: pendingReviews, trendLabel: 'submitted + under review', positive: pendingReviews < 20 },
			{ id: 'approval-rate', label: 'Approval rate', value: Number(approvedRate.toFixed(1)), suffix: '%', trendLabel: 'all time', positive: approvedRate >= 50 },
		]

		const participationMap = new Map<string, number>()
		activities.forEach((activity) => {
			if (typeof activity.createdAt !== 'number' || activity.createdAt < rangeStart) return
			const month = new Date(activity.createdAt).toLocaleString('en-US', { month: 'short' })
			participationMap.set(month, (participationMap.get(month) || 0) + 1)
		})

		const participation = Array.from(participationMap.entries()).map(([label, value]) => ({ label, value }))

		const categoryMap = new Map<Activity['category'], number>()
		activities.forEach((activity) => {
			categoryMap.set(activity.category, (categoryMap.get(activity.category) || 0) + 1)
		})

		const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }))

		const studentProfilesByUid = new Map<string, StudentProgressDatum['studentProfile']>()
		users.forEach((user) => {
			if (user.role === UserRole.STUDENT && user.uid) {
				const semesterCgpa = (user.studentProfile?.semesterCgpa || [])
					.filter((entry) => typeof entry?.semester === 'number' && typeof entry?.cgpa === 'number')
					.map((entry) => ({ semester: entry.semester as number, cgpa: entry.cgpa as number }))
					.sort((a, b) => a.semester - b.semester)

				studentProfilesByUid.set(user.uid, {
					studentId: user.studentProfile?.studentId,
					academicYear: user.studentProfile?.academicYear ?? user.studentProfile?.year,
					year: user.studentProfile?.year,
					semester: user.studentProfile?.semester,
					division: user.studentProfile?.division,
					branch: user.studentProfile?.branch,
					rollNo: user.studentProfile?.rollNo,
					department: normalizeBreakdownLabel(user.studentProfile?.branch || user.studentProfile?.department),
					cgpa: user.studentProfile?.cgpa,
					semesterCgpa,
					profileCompletion: user.profileCompletion,
				})
			}
		})

		const studentDepartmentByUid = new Map<string, string>()
		studentProfilesByUid.forEach((profile, uid) => {
			studentDepartmentByUid.set(uid, profile?.department || 'General')
		})

		const departmentMap = new Map<string, number>()
		activities.forEach((activity) => {
			const department = studentDepartmentByUid.get(activity.submittedBy) || 'General'
			departmentMap.set(department, (departmentMap.get(department) || 0) + 1)
		})

		const departments = Array.from(departmentMap.entries())
			.map(([department, total]) => ({ department, total }))
			.sort((a, b) => b.total - a.total)

		const monthTrendMap = new Map<string, { submitted: number; approved: number }>()
		activities.forEach((activity) => {
			if (typeof activity.createdAt !== 'number' || activity.createdAt < rangeStart) return
			const label = new Date(activity.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' })
			const current = monthTrendMap.get(label) || { submitted: 0, approved: 0 }
			current.submitted += 1
			if (activity.status === ActivityStatus.APPROVED) {
				current.approved += 1
			}
			monthTrendMap.set(label, current)
		})

		const trend = Array.from(monthTrendMap.entries()).map(([label, values]) => ({
			label,
			submitted: values.submitted,
			approved: values.approved,
		}))

		const topStudentMap = new Map<string, { name: string; approved: number; points: number; department?: string }>()
		activities.forEach((activity) => {
			if (activity.status !== ActivityStatus.APPROVED) return
			const existing = topStudentMap.get(activity.submittedBy) || {
				name: activity.submittedByName,
				approved: 0,
				points: 0,
				department: studentDepartmentByUid.get(activity.submittedBy),
			}
			existing.approved += 1
			existing.points += activity.pointsAwarded || 0
			topStudentMap.set(activity.submittedBy, existing)
		})

		const topStudents = Array.from(topStudentMap.entries())
			.map(([studentId, value]) => ({
				studentId,
				name: value.name,
				department: value.department,
				approved: value.approved,
				pointsAwarded: value.points,
			}))
			.sort((a, b) => b.pointsAwarded - a.pointsAwarded)
			.slice(0, 5)

		const studentProgressMap = new Map<string, StudentProgressDatum>()
		activities.forEach((activity) => {
			const studentProfile = studentProfilesByUid.get(activity.submittedBy)
			const existing = studentProgressMap.get(activity.submittedBy) || {
				studentId: activity.submittedBy,
				name: activity.submittedByName,
				email: undefined,
				department: studentDepartmentByUid.get(activity.submittedBy),
				studentProfile,
				approvedActivities: 0,
				totalSubmissions: 0,
				totalCredits: 0,
				submissions: [],
			}

			existing.totalSubmissions += 1
			if (activity.status === ActivityStatus.APPROVED) {
				existing.approvedActivities += 1
				existing.totalCredits += activity.pointsAwarded || 0
			}
			existing.submissions.push({
				activityId: activity.id,
				title: activity.title,
				category: activity.category,
				status: activity.status,
				activityDate: activity.activityDate,
				createdAt: activity.createdAt,
				pointsAwarded: activity.status === ActivityStatus.APPROVED ? activity.pointsAwarded || 0 : 0,
				year: activity.year,
				semester: activity.semester,
				division: activity.division,
				branch: activity.branch,
			})

			studentProgressMap.set(activity.submittedBy, existing)
		})

		const studentProgress = Array.from(studentProgressMap.values())
			.map((student) => ({
				...student,
				submissions: student.submissions.sort((a, b) => b.createdAt - a.createdAt),
			}))
			.sort((a, b) => b.totalSubmissions - a.totalSubmissions)

		const data: AnalyticsOverview = {
			metrics,
			participation,
			categories,
			departments,
			trend,
			topStudents,
			studentProgress,
		}

		return NextResponse.json<ApiResponse<AnalyticsOverview>>({
			success: true,
			data,
			message: 'Analytics fetched',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to fetch analytics',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

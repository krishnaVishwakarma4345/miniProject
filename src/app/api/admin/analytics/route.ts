import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse, UserRole, UserStatus } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { AnalyticsOverview, AnalyticsRange } from '@/features/analytics/types/analytics.types'
import { ensureInstitutionActivityMirror, getInstitutionActivitiesCollection } from '@/lib/firebase/firestore/activity-tenant.utils'

interface UserProfile {
	uid?: string
	role?: UserRole
	status?: UserStatus
	institutionId?: string
	studentProfile?: { department?: string }
	email?: string
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

		if (role !== UserRole.ADMIN) {
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

		const studentDepartmentByUid = new Map<string, string>()
		users.forEach((user) => {
			if (user.role === UserRole.STUDENT && user.uid) {
				studentDepartmentByUid.set(user.uid, user.studentProfile?.department || 'General')
			}
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

		const data: AnalyticsOverview = {
			metrics,
			participation,
			categories,
			departments,
			trend,
			topStudents,
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

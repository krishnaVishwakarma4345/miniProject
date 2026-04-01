import { NextRequest, NextResponse } from 'next/server'
import { Activity, ActivityStatus, ApiResponse, UserRole } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { GeneratedReport, ReportBuilderConfig, ReportTemplate } from '@/features/reports/types/report.types'
import { ensureInstitutionActivityMirror, getInstitutionActivitiesCollection } from '@/lib/firebase/firestore/activity-tenant.utils'

interface UserProfile {
	uid?: string
	role?: UserRole
	institutionId?: string
	studentProfile?: { department?: string }
	email?: string
}

const templates: ReportTemplate[] = [
	{
		id: 'institution-summary',
		name: 'Institution Summary',
		description: 'Overview of users, submissions, and review pipeline health.',
		recommendedFor: 'Admin monthly review',
	},
	{
		id: 'department-performance',
		name: 'Department Performance',
		description: 'Submission and approval trends by department.',
		recommendedFor: 'Department heads',
	},
	{
		id: 'student-outcomes',
		name: 'Student Outcomes',
		description: 'Top contributors, points distribution, and portfolio readiness indicators.',
		recommendedFor: 'Accreditation committee',
	},
]

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

const authorizeAdmin = async (request: NextRequest, adminDb: FirebaseFirestore.Firestore) => {
	const session = parseSessionCookie(request.headers)
	if (!session) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 }) }
	}

	const decoded = await verifySessionCookie(session, true)
	const adminProfile = await resolveUserProfile(decoded.uid, decoded.email, adminDb)
	const claimInstitutionId = (decoded.institutionId as string | undefined) || (decoded.org as string | undefined) || (decoded.custom_claims?.institutionId as string | undefined) || (decoded.custom_claims?.org as string | undefined)
	const resolvedAdminProfile = adminProfile ? { ...adminProfile, institutionId: adminProfile.institutionId || claimInstitutionId } : null
	const role = adminProfile?.role || (decoded.role as UserRole | undefined) || (decoded.custom_claims?.role as UserRole | undefined) || UserRole.STUDENT

	if (role !== UserRole.ADMIN) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 }) }
	}

	if (!resolvedAdminProfile?.institutionId) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for admin', timestamp: Date.now(), statusCode: 403 }, { status: 403 }) }
	}

	if (adminProfile && !adminProfile.institutionId && resolvedAdminProfile.institutionId) {
		await adminDb.collection('users').doc(decoded.uid).set({ institutionId: resolvedAdminProfile.institutionId, updatedAt: Date.now() }, { merge: true })
	}

	return { adminProfile: resolvedAdminProfile }
}

export async function GET(request: NextRequest) {
	try {
		const adminDb = getAdminFirestore()
		const auth = await authorizeAdmin(request, adminDb)
		if ('error' in auth) {
			return auth.error
		}

		await ensureInstitutionActivityMirror(adminDb, auth.adminProfile.institutionId as string)

		return NextResponse.json<ApiResponse<ReportTemplate[]>>({
			success: true,
			data: templates,
			message: 'Report templates fetched',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to fetch report templates',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const adminDb = getAdminFirestore()
		const auth = await authorizeAdmin(request, adminDb)
		if ('error' in auth) {
			return auth.error
		}

		const config = (await request.json()) as ReportBuilderConfig
		const institutionId = auth.adminProfile.institutionId as string

		const [usersSnapshot, activitiesSnapshot] = await Promise.all([
			adminDb.collection('users').where('institutionId', '==', institutionId).get(),
			getInstitutionActivitiesCollection(adminDb, institutionId).get(),
		])

		const users = usersSnapshot.docs.map((doc) => doc.data() as UserProfile)
		const activities = activitiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Activity))

		const submitted = activities.filter((activity) => activity.status === ActivityStatus.SUBMITTED || activity.status === ActivityStatus.UNDER_REVIEW).length
		const approved = activities.filter((activity) => activity.status === ActivityStatus.APPROVED).length
		const rejected = activities.filter((activity) => activity.status === ActivityStatus.REJECTED).length

		const departmentMap = new Map<string, number>()
		const studentDepartmentByUid = new Map<string, string>()
		users.forEach((user) => {
			if (user.role === UserRole.STUDENT && user.uid) {
				studentDepartmentByUid.set(user.uid, user.studentProfile?.department || 'General')
			}
		})
		activities.forEach((activity) => {
			const department = studentDepartmentByUid.get(activity.submittedBy) || 'General'
			departmentMap.set(department, (departmentMap.get(department) || 0) + 1)
		})

		const topDepartment = Array.from(departmentMap.entries()).sort((a, b) => b[1] - a[1])[0]

		const report: GeneratedReport = {
			id: `${institutionId}-${Date.now()}`,
			createdAt: Date.now(),
			format: config.format,
			fileName: `institution-report-${new Date().toISOString().slice(0, 10)}.${config.format}`,
			sections: [
				{ title: 'Registered users', value: String(users.length) },
				{ title: 'Total submissions', value: String(activities.length) },
				{ title: 'Pending reviews', value: String(submitted) },
				{ title: 'Approved', value: String(approved) },
				{ title: 'Rejected', value: String(rejected) },
			],
			highlights: [
				`${submitted} activities are awaiting review action`,
				`Approval rate is ${activities.length ? ((approved / activities.length) * 100).toFixed(1) : '0.0'}%`,
				topDepartment ? `${topDepartment[0]} leads with ${topDepartment[1]} submissions` : 'No department data available yet',
			],
		}

		return NextResponse.json<ApiResponse<GeneratedReport>>({
			success: true,
			data: report,
			message: 'Report generated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to generate report',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

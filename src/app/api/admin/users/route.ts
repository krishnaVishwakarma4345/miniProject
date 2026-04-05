import { NextRequest, NextResponse } from 'next/server'
import { ActivityCategory, ApiResponse, UserRole, UserStatus } from '@/types'
import { parseSessionCookie } from '@/lib/firebase/auth/createSessionCookie'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { AdminUserSummary } from '@/features/users/types/user.types'

interface UserProfile {
	uid?: string
	fullName?: string
	displayName?: string
	email?: string
	role?: UserRole
	status?: UserStatus
	institutionId?: string
	lastLoginAt?: number
	updatedAt?: number
	studentProfile?: { department?: string; totalActivities?: number }
	facultyProfile?: { department?: string; reviewCategories?: ActivityCategory[] }
	adminProfile?: { department?: string }
}

interface ManagerProfile extends UserProfile {
	uid: string
	role: UserRole
}

interface UpdateUserBody {
	userId?: string
	role?: UserRole
	status?: UserStatus
	institutionId?: string
	department?: string
	reviewCategories?: ActivityCategory[]
}

interface BulkRoleBody {
	action?: 'bulkRoleUpdate'
	userIds?: string[]
	role?: UserRole
	institutionId?: string
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

const mapUserSummary = (uid: string, user: UserProfile): AdminUserSummary => ({
	id: uid,
	name: user.fullName || user.displayName || user.email || 'Unknown User',
	email: user.email || 'unknown@example.com',
	role: user.role || UserRole.STUDENT,
	status: user.status || UserStatus.ACTIVE,
	department: user.studentProfile?.department || user.facultyProfile?.department || user.adminProfile?.department,
	reviewCategories: user.facultyProfile?.reviewCategories,
	lastActive: user.lastLoginAt,
	totalActivities: user.studentProfile?.totalActivities,
	institutionId: user.institutionId,
})

const normalizeCategories = (value: unknown): ActivityCategory[] | undefined => {
	if (!Array.isArray(value)) {
		return undefined
	}

	const allowed = new Set(Object.values(ActivityCategory) as ActivityCategory[])
	const normalized = value.filter((entry): entry is ActivityCategory => typeof entry === 'string' && allowed.has(entry as ActivityCategory))

	return Array.from(new Set(normalized))
}

const getAuthorizedAdminProfile = async (request: NextRequest, adminDb: FirebaseFirestore.Firestore) => {
	const session = parseSessionCookie(request.headers)
	if (!session) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Unauthorized', timestamp: Date.now(), statusCode: 401 }, { status: 401 }) }
	}

	const decoded = await verifySessionCookie(session, true)
	const adminProfile = await resolveUserProfile(decoded.uid, decoded.email, adminDb)
	const claimInstitutionId = (decoded.institutionId as string | undefined) || (decoded.org as string | undefined) || (decoded.custom_claims?.institutionId as string | undefined) || (decoded.custom_claims?.org as string | undefined)
	const resolvedAdminProfile = adminProfile ? { ...adminProfile, institutionId: adminProfile.institutionId || claimInstitutionId } : null
	const role = adminProfile?.role || (decoded.role as UserRole | undefined) || (decoded.custom_claims?.role as UserRole | undefined) || UserRole.STUDENT

	if (role !== UserRole.ADMIN && role !== UserRole.MASTER_ADMIN) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Forbidden', timestamp: Date.now(), statusCode: 403 }, { status: 403 }) }
	}

	if (role === UserRole.ADMIN && !resolvedAdminProfile?.institutionId) {
		return { error: NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Institution not found for admin', timestamp: Date.now(), statusCode: 403 }, { status: 403 }) }
	}

	if (role === UserRole.ADMIN && adminProfile && !adminProfile.institutionId && resolvedAdminProfile?.institutionId) {
		await adminDb.collection('users').doc(decoded.uid).set({ institutionId: resolvedAdminProfile.institutionId, updatedAt: Date.now() }, { merge: true })
	}

	return { managerProfile: { ...(resolvedAdminProfile || {}), uid: decoded.uid, role } as ManagerProfile }
}

const resolveInstitutionScope = (
	request: NextRequest,
	managerProfile: ManagerProfile,
	requestedInstitutionId?: string
): { institutionId?: string; error?: NextResponse } => {
	const url = new URL(request.url)
	const institutionId = requestedInstitutionId?.trim() || url.searchParams.get('institutionId')?.trim() || undefined

	if (managerProfile.role === UserRole.MASTER_ADMIN) {
		if (!institutionId) {
			return {
				error: NextResponse.json<ApiResponse<null>>(
					{ success: false, data: null, message: 'institutionId is required for master admin requests', timestamp: Date.now(), statusCode: 400 },
					{ status: 400 }
				),
			}
		}

		return { institutionId }
	}

	if (!managerProfile.institutionId) {
		return {
			error: NextResponse.json<ApiResponse<null>>(
				{ success: false, data: null, message: 'Institution not found for admin', timestamp: Date.now(), statusCode: 403 },
				{ status: 403 }
			),
		}
	}

	if (institutionId && institutionId !== managerProfile.institutionId) {
		return {
			error: NextResponse.json<ApiResponse<null>>(
				{ success: false, data: null, message: 'You can only manage users from your institution', timestamp: Date.now(), statusCode: 403 },
				{ status: 403 }
			),
		}
	}

	return { institutionId: managerProfile.institutionId }
}

export async function GET(request: NextRequest) {
	try {
		const adminDb = getAdminFirestore()
		const auth = await getAuthorizedAdminProfile(request, adminDb)
		if ('error' in auth) {
			return auth.error
		}

		const scope = resolveInstitutionScope(request, auth.managerProfile)
		if ('error' in scope) {
			return scope.error
		}

		const { searchParams } = new URL(request.url)
		const roleFilter = searchParams.get('role')
		const statusFilter = searchParams.get('status')
		const searchFilter = (searchParams.get('search') || '').trim().toLowerCase()

		const usersSnapshot = await adminDb
			.collection('users')
			.where('institutionId', '==', scope.institutionId)
			.get()

		let users = usersSnapshot.docs
			.map((doc) => mapUserSummary(doc.id, doc.data() as UserProfile))
			.filter((user) => user.role !== UserRole.MASTER_ADMIN)

		if (roleFilter && roleFilter !== 'all') {
			users = users.filter((user) => user.role === roleFilter)
		}

		if (statusFilter && statusFilter !== 'all') {
			users = users.filter((user) => user.status === statusFilter)
		}

		if (searchFilter) {
			users = users.filter((user) =>
				user.name.toLowerCase().includes(searchFilter) ||
				user.email.toLowerCase().includes(searchFilter) ||
				(user.department || '').toLowerCase().includes(searchFilter)
			)
		}

		users.sort((a, b) => (a.name > b.name ? 1 : -1))

		return NextResponse.json<ApiResponse<AdminUserSummary[]>>({
			success: true,
			data: users,
			message: 'Users fetched',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to fetch users',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const adminDb = getAdminFirestore()
		const auth = await getAuthorizedAdminProfile(request, adminDb)
		if ('error' in auth) {
			return auth.error
		}

		const body = (await request.json()) as UpdateUserBody
		if (!body.userId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'userId is required', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const scope = resolveInstitutionScope(request, auth.managerProfile, body.institutionId)
		if ('error' in scope) {
			return scope.error
		}

		const userRef = adminDb.collection('users').doc(body.userId)
		const userDoc = await userRef.get()
		if (!userDoc.exists) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'User not found', timestamp: Date.now(), statusCode: 404 }, { status: 404 })
		}

		const targetUser = userDoc.data() as UserProfile
		if (targetUser.institutionId !== scope.institutionId) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'You can only manage users from your institution', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (targetUser.role === UserRole.MASTER_ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Cannot modify master admin users', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const isMasterAdmin = auth.managerProfile.role === UserRole.MASTER_ADMIN
		if (isMasterAdmin && (body.status !== undefined || body.department !== undefined || body.reviewCategories !== undefined || body.role !== UserRole.ADMIN)) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Master admin can only promote users to admin', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const updates: Record<string, unknown> = { updatedAt: Date.now() }
		if (body.role && body.role !== UserRole.MASTER_ADMIN) {
			updates.role = body.role
		}
		if (body.status) {
			updates.status = body.status
		}
		if (body.department) {
			if (targetUser.role === UserRole.STUDENT) {
				updates.studentProfile = { ...(targetUser.studentProfile || {}), department: body.department }
			} else if (targetUser.role === UserRole.FACULTY) {
				updates.facultyProfile = { ...(targetUser.facultyProfile || {}), department: body.department }
			} else if (targetUser.role === UserRole.ADMIN) {
				updates.adminProfile = { ...(targetUser.adminProfile || {}), department: body.department }
			}
		}

		const normalizedReviewCategories = normalizeCategories(body.reviewCategories)
		if (normalizedReviewCategories) {
			const nextRole = body.role || targetUser.role
			if (nextRole !== UserRole.FACULTY) {
				return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Review categories can only be assigned to faculty users', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
			}

			updates.facultyProfile = {
				...(targetUser.facultyProfile || {}),
				...(typeof updates.facultyProfile === 'object' ? updates.facultyProfile as Record<string, unknown> : {}),
				reviewCategories: normalizedReviewCategories,
			}
		}

		await userRef.set(updates, { merge: true })

		if (targetUser.institutionId) {
			await adminDb
				.collection('institutions')
				.doc(targetUser.institutionId)
				.collection('users')
				.doc(body.userId)
				.set(updates, { merge: true })
		}

		const updatedDoc = await userRef.get()
		const updatedUser = mapUserSummary(updatedDoc.id, updatedDoc.data() as UserProfile)

		return NextResponse.json<ApiResponse<AdminUserSummary>>({
			success: true,
			data: updatedUser,
			message: 'User updated',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to update user',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const adminDb = getAdminFirestore()
		const auth = await getAuthorizedAdminProfile(request, adminDb)
		if ('error' in auth) {
			return auth.error
		}

		const body = (await request.json()) as BulkRoleBody
		if (body.action !== 'bulkRoleUpdate' || !body.userIds?.length || !body.role) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Invalid bulk role update payload', timestamp: Date.now(), statusCode: 400 }, { status: 400 })
		}

		const scope = resolveInstitutionScope(request, auth.managerProfile, body.institutionId)
		if ('error' in scope) {
			return scope.error
		}

		if (body.role === UserRole.MASTER_ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Cannot assign master admin role from admin panel', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		if (auth.managerProfile.role === UserRole.MASTER_ADMIN && body.role !== UserRole.ADMIN) {
			return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message: 'Master admin can only promote users to admin', timestamp: Date.now(), statusCode: 403 }, { status: 403 })
		}

		const now = Date.now()

		await Promise.all(
			body.userIds.map(async (userId) => {
				const userRef = adminDb.collection('users').doc(userId)
				const userDoc = await userRef.get()

				if (!userDoc.exists) return

				const user = userDoc.data() as UserProfile
				if (user.institutionId !== scope.institutionId) return
				if (user.role === UserRole.MASTER_ADMIN) return

				const updates = { role: body.role, updatedAt: now }
				await userRef.set(updates, { merge: true })

				if (user.institutionId) {
					await adminDb
						.collection('institutions')
						.doc(user.institutionId)
						.collection('users')
						.doc(userId)
						.set(updates, { merge: true })
				}
			})
		)

		const usersSnapshot = await adminDb
			.collection('users')
			.where('institutionId', '==', scope.institutionId)
			.get()

		const users = usersSnapshot.docs
			.map((doc) => mapUserSummary(doc.id, doc.data() as UserProfile))
			.sort((a, b) => (a.name > b.name ? 1 : -1))

		return NextResponse.json<ApiResponse<AdminUserSummary[]>>({
			success: true,
			data: users,
			message: 'Bulk role update complete',
			timestamp: Date.now(),
			statusCode: 200,
		})
	} catch (error) {
		return NextResponse.json<ApiResponse<null>>({
			success: false,
			data: null,
			message: error instanceof Error ? error.message : 'Failed to update users',
			timestamp: Date.now(),
			statusCode: 500,
		}, { status: 500 })
	}
}

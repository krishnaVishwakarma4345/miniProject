import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin'
import { verifySessionCookie } from '@/lib/firebase/auth/verifySessionCookie'
import { userProfileUpdateSchema } from '@/schemas/user.schema'
import { ApiError } from '@/types/api.types'
import { ActivityCategory } from '@/types'
import { StudentProfile, FacultyProfile, UserRole } from '@/types/user.types'

type ProfileRecord = {
	uid: string
	id?: string
	email: string
	role: UserRole
	fullName: string
	displayName?: string
	phone?: string
	avatar?: string | null
	photoURL?: string | null
	institutionId?: string | null
	bio?: string
	studentProfile?: Partial<StudentProfile>
	facultyProfile?: Partial<FacultyProfile>
	profileCompletion?: number
	lastProfileUpdateAt?: number | Date
	updatedAt?: number | Date
	createdAt?: number | Date
	status?: string
	language?: string
	mfaEnabled?: boolean
	emailVerified?: boolean
	metadata?: Record<string, unknown>
	lastLogin?: number | Date
	lastLoginAt?: number | Date
}

const getSessionCookie = (request: NextRequest) => {
	const cookieHeader = request.headers.get('cookie')
	if (!cookieHeader) return null

	return cookieHeader
		.split(';')
		.map((entry) => entry.trim())
		.find((entry) => entry.startsWith('session='))
		?.slice('session='.length)
}

const extractInstitutionFromPath = (path: string): string | undefined => {
	const parts = path.split('/')
	const institutionsIndex = parts.indexOf('institutions')
	if (institutionsIndex === -1) return undefined
	return parts[institutionsIndex + 1]
}

const normalizeString = (value: unknown) => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return trimmed.length ? trimmed : undefined
}

const normalizeReviewCategories = (value: unknown): ActivityCategory[] | undefined => {
	if (!Array.isArray(value)) {
		return undefined
	}

	const allowed = new Set(Object.values(ActivityCategory) as ActivityCategory[])
	const normalized = value.filter((entry): entry is ActivityCategory => typeof entry === 'string' && allowed.has(entry as ActivityCategory))

	return Array.from(new Set(normalized))
}

const stripUndefinedValues = <T>(value: T): T => {
	if (Array.isArray(value)) {
		return value
			.map((item) => stripUndefinedValues(item))
			.filter((item) => item !== undefined) as T
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.filter(([, item]) => item !== undefined)
				.map(([key, item]) => [key, stripUndefinedValues(item)])
		) as T
	}

	return value
}

const calculateCompletion = (profile: ProfileRecord) => {
	const studentFields = [
		profile.fullName,
		profile.phone,
		profile.studentProfile?.studentId,
		profile.studentProfile?.department,
		profile.studentProfile?.year,
		profile.bio,
		profile.studentProfile?.skills?.length,
	]

	const facultyFields = [
		profile.fullName,
		profile.phone,
		profile.facultyProfile?.employeeId,
		profile.facultyProfile?.department,
		profile.facultyProfile?.designation,
		profile.bio,
		profile.facultyProfile?.specializations?.length,
	]

	const fields = profile.role === UserRole.STUDENT ? studentFields : facultyFields
	return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

const buildProfileResponse = (profile: ProfileRecord) => ({
	uid: profile.uid,
	email: profile.email,
	role: profile.role,
	fullName: profile.fullName,
	phone: profile.phone,
	avatar: profile.avatar ?? null,
	photoURL: profile.photoURL ?? null,
	bio: profile.bio,
	institutionId: profile.institutionId ?? null,
	studentProfile: profile.studentProfile,
	facultyProfile: profile.facultyProfile,
	profileCompletion: profile.profileCompletion ?? calculateCompletion(profile),
	lastProfileUpdateAt: profile.lastProfileUpdateAt ?? profile.updatedAt ?? null,
})

const resolveProfileRecord = async (uid: string, email: string | undefined) => {
	const adminDb = getAdminFirestore()
	const globalRef = adminDb.collection('users').doc(uid)
	const globalSnap = await globalRef.get()
	let profile = globalSnap.exists ? (globalSnap.data() as ProfileRecord) : null
	let scopedRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null = null
	let scopedInstitutionId: string | undefined

	if (!profile) {
		try {
			const scopedByUid = await adminDb.collectionGroup('users').where('uid', '==', uid).limit(1).get()
			if (!scopedByUid.empty) {
				scopedRef = scopedByUid.docs[0].ref
				profile = scopedByUid.docs[0].data() as ProfileRecord
				scopedInstitutionId = profile.institutionId || extractInstitutionFromPath(scopedByUid.docs[0].ref.path)
			}
		} catch {
			// Ignore collection group failures and continue with the global record.
		}

		if (!profile && email) {
			try {
				const scopedByEmail = await adminDb.collectionGroup('users').where('email', '==', email).limit(1).get()
				if (!scopedByEmail.empty) {
					scopedRef = scopedByEmail.docs[0].ref
					profile = scopedByEmail.docs[0].data() as ProfileRecord
					scopedInstitutionId = profile.institutionId || extractInstitutionFromPath(scopedByEmail.docs[0].ref.path)
				}
			} catch {
				// Ignore collection group failures and continue with the global record.
			}
		}
	}

	if (!profile) return null

	if (!profile.institutionId && scopedInstitutionId) {
		profile.institutionId = scopedInstitutionId
	}

	return { globalRef, globalProfile: profile, scopedRef }
}

const getAuthorizedProfile = async (request: NextRequest) => {
	const sessionCookie = getSessionCookie(request)
	if (!sessionCookie) {
		throw new ApiError('Authentication required', 'AUTH_REQUIRED', 401)
	}

	return verifySessionCookie(sessionCookie, true)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const decoded = await getAuthorizedProfile(request)
		const profileRecord = await resolveProfileRecord(decoded.uid, decoded.email)
		if (!profileRecord) {
			return NextResponse.json(new ApiError('Profile not found', 'PROFILE_NOT_FOUND', 404), { status: 404 })
		}

		const profile = profileRecord.globalProfile
		if (profile.role !== UserRole.STUDENT && profile.role !== UserRole.FACULTY) {
			return NextResponse.json(new ApiError('Profile section is available for students and faculty only', 'FORBIDDEN', 403), { status: 403 })
		}

		return NextResponse.json({ success: true, profile: buildProfileResponse(profile) }, { status: 200 })
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error, { status: error.statusCode ?? 401 })
		}

		const message = error instanceof Error ? error.message : 'Failed to load profile'
		return NextResponse.json(new ApiError(message, 'PROFILE_LOAD_ERROR', 500), { status: 500 })
	}
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
	try {
		const decoded = await getAuthorizedProfile(request)
		const profileRecord = await resolveProfileRecord(decoded.uid, decoded.email)
		if (!profileRecord) {
			return NextResponse.json(new ApiError('Profile not found', 'PROFILE_NOT_FOUND', 404), { status: 404 })
		}

		const currentProfile = profileRecord.globalProfile
		if (currentProfile.role !== UserRole.STUDENT && currentProfile.role !== UserRole.FACULTY) {
			return NextResponse.json(new ApiError('Profile section is available for students and faculty only', 'FORBIDDEN', 403), { status: 403 })
		}

		const payload = await request.json()
		const parsed = userProfileUpdateSchema.safeParse(payload)
		if (!parsed.success) {
			const flattened = parsed.error.flatten()
			return NextResponse.json(
				new ApiError(parsed.error.issues[0]?.message || 'Invalid profile payload', 'INVALID_PROFILE_PAYLOAD', 400, {
					details: flattened.formErrors.join('; ') || 'Profile payload validation failed',
					fieldErrors: flattened.fieldErrors,
				}),
				{ status: 400 }
			)
		}

		const updates = parsed.data
		const nextProfile: ProfileRecord = {
			...currentProfile,
			fullName: normalizeString(updates.fullName) || currentProfile.fullName,
			displayName: normalizeString(updates.fullName) || currentProfile.displayName || currentProfile.fullName,
			phone: normalizeString(updates.phone) || currentProfile.phone,
			bio: normalizeString(updates.bio) || currentProfile.bio,
			updatedAt: new Date(),
			lastProfileUpdateAt: new Date(),
		}

		if (currentProfile.role === UserRole.STUDENT) {
			const studentProfile = currentProfile.studentProfile || {}
			nextProfile.studentProfile = {
				...studentProfile,
				studentId: normalizeString(updates.studentProfile?.studentId) || studentProfile.studentId,
				department: normalizeString(updates.studentProfile?.department) || studentProfile.department,
				year: updates.studentProfile?.year ?? studentProfile.year,
				cgpa: updates.studentProfile?.cgpa ?? studentProfile.cgpa,
				bio: normalizeString(updates.bio) || normalizeString(updates.studentProfile?.bio) || studentProfile.bio,
				skills: updates.studentProfile?.skills ?? studentProfile.skills,
				interests: updates.studentProfile?.interests ?? studentProfile.interests,
				links: updates.studentProfile?.links ?? studentProfile.links,
				profileCompletion: studentProfile.profileCompletion ?? 0,
			}
		}

		if (currentProfile.role === UserRole.FACULTY) {
			const facultyProfile = currentProfile.facultyProfile || {}
			const nextReviewCategories = normalizeReviewCategories(updates.facultyProfile?.reviewCategories)
			nextProfile.facultyProfile = {
				...facultyProfile,
				employeeId: normalizeString(updates.facultyProfile?.employeeId) || facultyProfile.employeeId,
				department: normalizeString(updates.facultyProfile?.department) || facultyProfile.department,
				designation: normalizeString(updates.facultyProfile?.designation) || facultyProfile.designation,
				office: normalizeString(updates.facultyProfile?.office) || facultyProfile.office,
				phoneExt: normalizeString(updates.facultyProfile?.phoneExt) || facultyProfile.phoneExt,
				specializations: updates.facultyProfile?.specializations ?? facultyProfile.specializations,
				reviewCategories: nextReviewCategories ?? facultyProfile.reviewCategories,
				bio: normalizeString(updates.bio) || normalizeString(updates.facultyProfile?.bio) || facultyProfile.bio,
				officeHours: normalizeString(updates.facultyProfile?.officeHours) || facultyProfile.officeHours,
				isAvailable: updates.facultyProfile?.isAvailable ?? facultyProfile.isAvailable ?? true,
				profileCompletion: facultyProfile.profileCompletion ?? 0,
			}
		}

		nextProfile.profileCompletion = calculateCompletion(nextProfile)
		if (nextProfile.studentProfile) {
			nextProfile.studentProfile.profileCompletion = nextProfile.profileCompletion
		}
		if (nextProfile.facultyProfile) {
			nextProfile.facultyProfile.profileCompletion = nextProfile.profileCompletion
		}

		const adminDb = getAdminFirestore()
		const adminAuth = getAdminAuth()
		const firestoreProfile = stripUndefinedValues(nextProfile)
		await adminDb.collection('users').doc(decoded.uid).set(firestoreProfile, { merge: true })

		if (profileRecord.scopedRef) {
			await profileRecord.scopedRef.set(firestoreProfile, { merge: true })
		} else if (nextProfile.institutionId) {
			await adminDb.collection('institutions').doc(nextProfile.institutionId).collection('users').doc(decoded.uid).set(firestoreProfile, { merge: true })
		}

		try {
			await adminAuth.updateUser(decoded.uid, {
				displayName: nextProfile.fullName,
				photoURL: nextProfile.photoURL ?? undefined,
			})
		} catch {
			// Ignore auth profile sync failures so Firestore updates still persist.
		}

		return NextResponse.json({ success: true, profile: buildProfileResponse(nextProfile) }, { status: 200 })
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error, { status: error.statusCode ?? 401 })
		}

		const message = error instanceof Error ? error.message : 'Failed to update profile'
		return NextResponse.json(new ApiError(message, 'PROFILE_UPDATE_ERROR', 500), { status: 500 })
	}
}
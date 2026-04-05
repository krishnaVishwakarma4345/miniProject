'use client'

import { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Input, Select, Spinner, Textarea } from '@/components/ui'
import { CATEGORY_LABELS } from '@/constants/activityCategories'
import { ActivityCategory, User, UserRole } from '@/types'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

type ProfileRole = 'student' | 'faculty'
type ProfileMode = 'overview' | 'edit'

type ProfileData = {
	uid: string
	email: string
	role: UserRole
	fullName: string
	phone?: string
	avatar?: string | null
	photoURL?: string | null
	bio?: string
	profileCompletion?: number
	studentProfile?: {
		studentId?: string
		department?: string
		academicYear?: number
		year?: number
		semester?: number
		division?: string
		rollNo?: string
		branch?: string
		cgpa?: number
		skills?: string[]
		interests?: string[]
	}
	facultyProfile?: {
		employeeId?: string
		department?: string
		designation?: string
		office?: string
		phoneExt?: string
		specializations?: string[]
		reviewCategories?: ActivityCategory[]
		officeHours?: string
		isAvailable?: boolean
	}
	lastProfileUpdateAt?: number | string | Date
}

type FormState = {
	fullName: string
	phone: string
	bio: string
	studentId: string
	department: string
	year: string
	semester: string
	division: string
	rollNo: string
	branch: string
	skills: string
	employeeId: string
	designation: string
	office: string
	phoneExt: string
	specializations: string
	officeHours: string
}

interface ProfileSectionProps {
	role: ProfileRole
	mode: ProfileMode
	viewHref: string
	editHref: string
}

const DESIGNATION_OPTIONS = [
	{ label: 'Professor', value: 'Professor' },
	{ label: 'Associate Professor', value: 'Associate Professor' },
	{ label: 'Assistant Professor', value: 'Assistant Professor' },
	{ label: 'Lecturer', value: 'Lecturer' },
	{ label: 'Teaching Assistant', value: 'Teaching Assistant' },
]

const YEAR_OPTIONS = [
	{ label: 'Year 1', value: '1' },
	{ label: 'Year 2', value: '2' },
	{ label: 'Year 3', value: '3' },
	{ label: 'Year 4', value: '4' },
]

const SEMESTER_OPTIONS = [
	{ label: 'Semester 1', value: '1' },
	{ label: 'Semester 2', value: '2' },
	{ label: 'Semester 3', value: '3' },
	{ label: 'Semester 4', value: '4' },
	{ label: 'Semester 5', value: '5' },
	{ label: 'Semester 6', value: '6' },
	{ label: 'Semester 7', value: '7' },
	{ label: 'Semester 8', value: '8' },
]

const emptyFormState: FormState = {
	fullName: '',
	phone: '',
	bio: '',
	studentId: '',
	department: '',
	year: '',
	semester: '',
	division: '',
	rollNo: '',
	branch: '',
	skills: '',
	employeeId: '',
	designation: '',
	office: '',
	phoneExt: '',
	specializations: '',
	officeHours: '',
}

const splitList = (value: string) =>
	value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)

const joinList = (items?: string[]) => (items?.length ? items.join(', ') : '')

const hasSameCategories = (a: ActivityCategory[], b: ActivityCategory[]) =>
	a.length === b.length && a.every((category, index) => category === b[index])

const getInitials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('') || 'U'

const getRoleLabel = (role: ProfileRole) => (role === 'student' ? 'Student profile' : 'Faculty profile')

const calculateCompletion = (role: ProfileRole, profile: ProfileData | null) => {
	if (!profile) return 0

	if (role === 'student') {
		const fields = [
			profile.fullName,
			profile.phone,
			profile.studentProfile?.studentId,
			profile.studentProfile?.academicYear ?? profile.studentProfile?.year,
			profile.studentProfile?.semester,
			profile.studentProfile?.division,
			profile.studentProfile?.rollNo,
			profile.studentProfile?.branch,
			profile.bio,
			profile.studentProfile?.skills?.length,
		]
		return Math.round((fields.filter(Boolean).length / fields.length) * 100)
	}

	const fields = [
		profile.fullName,
		profile.phone,
		profile.facultyProfile?.employeeId,
		profile.facultyProfile?.department,
		profile.facultyProfile?.designation,
		profile.bio,
		profile.facultyProfile?.specializations?.length,
	]
	return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

const normalizeLastProfileUpdateAt = (value: ProfileData['lastProfileUpdateAt']): number | Date => {
	if (value instanceof Date || typeof value === 'number') {
		return value
	}

	if (typeof value === 'string') {
		const parsed = Date.parse(value)
		if (!Number.isNaN(parsed)) {
			return new Date(parsed)
		}
	}

	return new Date()
}

const updateAuthStore = (profile: ProfileData) => {
	const currentUser = useAuthStore.getState().user
	if (!currentUser) return

	const nextUser = {
		...currentUser,
		fullName: profile.fullName,
		displayName: profile.fullName,
		phone: profile.phone,
		avatar: profile.avatar ?? currentUser.avatar,
		photoURL: profile.photoURL ?? currentUser.photoURL,
		studentProfile: profile.studentProfile ?? currentUser.studentProfile,
		facultyProfile: profile.facultyProfile ?? currentUser.facultyProfile,
		updatedAt: new Date(),
		lastProfileUpdateAt: normalizeLastProfileUpdateAt(profile.lastProfileUpdateAt),
	}

	useAuthStore.getState().setUser(nextUser as User)
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
			<p className='text-xs uppercase tracking-[0.2em] text-slate-400'>{label}</p>
			<p className='mt-2 text-sm font-medium text-slate-900'>{value}</p>
		</div>
	)
}

export function ProfileSection({ role, mode, viewHref, editHref }: ProfileSectionProps) {
	const router = useRouter()
	const addToast = useUIStore((state) => state.addToast)
	const [profile, setProfile] = useState<ProfileData | null>(null)
	const [form, setForm] = useState<FormState>(emptyFormState)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState('')

	const applyProfileToState = useCallback((nextProfile: ProfileData | null) => {
		setProfile(nextProfile)
		if (nextProfile) {
			updateAuthStore(nextProfile)
		}
		setForm({
			fullName: nextProfile?.fullName || '',
			phone: nextProfile?.phone || '',
			bio: nextProfile?.bio || '',
			studentId: nextProfile?.studentProfile?.studentId || '',
			department: nextProfile?.studentProfile?.department || nextProfile?.facultyProfile?.department || '',
			year: nextProfile?.studentProfile?.academicYear ? String(nextProfile.studentProfile.academicYear) : nextProfile?.studentProfile?.year ? String(nextProfile.studentProfile.year) : '',
			semester: nextProfile?.studentProfile?.semester ? String(nextProfile.studentProfile.semester) : '',
			division: nextProfile?.studentProfile?.division || '',
			rollNo: nextProfile?.studentProfile?.rollNo || '',
			branch: nextProfile?.studentProfile?.branch || '',
			skills: joinList(nextProfile?.studentProfile?.skills),
			employeeId: nextProfile?.facultyProfile?.employeeId || '',
			designation: nextProfile?.facultyProfile?.designation || '',
			office: nextProfile?.facultyProfile?.office || '',
			phoneExt: nextProfile?.facultyProfile?.phoneExt || '',
			specializations: joinList(nextProfile?.facultyProfile?.specializations),
			officeHours: nextProfile?.facultyProfile?.officeHours || '',
		})
	}, [])

	useEffect(() => {
		let isMounted = true

		const loadProfile = async () => {
			setIsLoading(true)
			setError('')

			try {
				const response = await fetch('/api/user/profile', {
					credentials: 'include',
				})

				if (!response.ok) {
					const payload = await response.json().catch(() => null)
					throw new Error(payload?.error || 'Failed to load profile')
				}

				const payload = (await response.json()) as { profile?: ProfileData }
				const nextProfile = payload.profile || null

				if (!isMounted) return

				applyProfileToState(nextProfile)
			} catch (loadError) {
				if (!isMounted) return
				setError(loadError instanceof Error ? loadError.message : 'Failed to load profile')
			} finally {
				if (isMounted) setIsLoading(false)
			}
		}

		void loadProfile()

		return () => {
			isMounted = false
		}
	}, [applyProfileToState])

	useEffect(() => {
		if (role !== 'faculty' || mode !== 'overview') {
			return
		}

		let cancelled = false

		const syncFacultyReviewCategories = async () => {
			try {
				const response = await fetch('/api/user/profile', {
					credentials: 'include',
					cache: 'no-store',
				})

				if (!response.ok) {
					return
				}

				const payload = (await response.json()) as { profile?: ProfileData }
				const nextProfile = payload.profile || null
				if (!nextProfile || cancelled) {
					return
				}

				setProfile((current) => {
					const currentCategories = current?.facultyProfile?.reviewCategories ?? []
					const nextCategories = nextProfile.facultyProfile?.reviewCategories ?? []

					if (hasSameCategories(currentCategories, nextCategories)) {
						return current
					}

					updateAuthStore(nextProfile)
					return nextProfile
				})
			} catch {
				// Silent background sync; initial load/save paths handle user-facing errors.
			}
		}

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void syncFacultyReviewCategories()
			}
		}

		const intervalId = window.setInterval(() => {
			void syncFacultyReviewCategories()
		}, 10000)

		window.addEventListener('focus', syncFacultyReviewCategories)
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			cancelled = true
			window.clearInterval(intervalId)
			window.removeEventListener('focus', syncFacultyReviewCategories)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [mode, role])

	const completion = useMemo(() => calculateCompletion(role, profile), [profile, role])
	const profileLabel = getRoleLabel(role)
	const avatarSrc = profile?.avatar || profile?.photoURL || undefined
	const facultyReviewCategories = profile?.facultyProfile?.reviewCategories ?? []

	const handleChange = (field: keyof FormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }))
	}

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSaving(true)
		setError('')

		const payload = {
			fullName: form.fullName.trim(),
			phone: form.phone.trim() || undefined,
			bio: form.bio.trim() || undefined,
			...(role === 'student'
				? {
					studentProfile: {
						studentId: form.studentId.trim() || undefined,
						department: form.department.trim() || undefined,
						year: form.year ? Number(form.year) : undefined,
						academicYear: form.year ? Number(form.year) : undefined,
						semester: form.semester ? Number(form.semester) : undefined,
						division: form.division.trim() || undefined,
						rollNo: form.rollNo.trim() || undefined,
						branch: form.branch.trim() || undefined,
						skills: splitList(form.skills),
					},
				}
				: {
					facultyProfile: {
						employeeId: form.employeeId.trim() || undefined,
						department: form.department.trim() || undefined,
						designation: form.designation || undefined,
						office: form.office.trim() || undefined,
						phoneExt: form.phoneExt.trim() || undefined,
						specializations: splitList(form.specializations),
						officeHours: form.officeHours.trim() || undefined,
					},
				}),
		}

		try {
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload),
			})

			const responseBody = await response.json().catch(() => null)
			if (!response.ok) {
				throw new Error(responseBody?.error || 'Failed to save profile')
			}

			const nextProfile = responseBody?.profile as ProfileData
			applyProfileToState(nextProfile)
			addToast({
				type: 'success',
				title: 'Profile updated',
				message: 'Your basic information has been saved.',
				duration: 3000,
			})
			router.push(viewHref)
		} catch (saveError) {
			const message = saveError instanceof Error ? saveError.message : 'Failed to save profile'
			setError(message)
		} finally {
			setIsSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div className='grid min-h-80 place-items-center rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm'>
				<Spinner size='lg' label='Loading profile' />
			</div>
		)
	}

	if (error && !profile) {
		return (
			<div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700'>
				<p className='font-semibold'>Unable to load profile</p>
				<p className='mt-1'>{error}</p>
				<button type='button' className='mt-4 text-sm font-semibold underline' onClick={() => router.refresh()}>
					Try again
				</button>
			</div>
		)
	}

	if (mode === 'overview') {
		return (
			<div className='grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
				<aside className='min-w-0 rounded-4xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
						<Avatar src={avatarSrc} alt={profile?.fullName || profileLabel} size='lg' fallback={getInitials(profile?.fullName || profileLabel)} />
						<div className='min-w-0'>
							<Badge variant='info' className='mb-2'>{profileLabel}</Badge>
							<h2 className='wrap-break-word text-xl font-semibold text-slate-900'>{profile?.fullName || 'Complete your profile'}</h2>
							<p className='break-all text-sm text-slate-500'>{profile?.email}</p>
						</div>
					</div>

					<div className='mt-6 min-w-0'>
						<div className='mb-2 flex items-center justify-between text-sm text-slate-600'>
							<span>Profile completion</span>
							<span className='font-semibold text-slate-900'>{completion}%</span>
						</div>
						<div className='h-2 rounded-full bg-slate-100'>
							<div className='h-2 rounded-full bg-slate-900 transition-all' style={{ width: `${completion}%` }} />
						</div>
						<p className='mt-3 wrap-break-word text-sm text-slate-500'>Add your basic information so your dashboard, portfolio, review flows, and academic-year filters stay current.</p>
					</div>

					<Link
						href={editHref}
						className='mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800'
					>
						Edit basic info
					</Link>
				</aside>

				<div className='min-w-0 space-y-6'>
					<section className='rounded-4xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6'>
						<h3 className='text-lg font-semibold text-slate-900'>Basic information</h3>
						<div className='mt-4 grid gap-4 sm:grid-cols-2'>
							<InfoCard label='Full name' value={profile?.fullName || 'Not added yet'} />
							<InfoCard label='Email' value={profile?.email || 'Not available'} />
							<InfoCard label='Phone' value={profile?.phone || 'Not added yet'} />
							<InfoCard label='Bio' value={profile?.bio || 'Add a short introduction.'} />
						</div>
					</section>

					<section className='rounded-4xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6'>
						<h3 className='text-lg font-semibold text-slate-900'>{role === 'student' ? 'Academic details' : 'Professional details'}</h3>
						<div className='mt-4 grid gap-4 sm:grid-cols-2'>
							{role === 'student' ? (
								<>
									<InfoCard label='Student ID' value={profile?.studentProfile?.studentId || 'Not added yet'} />
									<InfoCard label='Academic year' value={profile?.studentProfile?.academicYear || profile?.studentProfile?.year ? `Year ${profile.studentProfile.academicYear || profile.studentProfile.year}` : 'Not added yet'} />
									<InfoCard label='Semester' value={profile?.studentProfile?.semester ? `Sem ${profile.studentProfile.semester}` : 'Not added yet'} />
									<InfoCard label='Branch' value={profile?.studentProfile?.branch || 'Not added yet'} />
									<InfoCard label='Division' value={profile?.studentProfile?.division || 'Not added yet'} />
									<InfoCard label='Roll number' value={profile?.studentProfile?.rollNo || 'Not added yet'} />
									<InfoCard label='Skills' value={joinList(profile?.studentProfile?.skills) || 'Add a few skills'} />
								</>
							) : (
								<>
									<InfoCard label='Employee ID' value={profile?.facultyProfile?.employeeId || 'Not added yet'} />
									<InfoCard label='Department' value={profile?.facultyProfile?.department || 'Not added yet'} />
									<InfoCard label='Designation' value={profile?.facultyProfile?.designation || 'Not added yet'} />
									<InfoCard label='Specializations' value={joinList(profile?.facultyProfile?.specializations) || 'Add your expertise areas'} />
								</>
							)}
						</div>
					</section>

					{role === 'faculty' ? (
						<section className='rounded-4xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6'>
							<h3 className='text-lg font-semibold text-slate-900'>Review responsibilities</h3>
							<p className='mt-1 text-sm text-slate-500'>These are the activity categories you are assigned to verify.</p>
							{facultyReviewCategories.length ? (
								<div className='mt-4 flex flex-wrap gap-2'>
									{facultyReviewCategories.map((category) => (
										<Badge key={category} variant='info'>
											{CATEGORY_LABELS[category]}
										</Badge>
									))}
								</div>
							) : (
								<p className='mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
									No review categories assigned yet. Ask your admin to assign categories so you can verify submissions.
								</p>
							)}
						</section>
					) : null}
				</div>
			</div>
		)
	}

	return (
		<form onSubmit={handleSave} className='space-y-6 rounded-4xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6'>
			<section>
				<h3 className='text-lg font-semibold text-slate-900'>Basic information</h3>
				<p className='mt-1 text-sm text-slate-500'>Keep the details that appear across your dashboard and activity history up to date.</p>
				<div className='mt-4 grid gap-4 sm:grid-cols-2'>
					<Input label='Full name' value={form.fullName} onChange={(event) => handleChange('fullName', event.target.value)} required />
					<Input label='Phone' value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder='+1 555 123 4567' />
					<Textarea label='Bio' value={form.bio} onChange={(event) => handleChange('bio', event.target.value)} rows={4} containerClassName='sm:col-span-2' placeholder='Write a short intro about yourself' />
				</div>
			</section>

			<section>
				<h3 className='text-lg font-semibold text-slate-900'>{role === 'student' ? 'Academic details' : 'Professional details'}</h3>
						<p className='mt-1 text-sm text-slate-500'>{role === 'student' ? 'Add the academic fields that help your faculty and portfolio views. Academic year is required for progress filters.' : 'Add the core teaching information shown on your faculty profile.'}</p>
				<div className='mt-4 grid gap-4 sm:grid-cols-2'>
					{role === 'student' ? (
						<>
							<Input label='Student ID' value={form.studentId} onChange={(event) => handleChange('studentId', event.target.value)} required />
									<Select label='Academic year' value={form.year} onChange={(event) => handleChange('year', event.target.value)} options={YEAR_OPTIONS} placeholder='Select academic year' required />
							<Select label='Semester' value={form.semester} onChange={(event) => handleChange('semester', event.target.value)} options={SEMESTER_OPTIONS} placeholder='Select semester' required />
							<Input label='Division' value={form.division} onChange={(event) => handleChange('division', event.target.value)} required />
							<Input label='Roll number' value={form.rollNo} onChange={(event) => handleChange('rollNo', event.target.value)} required />
							<Input label='Branch' value={form.branch} onChange={(event) => handleChange('branch', event.target.value)} required />
							<Textarea label='Skills' value={form.skills} onChange={(event) => handleChange('skills', event.target.value)} rows={3} containerClassName='sm:col-span-2' placeholder='Comma-separated skills, for example: React, Python, Leadership' hint='Use commas to separate multiple skills.' />
						</>
					) : (
						<>
							<Input label='Employee ID' value={form.employeeId} onChange={(event) => handleChange('employeeId', event.target.value)} required />
							<Input label='Department' value={form.department} onChange={(event) => handleChange('department', event.target.value)} required />
							<Select label='Designation' value={form.designation} onChange={(event) => handleChange('designation', event.target.value)} options={DESIGNATION_OPTIONS} placeholder='Select designation' required />
							<Input label='Office' value={form.office} onChange={(event) => handleChange('office', event.target.value)} placeholder='Room number or office name' />
							<Input label='Phone extension' value={form.phoneExt} onChange={(event) => handleChange('phoneExt', event.target.value)} placeholder='1234' />
							<Textarea label='Specializations' value={form.specializations} onChange={(event) => handleChange('specializations', event.target.value)} rows={3} containerClassName='sm:col-span-2' placeholder='Comma-separated areas of expertise' hint='Use commas to separate multiple specializations.' />
							<Textarea label='Office hours' value={form.officeHours} onChange={(event) => handleChange('officeHours', event.target.value)} rows={3} containerClassName='sm:col-span-2' placeholder='Mon to Wed, 2 PM - 4 PM' />
						</>
					)}
				</div>
			</section>

			{error ? <p className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</p> : null}

			<div className='flex flex-wrap gap-3'>
				<Button type='submit' loading={isSaving}>
					Save profile
				</Button>
				<Link href={viewHref} className='inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50'>
					Cancel
				</Link>
			</div>
		</form>
	)
}

export default ProfileSection
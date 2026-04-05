"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ActivityStatus } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import useActivities from '@/features/activities/hooks/useActivities'
import ActivityList from '@/features/activities/components/ActivityList'
import { StatCard } from '@/components/data-display/StatCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'
import { useUIStore } from '@/store/ui.store'

type SemesterCgpaEntry = {
	semester: number
	cgpa: number
}

type ProfilePayload = {
	success?: boolean
	profile?: {
		studentProfile?: {
			semesterCgpa?: SemesterCgpaEntry[]
		}
	}
	error?: string
	message?: string
}

const SEMESTER_SEQUENCE = [1, 2, 3, 4, 5, 6, 7, 8]

const buildInitialCgpaForm = (entries?: SemesterCgpaEntry[]) => {
	const entryMap = new Map((entries || []).map((entry) => [entry.semester, entry.cgpa]))
	return Object.fromEntries(
		SEMESTER_SEQUENCE.map((semester) => [String(semester), entryMap.has(semester) ? String(entryMap.get(semester)) : ''])
	) as Record<string, string>
}

export default function StudentDashboardPage() {
	const { user } = useAuth()
	const addToast = useUIStore((state) => state.addToast)
	const { activities, isLoading, error, refresh } = useActivities(user?.id)
	const [cgpaForm, setCgpaForm] = useState<Record<string, string>>(buildInitialCgpaForm(user?.studentProfile?.semesterCgpa as SemesterCgpaEntry[] | undefined))
	const [isSavingCgpa, setIsSavingCgpa] = useState(false)
	const [cgpaError, setCgpaError] = useState('')

	useEffect(() => {
		setCgpaForm(buildInitialCgpaForm(user?.studentProfile?.semesterCgpa as SemesterCgpaEntry[] | undefined))
	}, [user?.studentProfile?.semesterCgpa])

	useEffect(() => {
		if (!user?.id) {
			return
		}

		let isMounted = true

		const loadSemesterCgpa = async () => {
			try {
				const response = await fetch('/api/user/profile', {
					credentials: 'include',
					cache: 'no-store',
				})

				if (!response.ok) {
					return
				}

				const payload = (await response.json()) as ProfilePayload
				const semesterCgpa = payload.profile?.studentProfile?.semesterCgpa

				if (isMounted) {
					setCgpaForm(buildInitialCgpaForm(semesterCgpa))
				}
			} catch {
				// Keep current values if profile hydration fails.
			}
		}

		void loadSemesterCgpa()

		return () => {
			isMounted = false
		}
	}, [user?.id])

	const stats = useMemo(() => {
		const total = activities.length
		const approved = activities.filter((activity) => activity.status === ActivityStatus.APPROVED).length
		const underReview = activities.filter((activity) => activity.status === ActivityStatus.UNDER_REVIEW).length
		const earnedCredits = activities.reduce((sum, activity) => {
			if (activity.status !== ActivityStatus.APPROVED) {
				return sum
			}

			const points =
				typeof activity.pointsAwarded === 'number'
					? activity.pointsAwarded
					: typeof activity.review?.pointsAwarded === 'number'
						? activity.review.pointsAwarded
						: 0

			return sum + points
		}, 0)
		return [
			{ label: 'Total submissions', value: total },
			{ label: 'Approved wins', value: approved },
			{ label: 'Under review', value: underReview },
			{ label: 'Total credits earned', value: earnedCredits, suffix: ' pts' },
		]
	}, [activities])

	const handleCgpaChange = (semester: number, value: string) => {
		setCgpaForm((current) => ({ ...current, [String(semester)]: value }))
		if (cgpaError) {
			setCgpaError('')
		}
	}

	const handleSaveCgpa = async () => {
		setCgpaError('')
		const parsedEntries: SemesterCgpaEntry[] = []

		for (const semester of SEMESTER_SEQUENCE) {
			const raw = (cgpaForm[String(semester)] || '').trim()
			if (!raw) {
				continue
			}

			const cgpa = Number(raw)
			if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
				setCgpaError(`Sem ${semester} CGPA must be between 0 and 10.`)
				return
			}

			parsedEntries.push({ semester, cgpa: Number(cgpa.toFixed(2)) })
		}

		setIsSavingCgpa(true)
		try {
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					studentProfile: {
						semesterCgpa: parsedEntries,
					},
				}),
			})

			const payload = (await response.json().catch(() => null)) as ProfilePayload | null
			if (!response.ok || !payload?.success) {
				throw new Error(payload?.error || payload?.message || 'Failed to save semester CGPA')
			}

			setCgpaForm(buildInitialCgpaForm(payload.profile?.studentProfile?.semesterCgpa || parsedEntries))

			addToast({
				type: 'success',
				title: 'Semester CGPA updated',
				message: 'Your semester-wise CGPA is now visible to faculty.',
				duration: 3000,
			})
		} catch (saveError) {
			setCgpaError(saveError instanceof Error ? saveError.message : 'Failed to save semester CGPA')
		} finally {
			setIsSavingCgpa(false)
		}
	}

	return (
		<div className='space-y-6'>
			<ScrollReveal from='left'>
				<section className='rounded-4xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-8 shadow-sm'>
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<div>
						<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Welcome back</p>
						<h2 className='text-2xl font-semibold text-slate-900'>{user?.displayName || 'Student'}</h2>
						<p className='text-sm text-slate-600'>Track approvals, add new achievements, and keep your portfolio fresh.</p>
					</div>
					<div className='flex gap-3'>
						<Link href='/student/profile'>
							<Button variant='outline'>Profile</Button>
						</Link>
						<Button variant='outline' onClick={() => refresh()} loading={isLoading}>
							Refresh
						</Button>
						<Link href='/student/activities/add'>
							<Button>+ Add activity</Button>
						</Link>
					</div>
				</div>
				</section>
			</ScrollReveal>

			<ScrollReveal from='right'>
				<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					{stats.map((stat) => (
						<StatCard key={stat.label} label={stat.label} value={stat.value} />
					))}
				</section>
			</ScrollReveal>

			<ScrollReveal from='left'>
			<section className='rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-sm'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div>
						<h3 className='text-lg font-semibold text-slate-900'>Semester-wise CGPA</h3>
						<p className='text-sm text-slate-600'>Add CGPA for each semester. Faculty can view this in review details.</p>
					</div>
					<Button variant='outline' onClick={handleSaveCgpa} loading={isSavingCgpa}>Save CGPA</Button>
				</div>
				<div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
					{SEMESTER_SEQUENCE.map((semester) => (
						<Input
							key={semester}
							label={`Sem ${semester} CGPA`}
							type='number'
							min={0}
							max={10}
							step='0.01'
							placeholder='0.00'
							value={cgpaForm[String(semester)] || ''}
							onChange={(event) => handleCgpaChange(semester, event.target.value)}
						/>
					))}
				</div>
				{cgpaError ? <p className='mt-3 text-sm text-rose-600'>{cgpaError}</p> : null}
			</section>
			</ScrollReveal>

			<ScrollReveal from='left'>
			<section className='space-y-4'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<h3 className='text-lg font-semibold text-slate-900'>Recent activity</h3>
					<Link href='/student/activities' className='text-sm font-semibold text-slate-600 underline-offset-4 hover:underline'>
						View all
					</Link>
				</div>
				<ActivityList
					activities={activities.slice(0, 5)}
					isLoading={isLoading}
					error={error}
					onRetry={refresh}
					emptyAction={
						<Link href='/student/activities/add'>
							<Button variant='outline'>Start logging activities</Button>
						</Link>
					}
				/>
			</section>
			</ScrollReveal>
		</div>
	)
}

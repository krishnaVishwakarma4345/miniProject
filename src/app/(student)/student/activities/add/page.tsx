"use client"

import { useRouter } from 'next/navigation'
import ActivityForm from '@/features/activities/components/ActivityForm'

export default function AddActivityPage() {
	const router = useRouter()

	return (
		<div className='mx-auto max-w-4xl space-y-6'>
			<div className='space-y-2 text-center'>
				<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>New submission</p>
				<h1 className='text-2xl font-semibold text-slate-900'>Log an activity</h1>
				<p className='text-sm text-slate-500'>Share proof, highlight your role, and route it to faculty in minutes.</p>
			</div>
			<ActivityForm
				onSuccess={(activityId) => {
					router.push(`/student/activities/${activityId}`)
				}}
			/>
		</div>
	)
}

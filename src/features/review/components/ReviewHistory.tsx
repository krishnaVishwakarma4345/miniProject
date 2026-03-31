import { Activity } from '@/types'
import { formatDate } from '@/utils/date.utils'
import { motion } from 'framer-motion'

interface ReviewHistoryProps {
	activity: Activity
}

const timelineVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: (index: number) => ({ opacity: 1, y: 0, transition: { delay: index * 0.08 } }),
}

export function ReviewHistory({ activity }: ReviewHistoryProps) {
	const events = [
		{ label: 'Submitted', at: activity.submittedAt || activity.createdAt, description: 'Student sent activity for review' },
		activity.updatedAt
			? { label: 'Last update', at: activity.updatedAt, description: 'Student made changes' }
			: null,
		activity.review?.reviewedAt
			? { label: activity.status === 'approved' ? 'Approved' : 'Rejected', at: activity.review.reviewedAt, description: activity.review.remarks }
			: null,
	].filter(Boolean) as { label: string; at: number; description?: string }[]

	return (
		<section className='rounded-3xl border border-slate-200/80 bg-white/90 p-6 backdrop-blur'>
			<h3 className='text-lg font-semibold text-slate-900'>Review history</h3>
			<div className='mt-6 space-y-6 border-l-2 border-dashed border-slate-200 pl-6'>
				{events.map((event, index) => (
					<motion.div
						key={`${event.label}-${event.at}`}
						custom={index}
						variants={timelineVariants}
						initial='hidden'
						animate='visible'
						className='relative'
					>
						<span className='absolute -left-8 top-1.5 h-3 w-3 rounded-full bg-slate-900' />
						<p className='text-xs uppercase tracking-wide text-slate-500'>{formatDate(event.at)}</p>
						<p className='text-base font-semibold text-slate-900'>{event.label}</p>
						{event.description ? <p className='text-sm text-slate-600'>{event.description}</p> : null}
					</motion.div>
				))}
			</div>
		</section>
	)
}

export default ReviewHistory

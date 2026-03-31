"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ActivityCategory, ActivityStatus } from '@/types'
import { CATEGORY_LABELS } from '@/constants/activityCategories'
import { STATUS_LABELS } from '@/constants/statusConfig'
import { ActivityFilters } from '@/store/activities.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export interface ActivityFilterProps {
	filters: ActivityFilters
	onChange: (filters: Partial<ActivityFilters>) => void
	onRefresh?: () => void
	onAdd?: () => void
	isRefreshing?: boolean
}

const statusOptions = [{ value: 'all', label: 'All statuses' }].concat(
	Object.values(ActivityStatus).map((status) => ({
		value: status,
		label: STATUS_LABELS[status],
	}))
)

const categoryOptions = [{ value: 'all', label: 'All categories' }].concat(
	Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
		value,
		label,
	}))
)

export function ActivityFilter({ filters, onChange, onRefresh, onAdd, isRefreshing }: ActivityFilterProps) {
	const hasCustomFilters = useMemo(() => filters.status !== 'all' || filters.category !== 'all' || Boolean(filters.search), [filters])

	const handleReset = () => {
		onChange({ status: 'all', category: 'all', search: '' })
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: 'easeOut' }}
			className='flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur'
		>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Activities</p>
					<h2 className='text-xl font-semibold text-slate-900'>Track every submission</h2>
					<p className='text-sm text-slate-500'>Filter by status, category, or search keywords.</p>
				</div>
				<div className='flex flex-wrap gap-2'>
					{onRefresh ? (
						<Button type='button' variant='outline' size='sm' onClick={onRefresh} loading={isRefreshing}>
							Refresh
						</Button>
					) : null}
					{onAdd ? (
						<Button type='button' size='sm' onClick={onAdd}>
							+ Add activity
						</Button>
					) : (
						<Link href='/student/activities/add'>
							<Button size='sm'>+ Add activity</Button>
						</Link>
					)}
				</div>
			</div>
			<div className='grid gap-4 lg:grid-cols-3'>
				<Input
					name='search'
					placeholder='Search title or description'
					value={filters.search}
					onChange={(event) => onChange({ search: event.target.value })}
				/>
				<Select
					name='status'
					value={filters.status ?? 'all'}
					onChange={(event) => onChange({ status: event.target.value as ActivityFilters['status'] })}
					options={statusOptions}
				/>
				<Select
					name='category'
					value={filters.category ?? 'all'}
					onChange={(event) => onChange({ category: event.target.value as ActivityFilters['category'] })}
					options={categoryOptions}
				/>
			</div>
			{hasCustomFilters ? (
				<div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
					<span>Filters applied:</span>
					{filters.status !== 'all' ? <span className='rounded-full bg-slate-100 px-3 py-1'>Status: {filters.status}</span> : null}
					{filters.category !== 'all' ? <span className='rounded-full bg-slate-100 px-3 py-1'>Category: {CATEGORY_LABELS[filters.category as ActivityCategory]}</span> : null}
					{filters.search ? <span className='rounded-full bg-slate-100 px-3 py-1'>Query: “{filters.search}”</span> : null}
					<button type='button' className='text-slate-600 underline-offset-2 hover:underline' onClick={handleReset}>
						Reset
					</button>
				</div>
			) : null}
		</motion.div>
	)
}

export default ActivityFilter
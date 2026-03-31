"use client"

import { useMemo, useState } from 'react'
import { Activity, ActivityCategory, ActivityStatus } from '@/types'
import { CATEGORY_LABELS } from '@/constants/activityCategories'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/feedback/Alert'
import EmptyState from '@/components/data-display/EmptyState'
import LoadingSkeleton from '@/components/data-display/LoadingSkeleton'
import StatCard from '@/components/data-display/StatCard'
import { useReviewQueue } from '@/features/review/hooks/useReviewQueue'
import { useApproval } from '@/features/review/hooks/useApproval'
import ReviewCard from '@/features/review/components/ReviewCard'
import ApprovalModal from '@/features/review/components/ApprovalModal'
import RejectionModal from '@/features/review/components/RejectionModal'
import BulkActionBar from '@/features/review/components/BulkActionBar'

type ModalScope = 'single' | 'bulk'
type ModalType = 'approve' | 'reject'

const statusOptions = [
	{ label: 'All statuses', value: 'all' },
	{ label: 'Under review', value: ActivityStatus.UNDER_REVIEW },
	{ label: 'Submitted', value: ActivityStatus.SUBMITTED },
]

const assignmentOptions = [
	{ label: 'All assignments', value: 'all' },
	{ label: 'Assigned to me', value: 'mine' },
	{ label: 'Unassigned', value: 'unassigned' },
]

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
	label,
	value: value as ActivityCategory,
}))

export function ReviewQueue() {
	const { queue, stats, filters, selectedIds, isLoading, error, refresh, setFilters, toggleSelection } = useReviewQueue()
	const { approve, reject, bulkApprove, bulkReject, assignToMe, selectedIds: approvalSelection, isProcessing } = useApproval()
	const [modalState, setModalState] = useState<{ type: ModalType; scope: ModalScope; activity?: Activity } | null>(null)

	const hasQueue = queue.length > 0
	const hasSelection = selectedIds.length > 0

	const handleApproveSubmit = async (payload: { remarks: string; pointsAwarded: number; score?: number }) => {
		if (!modalState) return
		if (modalState.scope === 'single' && modalState.activity) {
			await approve(modalState.activity.id, payload)
		} else if (modalState.scope === 'bulk' && approvalSelection.length) {
			await bulkApprove(approvalSelection, payload)
		}
		setModalState(null)
	}

	const handleRejectSubmit = async (remarks: string) => {
		if (!modalState) return
		if (modalState.scope === 'single' && modalState.activity) {
			await reject(modalState.activity.id, remarks)
		} else if (modalState.scope === 'bulk' && approvalSelection.length) {
			await bulkReject(approvalSelection, remarks)
		}
		setModalState(null)
	}

	const filteredCategories = useMemo(() => [{ label: 'All categories', value: 'all' }, ...categoryOptions], [])

	return (
		<section className='space-y-6'>
			<div className='grid gap-4 sm:grid-cols-3'>
				<StatCard label='Pending reviews' value={stats.pending} />
				<StatCard label='Assigned to me' value={stats.assignedToMe} />
				<StatCard label='Unassigned' value={stats.unassigned} />
			</div>

			<div className='grid gap-4 rounded-3xl border border-slate-200/70 bg-white p-4 md:grid-cols-4'>
				<Input
					placeholder='Search by title or student'
					value={filters.search}
					onChange={(event) => setFilters({ search: event.target.value })}
					className='md:col-span-1'
				/>
				<Select
					value={filters.status}
					onChange={(event) => setFilters({ status: event.target.value as ActivityStatus | 'all' })}
					options={statusOptions}
				/>
				<Select
					value={filters.category}
					onChange={(event) => setFilters({ category: event.target.value as ActivityCategory | 'all' })}
					options={filteredCategories}
				/>
				<Select
					value={filters.assignment}
					onChange={(event) => setFilters({ assignment: event.target.value as 'all' | 'mine' | 'unassigned' })}
					options={assignmentOptions}
				/>
			</div>

			{error ? (
				<Alert variant='error' title='Something went wrong'>
					{error}
				</Alert>
			) : null}

			<div className='space-y-4'>
				{isLoading ? (
					<LoadingSkeleton lines={4} />
				) : hasQueue ? (
					queue.map((activity) => (
						<ReviewCard
							key={activity.id}
							activity={activity}
							selected={selectedIds.includes(activity.id)}
							onSelectToggle={toggleSelection}
							onApprove={(item) => setModalState({ type: 'approve', scope: 'single', activity: item })}
							onReject={(item) => setModalState({ type: 'reject', scope: 'single', activity: item })}
							onAssign={(item) => {
							void assignToMe([item.id])
						}}
						/>
					))
				) : (
					<EmptyState
						title='No submissions waiting'
						description='Students are all caught up. Refresh to check for new submissions.'
						action={<button onClick={() => { void refresh() }} className='text-sm font-semibold text-slate-900 underline'>Refresh queue</button>}
					/>
				)}
			</div>

			<BulkActionBar
				count={hasSelection ? selectedIds.length : 0}
				disabled={isProcessing || !hasSelection}
				onAssign={() => {
					void assignToMe(selectedIds)
				}}
				onApprove={() => setModalState({ type: 'approve', scope: 'bulk' })}
				onReject={() => setModalState({ type: 'reject', scope: 'bulk' })}
			/>

			<ApprovalModal
				open={modalState?.type === 'approve'}
				activity={modalState?.activity}
				title={modalState?.scope === 'bulk' ? `Approve ${selectedIds.length} activities` : undefined}
				isSubmitting={isProcessing}
				onSubmit={handleApproveSubmit}
				onClose={() => setModalState(null)}
			/>

			<RejectionModal
				open={modalState?.type === 'reject'}
				activity={modalState?.activity}
				title={modalState?.scope === 'bulk' ? `Reject ${selectedIds.length} activities` : undefined}
				isSubmitting={isProcessing}
				onSubmit={handleRejectSubmit}
				onClose={() => setModalState(null)}
			/>
		</section>
	)
}

export default ReviewQueue

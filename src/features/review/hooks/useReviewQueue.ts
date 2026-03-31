'use client'

import { useCallback, useEffect } from 'react'
import { ReviewQueueFilters } from '@/features/review/types/review.types'
import { useReviewStore } from '@/store/review.store'
import reviewService from '@/features/review/services/review.service'

export function useReviewQueue(options: { auto?: boolean } = { auto: true }) {
	const { auto = true } = options
	const {
		queue,
		stats,
		filters,
		selectedIds,
		isLoading,
		error,
		setQueue,
		setStats,
		setFilters,
		setLoading,
		setError,
		clearSelection,
		toggleSelection,
	} = useReviewStore()

	const fetchQueue = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await reviewService.fetchQueue(filters)
			setQueue(data.items)
			setStats(data.stats)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load review queue')
		} finally {
			setLoading(false)
		}
	}, [filters, setError, setLoading, setQueue, setStats])

	useEffect(() => {
		if (!auto) return
		void fetchQueue()
	}, [auto, fetchQueue])

	const updateFilters = (partial: Partial<ReviewQueueFilters>) => {
		setFilters(partial)
	}

	return {
		queue,
		stats,
		filters,
		selectedIds,
		isLoading,
		error,
		refresh: fetchQueue,
		setFilters: updateFilters,
		clearSelection,
		toggleSelection,
	}
}

export default useReviewQueue

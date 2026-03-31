import { create } from 'zustand'
import { Activity } from '@/types'
import { ReviewQueueFilters, ReviewQueueStats } from '@/features/review/types/review.types'

interface ReviewStoreState {
	queue: Activity[]
	stats: ReviewQueueStats
	isLoading: boolean
	isActioning: boolean
	error: string | null
	filters: ReviewQueueFilters
	selectedIds: string[]
	setQueue: (items: Activity[]) => void
	setStats: (stats: ReviewQueueStats) => void
	setLoading: (value: boolean) => void
	setActioning: (value: boolean) => void
	setError: (value: string | null) => void
	setFilters: (filters: Partial<ReviewQueueFilters>) => void
	clearSelection: () => void
	toggleSelection: (activityId: string) => void
	removeActivities: (ids: string[]) => void
	updateActivity: (activity: Activity) => void
}

const initialFilters: ReviewQueueFilters = {
	status: 'all',
	category: 'all',
	assignment: 'all',
	search: '',
}

export const useReviewStore = create<ReviewStoreState>((set) => ({
	queue: [],
	stats: { pending: 0, assignedToMe: 0, unassigned: 0 },
	isLoading: false,
	isActioning: false,
	error: null,
	filters: initialFilters,
	selectedIds: [],
	setQueue: (items) => set({ queue: items }),
	setStats: (stats) => set({ stats }),
	setLoading: (value) => set({ isLoading: value }),
	setActioning: (value) => set({ isActioning: value }),
	setError: (value) => set({ error: value }),
	setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
	clearSelection: () => set({ selectedIds: [] }),
	toggleSelection: (activityId) =>
		set((state) => ({
			selectedIds: state.selectedIds.includes(activityId)
				? state.selectedIds.filter((id) => id !== activityId)
				: [...state.selectedIds, activityId],
		})),
	removeActivities: (ids) =>
		set((state) => ({
			queue: state.queue.filter((item) => !ids.includes(item.id)),
			selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
		})),
	updateActivity: (activity) =>
		set((state) => ({
			queue: state.queue.map((item) => (item.id === activity.id ? activity : item)),
		})),
}))

export default useReviewStore

import { create } from 'zustand'
import { Activity, ActivityCategory, ActivityStatus } from '@/types'

export interface ActivityFilters {
	status?: ActivityStatus | 'all'
	category?: ActivityCategory | 'all'
	search?: string
}

interface ActivitiesStoreState {
	items: Activity[]
	isLoading: boolean
	error: string | null
	filters: ActivityFilters
	setItems: (items: Activity[]) => void
	appendItems: (items: Activity[]) => void
	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
	setFilters: (filters: Partial<ActivityFilters>) => void
	clear: () => void
}

const initialFilters: ActivityFilters = {
	status: 'all',
	category: 'all',
	search: '',
}

export const useActivitiesStore = create<ActivitiesStoreState>((set) => ({
	items: [],
	isLoading: false,
	error: null,
	filters: initialFilters,
	setItems: (items) => set({ items }),
	appendItems: (items) => set((state) => ({ items: [...state.items, ...items] })),
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
	clear: () => set({ items: [], isLoading: false, error: null, filters: initialFilters }),
}))

export default useActivitiesStore

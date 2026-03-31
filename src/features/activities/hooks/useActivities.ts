'use client'

import { useCallback, useEffect } from 'react'
import { Activity, ActivityStatus } from '@/types'
import { useActivitiesStore } from '@/store/activities.store'
import activitiesService from '@/features/activities/services/activities.service'

export function useActivities(studentId?: string) {
	const { items, isLoading, error, filters, setItems, setLoading, setError, setFilters } = useActivitiesStore()

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await activitiesService.listStudentActivities({
				studentId,
				status: filters.status && filters.status !== 'all' ? (filters.status as ActivityStatus) : undefined,
			})
			setItems(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load activities')
		} finally {
			setLoading(false)
		}
	}, [studentId, filters.status, setError, setItems, setLoading])

	useEffect(() => {
		void load()
	}, [load])

	const filteredItems = items.filter((activity) => {
		const search = (filters.search || '').toLowerCase()
		const matchesSearch = !search || activity.title.toLowerCase().includes(search) || activity.description.toLowerCase().includes(search)
		const matchesCategory = !filters.category || filters.category === 'all' || activity.category === filters.category
		return matchesSearch && matchesCategory
	})

	return {
		activities: filteredItems,
		isLoading,
		error,
		filters,
		setFilters,
		refresh: load,
	}
}

export default useActivities

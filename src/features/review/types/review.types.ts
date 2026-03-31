import { Activity, ActivityCategory, ActivityStatus } from '@/types'

export interface ReviewQueueFilters {
	status: ActivityStatus | 'all'
	category: ActivityCategory | 'all'
	assignment: 'all' | 'mine' | 'unassigned'
	search?: string
}

export interface ReviewQueueStats {
	pending: number
	assignedToMe: number
	unassigned: number
}

export interface ReviewQueueData {
	items: Activity[]
	stats: ReviewQueueStats
}

export interface ReviewActionPayload {
	activityIds: string[]
	remarks?: string
	pointsAwarded?: number
	score?: number
}

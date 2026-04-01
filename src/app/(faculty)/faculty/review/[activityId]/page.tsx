import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Activity, ApiResponse } from "@/types"
import ReviewDetailClient from "@/features/review/components/ReviewDetailClient"

interface ReviewDetailPageProps {
	params: Promise<{ activityId: string }>
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
	const { activityId } = await params
	const cookieStore = await cookies()
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ')

	const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activity/detail?activityId=${encodeURIComponent(activityId)}`, {
		headers: {
			cookie: cookieHeader,
		},
		cache: 'no-store',
	})

	if (!response.ok) {
		if (response.status === 404 || response.status === 403) {
			notFound()
		}

		throw new Error('Failed to load activity details')
	}

	const payload = (await response.json()) as ApiResponse<Activity>
	const activity = payload.data

	if (!activity) {
		notFound()
	}

	return <ReviewDetailClient activity={activity} />
}

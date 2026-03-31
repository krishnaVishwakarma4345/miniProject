import { notFound } from "next/navigation"
import { getActivityById } from "@/lib/firebase/firestore/activities.repository"
import ReviewDetailClient from "@/features/review/components/ReviewDetailClient"

interface ReviewDetailPageProps {
	params: { activityId: string }
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
	const activity = await getActivityById(params.activityId)

	if (!activity) {
		notFound()
	}

	return <ReviewDetailClient activity={activity} />
}

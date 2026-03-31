"use client"

import { PageContainer } from "@/components/layout/PageContainer"
import { PageHeader } from "@/components/layout/PageHeader"
import ReviewQueue from "@/features/review/components/ReviewQueue"

export default function ReviewQueuePage() {
	return (
		<PageContainer>
			<PageHeader
				title="Review queue"
				subtitle="Filter, assign, and take action on the submissions waiting for your attention."
			/>
			<ReviewQueue />
		</PageContainer>
	)
}

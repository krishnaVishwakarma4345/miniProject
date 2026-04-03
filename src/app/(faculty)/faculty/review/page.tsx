"use client"

import { PageContainer } from "@/components/layout/PageContainer"
import { PageHeader } from "@/components/layout/PageHeader"
import ReviewQueue from "@/features/review/components/ReviewQueue"
import { ScrollReveal } from "@/features/landing/components/ScrollReveal"

export default function ReviewQueuePage() {
	return (
		<PageContainer>
			<ScrollReveal from='left'>
				<PageHeader
					title="Review queue"
					subtitle="Filter, assign, and take action on the submissions waiting for your attention."
				/>
			</ScrollReveal>
			<ScrollReveal from='right'>
				<ReviewQueue />
			</ScrollReveal>
		</PageContainer>
	)
}

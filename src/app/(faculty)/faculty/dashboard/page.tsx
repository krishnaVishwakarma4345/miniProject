"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatCard } from "@/components/data-display/StatCard"
import { LoadingSkeleton } from "@/components/data-display/LoadingSkeleton"
import { EmptyState } from "@/components/data-display/EmptyState"
import { Button } from "@/components/ui/Button"
import ActivityStatusBadge from "@/features/activities/components/ActivityStatusBadge"
import { CATEGORY_LABELS } from "@/constants/activityCategories"
import { useReviewQueue } from "@/features/review/hooks/useReviewQueue"
import { formatDate } from "@/utils/date.utils"
import { ScrollReveal } from "@/features/landing/components/ScrollReveal"

export default function FacultyDashboardPage() {
	const router = useRouter()
	const { stats, queue, isLoading, refresh } = useReviewQueue({ auto: true })
	const topActivities = queue.slice(0, 3)

	return (
		<PageContainer>
			<ScrollReveal from='left'>
				<PageHeader
					title="Faculty dashboard"
					subtitle="Monitor review load, keep an eye on assignments, and dive into the queue when you're ready."
					actions={
						<div className="flex items-center gap-2">
							<Link href="/faculty/profile" className="inline-flex">
								<Button variant="outline" size="sm">
									Profile
								</Button>
							</Link>
							<Button variant="outline" size="sm" onClick={() => refresh()}>
								Refresh data
							</Button>
							<Button size="sm" onClick={() => router.push("/faculty/review")}>
								Open review queue
							</Button>
						</div>
					}
				/>
			</ScrollReveal>
			<ScrollReveal from='right'>
				<section className="grid gap-4 md:grid-cols-3">
					<StatCard label="Total pending" value={stats.pending} suffix="" />
					<StatCard label="Assigned to me" value={stats.assignedToMe} suffix="" />
					<StatCard label="Unassigned backlog" value={stats.unassigned} suffix="" />
				</section>
			</ScrollReveal>
			<ScrollReveal from='left'>
			<section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-slate-900">Latest submissions</h2>
						<p className="text-sm text-slate-500">A quick glance at the freshest activities awaiting review.</p>
					</div>
					<Link href="/faculty/review" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
						View full queue →
					</Link>
				</div>
				<div className="mt-6 space-y-4">
					{isLoading ? (
						<LoadingSkeleton lines={5} />
					) : topActivities.length ? (
						topActivities.map((activity) => (
							<Link
								key={activity.id}
								href={`/faculty/review/${activity.id}`}
								className="block rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition hover:border-slate-300"
							>
								<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
									<div>
										<p className="text-xs uppercase tracking-wide text-slate-400">{formatDate(activity.createdAt)}</p>
										<p className="text-base font-semibold text-slate-900">{activity.title}</p>
										<p className="text-sm text-slate-500">Submitted by {activity.submittedByName}</p>
									</div>
									<ActivityStatusBadge status={activity.status} size="sm" />
								</div>
								<div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
									<span>{activity.proofFiles?.length ?? 0} proofs attached</span>
									<span>Category: {CATEGORY_LABELS[activity.category]}</span>
								</div>
							</Link>
						))
					) : (
						<EmptyState title="All caught up" description="No new submissions right now. Keep an eye on the queue for the next batch." />
					)}
				</div>
			</section>
			</ScrollReveal>
		</PageContainer>
	)
}

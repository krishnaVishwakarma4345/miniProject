"use client"

import Link from "next/link"
import { useState } from "react"
import { Activity } from "@/types"
import { PageContainer } from "@/components/layout/PageContainer"
import { PageHeader } from "@/components/layout/PageHeader"
import ActivityStatusBadge from "@/features/activities/components/ActivityStatusBadge"
import { Badge } from "@/components/ui/Badge"
import { CATEGORY_LABELS } from "@/constants/activityCategories"
import { ACTIVITY_TYPE_LABELS } from "@/constants/activityTypes"
import { formatDate } from "@/utils/date.utils"
import ReviewHistory from "./ReviewHistory"
import ReviewDetailActions from "./ReviewDetailActions"

interface ReviewDetailClientProps {
  activity: Activity
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

export function ReviewDetailClient({ activity }: ReviewDetailClientProps) {
  const [currentActivity, setCurrentActivity] = useState(activity)

  const proofFiles = currentActivity.proofFiles ?? []
  const semesterCgpa = currentActivity.studentSemesterCgpa ?? []

  return (
    <PageContainer>
      <PageHeader
        title={currentActivity.title}
        subtitle={`Submitted by ${currentActivity.submittedByName}`}
        actions={
          <Link href="/faculty/review" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to queue
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <ActivityStatusBadge status={currentActivity.status} showDescription />
        <Badge variant="info">{CATEGORY_LABELS[currentActivity.category]}</Badge>
        <Badge variant="neutral">{ACTIVITY_TYPE_LABELS[currentActivity.type]}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Submission overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{currentActivity.description}</p>
            <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Activity date</dt>
                <dd className="text-base font-medium text-slate-900">{formatDate(currentActivity.activityDate)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
                <dd className="text-base font-medium text-slate-900">{currentActivity.location || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Organization</dt>
                <dd className="text-base font-medium text-slate-900">{currentActivity.organization || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Duration</dt>
                <dd className="text-base font-medium text-slate-900">{currentActivity.durationHours ? `${currentActivity.durationHours} hours` : "Not specified"}</dd>
              </div>
            </dl>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Proof attachments</h2>
            {proofFiles.length ? (
              <ul className="mt-4 space-y-3">
                {proofFiles.map((file) => (
                  <li key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.mimeType} • {formatBytes(file.size)}</p>
                    </div>
                    <Link
                      href={file.secureUrl || file.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No proof files attached.</p>
            )}
          </article>
          <ReviewDetailActions activity={currentActivity} onActivityUpdate={setCurrentActivity} />
        </section>
        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Student info</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Student</dt>
                <dd className="text-base font-medium text-slate-900">{currentActivity.submittedByName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Submitted on</dt>
                <dd className="text-base font-medium text-slate-900">{formatDate(currentActivity.submittedAt || currentActivity.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Assignment</dt>
                <dd className="text-base font-medium text-slate-900">{currentActivity.assignedToName || "Unassigned"}</dd>
              </div>
              {currentActivity.review?.reviewerName ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Reviewed by</dt>
                  <dd className="text-base font-medium text-slate-900">{currentActivity.review.reviewerName}</dd>
                </div>
              ) : null}
              {typeof currentActivity.pointsAwarded === "number" ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Points awarded</dt>
                  <dd className="text-base font-medium text-slate-900">{currentActivity.pointsAwarded}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900">Semester-wise CGPA</h4>
              {semesterCgpa.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {semesterCgpa.map((entry) => (
                    <div key={entry.semester} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Sem {entry.semester}</p>
                      <p className="text-sm font-semibold text-slate-900">{entry.cgpa.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">No semester CGPA shared by the student yet.</p>
              )}
            </div>
          </article>
          <ReviewHistory activity={currentActivity} />
        </aside>
      </div>
    </PageContainer>
  )
}

export default ReviewDetailClient

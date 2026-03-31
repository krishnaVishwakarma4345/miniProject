"use client"

import { useEffect, useState } from "react"
import { Activity, ActivityStatus } from "@/types"
import { Alert } from "@/components/feedback/Alert"
import { Button } from "@/components/ui/Button"
import ApprovalModal from "./ApprovalModal"
import RejectionModal from "./RejectionModal"
import { reviewService } from "@/features/review/services/review.service"

interface ReviewDetailActionsProps {
  activity: Activity
  onActivityUpdate?: (activity: Activity) => void
}

type ActiveModal = "approve" | "reject" | null

export function ReviewDetailActions({ activity, onActivityUpdate }: ReviewDetailActionsProps) {
  const [currentActivity, setCurrentActivity] = useState(activity)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentActivity(activity)
  }, [activity])

  const isFinalized = [ActivityStatus.APPROVED, ActivityStatus.REJECTED].includes(currentActivity.status)

  const handleSuccess = (updated: Activity | null) => {
    if (!updated) return
    setCurrentActivity(updated)
    onActivityUpdate?.(updated)
  }

  const handleApprove = async (payload: { remarks: string; pointsAwarded: number; score?: number }) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await reviewService.approveActivity(currentActivity.id, payload)
      handleSuccess(updated)
      setActiveModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (remarks: string) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await reviewService.rejectActivity(currentActivity.id, remarks)
      handleSuccess(updated)
      setActiveModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Review actions</h3>
          <p className="text-sm text-slate-500">Share feedback, approve with points, or reject with clarity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={isFinalized}
            onClick={() => setActiveModal("reject")}
          >
            Reject
          </Button>
          <Button disabled={isFinalized} onClick={() => setActiveModal("approve")}>Approve</Button>
        </div>
      </div>
      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
      {isFinalized ? (
        <div className="mt-4">
          <Alert variant="info">
            This submission has already been {currentActivity.status.replace("_", " ")}. Further changes will require a new submission.
          </Alert>
        </div>
      ) : null}
      <ApprovalModal
        open={activeModal === "approve"}
        activity={currentActivity}
        isSubmitting={isSubmitting}
        onClose={() => setActiveModal(null)}
        onSubmit={handleApprove}
      />
      <RejectionModal
        open={activeModal === "reject"}
        activity={currentActivity}
        isSubmitting={isSubmitting}
        onClose={() => setActiveModal(null)}
        onSubmit={handleReject}
      />
    </section>
  )
}

export default ReviewDetailActions

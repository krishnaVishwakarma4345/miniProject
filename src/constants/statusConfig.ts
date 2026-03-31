/**
 * Activity Status Configuration
 * Status display, animations, colors, and workflow transitions
 *
 * Consumed by:
 * - ActivityStatusBadge component (Phase 5)
 * - Activity workflows
 * - Dashboard status tracking
 * - Notification triggers
 */

import { ActivityStatus } from "@/types";

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.DRAFT]: "Draft",
  [ActivityStatus.SUBMITTED]: "Submitted",
  [ActivityStatus.UNDER_REVIEW]: "Under Review",
  [ActivityStatus.APPROVED]: "Approved",
  [ActivityStatus.REJECTED]: "Rejected",
  [ActivityStatus.REVISION_REQUESTED]: "Revision Requested",
} as const;

/**
 * Status color codes for badges and UI
 * Tailwind color classes or hex values
 */
export const STATUS_COLORS: Record<ActivityStatus, { bg: string; text: string; border: string }> = {
  [ActivityStatus.DRAFT]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },

  [ActivityStatus.SUBMITTED]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },

  [ActivityStatus.UNDER_REVIEW]: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
  },

  [ActivityStatus.APPROVED]: {
    bg: "bg-teal-100",
    text: "text-teal-800",
    border: "border-teal-300",
  },

  [ActivityStatus.REJECTED]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },

  [ActivityStatus.REVISION_REQUESTED]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
} as const;

/**
 * Status animations
 * Describes which animations trigger for each status
 *
 * Consumed by ActivityStatusBadge to trigger animations on status change
 */
export const STATUS_ANIMATIONS: Record<
  ActivityStatus,
  {
    animation: "pulse" | "spin" | "bounce" | "shake" | "scale" | "draw" | "none";
    duration: number; // ms
    repeatCount: number; // -1 for infinite
  }
> = {
  [ActivityStatus.DRAFT]: {
    animation: "none",
    duration: 0,
    repeatCount: 0,
  },

  [ActivityStatus.SUBMITTED]: {
    animation: "scale",
    duration: 600,
    repeatCount: 1,
  },

  [ActivityStatus.UNDER_REVIEW]: {
    animation: "pulse",
    duration: 2000,
    repeatCount: -1, // infinite
  },

  [ActivityStatus.APPROVED]: {
    animation: "draw", // checkmark draws itself
    duration: 1200,
    repeatCount: 1,
  },

  [ActivityStatus.REJECTED]: {
    animation: "shake",
    duration: 400,
    repeatCount: 3,
  },

  [ActivityStatus.REVISION_REQUESTED]: {
    animation: "bounce",
    duration: 1000,
    repeatCount: 2,
  },
} as const;

/**
 * Status icon names (Heroicons)
 */
export const STATUS_ICONS: Record<ActivityStatus, string> = {
  [ActivityStatus.DRAFT]: "document-text",
  [ActivityStatus.SUBMITTED]: "arrow-up-tray",
  [ActivityStatus.UNDER_REVIEW]: "clock",
  [ActivityStatus.APPROVED]: "check-circle",
  [ActivityStatus.REJECTED]: "x-circle",
  [ActivityStatus.REVISION_REQUESTED]: "exclamation-circle",
} as const;

/**
 * Status descriptions (longer text for UI)
 */
export const STATUS_DESCRIPTIONS: Record<ActivityStatus, string> = {
  [ActivityStatus.DRAFT]:
    "Save your progress. Submit when you have all required proof files.",

  [ActivityStatus.SUBMITTED]:
    "Your activity has been submitted. Faculty will review it soon.",

  [ActivityStatus.UNDER_REVIEW]:
    "Faculty is reviewing your activity. Please wait for their feedback.",

  [ActivityStatus.APPROVED]:
    "Congratulations! Your activity has been approved and points have been awarded.",

  [ActivityStatus.REJECTED]:
    "Your activity was not approved. Please review the feedback and try again.",

  [ActivityStatus.REVISION_REQUESTED]:
    "Faculty requested revisions. Please address the feedback and resubmit.",
} as const;

/**
 * Allowed status transitions
 * Defines which statuses can transition to which other statuses
 *
 * Used for validation in backend and UI state machines
 */
export const STATUS_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  [ActivityStatus.DRAFT]: [ActivityStatus.SUBMITTED, ActivityStatus.DRAFT],

  [ActivityStatus.SUBMITTED]: [
    ActivityStatus.UNDER_REVIEW,
    ActivityStatus.DRAFT, // Student can go back to draft
  ],

  [ActivityStatus.UNDER_REVIEW]: [
    ActivityStatus.APPROVED,
    ActivityStatus.REJECTED,
    ActivityStatus.REVISION_REQUESTED,
  ],

  [ActivityStatus.APPROVED]: [], // Terminal state

  [ActivityStatus.REJECTED]: [ActivityStatus.DRAFT], // Student can revise

  [ActivityStatus.REVISION_REQUESTED]: [
    ActivityStatus.SUBMITTED, // Student resubmits after revision
    ActivityStatus.DRAFT, // Or goes back to draft
  ],
} as const;

/**
 * Check if status transition is allowed
 */
export function isStatusTransitionAllowed(
  from: ActivityStatus,
  to: ActivityStatus
): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Who can change status to what?
 * Determines permission for status updates
 */
export const STATUS_CHANGE_PERMISSIONS: Record<
  ActivityStatus,
  {
    allowedRole: "student" | "faculty" | "admin";
    requiresFiles?: boolean;
    requiresReason?: boolean;
  }
> = {
  [ActivityStatus.DRAFT]: {
    allowedRole: "student",
    requiresFiles: false,
  },

  [ActivityStatus.SUBMITTED]: {
    allowedRole: "student",
    requiresFiles: true,
  },

  [ActivityStatus.UNDER_REVIEW]: {
    allowedRole: "faculty",
    requiresReason: false,
  },

  [ActivityStatus.APPROVED]: {
    allowedRole: "faculty",
    requiresReason: true, // Faculty remarks required
  },

  [ActivityStatus.REJECTED]: {
    allowedRole: "faculty",
    requiresReason: true, // Faculty must provide reason
  },

  [ActivityStatus.REVISION_REQUESTED]: {
    allowedRole: "faculty",
    requiresReason: true, // Faculty must explain what to revise
  },
} as const;

/**
 * Points awarded per status
 * Base points before category multiplier
 */
export const STATUS_POINTS: Record<ActivityStatus, number> = {
  [ActivityStatus.DRAFT]: 0,
  [ActivityStatus.SUBMITTED]: 0,
  [ActivityStatus.UNDER_REVIEW]: 0,
  [ActivityStatus.APPROVED]: 50, // Default, can be overridden
  [ActivityStatus.REJECTED]: 0,
  [ActivityStatus.REVISION_REQUESTED]: 0,
} as const;

/**
 * Notifications triggered by status changes
 * Defines what notification to send
 */
export const STATUS_NOTIFICATIONS: Record<
  ActivityStatus,
  {
    toStudent: boolean;
    toFaculty: boolean;
    notificationType: string;
  }
> = {
  [ActivityStatus.DRAFT]: {
    toStudent: false,
    toFaculty: false,
    notificationType: "draft_saved",
  },

  [ActivityStatus.SUBMITTED]: {
    toStudent: true,
    toFaculty: true,
    notificationType: "activity_submitted",
  },

  [ActivityStatus.UNDER_REVIEW]: {
    toStudent: true,
    toFaculty: false,
    notificationType: "activity_under_review",
  },

  [ActivityStatus.APPROVED]: {
    toStudent: true,
    toFaculty: false,
    notificationType: "activity_approved",
  },

  [ActivityStatus.REJECTED]: {
    toStudent: true,
    toFaculty: false,
    notificationType: "activity_rejected",
  },

  [ActivityStatus.REVISION_REQUESTED]: {
    toStudent: true,
    toFaculty: false,
    notificationType: "activity_revision_requested",
  },
} as const;

/**
 * Get status configuration object
 */
export function getStatusConfig(status: ActivityStatus) {
  return {
    label: STATUS_LABELS[status],
    colors: STATUS_COLORS[status],
    animation: STATUS_ANIMATIONS[status],
    icon: STATUS_ICONS[status],
    description: STATUS_DESCRIPTIONS[status],
  };
}

/**
 * Helper to check if user can transition status
 */
export function canChangeStatus(
  currentStatus: ActivityStatus,
  newStatus: ActivityStatus,
  userRole: "student" | "faculty" | "admin"
): boolean {
  const allowed = isStatusTransitionAllowed(currentStatus, newStatus);
  const permission = STATUS_CHANGE_PERMISSIONS[newStatus];

  return allowed && permission.allowedRole === userRole;
}

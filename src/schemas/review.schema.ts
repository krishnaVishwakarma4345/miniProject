/**
 * Review/Approval Validation Schemas
 *
 * Zod schemas for faculty review, approval, and rejection of activities.
 * Ensures faculty feedback is complete and follows business rules.
 *
 * Features:
 * - Remarks length validation
 * - Point allocation bounds
 * - Workflow state validation
 * - Batch review support
 */

import { z } from "zod";
import { ActivityStatus } from "@/types";

/**
 * Activity approval validation
 * Used by PUT /api/activity/:id/approve
 */
export const approveActivitySchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),

  remarks: z
    .string()
    .min(10, "Remarks must be at least 10 characters")
    .max(1000, "Remarks must be less than 1000 characters")
    .transform((val) => val.trim())
    .optional(),

  pointsAwarded: z
    .number()
    .int("Points must be a whole number")
    .min(0, "Points cannot be negative")
    .max(1000, "Points cannot exceed 1000")
    .default(50),

  certificateUrl: z
    .string()
    .url("Invalid certificate URL")
    .optional(),
});

export type ApproveActivityInput = z.infer<typeof approveActivitySchema>;

/**
 * Activity rejection validation
 * Used by PUT /api/activity/:id/reject
 */
export const rejectActivitySchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),

  remarks: z
    .string()
    .min(20, "Rejection remarks must be at least 20 characters")
    .max(1000, "Remarks must be less than 1000 characters")
    .transform((val) => val.trim()),

  revisionRequest: z
    .boolean()
    .default(false),

  revisitDeadline: z
    .number()
    .int()
    .optional()
    .refine(
      (date) => !date || date > Date.now(),
      "Revisit deadline must be in the future"
    ),
});

export type RejectActivityInput = z.infer<typeof rejectActivitySchema>;

/**
 * Request revision from student
 * Used by PUT /api/activity/:id/request-revision
 */
export const requestRevisionSchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),

  reasons: z
    .array(z.string().min(5).max(200))
    .min(1, "At least one reason required")
    .max(5, "Maximum 5 reasons allowed"),

  suggestedChanges: z
    .string()
    .max(1000, "Suggested changes must be less than 1000 characters")
    .optional()
    .transform((val) => val?.trim()),

  deadline: z
    .number()
    .int()
    .optional()
    .refine(
      (date) => !date || date > Date.now(),
      "Revision deadline must be in the future"
    ),
});

export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>;

/**
 * Review assignment validation
 * Used to assign activities to specific faculty for review
 */
export const assignReviewSchema = z.object({
  activityId: z
    .string()
    .or(z.array(z.string().min(1)))
    .transform((val) => (Array.isArray(val) ? val : [val])),

  assignToFacultyId: z.string().min(1, "Faculty ID is required"),

  priority: z.enum(["low", "normal", "high"]).default("normal"),

  deadline: z
    .number()
    .int()
    .optional()
    .refine(
      (date) => !date || date > Date.now(),
      "Assignment deadline must be in the future"
    ),

  message: z
    .string()
    .max(500, "Assignment message must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim()),
});

export type AssignReviewInput = z.infer<typeof assignReviewSchema>;

/**
 * Batch review operations validation
 * Used by POST /api/activity/batch-review
 */
export const batchReviewSchema = z
  .object({
    activityIds: z
      .array(z.string().min(1))
      .min(1, "At least one activity is required")
      .max(50, "Maximum 50 activities per batch"),

    action: z.enum(["approve_all", "reject_all", "assign_all"]),

    defaultRemarks: z
      .string()
      .max(1000)
      .optional()
      .transform((val) => val?.trim()),

    defaultPoints: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .optional(),

    assignToFacultyId: z.string().optional(),

    applyRubric: z.boolean().default(false),

    rubricId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === "assign_all") {
        return !!data.assignToFacultyId;
      }
      return true;
    },
    {
      message: "Faculty ID required for batch assignment",
      path: ["assignToFacultyId"],
    }
  );

export type BatchReviewInput = z.infer<typeof batchReviewSchema>;

/**
 * Review queue filter validation
 * Used by GET /api/review/queue
 */
export const reviewQueueFilterSchema = z.object({
  status: z
    .enum([ActivityStatus.SUBMITTED, ActivityStatus.UNDER_REVIEW, ActivityStatus.REVISION_REQUESTED])
    .or(z.array(z.enum([ActivityStatus.SUBMITTED, ActivityStatus.UNDER_REVIEW, ActivityStatus.REVISION_REQUESTED])))
    .optional(),

  assignedTo: z.string().optional(),

  priority: z.enum(["low", "normal", "high"]).optional(),

  department: z.string().optional(),

  studentName: z.string().optional(),

  activityCategory: z.string().optional(),

  overdue: z.boolean().optional(),

  cursor: z.string().optional(),

  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  sortBy: z.enum(["submittedAt:asc", "deadline:asc", "priority:desc"]).default("submittedAt:asc"),
});

export type ReviewQueueFilterInput = z.infer<typeof reviewQueueFilterSchema>;

/**
 * Review comment validation
 * Used by POST /api/activity/:id/comment
 */
export const reviewCommentSchema = z.object({
  activityId: z.string().min(1, "Activity ID required"),

  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be less than 2000 characters")
    .transform((val) => val.trim()),

  isInternal: z
    .boolean()
    .default(false)
    .describe("Internal comment not visible to student"),

  attachmentUrl: z
    .string()
    .url("Invalid attachment URL")
    .optional(),

  mentions: z
    .array(z.string().min(1))
    .max(5, "Maximum 5 mentions allowed")
    .optional(),
});

export type ReviewCommentInput = z.infer<typeof reviewCommentSchema>;

/**
 * Rubric scoring validation
 * For structured evaluation based on criteria
 */
export const rubricScoreSchema = z.object({
  activityId: z.string().min(1),

  rubricId: z.string().min(1, "Rubric ID required"),

  scores: z.record(
    z.string().min(1),
    z.object({
      criteriaId: z.string(),
      score: z.number().int().min(0).max(5),
      comments: z.string().max(500).optional(),
    })
  ),

  overallComments: z
    .string()
    .max(1000)
    .optional()
    .transform((val) => val?.trim()),

  recommendedAction: z
    .enum(["approve", "reject", "revision_request"])
    .optional(),
});

export type RubricScoreInput = z.infer<typeof rubricScoreSchema>;

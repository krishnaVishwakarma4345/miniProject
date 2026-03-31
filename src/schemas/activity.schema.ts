/**
 * Activity Validation Schemas
 *
 * Zod schemas for validating activity submissions, updates, and filters.
 * Ensures data consistency and prevents invalid states.
 *
 * Features:
 * - File upload validation
 * - Date range validation
 * - Array length constraints
 * - Cross-field refinements
 */

import { z } from "zod";
import { ActivityCategory, ActivityType, ActivityStatus } from "@/types";

/**
 * Proof file validation
 * For uploaded activity evidence (screenshots, certificates, etc.)
 */
export const proofFileSchema = z.object({
  id: z.string().min(1, "File ID is required"),
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name is too long"),
  type: z.enum(["image", "pdf", "video", "document"]),
  url: z.string().url("Invalid file URL"),
  secureUrl: z.string().url("Invalid secure URL"),
  size: z.number().positive("File size must be positive").max(100 * 1024 * 1024, "File size cannot exceed 100MB"),
  mimeType: z
    .string()
    .regex(
      /^[a-z-]+\/[a-z0-9+.-]+$/i,
      "Invalid MIME type"
    ),
  uploadedAt: z.number().int().positive(),
  order: z.number().int().min(0),
  metadata: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

/**
 * Activity creation validation
 * Used by POST /api/activity/create
 */
export const activityCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Activity title must be at least 5 characters")
    .max(200, "Activity title must be less than 200 characters")
    .transform((val) => val.trim()),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters")
    .transform((val) => val.trim()),

  category: z.nativeEnum(ActivityCategory),

  type: z.nativeEnum(ActivityType),

  activityDate: z
    .number()
    .int("Activity date must be a valid timestamp")
    .positive("Activity date cannot be in the future")
    .refine(
      (date) => date <= Date.now(),
      "Activity date cannot be in the future"
    ),

  location: z
    .string()
    .max(200, "Location is too long")
    .optional()
    .transform((val) => val?.trim()),

  organization: z
    .string()
    .max(200, "Organization name is too long")
    .optional()
    .transform((val) => val?.trim()),

  durationHours: z
    .number()
    .positive("Duration must be positive")
    .max(24 * 365, "Duration cannot exceed 1 year")
    .optional(),

  certificatesAwards: z
    .string()
    .max(500, "Certificates/Awards field is too long")
    .optional()
    .transform((val) => val?.trim()),

  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([]),

  proofFiles: z
    .array(proofFileSchema)
    .max(10, "Maximum 10 proof files allowed")
    .optional(),

  proofFileIds: z
    .array(z.string().min(1, "File ID cannot be empty"))
    .max(10, "Maximum 10 proof files allowed")
    .optional(),
})
.refine(
  (data) => (data.proofFiles?.length ?? 0) > 0 || (data.proofFileIds?.length ?? 0) > 0,
  "Please attach at least one proof file"
);

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;

/**
 * Activity update validation
 * Used by PUT /api/activity/:id
 * All fields optional to support partial updates
 */
export const activityUpdateSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must be less than 200 characters")
      .optional()
      .transform((val) => val?.trim()),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(5000, "Description must be less than 5000 characters")
      .optional()
      .transform((val) => val?.trim()),

    category: z.nativeEnum(ActivityCategory).optional(),

    type: z.nativeEnum(ActivityType).optional(),

    activityDate: z
      .number()
      .int()
      .refine(
        (date) => date <= Date.now(),
        "Activity date cannot be in the future"
      )
      .optional(),

    location: z
      .string()
      .max(200, "Location is too long")
      .optional()
      .transform((val) => val?.trim()),

    organization: z
      .string()
      .max(200, "Organization name is too long")
      .optional()
      .transform((val) => val?.trim()),

    durationHours: z
      .number()
      .positive()
      .max(24 * 365)
      .optional(),

    certificatesAwards: z
      .string()
      .max(500)
      .optional()
      .transform((val) => val?.trim()),

    tags: z
      .array(z.string().min(1).max(50))
      .max(10, "Maximum 10 tags allowed")
      .optional(),

    isFeatured: z.boolean().optional(),

    status: z.nativeEnum(ActivityStatus).optional(),
  })
  .strict()
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    "At least one field must be provided for update"
  );

export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;

/**
 * Activity filter validation
 * Used by GET /api/activity/filter query parameters
 */
export const activityFilterSchema = z.object({
  submittedBy: z.string().optional(),
  status: z.nativeEnum(ActivityStatus).or(
    z.array(z.nativeEnum(ActivityStatus))
  ).optional(),
  category: z.nativeEnum(ActivityCategory).or(
    z.array(z.nativeEnum(ActivityCategory))
  ).optional(),
  type: z.nativeEnum(ActivityType).or(
    z.array(z.nativeEnum(ActivityType))
  ).optional(),
  startDate: z.number().int().optional(),
  endDate: z.number().int().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredOnly: z.boolean().optional(),
  searchQuery: z.string().max(200).optional(),
  department: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ActivityFilterInput = z.infer<typeof activityFilterSchema>;

/**
 * Bulk activity action validation
 * Used by POST /api/activity/bulk-action
 */
export const bulkActivityActionSchema = z
  .object({
    activityIds: z
      .array(z.string().min(1))
      .min(1, "At least one activity ID required")
      .max(100, "Maximum 100 activities per action"),

    action: z.enum(["approve", "reject", "assign", "archive", "restore"]),

    assignToId: z.string().optional(),

    remarks: z
      .string()
      .max(1000, "Remarks must be less than 1000 characters")
      .optional()
      .transform((val) => val?.trim()),

    points: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === "approve") {
        return data.points !== undefined;
      }
      if (data.action === "assign") {
        return data.assignToId !== undefined;
      }
      return true;
    },
    {
      message: "Required fields missing for selected action",
      path: ["action"],
    }
  );

export type BulkActivityActionInput = z.infer<typeof bulkActivityActionSchema>;

/**
 * Query parameters for activity listings
 * Used by GET /api/activity routes
 */
export const activityQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform(Number)
    .refine((n) => !isNaN(n) && n > 0 && n <= 100, "Invalid limit")
    .default(20),
  sortBy: z.enum(["newest", "oldest", "mostViewed", "trending"]).default("newest"),
  role: z.enum(["student", "faculty"]).optional(),
});

export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;

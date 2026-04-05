/**
 * User Profile Validation Schemas
 *
 * Zod schemas for user registration, profile updates, and role-specific data.
 * Ensures data consistency and validates role-specific requirements.
 *
 * Features:
 * - Student, Faculty, Admin profile validation
 * - Field constraints per role
 * - Profile completion tracking
 * - Denormalization consistency
 */

import { z } from "zod";
import { ActivityCategory, UserRole, UserStatus } from "@/types";

const semesterCgpaEntrySchema = z.object({
  semester: z
    .number()
    .int()
    .min(1, "Semester must be between 1 and 8")
    .max(8, "Semester must be between 1 and 8"),
  cgpa: z
    .number()
    .min(0, "CGPA cannot be negative")
    .max(10, "CGPA cannot exceed 10"),
});

/**
 * Student profile validation
 * Used by student profile setup and updates
 */
export const studentProfileSchema = z.object({
  studentId: z
    .string()
    .min(8, "Student ID must be at least 8 characters")
    .max(20, "Student ID must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Student ID can only contain uppercase letters, numbers, and hyphens"),

  department: z
    .string()
    .min(2, "Department is required")
    .max(100, "Department name is too long"),

  year: z
    .number()
    .int()
    .min(1, "Year must be between 1 and 4")
    .max(4, "Year must be between 1 and 4"),

  semester: z
    .number()
    .int()
    .min(1, "Semester must be between 1 and 8")
    .max(8, "Semester must be between 1 and 8"),

  division: z
    .string()
    .min(1, "Division is required")
    .max(10, "Division is too long")
    .transform((val) => val.trim()),

  rollNo: z
    .string()
    .min(1, "Roll number is required")
    .max(20, "Roll number is too long")
    .transform((val) => val.trim()),

  branch: z
    .string()
    .min(2, "Branch is required")
    .max(100, "Branch name is too long")
    .transform((val) => val.trim()),

  cgpa: z
    .number()
    .min(0, "CGPA cannot be negative")
    .max(10, "CGPA cannot exceed 10")
    .default(0),

  semesterCgpa: z
    .array(semesterCgpaEntrySchema)
    .max(8, "Maximum 8 semesters allowed")
    .refine((entries) => new Set(entries.map((entry) => entry.semester)).size === entries.length, {
      message: "Each semester can have only one CGPA value",
    })
    .optional(),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim()),

  skills: z
    .array(
      z.string()
        .min(2, "Skill must be at least 2 characters")
        .max(50, "Skill name is too long")
    )
    .max(20, "Maximum 20 skills allowed")
    .default([]),

  interests: z
    .array(
      z.string()
        .min(2, "Interest must be at least 2 characters")
        .max(50, "Interest name is too long")
    )
    .max(15, "Maximum 15 interests allowed")
    .optional(),

  links: z
    .object({
      portfolio: z.string().url("Invalid portfolio URL").optional(),
      github: z.string().url("Invalid GitHub URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      twitter: z.string().url("Invalid Twitter URL").optional(),
    })
    .optional(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

/**
 * Faculty profile validation
 * Used by faculty profile setup and updates
 */
export const facultyProfileSchema = z.object({
  employeeId: z
    .string()
    .min(6, "Employee ID must be at least 6 characters")
    .max(20, "Employee ID must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Employee ID can only contain uppercase letters, numbers, and hyphens"),

  department: z
    .string()
    .min(2, "Department is required")
    .max(100, "Department name is too long"),

  designation: z
    .enum(
      ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Teaching Assistant"],
      "Invalid designation"
    ),

  office: z
    .string()
    .max(100, "Office location is too long")
    .optional()
    .transform((val) => val?.trim()),

  phoneExt: z
    .string()
    .max(10, "Phone extension is too long")
    .regex(/^[0-9-]+$/, "Phone extension can only contain numbers and hyphens")
    .optional(),

  specializations: z
    .array(
      z.string()
        .min(2, "Specialization must be at least 2 characters")
        .max(100, "Specialization is too long")
    )
    .min(1, "At least one specialization is required")
    .max(10, "Maximum 10 specializations allowed"),

  reviewCategories: z
    .array(z.nativeEnum(ActivityCategory))
    .max(20, "Too many review categories")
    .optional(),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim()),

  officeHours: z
    .string()
    .max(200, "Office hours description is too long")
    .optional()
    .transform((val) => val?.trim()),

  isAvailable: z.boolean().default(true),
});

export type FacultyProfileInput = z.infer<typeof facultyProfileSchema>;

/**
 * Admin profile validation
 * Used by admin profile setup and updates
 */
export const adminProfileSchema = z.object({
  adminTitle: z
    .string()
    .min(5, "Admin title must be at least 5 characters")
    .max(100, "Admin title is too long"),

  department: z
    .string()
    .max(100, "Department name is too long")
    .optional()
    .transform((val) => val?.trim()),

  permissionLevel: z.enum(["super-admin", "moderator", "analyst"]),
});

export type AdminProfileInput = z.infer<typeof adminProfileSchema>;

/**
 * User profile update validation
 * Supports partial updates across all fields
 */
export const userProfileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .optional()
      .transform((val) => val?.trim()),

    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional(),

    avatar: z
      .string()
      .url("Invalid avatar URL")
      .optional(),

    themePreference: z.enum(["light", "dark", "system"]).optional(),

    language: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid language code (e.g., 'en' or 'en-US')")
      .optional(),

    bio: z
      .string()
      .max(500, "Bio must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim()),

    studentProfile: studentProfileSchema.partial().optional(),
    facultyProfile: facultyProfileSchema.partial().optional(),
  })
  .strict()
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    "At least one field must be provided for update"
  );

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

/**
 * User list query parameters validation
 * For GET /api/users endpoint
 */
export const userListQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),

  department: z.string().optional(),

  status: z.nativeEnum(UserStatus).optional(),

  searchQuery: z
    .string()
    .max(100, "Search query is too long")
    .optional(),

  sortBy: z
    .enum(["fullName:asc", "fullName:desc", "createdAt:desc", "createdAt:asc"])
    .default("createdAt:desc"),

  cursor: z.string().optional(),

  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export type UserListQueryInput = z.infer<typeof userListQuerySchema>;

/**
 * User role change validation
 * For admin operations changing user roles
 */
export const changeUserRoleSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),

    newRole: z.nativeEnum(UserRole, {
      message: "Invalid role",
    }),

    reason: z
      .string()
      .max(500, "Reason must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim()),

    requiredProfileData: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    (data) => {
      // Validate that required data for new role is provided
      if (data.newRole === UserRole.STUDENT && data.requiredProfileData) {
        return data.requiredProfileData.studentId && data.requiredProfileData.year;
      }
      if (data.newRole === UserRole.FACULTY && data.requiredProfileData) {
        return data.requiredProfileData.employeeId && data.requiredProfileData.designation;
      }
      return true;
    },
    {
      message: "Required profile data missing for new role",
      path: ["requiredProfileData"],
    }
  );

export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;

/**
 * User account status change validation
 * For suspending, reactivating, or deleting accounts
 */
export const changeUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  newStatus: z.nativeEnum(UserStatus),

  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim()),

  notifyUser: z.boolean().default(true),
});

export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;

/**
 * Bulk user import validation
 * For CSV/JSON bulk import operations
 */
export const bulkUserImportSchema = z.object({
  users: z
    .array(
      z.object({
        fullName: z.string().min(2).max(100),
        email: z.string().email(),
        role: z.nativeEnum(UserRole),
        department: z.string().optional(),
        studentId: z.string().optional(),
        year: z.number().min(1).max(4).optional(),
        employeeId: z.string().optional(),
        designation: z.string().optional(),
      })
    )
    .min(1, "At least one user required")
    .max(1000, "Maximum 1000 users per import"),

  sendInviteEmails: z.boolean().default(true),

  departmentMapping: z.record(z.string(), z.string()).optional(),
});

export type BulkUserImportInput = z.infer<typeof bulkUserImportSchema>;

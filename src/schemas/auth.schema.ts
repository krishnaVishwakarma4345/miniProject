/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication requests.
 * Used by login/signup endpoints and react-hook-form integration.
 *
 * Features:
 * - Password strength validation
 * - Email normalization and validation
 * - Regex-based pattern validation
 * - Custom error messages
 * - Refinements for cross-field validation
 */

import { z } from "zod";
import { UserRole } from "@/types";

/**
 * Email validation pattern
 * RFC 5322 simplified but practical pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation requirements:
 * - At least 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 */
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Password validation schema
 * Reusable for signup, password change, etc.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
  .refine(
    (val) => PASSWORD_REGEX.test(val),
    "Password does not meet complexity requirements"
  );

/**
 * Email validation schema
 * Normalizes to lowercase, trims whitespace
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .regex(EMAIL_REGEX, "Email format is invalid")
  .max(254, "Email address is too long");

/**
 * Login request validation
 * Used by POST /api/auth/login
 *
 * @example
 * const result = loginSchema.parse({ email: "user@example.com", password: "Pass123!" });
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Signup request validation
 * Includes additional fields for user registration
 *
 * Note: studentId, year, department are required if role === STUDENT
 * employeeId, department are required if role === FACULTY
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes")
      .transform((val) => val.trim()),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: "Invalid role selected" }),
    }),

    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be a valid E.164 format")
      .optional(),

    // Student-specific fields
    studentId: z.string().optional(),
    year: z.number().min(1).max(4).optional(),
    cgpa: z.number().min(0).max(10).optional(),

    // Faculty-specific fields
    employeeId: z.string().optional(),
    designation: z.string().optional(),

    // Common optional fields
    department: z
      .string()
      .min(1, "Department is required")
      .max(100, "Department is too long")
      .optional(),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Student validation
      if (data.role === UserRole.STUDENT) {
        return data.studentId && data.year && data.department;
      }
      // Faculty validation
      if (data.role === UserRole.FACULTY) {
        return data.employeeId && data.designation && data.department;
      }
      // Admin requires only basic fields
      return true;
    },
    {
      message: "Required fields missing for selected role",
      path: ["role"],
    }
  );

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Password reset request validation
 * Used by POST /api/auth/forgot-password
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * Password change validation
 * Used by POST /api/auth/change-password (authenticated)
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * Google OAuth response validation
 * Used to validate tokens from Google Sign-In
 */
export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  credential: z.string().optional(), // Legacy Google Sign-In
  accessToken: z.string().optional(),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

/**
 * Session verification payload
 * For validating session cookies
 */
export const sessionTokenSchema = z.object({
  sessionToken: z.string().min(1, "Session token is required"),
});

export type SessionTokenInput = z.infer<typeof sessionTokenSchema>;

/**
 * Email verification token validation
 * Used for email confirmation links
 */
export const emailVerificationSchema = z.object({
  token: z
    .string()
    .min(20, "Verification token is invalid")
    .max(500, "Verification token is invalid"),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

/**
 * MFA setup validation
 * For enabling two-factor authentication
 */
export const mfaSetupSchema = z.object({
  mfaMethod: z.enum(["totp", "sms", "email"]),
  phoneNumber: z.string().optional(),
});

export type MfaSetupInput = z.infer<typeof mfaSetupSchema>;

/**
 * MFA verification validation
 * For verifying OTP/TOTP codes
 */
export const mfaVerificationSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type MfaVerificationInput = z.infer<typeof mfaVerificationSchema>;

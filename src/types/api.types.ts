/**
 * API Type Definitions
 *
 * Standard request/response types for all API routes.
 * Ensures consistent error handling, pagination, and data structures.
 *
 * Requirements:
 * - Standard HTTP status codes (200, 400, 401, 403, 404, 500)
 * - Consistent error message format
 * - Pagination with cursors
 * - Type-safe API responses
 */

/**
 * Standard API response wrapper
 * Used by all endpoints for consistency
 *
 * @template T - Response data type
 *
 * @example
 * {
 *   success: true,
 *   data: { id: "123", name: "John" },
 *   message: "User created successfully",
 *   timestamp: 1704067200000
 * }
 */
export interface ApiResponse<T = any> {
  /** Request success status */
  success: boolean;

  /** Response data (null if error) */
  data?: T;

  /** Human-readable message */
  message: string;

  /** Response timestamp (epoch milliseconds) */
  timestamp: number;

  /** HTTP status code (mirrors Response.status) */
  statusCode?: number;

  /** Request ID for tracking/logging */
  requestId?: string;
}

export interface ApiErrorOptions {
  details?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  error: string;
  code: string;
  statusCode?: number;
  details?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;

  constructor(
    message: string,
    code = "UNKNOWN_ERROR",
    statusCode = 400,
    options?: ApiErrorOptions
  ) {
    super(message);
    this.name = "ApiError";
    this.error = message;
    this.code = code;
    this.statusCode = options?.statusCode ?? statusCode;
    this.details = options?.details;
    this.fieldErrors = options?.fieldErrors;
    this.requestId = options?.requestId;
  }
}

/**
 * Standard error response
 * Used for all error cases (4xx, 5xx)
 *
 * @example
 * {
 *   success: false,
 *   data: null,
 *   message: "Invalid email format",
 *   error: {
 *     code: "INVALID_INPUT",
 *     details: "Email field must be a valid email address"
 *   },
 *   statusCode: 400,
 *   timestamp: 1704067200000
 * }
 */
export interface ApiErrorResponse {
  /** Always false for error responses */
  success: false;

  /** Data is null for errors */
  data: null;

  /** Human-readable error message */
  message: string;

  /** Error details object */
  error: {
    /** Machine-readable error code (e.g., INVALID_INPUT, UNAUTHORIZED, NOT_FOUND) */
    code: string;

    /** Detailed error description */
    details?: string;

    /** Field-level validation errors (for 400 Bad Request) */
    fieldErrors?: Record<string, string[]>;

    /** Stack trace (dev mode only, not sent to client) */
    stack?: string;
  };

  /** HTTP status code */
  statusCode: number;

  /** Response timestamp */
  timestamp: number;

  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Pagination cursor structure
 * For cursor-based pagination (more scalable than offset)
 */
export interface PaginationCursor {
  /** Base64-encoded last document ID / cursor position */
  cursor?: string;

  /** Pagination direction */
  direction: "next" | "previous";

  /** Results per page */
  limit: number;
}

/**
 * Paginated response wrapper
 * Used for list endpoints
 *
 * @template T - Item type in list
 *
 * @example
 * {
 *   success: true,
 *   data: {
 *     items: [...],
 *     pagination: {
 *       nextCursor: "xyz123",
 *       prevCursor: "abc456",
 *       hasMore: true,
 *       totalCount: 1000
 *     }
 *   },
 *   message: "Users fetched successfully",
 *   timestamp: 1704067200000
 * }
 */
export interface PaginatedApiResponse<T> extends ApiResponse<{
  items: T[];
  pagination: {
    /** Cursor for next page of results */
    nextCursor?: string;

    /** Cursor for previous page */
    prevCursor?: string;

    /** Total items available (may be approximate) */
    totalCount?: number;

    /** Whether more results exist */
    hasMore: boolean;

    /** Current page number (if using offset pagination) */
    currentPage?: number;

    /** Total pages (if using offset pagination) */
    totalPages?: number;
  };
}> {}

/**
 * Standard request headers expected by API
 * Used for authentication, content negotiation, etc.
 */
export interface ApiRequestHeaders {
  /** Bearer token for JWT authentication */
  authorization?: string;

  /** Content type of request body */
  "content-type"?: "application/json" | "multipart/form-data";

  /** Client version for compatibility tracking */
  "x-client-version"?: string;

  /** Request ID for tracing */
  "x-request-id"?: string;

  /** Feature flags for A/B testing */
  "x-feature-flags"?: string;

  /** API version (e.g., "v1") */
  "x-api-version"?: string;
}

/**
 * Authentication request body
 * Used by login/signup endpoints
 */
export interface AuthRequest {
  email: string;
  password: string;
}

/**
 * Authentication response data
 * Returned on successful login
 */
export interface AuthResponse {
  /** Firebase ID token for subsequent API calls */
  idToken: string;

  /** Refresh token (stored in secure httpOnly cookie) */
  refreshToken?: string;

  /** Session cookie token (httpOnly, Secure) */
  sessionToken?: string;

  /** User object */
  user: {
    uid: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
  };

  /** Session expiration timestamp */
  expiresAt: number;
}

/**
 * File upload request body
 * Used by multipart form endpoints
 */
export interface FileUploadRequest {
  /** FormData with file(s) */
  file: File | File[];

  /** Optional folder path in Cloudinary */
  folder?: string;

  /** Optional public ID override */
  publicId?: string;

  /** Resource type (image, video, auto) */
  resourceType?: "image" | "video" | "auto";

  /** Optional tags for the upload */
  tags?: string[];
}

/**
 * File upload response data
 * Returned by upload endpoints
 */
export interface FileUploadResponse {
  /** Cloudinary public ID */
  publicId: string;

  /** Display URL (http or https) */
  url: string;

  /** Secure URL (HTTPS only) */
  secureUrl: string;

  /** Resource type (image, video, etc.) */
  resourceType: string;

  /** Asset type (upload, etc.) */
  type: string;

  /** File size in bytes */
  bytes: number;

  /** Cloudinary width (images) */
  width?: number;

  /** Cloudinary height (images) */
  height?: number;

  /** Upload timestamp */
  createdAt: number;

  /** Cloudinary version ID */
  version: number;

  /** Format (jpg, png, gif, etc.) */
  format: string;
}

/**
 * Signed URL request for Cloudinary upload
 * Allows client-side direct uploads
 */
export interface CloudinarySignatureRequest {
  /** Folder path */
  folder: string;

  /** Resource type */
  resourceType: "image" | "video" | "auto";

  /** Array of allowed file types */
  allowedFormats?: string[];

  /** Max file size in bytes */
  maxFileSize?: number;
}

/**
 * Signed URL response with upload parameters
 */
export interface CloudinarySignatureResponse {
  /** API key for upload form */
  cloudName: string;

  /** Upload API key */
  apiKey: string;

  /** Generated signature for upload */
  signature: string;

  /** Timestamp for signature */
  timestamp: number;

  /** Folder path */
  folder: string;

  /** Resource type */
  resourceType: string;

  /** Unsigned upload allowed? */
  unsigned?: boolean;
}

/**
 * Activity bulk action request
 * For operations on multiple activities at once
 */
export interface BulkActionRequest {
  /** IDs of activities to act on */
  activityIds: string[];

  /** Action type (approve, reject, assign, delete) */
  action: "approve" | "reject" | "assign" | "archive" | "restore";

  /** Faculty ID (for assign action) */
  assignToId?: string;

  /** Remarks (for approve/reject) */
  remarks?: string;

  /** Points to award (for approve) */
  points?: number;
}

/**
 * Query parameter types for list endpoints
 * Standardizes filtering and sorting
 */
export interface ListQueryParams {
  /** Cursor for pagination */
  cursor?: string;

  /** Results per page */
  limit?: number;

  /** Sort field and direction */
  sort?: string; // e.g., "createdAt:desc" or "name:asc"

  /** Filter by status */
  status?: string | string[];

  /** Filter by category */
  category?: string | string[];

  /** Filter by department */
  department?: string;

  /** Search query */
  search?: string;

  /** Filter by user/owner */
  userId?: string;

  /** Start date for range filter */
  startDate?: number;

  /** End date for range filter */
  endDate?: number;
}

/**
 * Cache control headers
 * Used for optimizing API response caching
 */
export interface CacheControl {
  /** Cache validity duration in seconds */
  maxAge: number;

  /** Revalidate if stale after this duration */
  sMaxAge?: number;

  /** Include whether response is stale-while-revalidate */
  staleWhileRevalidate?: number;

  /** Cache is private (user-specific) or public */
  isPrivate: boolean;
}

/**
 * Standard rate limit headers
 * Included in API responses
 */
export interface RateLimitHeaders {
  /** Requests remaining in current window */
  "x-ratelimit-remaining": number;

  /** Total requests allowed in window */
  "x-ratelimit-limit": number;

  /** Seconds until rate limit resets */
  "x-ratelimit-reset": number;

  /** Request was rate limited */
  "x-ratelimit-exceeded"?: boolean;
}

/**
 * Request validation error response
 * More detailed than generic 400 Bad Request
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  error: {
    code: "VALIDATION_ERROR";
    details: string;
    /** Field-level validation errors */
    fieldErrors: Record<string, string[]>;
  };
}

/**
 * Webhook payload structure
 * For Firebase function triggers or external webhooks
 */
export interface WebhookPayload<T = any> {
  /** Event type that triggered webhook */
  event: string;

  /** Data associated with event */
  data: T;

  /** Timestamp of event */
  timestamp: number;

  /** Webhook signature for verification */
  signature?: string;

  /** Version of webhook payload structure */
  version: string;
}

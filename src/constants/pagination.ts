/**
 * Pagination Constants
 * Default pagination parameters and limits
 */

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  /** Default number of items per page */
  LIMIT: 20,

  /** Maximum items per page (prevents DOS attacks) */
  MAX_LIMIT: 100,

  /** Minimum items per page */
  MIN_LIMIT: 1,
} as const;

/**
 * Presets for common pagination limits
 */
export const PAGINATION_PRESETS = {
  /** Compact list (3-5 items) */
  COMPACT: 5,

  /** Standard list (20 items) */
  STANDARD: 20,

  /** Detailed list (50 items) */
  DETAILED: 50,

  /** Large list (100+ items, use with server-side filtering) */
  LARGE: 100,
} as const;

/**
 * Pagination configuration per context
 * Different parts of the app use different default limits
 */
export const PAGINATION_CONFIG = {
  // Activity listings
  ACTIVITIES: {
    LIMIT: 20,
    SORT: "createdAt:desc" as const,
  },

  // User listings
  USERS: {
    LIMIT: 30,
    SORT: "fullName:asc" as const,
  },

  // Review queue
  REVIEW_QUEUE: {
    LIMIT: 15,
    SORT: "submittedAt:asc" as const,
  },

  // Portfolios
  PORTFOLIOS: {
    LIMIT: 12,
    SORT: "createdAt:desc" as const,
  },

  // Notifications
  NOTIFICATIONS: {
    LIMIT: 15,
    SORT: "createdAt:desc" as const,
  },

  // Analytics/Reports
  ANALYTICS: {
    LIMIT: 50,
    SORT: "createdAt:desc" as const,
  },

  // Comments/Discussion
  COMMENTS: {
    LIMIT: 10,
    SORT: "createdAt:asc" as const,
  },
} as const;

/**
 * Infinite scroll configuration
 */
export const INFINITE_SCROLL = {
  /** Trigger load when user is within 500px of bottom */
  LOAD_MORE_OFFSET: 500,

  /** Wait this many ms before allowing another load_more */
  DEBOUNCE_MS: 300,

  /** Show loading skeleton for this many items */
  LOADING_SKELETON_COUNT: 3,
} as const;

/**
 * Cursor pagination type (more scalable than offset)
 * Used for performance-critical endpoints
 */
export const CURSOR_PAGINATION = {
  /** Cursor encoding method */
  ENCODING: "base64" as const,

  /** Default page size */
  DEFAULT_SIZE: 20,

  /** Fields to include in cursor */
  CURSOR_FIELDS: ["id", "createdAt"] as const,
} as const;

/**
 * Validation functions for pagination parameters
 */
export function validateLimit(limit?: number): number {
  if (!limit) return DEFAULT_PAGINATION.LIMIT;
  if (limit < DEFAULT_PAGINATION.MIN_LIMIT) return DEFAULT_PAGINATION.MIN_LIMIT;
  if (limit > DEFAULT_PAGINATION.MAX_LIMIT) return DEFAULT_PAGINATION.MAX_LIMIT;
  return limit;
}

/**
 * Get pagination config for a specific context
 */
export function getPaginationConfig(
  context: keyof typeof PAGINATION_CONFIG
): (typeof PAGINATION_CONFIG)[keyof typeof PAGINATION_CONFIG] {
  return PAGINATION_CONFIG[context] || PAGINATION_CONFIG.ACTIVITIES;
}

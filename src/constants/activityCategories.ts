/**
 * Activity Categories Constants
 * Predefined list of activity categories with metadata
 */

import { ActivityCategory } from "@/types";

/**
 * Category display labels
 */
export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.SPORTS]: "Sports",
  [ActivityCategory.TECH]: "Technology",
  [ActivityCategory.CULTURAL]: "Cultural",
  [ActivityCategory.COMMUNITY_SERVICE]: "Community Service",
  [ActivityCategory.COMMITTEE]: "Committee",
  [ActivityCategory.ACADEMIC]: "Academic",
  [ActivityCategory.INTERNSHIP]: "Internship",
  [ActivityCategory.CERTIFICATION]: "Certification",
  [ActivityCategory.LEADERSHIP]: "Leadership",
  [ActivityCategory.ENTREPRENEURSHIP]: "Entrepreneurship",
  [ActivityCategory.VOLUNTEER]: "Volunteer",
} as const;

/**
 * Category descriptions for UI
 */
export const CATEGORY_DESCRIPTIONS: Record<ActivityCategory, string> = {
  [ActivityCategory.SPORTS]:
    "Participation and achievements in indoor and outdoor sports",
  [ActivityCategory.TECH]:
    "Technology-related activities including hackathons, workshops, and tech talks",
  [ActivityCategory.CULTURAL]:
    "Cultural events, performances, and celebrations of arts and traditions",
  [ActivityCategory.COMMUNITY_SERVICE]:
    "Community service projects, charity drives, and social initiatives",
  [ActivityCategory.COMMITTEE]:
    "Participation in committees such as NSS, NCC, and other recognized bodies",
  [ActivityCategory.ACADEMIC]:
    "Academic presentations, seminars, paper publications, and research contributions",
  [ActivityCategory.INTERNSHIP]:
    "Industry or institutional internships with documented work and outcomes",
  [ActivityCategory.CERTIFICATION]:
    "Completed certification courses with valid course completion proof",
  [ActivityCategory.LEADERSHIP]:
    "Leadership roles in clubs, committees, and event organizing",
  [ActivityCategory.ENTREPRENEURSHIP]:
    "Startup launches, business pitches, and entrepreneurial ventures",
  [ActivityCategory.VOLUNTEER]:
    "Volunteer work and social service activities",
} as const;

/**
 * Category colors for UI badges and displays
 */
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.SPORTS]: "#3b82f6", // blue
  [ActivityCategory.TECH]: "#8b5cf6", // violet
  [ActivityCategory.CULTURAL]: "#ec4899", // pink
  [ActivityCategory.COMMUNITY_SERVICE]: "#10b981", // emerald
  [ActivityCategory.COMMITTEE]: "#059669", // emerald-600
  [ActivityCategory.ACADEMIC]: "#f59e0b", // amber
  [ActivityCategory.INTERNSHIP]: "#0ea5e9", // sky
  [ActivityCategory.CERTIFICATION]: "#7c3aed", // violet-600
  [ActivityCategory.LEADERSHIP]: "#ef4444", // red
  [ActivityCategory.ENTREPRENEURSHIP]: "#06b6d4", // cyan
  [ActivityCategory.VOLUNTEER]: "#14b8a6", // teal
} as const;

/**
 * Category icons (Heroicons names)
 */
export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  [ActivityCategory.SPORTS]: "trophy",
  [ActivityCategory.TECH]: "computer-desktop",
  [ActivityCategory.CULTURAL]: "film",
  [ActivityCategory.COMMUNITY_SERVICE]: "heart",
  [ActivityCategory.COMMITTEE]: "users",
  [ActivityCategory.ACADEMIC]: "book-open",
  [ActivityCategory.INTERNSHIP]: "briefcase",
  [ActivityCategory.CERTIFICATION]: "academic-cap",
  [ActivityCategory.LEADERSHIP]: "star",
  [ActivityCategory.ENTREPRENEURSHIP]: "light-bulb",
  [ActivityCategory.VOLUNTEER]: "hands-raised",
} as const;

/**
 * Minimum points awarded for each category
 * Faculty cannot award less than this
 */
export const CATEGORY_MIN_POINTS: Record<ActivityCategory, number> = {
  [ActivityCategory.SPORTS]: 10,
  [ActivityCategory.TECH]: 20,
  [ActivityCategory.CULTURAL]: 15,
  [ActivityCategory.COMMUNITY_SERVICE]: 15,
  [ActivityCategory.COMMITTEE]: 20,
  [ActivityCategory.ACADEMIC]: 25,
  [ActivityCategory.INTERNSHIP]: 30,
  [ActivityCategory.CERTIFICATION]: 20,
  [ActivityCategory.LEADERSHIP]: 20,
  [ActivityCategory.ENTREPRENEURSHIP]: 30,
  [ActivityCategory.VOLUNTEER]: 15,
} as const;

/**
 * Maximum points for each category
 * Faculty cannot award more than this
 */
export const CATEGORY_MAX_POINTS: Record<ActivityCategory, number> = {
  [ActivityCategory.SPORTS]: 50,
  [ActivityCategory.TECH]: 100,
  [ActivityCategory.CULTURAL]: 75,
  [ActivityCategory.COMMUNITY_SERVICE]: 75,
  [ActivityCategory.COMMITTEE]: 100,
  [ActivityCategory.ACADEMIC]: 100,
  [ActivityCategory.INTERNSHIP]: 150,
  [ActivityCategory.CERTIFICATION]: 100,
  [ActivityCategory.LEADERSHIP]: 100,
  [ActivityCategory.ENTREPRENEURSHIP]: 150,
  [ActivityCategory.VOLUNTEER]: 75,
} as const;

/**
 * Required proof files per category
 * Minimum number of proof files to submit
 */
export const CATEGORY_MIN_PROOFS: Record<ActivityCategory, number> = {
  [ActivityCategory.SPORTS]: 1,
  [ActivityCategory.TECH]: 2,
  [ActivityCategory.CULTURAL]: 2,
  [ActivityCategory.COMMUNITY_SERVICE]: 2,
  [ActivityCategory.COMMITTEE]: 2,
  [ActivityCategory.ACADEMIC]: 2,
  [ActivityCategory.INTERNSHIP]: 2,
  [ActivityCategory.CERTIFICATION]: 1,
  [ActivityCategory.LEADERSHIP]: 1,
  [ActivityCategory.ENTREPRENEURSHIP]: 3,
  [ActivityCategory.VOLUNTEER]: 2,
} as const;

/**
 * Get minimum points for category
 */
export function getCategoryMinPoints(category: ActivityCategory): number {
  return CATEGORY_MIN_POINTS[category];
}

/**
 * Get maximum points for category
 */
export function getCategoryMaxPoints(category: ActivityCategory): number {
  return CATEGORY_MAX_POINTS[category];
}

/**
 * Get category label
 */
export function getCategoryLabel(category: ActivityCategory): string {
  return CATEGORY_LABELS[category];
}

/**
 * Get category color
 */
export function getCategoryColor(category: ActivityCategory): string {
  return CATEGORY_COLORS[category];
}

/**
 * List of all categories
 */
export const ALL_CATEGORIES = Object.values(ActivityCategory) as ActivityCategory[];

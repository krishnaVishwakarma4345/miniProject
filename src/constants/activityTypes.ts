/**
 * Activity Types Constants
 * Predefined list of specific activity types within categories
 */

import { ActivityCategory, ActivityType } from "@/types";

/**
 * Activity type display labels
 */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  // Sports
  [ActivityType.SPORTS_COMPETITION]: "Sports Competition",
  [ActivityType.SPORTS_TRAINING]: "Sports Training",

  // Tech
  [ActivityType.HACKATHON]: "Hackathon",
  [ActivityType.TECH_TALK]: "Tech Talk/Seminar",
  [ActivityType.CODING_WORKSHOP]: "Coding Workshop",
  [ActivityType.TECH_PROJECT]: "Tech Project",

  // Cultural
  [ActivityType.CULTURAL_EVENT]: "Cultural Event",
  [ActivityType.CULTURAL_PERFORMANCE]: "Cultural Performance",

  // Community Service
  [ActivityType.COMMUNITY_EVENT]: "Community Event",
  [ActivityType.CHARITY_DRIVE]: "Charity Drive",
  [ActivityType.MENTORING]: "Mentoring",

  // Academic
  [ActivityType.PRESENTATION]: "Presentation",
  [ActivityType.PAPER_PUBLICATION]: "Paper Publication",
  [ActivityType.SEMINAR_ATTENDED]: "Seminar Attended",

  // Leadership
  [ActivityType.CLUB_LEADERSHIP]: "Club Leadership",
  [ActivityType.EVENT_ORGANIZING]: "Event Organizing",

  // Entrepreneurship
  [ActivityType.STARTUP_LAUNCH]: "Startup Launch",
  [ActivityType.BUSINESS_PITCH]: "Business Pitch",

  // Volunteer
  [ActivityType.VOLUNTEER_WORK]: "Volunteer Work",

  // Research
  [ActivityType.RESEARCH_PROJECT]: "Research Project",

  // Arts & Music
  [ActivityType.MUSIC_PERFORMANCE]: "Music Performance",
  [ActivityType.ART_EXHIBITION]: "Art Exhibition",
} as const;

/**
 * Map of categories to their activity types
 * Used for category selection → type selection workflow
 */
export const CATEGORY_TYPE_MAP: Record<ActivityCategory, ActivityType[]> = {
  [ActivityCategory.SPORTS]: [
    ActivityType.SPORTS_COMPETITION,
    ActivityType.SPORTS_TRAINING,
  ],

  [ActivityCategory.TECH]: [
    ActivityType.HACKATHON,
    ActivityType.TECH_TALK,
    ActivityType.CODING_WORKSHOP,
    ActivityType.TECH_PROJECT,
  ],

  [ActivityCategory.CULTURAL]: [
    ActivityType.CULTURAL_EVENT,
    ActivityType.CULTURAL_PERFORMANCE,
  ],

  [ActivityCategory.COMMUNITY_SERVICE]: [
    ActivityType.COMMUNITY_EVENT,
    ActivityType.CHARITY_DRIVE,
    ActivityType.MENTORING,
  ],

  [ActivityCategory.ACADEMIC]: [
    ActivityType.PRESENTATION,
    ActivityType.PAPER_PUBLICATION,
    ActivityType.SEMINAR_ATTENDED,
  ],

  [ActivityCategory.LEADERSHIP]: [
    ActivityType.CLUB_LEADERSHIP,
    ActivityType.EVENT_ORGANIZING,
  ],

  [ActivityCategory.ENTREPRENEURSHIP]: [
    ActivityType.STARTUP_LAUNCH,
    ActivityType.BUSINESS_PITCH,
  ],

  [ActivityCategory.VOLUNTEER]: [ActivityType.VOLUNTEER_WORK],

  [ActivityCategory.RESEARCH]: [ActivityType.RESEARCH_PROJECT],

  [ActivityCategory.ARTS_MUSIC]: [
    ActivityType.MUSIC_PERFORMANCE,
    ActivityType.ART_EXHIBITION,
  ],
} as const;

/**
 * Reverse mapping: ActivityType → ActivityCategory
 * Used to determine category from type
 */
export const TYPE_CATEGORY_MAP: Record<ActivityType, ActivityCategory> = {
  // Sports
  [ActivityType.SPORTS_COMPETITION]: ActivityCategory.SPORTS,
  [ActivityType.SPORTS_TRAINING]: ActivityCategory.SPORTS,

  // Tech
  [ActivityType.HACKATHON]: ActivityCategory.TECH,
  [ActivityType.TECH_TALK]: ActivityCategory.TECH,
  [ActivityType.CODING_WORKSHOP]: ActivityCategory.TECH,
  [ActivityType.TECH_PROJECT]: ActivityCategory.TECH,

  // Cultural
  [ActivityType.CULTURAL_EVENT]: ActivityCategory.CULTURAL,
  [ActivityType.CULTURAL_PERFORMANCE]: ActivityCategory.CULTURAL,

  // Community Service
  [ActivityType.COMMUNITY_EVENT]: ActivityCategory.COMMUNITY_SERVICE,
  [ActivityType.CHARITY_DRIVE]: ActivityCategory.COMMUNITY_SERVICE,
  [ActivityType.MENTORING]: ActivityCategory.COMMUNITY_SERVICE,

  // Academic
  [ActivityType.PRESENTATION]: ActivityCategory.ACADEMIC,
  [ActivityType.PAPER_PUBLICATION]: ActivityCategory.ACADEMIC,
  [ActivityType.SEMINAR_ATTENDED]: ActivityCategory.ACADEMIC,

  // Leadership
  [ActivityType.CLUB_LEADERSHIP]: ActivityCategory.LEADERSHIP,
  [ActivityType.EVENT_ORGANIZING]: ActivityCategory.LEADERSHIP,

  // Entrepreneurship
  [ActivityType.STARTUP_LAUNCH]: ActivityCategory.ENTREPRENEURSHIP,
  [ActivityType.BUSINESS_PITCH]: ActivityCategory.ENTREPRENEURSHIP,

  // Volunteer
  [ActivityType.VOLUNTEER_WORK]: ActivityCategory.VOLUNTEER,

  // Research
  [ActivityType.RESEARCH_PROJECT]: ActivityCategory.RESEARCH,

  // Arts & Music
  [ActivityType.MUSIC_PERFORMANCE]: ActivityCategory.ARTS_MUSIC,
  [ActivityType.ART_EXHIBITION]: ActivityCategory.ARTS_MUSIC,
} as const;

/**
 * Get label for activity type
 */
export function getActivityTypeLabel(type: ActivityType): string {
  return ACTIVITY_TYPE_LABELS[type];
}

/**
 * Get activity types for a category
 */
export function getActivityTypesForCategory(
  category: ActivityCategory
): ActivityType[] {
  return CATEGORY_TYPE_MAP[category] || [];
}

/**
 * Get category for an activity type
 */
export function getCategoryForActivityType(type: ActivityType): ActivityCategory {
  return TYPE_CATEGORY_MAP[type];
}

/**
 * List of all activity types
 */
export const ALL_ACTIVITY_TYPES = Object.values(ActivityType) as ActivityType[];

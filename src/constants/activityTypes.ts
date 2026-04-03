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
  [ActivityType.SPORTS_PARTICIPATED]: "Participated",
  [ActivityType.SPORTS_WINNER]: "Winner",

  // Tech
  [ActivityType.HACKATHON]: "Hackathon",
  [ActivityType.TECH_TALK]: "Tech Talk/Seminar",
  [ActivityType.CODING_WORKSHOP]: "Coding Workshop",
  [ActivityType.TECH_PROJECT]: "Tech Project",
  [ActivityType.INTERNSHIP]: "Internship",
  [ActivityType.CERTIFICATION_COURSE]: "Certification Course",

  // Cultural
  [ActivityType.CULTURAL_EVENT_ATTENDED]: "Cultural Event Attended",
  [ActivityType.CULTURAL_PERFORMANCE]: "Cultural Performance",

  // Community Service
  [ActivityType.COMMUNITY_EVENT]: "Community Event",
  [ActivityType.CHARITY_DRIVE]: "Charity Drive",
  [ActivityType.MENTORING]: "Mentoring",
  [ActivityType.COMMITTEE_MEMBER]: "Member",
  [ActivityType.COMMITTEE_HEAD]: "Head",

  // Academic
  [ActivityType.PRESENTATION]: "Presentation",
  [ActivityType.PAPER_PUBLICATION]: "Paper Publication",
  [ActivityType.SEMINAR_ATTENDED]: "Seminar Attended",

  // Leadership
  [ActivityType.EVENT_HEAD]: "Event Head",
  [ActivityType.CHAIRPERSON]: "Chairperson",
  [ActivityType.VICE_CHAIRPERSON]: "Vice Chairperson",

  // Entrepreneurship
  [ActivityType.STARTUP_LAUNCH]: "Startup Launch",
  [ActivityType.BUSINESS_PITCH]: "Business Pitch",

  // Volunteer
  [ActivityType.VOLUNTEER_WORK]: "Volunteer Work",
} as const;

/**
 * Map of categories to their activity types
 * Used for category selection → type selection workflow
 */
export const CATEGORY_TYPE_MAP: Record<ActivityCategory, ActivityType[]> = {
  [ActivityCategory.SPORTS]: [
    ActivityType.SPORTS_PARTICIPATED,
    ActivityType.SPORTS_WINNER,
  ],

  [ActivityCategory.TECH]: [
    ActivityType.HACKATHON,
    ActivityType.TECH_TALK,
    ActivityType.CODING_WORKSHOP,
    ActivityType.TECH_PROJECT,
  ],

  [ActivityCategory.CULTURAL]: [
    ActivityType.CULTURAL_EVENT_ATTENDED,
    ActivityType.CULTURAL_PERFORMANCE,
  ],

  [ActivityCategory.COMMUNITY_SERVICE]: [
    ActivityType.COMMUNITY_EVENT,
    ActivityType.CHARITY_DRIVE,
    ActivityType.MENTORING,
  ],

  [ActivityCategory.COMMITTEE]: [
    ActivityType.COMMITTEE_MEMBER,
    ActivityType.COMMITTEE_HEAD,
  ],

  [ActivityCategory.ACADEMIC]: [
    ActivityType.PRESENTATION,
    ActivityType.PAPER_PUBLICATION,
    ActivityType.SEMINAR_ATTENDED,
  ],

  [ActivityCategory.INTERNSHIP]: [ActivityType.INTERNSHIP],

  [ActivityCategory.CERTIFICATION]: [ActivityType.CERTIFICATION_COURSE],

  [ActivityCategory.LEADERSHIP]: [
    ActivityType.EVENT_HEAD,
    ActivityType.CHAIRPERSON,
    ActivityType.VICE_CHAIRPERSON,
  ],

  [ActivityCategory.ENTREPRENEURSHIP]: [
    ActivityType.STARTUP_LAUNCH,
    ActivityType.BUSINESS_PITCH,
  ],

  [ActivityCategory.VOLUNTEER]: [ActivityType.VOLUNTEER_WORK],
} as const;

/**
 * Reverse mapping: ActivityType → ActivityCategory
 * Used to determine category from type
 */
export const TYPE_CATEGORY_MAP: Record<ActivityType, ActivityCategory> = {
  // Sports
  [ActivityType.SPORTS_PARTICIPATED]: ActivityCategory.SPORTS,
  [ActivityType.SPORTS_WINNER]: ActivityCategory.SPORTS,

  // Tech
  [ActivityType.HACKATHON]: ActivityCategory.TECH,
  [ActivityType.TECH_TALK]: ActivityCategory.TECH,
  [ActivityType.CODING_WORKSHOP]: ActivityCategory.TECH,
  [ActivityType.TECH_PROJECT]: ActivityCategory.TECH,
  [ActivityType.INTERNSHIP]: ActivityCategory.INTERNSHIP,
  [ActivityType.CERTIFICATION_COURSE]: ActivityCategory.CERTIFICATION,

  // Cultural
  [ActivityType.CULTURAL_EVENT_ATTENDED]: ActivityCategory.CULTURAL,
  [ActivityType.CULTURAL_PERFORMANCE]: ActivityCategory.CULTURAL,

  // Community Service
  [ActivityType.COMMUNITY_EVENT]: ActivityCategory.COMMUNITY_SERVICE,
  [ActivityType.CHARITY_DRIVE]: ActivityCategory.COMMUNITY_SERVICE,
  [ActivityType.MENTORING]: ActivityCategory.COMMUNITY_SERVICE,
  [ActivityType.COMMITTEE_MEMBER]: ActivityCategory.COMMITTEE,
  [ActivityType.COMMITTEE_HEAD]: ActivityCategory.COMMITTEE,

  // Academic
  [ActivityType.PRESENTATION]: ActivityCategory.ACADEMIC,
  [ActivityType.PAPER_PUBLICATION]: ActivityCategory.ACADEMIC,
  [ActivityType.SEMINAR_ATTENDED]: ActivityCategory.ACADEMIC,

  // Leadership
  [ActivityType.EVENT_HEAD]: ActivityCategory.LEADERSHIP,
  [ActivityType.CHAIRPERSON]: ActivityCategory.LEADERSHIP,
  [ActivityType.VICE_CHAIRPERSON]: ActivityCategory.LEADERSHIP,

  // Entrepreneurship
  [ActivityType.STARTUP_LAUNCH]: ActivityCategory.ENTREPRENEURSHIP,
  [ActivityType.BUSINESS_PITCH]: ActivityCategory.ENTREPRENEURSHIP,

  // Volunteer
  [ActivityType.VOLUNTEER_WORK]: ActivityCategory.VOLUNTEER,
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

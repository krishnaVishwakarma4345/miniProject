import { ActivityCategory } from "@/types";
import { UserRole, UserStatus } from "@/types/user.types";

interface FacultyProfileLike {
  reviewCategories?: unknown;
  isAvailable?: boolean;
  activitiesReviewed?: number;
}

interface ReviewerProfileLike {
  uid?: string;
  role?: string;
  status?: string;
  fullName?: string;
  displayName?: string;
  facultyProfile?: FacultyProfileLike;
}

export interface CategoryReviewer {
  uid: string;
  name: string;
}

const ALL_ACTIVITY_CATEGORIES = Object.values(ActivityCategory) as ActivityCategory[];

export function normalizeFacultyReviewCategories(input: unknown): ActivityCategory[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const allowed = new Set(ALL_ACTIVITY_CATEGORIES);
  const normalized = input
    .filter((value): value is ActivityCategory => typeof value === "string" && allowed.has(value as ActivityCategory));

  return Array.from(new Set(normalized));
}

export function canReviewerAccessCategory(
  profile: ReviewerProfileLike | null | undefined,
  category: ActivityCategory
): boolean {
  if (!profile) {
    return false;
  }

  if (profile.role === UserRole.ADMIN || profile.role === UserRole.MASTER_ADMIN) {
    return true;
  }

  if (profile.role !== UserRole.FACULTY) {
    return false;
  }

  const categories = normalizeFacultyReviewCategories(profile.facultyProfile?.reviewCategories);
  if (!categories.length) {
    return false;
  }

  return categories.includes(category);
}

export async function findCategoryFacultyReviewer(
  adminDb: FirebaseFirestore.Firestore,
  institutionId: string,
  category: ActivityCategory
): Promise<CategoryReviewer | null> {
  const usersSnapshot = await adminDb
    .collection("users")
    .where("institutionId", "==", institutionId)
    .where("role", "==", UserRole.FACULTY)
    .get();

  if (usersSnapshot.empty) {
    return null;
  }

  const reviewers: Array<{
    uid: string;
    name: string;
    activitiesReviewed: number;
  }> = [];

  for (const doc of usersSnapshot.docs) {
    const data = doc.data() as ReviewerProfileLike;

    if (data.status && data.status !== UserStatus.ACTIVE) {
      continue;
    }

    if (data.facultyProfile?.isAvailable === false) {
      continue;
    }

    if (!canReviewerAccessCategory(data, category)) {
      continue;
    }

    reviewers.push({
      uid: data.uid || doc.id,
      name: data.displayName || data.fullName || "Faculty Reviewer",
      activitiesReviewed: Number(data.facultyProfile?.activitiesReviewed || 0),
    });
  }

  if (!reviewers.length) {
    return null;
  }

  reviewers.sort((left, right) => {
    if (left.activitiesReviewed !== right.activitiesReviewed) {
      return left.activitiesReviewed - right.activitiesReviewed;
    }

    return left.uid.localeCompare(right.uid);
  });

  const selected = reviewers[0];
  return {
    uid: selected.uid,
    name: selected.name,
  };
}

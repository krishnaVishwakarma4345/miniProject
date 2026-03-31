/**
 * Cloudinary Folder Strategy
 * ============================================================
 * Folder organization and access control strategy.
 * Defines folder hierarchy for multi-tenant, role-based access.
 */

import { UserRole } from "@/types/user.types";
import { ActivityCategory } from "@/types/activity.types";

/**
 * Folder structure hierarchy
 */
export interface FolderHierarchy {
  root: string;
  subfolders: Record<string, string>;
}

/**
 * Generate folder path for student activity uploads
 * @param studentId - Student ID
 * @param activityId - Activity ID
 * @param proofType - Type of proof (image, document, etc.)
 * @returns Folder path for Cloudinary
 */
export const getActivityProofFolder = (
  studentId: string,
  activityId: string,
  proofType: "image" | "document" | "video" = "image"
): string => {
  return `student_activities/${studentId}/${activityId}/${proofType}`;
};

/**
 * Generate folder path for portfolio assets
 * @param studentId - Student ID
 * @returns Folder path for Cloudinary
 */
export const getPortfolioFolder = (studentId: string): string => {
  return `portfolios/${studentId}`;
};

/**
 * Generate folder path for user avatars
 * @param userId - User ID
 * @returns Folder path for Cloudinary
 */
export const getAvatarFolder = (userId: string): string => {
  return `avatars/${userId}`;
};

/**
 * Generate folder path for institution assets
 * @param institutionId - Institution ID
 * @param assetType - Type of asset (logo, banner, etc.)
 * @returns Folder path for Cloudinary
 */
export const getInstitutionFolder = (
  institutionId: string,
  assetType: string = "assets"
): string => {
  return `institutions/${institutionId}/${assetType}`;
};

/**
 * Generate folder path by category
 * @param category - Activity category
 * @param parentId - Parent entity ID (student, institution, etc.)
 * @returns Folder path for Cloudinary
 */
export const getCategoryFolder = (
  category: ActivityCategory,
  parentId: string
): string => {
  const categoryMap: Record<ActivityCategory, string> = {
    [ActivityCategory.SPORTS]: "sports_activities",
    [ActivityCategory.TECH]: "tech_activities",
    [ActivityCategory.CULTURAL]: "cultural_activities",
    [ActivityCategory.COMMUNITY_SERVICE]: "community_service_activities",
    [ActivityCategory.ACADEMIC]: "academic_activities",
    [ActivityCategory.LEADERSHIP]: "leadership_activities",
    [ActivityCategory.ENTREPRENEURSHIP]: "entrepreneurship_activities",
    [ActivityCategory.VOLUNTEER]: "volunteer_activities",
    [ActivityCategory.RESEARCH]: "research_activities",
    [ActivityCategory.ARTS_MUSIC]: "arts_music_activities",
  };

  return `${categoryMap[category]}/by_student/${parentId}`;
};

/**
 * Generate public ID for uploaded file (not folder, but full path)
 * @param folder - Folder path
 * @param fileName - Original file name
 * @param userId - User ID for audit
 * @returns Public ID for Cloudinary
 */
export const generatePublicId = (
  folder: string,
  fileName: string,
  userId: string
): string => {
  const timestamp = Date.now();
  const sanitizedName = sanitizeFileName(fileName);
  return `${folder}/${sanitizedName}_${timestamp}_${userId}`;
};

/**
 * Sanitize file name for safe Cloudinary storage
 * @param fileName - Original file name
 * @returns Sanitized file name
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^\w\s.-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .slice(0, 100); // Limit length
};

/**
 * Extract metadata from folder path
 * @param folderPath - Cloudinary folder path
 * @returns Extracted metadata object
 */
export const extractMetadataFromPath = (
  folderPath: string
): {
  type: string;
  parentId?: string;
  category?: string;
} => {
  const parts = folderPath.split("/");

  if (parts[0] === "student_activities") {
    return {
      type: "activity_proof",
      parentId: parts[1],
      category: parts[3],
    };
  }

  if (parts[0] === "portfolios") {
    return {
      type: "portfolio",
      parentId: parts[1],
    };
  }

  if (parts[0] === "avatars") {
    return {
      type: "avatar",
      parentId: parts[1],
    };
  }

  if (parts[0] === "institutions") {
    return {
      type: "institution_asset",
      parentId: parts[1],
      category: parts[2],
    };
  }

  return { type: "unknown" };
};

/**
 * Check if user has access to a folder
 * @param userId - User ID
 * @param userRole - User role
 * @param folderPath - Folder path to check
 * @returns Access permission result
 */
export const checkFolderAccess = (
  userId: string,
  userRole: UserRole,
  folderPath: string
): {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
} => {
  const metadata = extractMetadataFromPath(folderPath);

  if (userRole === "admin") {
    // Admins have full access
    return { canRead: true, canWrite: true, canDelete: true };
  }

  if (userRole === "student") {
    // Students can only access their own folders
    if (
      metadata.type === "activity_proof" &&
      metadata.parentId === userId
    ) {
      return { canRead: true, canWrite: true, canDelete: true };
    }

    if (metadata.type === "portfolio" && metadata.parentId === userId) {
      return { canRead: true, canWrite: true, canDelete: true };
    }

    if (metadata.type === "avatar" && metadata.parentId === userId) {
      return { canRead: true, canWrite: true, canDelete: true };
    }
  }

  if (userRole === "faculty") {
    // Faculty can read student portfolios
    if (metadata.type === "portfolio") {
      return { canRead: true, canWrite: false, canDelete: false };
    }

    // Faculty can read activity proofs for their institution
    if (metadata.type === "activity_proof") {
      return { canRead: true, canWrite: false, canDelete: false };
    }
  }

  return { canRead: false, canWrite: false, canDelete: false };
};

/**
 * Get folder structure template for new institution
 * @param institutionId - Institution ID
 * @returns Folder hierarchy template
 */
export const getInstitutionFolderTemplate = (
  institutionId: string
): FolderHierarchy => {
  return {
    root: `institutions/${institutionId}`,
    subfolders: {
      logo: `institutions/${institutionId}/logo`,
      banner: `institutions/${institutionId}/banner`,
      documents: `institutions/${institutionId}/documents`,
      reports: `institutions/${institutionId}/reports`,
    },
  };
};

/**
 * Folder size limits (in bytes)
 */
export const FOLDER_SIZE_LIMITS = {
  profile: 10 * 1024 * 1024, // 10MB per student profile
  institution: 500 * 1024 * 1024, // 500MB per institution
  system: 5 * 1024 * 1024 * 1024, // 5GB total
};

/**
 * Auto-archive old files from a folder
 * Files are never deleted, only archived to cheaper storage
 * @param folderPath - Folder to archive
 * @param ageInDays - Archive files older than this many days
 * @returns Archival job ID
 */
export const scheduleArchival = (folderPath: string, ageInDays: number = 180): string => {
  // This would trigger a Cloud Function job
  return `archive_${folderPath}_${Date.now()}`;
};

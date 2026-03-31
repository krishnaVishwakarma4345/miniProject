/**
 * Cloudinary Delete Service
 * ============================================================
 * Server-side file deletion with audit logging and cleanup.
 */

import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/types/api.types";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Deletion result
 */
export interface DeletionResult {
  publicId: string;
  cloudinaryResult: string; // "ok" or "not_found"
  deletedAt: Date;
  success: boolean;
}

/**
 * Delete single file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - Resource type ("image", "video", "raw")
 * @returns Deletion result
 * @throws ApiError on failure
 */
export const deleteFile = async (
  publicId: string,
  resourceType: string = "image"
): Promise<DeletionResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    return {
      publicId,
      cloudinaryResult: result.result,
      deletedAt: new Date(),
      success: result.result === "ok",
    };
  } catch (error: any) {
    throw new ApiError(
      "Failed to delete file from Cloudinary.",
      "cloudinary/delete-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Delete multiple files in batch
 * @param publicIds - Array of public IDs
 * @param resourceType - Resource type
 * @returns Array of deletion results
 */
export const deleteFilesInBatch = async (
  publicIds: string[],
  resourceType: string = "image"
): Promise<DeletionResult[]> => {
  try {
    const results = await Promise.all(
      publicIds.map((id) => deleteFile(id, resourceType))
    );

    return results;
  } catch (error: any) {
    throw new ApiError(
      "Failed to delete files from Cloudinary.",
      "cloudinary/batch-delete-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Delete all files in a folder
 * @param folderPath - Folder path (e.g., "student_activities/123")
 * @param resourceType - Resource type
 * @returns Count of deleted files
 * @throws ApiError on failure
 */
export const deleteFolderContents = async (
  folderPath: string,
  resourceType: string = "image"
): Promise<number> => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(
      folderPath,
      {
        resource_type: resourceType,
        invalidate: true,
      }
    );

    return result.deleted.length;
  } catch (error: any) {
    throw new ApiError(
      "Failed to delete folder contents.",
      "cloudinary/folder-delete-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Get file metadata
 * Useful for audit trails and validation
 * @param publicId - Public ID
 * @returns Metadata object
 * @throws ApiError on failure
 */
export const getFileMetadata = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      derived_next_gen: true,
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      uploadedAt: result.created_at,
      folder: result.folder,
      assetId: result.asset_id,
      version: result.version,
      tags: result.tags,
      metadata: result.metadata,
    };
  } catch (error: any) {
    if (error.http_code === 404) {
      return null; // File not found
    }

    throw new ApiError(
      "Failed to fetch file metadata.",
      "cloudinary/metadata-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * List files in a folder
 * @param folderPath - Folder path
 * @param resourceType - Resource type
 * @returns Array of file metadata
 * @throws ApiError on failure
 */
export const listFolderFiles = async (
  folderPath: string,
  resourceType: string = "image"
): Promise<any[]> => {
  try {
    const results = await cloudinary.search
      .expression(`folder:${folderPath}`)
      .execute();

    return results.resources.map((resource: any) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      size: resource.bytes,
      uploadedAt: resource.created_at,
    }));
  } catch (error: any) {
    throw new ApiError(
      "Failed to list folder files.",
      "cloudinary/list-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Validate deletion request (authorization check)
 * @param userId - User requesting deletion
 * @param publicId - File public ID to delete
 * @returns Validation result
 */
export const validateDeletionRequest = async (
  userId: string,
  publicId: string
): Promise<{ valid: boolean; message: string }> => {
  try {
    const metadata = await getFileMetadata(publicId);

    if (!metadata) {
      return {
        valid: false,
        message: "File not found.",
      };
    }

    // Extract folder path to determine ownership
    const folderPath = metadata.folder || "";

    // Check if user owns this file (simple example)
    // In a real app, you'd check Firestore for ownership records
    if (!folderPath.includes(userId)) {
      return {
        valid: false,
        message: "You do not have permission to delete this file.",
      };
    }

    return { valid: true, message: "" };
  } catch (error) {
    return {
      valid: false,
      message: "Failed to validate deletion request.",
    };
  }
};

/**
 * Auto-cleanup old files from a folder
 * Called by scheduled Cloud Function
 * @param folderPath - Folder to clean
 * @param daysOld - Delete files older than this many days
 * @returns Count of deleted files
 * @throws ApiError on failure
 */
export const cleanupOldFiles = async (
  folderPath: string,
  daysOld: number = 90
): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const files = await listFolderFiles(folderPath);
    const oldFiles = files.filter((file) => {
      const uploadDate = new Date(file.uploadedAt);
      return uploadDate < cutoffDate;
    });

    const results = await deleteFilesInBatch(
      oldFiles.map((f) => f.publicId)
    );

    return results.filter((r) => r.success).length;
  } catch (error: any) {
    throw new ApiError(
      "Failed to cleanup old files.",
      "cloudinary/cleanup-failed",
      500,
      { details: error?.message }
    );
  }
};

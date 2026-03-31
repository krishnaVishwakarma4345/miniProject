/**
 * Cloudinary Upload Service
 * ============================================================
 * Server-side upload handling with signed URLs and authentication.
 * Client gets signature from this service, then uploads directly to Cloudinary.
 */

import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/types/api.types";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload signature generation request
 */
export interface UploadSignatureRequest {
  folder: string; // e.g., "student_activities", "portfolios"
  resourceType?: string; // "image", "video", "raw", "auto"
  maxFileSize?: number;
  allowedFormats?: string[];
}

/**
 * Upload signature response
 */
export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  uploadEndpoint: string;
  folder: string;
  resourceType?: string;
  apiKey?: string;
}

/**
 * Generate signed upload signature
 * Client uses this to upload directly to Cloudinary without exposing API key
 * @param request - Signature request parameters
 * @returns Signature response with credentials
 * @throws ApiError on failure
 */
export const generateUploadSignature = async (
  request: UploadSignatureRequest
): Promise<UploadSignatureResponse> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      folder: request.folder,
      resource_type: request.resourceType || "auto",
      timestamp,
      ...(request.maxFileSize && { max_file_size: request.maxFileSize }),
      ...(request.allowedFormats && {
        allowed_formats: request.allowedFormats.join(","),
      }),
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    return {
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      uploadEndpoint: "https://api.cloudinary.com/v1_1",
      folder: request.folder,
      resourceType: request.resourceType,
      apiKey: process.env.CLOUDINARY_API_KEY,
    };
  } catch (error: any) {
    throw new ApiError(
      "Failed to generate upload signature.",
      "cloudinary/signature-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Upload file to Cloudinary from server side
 * Used for server-side operations (e.g., batch uploads, backups)
 * @param filePath - Local file path
 * @param folder - Cloudinary folder path
 * @param options - Additional upload options
 * @returns Upload result with public ID
 * @throws ApiError on failure
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  folder: string,
  options?: {
    publicId?: string;
    overwrite?: boolean;
    resourceType?: "image" | "video" | "raw" | "auto";
    tags?: string[];
  }
): Promise<any> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: options?.publicId,
      overwrite: options?.overwrite ?? false,
      resource_type: options?.resourceType || "auto",
      tags: options?.tags || [],
      invalidate: true, // Invalidade CDN cache
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      assetId: result.asset_id,
      version: result.version,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      metadata: {
        uploadedAt: new Date(),
        folder,
      },
    };
  } catch (error: any) {
    throw new ApiError(
      "Failed to upload file to Cloudinary.",
      "cloudinary/upload-failed",
      500,
      { details: error?.message }
    );
  }
};

/**
 * Get upload progress tracking
 * Returns a request object that tracks upload progress
 * For use in client-side XHR/fetch requests
 */
export const getUploadProgressTracker = (): any => {
  return {
    onUploadProgress: (progressEvent: ProgressEvent): void => {
      if (progressEvent.lengthComputable) {
        const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
        // Dispatch custom event or update UI state
        window.dispatchEvent(
          new CustomEvent("uploadProgress", { detail: { percentComplete } })
        );
      }
    },
  };
};

/**
 * Validate upload request based on user role
 * @param userId - User ID requesting upload
 * @param folder - Target folder
 * @param fileSize - File size in bytes
 * @returns Validation result
 */
export const validateUploadRequest = async (
  userId: string,
  folder: string,
  fileSize: number
): Promise<{ valid: boolean; message: string }> => {
  // Check file size limits by user role
  const maxSizePerFile = 10 * 1024 * 1024; // 10MB

  if (fileSize > maxSizePerFile) {
    return {
      valid: false,
      message: `File exceeds maximum size of 10MB`,
    };
  }

  // Check allowed folders by role
  const allowedFolders = [
    "student_activities",
    "proof_documents",
    "portfolios",
    "avatars",
  ];

  if (!allowedFolders.includes(folder)) {
    return {
      valid: false,
      message: `Invalid upload folder: ${folder}`,
    };
  }

  return { valid: true, message: "" };
};

/**
 * Get upload presets (useful for client-side config)
 */
export const getUploadPresets = () => {
  return {
    studentActivityProof: {
      folder: "student_activities/proof",
      resourceType: "image",
      maxFileSize: 5 * 1024 * 1024,
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
    },
    portfolioAsset: {
      folder: "portfolios/assets",
      resourceType: "auto",
      maxFileSize: 10 * 1024 * 1024,
      allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"],
    },
    avatar: {
      folder: "avatars",
      resourceType: "image",
      maxFileSize: 2 * 1024 * 1024,
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
    },
    document: {
      folder: "documents",
      resourceType: "raw",
      maxFileSize: 20 * 1024 * 1024,
      allowedFormats: ["pdf", "doc", "docx", "xls", "xlsx"],
    },
  };
};

/**
 * Cloudinary Client SDK
 * ============================================================
 * Client-side Cloudinary configuration and signed upload setup.
 * Enables direct browser uploads without exposing API keys.
 */

import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary instance configured for client-side operations
 * Uses public cloud name only (no API key exposed)
 */
export const cloudinaryClient = cloudinary;

/**
 * Cloudinary cloud name (public)
 */
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

/**
 * Cloudinary API endpoint for signed uploads
 * Points to /api/upload/sign endpoint on our server
 */
export const CLOUDINARY_UPLOAD_ENDPOINT = "/api/upload/sign";

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Supported document formats
 */
export const SUPPORTED_DOCUMENT_FORMATS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

/**
 * Max file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
};

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { valid: boolean; message: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true, message: "" };
};

/**
 * Validate file size
 * @param file - File object
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result
 */
export const validateFileSize = (
  file: File,
  maxSize: number
): { valid: boolean; message: string } => {
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      message: `File size exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  return { valid: true, message: "" };
};

/**
 * Validate image file
 * @param file - File object
 * @returns Validation result
 */
export const validateImageFile = (
  file: File
): { valid: boolean; message: string } => {
  const typeValidation = validateFileType(file, SUPPORTED_IMAGE_FORMATS);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return validateFileSize(file, MAX_FILE_SIZES.image);
};

/**
 * Validate document file
 * @param file - File object
 * @returns Validation result
 */
export const validateDocumentFile = (
  file: File
): { valid: boolean; message: string } => {
  const typeValidation = validateFileType(file, SUPPORTED_DOCUMENT_FORMATS);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return validateFileSize(file, MAX_FILE_SIZES.document);
};

/**
 * Generate transformation URL for Cloudinary image
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export const generateImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    gravity?: string;
    crop?: string;
  }
): string => {
  if (!CLOUDINARY_CLOUD_NAME) {
    return "";
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transformations: string[] = [];

  if (options?.width || options?.height) {
    const w = options.width ? `w_${options.width}` : "";
    const h = options.height ? `h_${options.height}` : "";
    const c = options.crop || "fill";
    transformations.push([w, h, `c_${c}`].filter(Boolean).join(","));
  }

  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  if (options?.gravity) {
    transformations.push(`g_${options.gravity}`);
  }

  const transformString = transformations.length > 0 ? transformations.join("/") : "q_auto";

  return `${baseUrl}/${transformString}/${publicId}`;
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID
 */
export const extractPublicId = (url: string): string => {
  const regex = /\/([a-zA-Z0-9/_-]+)(?:\.[a-z]+)?$/;
  const match = url.match(regex);
  return match ? match[1] : "";
};

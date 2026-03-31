/**
 * Cloudinary Configuration
 * Handles image/video upload, transformation, and delivery
 * Uses client-side safe configuration
 */

import { CldUploadWidget } from 'next-cloudinary';
import { cloudinaryConfig, appConfig } from './env';

/**
 * Cloudinary Cloud Name
 * Required for all Cloudinary operations
 */
export const CLOUDINARY_CLOUD_NAME = cloudinaryConfig.cloudName;

/**
 * Cloudinary Upload Preset
 * Allows unsigned uploads from browser
 */
export const CLOUDINARY_UPLOAD_PRESET = cloudinaryConfig.uploadPreset;

/**
 * Cloudinary Transformation Presets
 * Used for consistent image optimization across the platform
 */
export const cloudinaryTransforms = {
  // Thumbnail: 300x300, auto crop, WEBP format
  thumbnail: {
    width: 300,
    height: 300,
    crop: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  },
  
  // Card image: 400x300, maintain aspect ratio
  card: {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  },
  
  // Full-width: responsive, up to 1200px
  fullWidth: {
    width: 1200,
    crop: 'scale',
    quality: 'auto',
    fetch_format: 'auto',
  },
  
  // Avatar: 60x60, circular
  avatar: {
    width: 60,
    height: 60,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  },
  
  // Portfolio proof: 800x600, maintain aspect
  portfolio: {
    width: 800,
    height: 600,
    crop: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  },
} as const;

/**
 * Build Cloudinary URL with transformations
 * @param publicId - Asset public ID from Cloudinary
 * @param transform - Transformation preset key
 * @returns Full Cloudinary CDN URL
 */
export const buildCloudinaryUrl = (
  publicId: string,
  transform: keyof typeof cloudinaryTransforms = 'fullWidth'
): string => {
  if (!publicId || !CLOUDINARY_CLOUD_NAME) {
    return '';
  }

  const params = cloudinaryTransforms[transform];
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${paramString}/c_limit,w_2000/${publicId}`;
};

/**
 * Upload widget configuration
 * Used in ProofUploader component
 */
export const uploadWidgetConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  multiple: false,
  maxFileSize: 5242880, // 5MB
  resourceType: 'auto',
  clientAllowedFormats: ['image', 'video', 'pdf'],
  showPoweredBy: false,
  cropping: true,
  croppingAspectRatio: 4 / 3,
  croppingShowDimensions: true,
  removeMetadata: true,
  folder: 'smart-student-hub/activities',
  tags: ['student-activity', 'portfolio-proof'],
} as const;

/**
 * Validate Cloudinary configuration on initialization
 */
const validateCloudinaryConfig = (): void => {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary Cloud Name is not configured');
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    console.warn('⚠️ Cloudinary Upload Preset is not configured');
  }

  if (appConfig.isDevelopment) {
    console.log('✅ Cloudinary configuration loaded');
  }
};

// Validate on import
if (typeof window !== 'undefined') {
  validateCloudinaryConfig();
}

export default {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  cloudinaryTransforms,
  buildCloudinaryUrl,
  uploadWidgetConfig,
};

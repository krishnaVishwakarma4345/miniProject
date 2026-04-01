/**
 * Cloudinary Utility Functions
 *
 * Helper functions for image/video transforms, URL building, and upload handling.
 * Integrates with Cloudinary CDN for optimized media delivery.
 */

/**
 * Cloudinary transformation presets
 * Used for consistent image transformations across the app
 */
export const CLOUDINARY_PRESETS = {
  // Avatar (small, circular)
  AVATAR: "c_fill,g_face,h_60,r_max,w_60",

  // Thumbnail (small preview)
  THUMBNAIL: "c_fill,h_300,w_300",

  // Card image (standard list view)
  CARD: "c_fill,h_300,w_400",

  // Portfolio hero (large image)
  PORTFOLIO: "c_fill,h_600,w_800",

  // Profile banner (wide)
  BANNER: "c_fill,h_300,w_1200",

  // Activity detail (medium)
  ACTIVITY: "c_fill,h_400,w_600",

  // Optimized for web (auto quality, format)
  OPTIMIZED: "q_auto,f_auto",
} as const;

/**
 * Build optimized Cloudinary URL
 * @param publicId - Cloudinary public ID
 * @param transforms - Optional transformation string
 * @param options - Additional options (secure, format, quality)
 * @returns Full Cloudinary URL
 *
 * @example
 * buildCloudinaryUrl('user/avatar-123', CLOUDINARY_PRESETS.AVATAR)
 * // "https://res.cloudinary.com/[cloud]/image/upload/c_fill,g_face,h_60,r_max,w_60/user/avatar-123"
 */
export function buildCloudinaryUrl(
  publicId: string,
  transforms: string = "",
  options: {
    secure?: boolean;
    fetch_format?: string;
    quality?: string;
    dpr?: string;
  } = {}
): string {
  if (!publicId) {
    return "";
  }

  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

  if (!cloudName) {
    return "";
  }

  // Build transformation string
  let transformString = transforms;

  if (options.fetch_format || options.quality || options.dpr) {
    const params = [];
    if (options.fetch_format) params.push(`f_${options.fetch_format}`);
    if (options.quality) params.push(`q_${options.quality}`);
    if (options.dpr) params.push(`dpr_${options.dpr}`);

    transformString = transformString
      ? `${transformString},${params.join(",")}`
      : params.join(",");
  }

  const protocol = options.secure !== false ? "https" : "http";
  const transformPart = transformString ? `/${transformString}` : "";

  return `${protocol}://res.cloudinary.com/${cloudName}/image/upload${transformPart}/${publicId}`;
}

/**
 * Build responsive image srcSet
 * For `<img srcSet="">` attribute
 *
 * @param publicId - Cloudinary public ID
 * @param preset - Transformation preset
 * @returns srcSet string with multiple sizes
 *
 * @example
 * <img srcSet={buildSrcSet('user/avatar')} sizes="60px" />
 */
export function buildSrcSet(publicId: string, preset: string = ""): string {
  const dprVariants = ["1x", "2x", "3x"];

  return dprVariants
    .map((dpr) => {
      const dprNumber = parseInt(dpr);
      const url = buildCloudinaryUrl(publicId, preset, { dpr: String(dprNumber) });
      return `${url} ${dpr}`;
    })
    .join(", ");
}

/**
 * Build responsive image with multiple sizes
 * For art direction and bandwidth optimization
 *
 * @param publicId - Cloudinary public ID
 * @param sizes - Array of [width, breakpoint] tuples
 * @param baseTransform - Base transformation (e.g., preset)
 * @returns srcSet string with multiple sizes
 *
 * @example
 * buildResponsiveSrcSet('portfolio/image', [
 *   [300, '(max-width: 640px)'],
 *   [600, '(max-width: 1024px)'],
 *   [800, '(min-width: 1025px)']
 * ])
 */
export function buildResponsiveSrcSet(
  publicId: string,
  sizes: Array<[number, string]>,
  baseTransform: string = ""
): { srcSet: string; sizes: string } {
  const srcSet = sizes
    .map(([width]) => {
      const transform = baseTransform
        ? `${baseTransform},w_${width}`
        : `w_${width}`;
      const url = buildCloudinaryUrl(publicId, transform);
      return `${url} ${width}w`;
    })
    .join(", ");

  const sizeString = sizes
    .map(([width, mediaQuery]) => `${mediaQuery} ${width}px`)
    .join(", ");

  return { srcSet, sizes: sizeString };
}

/**
 * Get image metadata from Cloudinary
 * Returns computed information about uploaded image
 *
 * @param publicId - Cloudinary public ID
 * @returns Promise with image metadata
 */
export async function getImageMetadata(
  publicId: string
): Promise<{
  width: number;
  height: number;
  format: string;
  bytes: number;
  aspectRatio: number;
  publicId: string;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured");
  }

  // Cloudinary provides metadata via fetch-format=json
  const metaUrl = buildCloudinaryUrl(
    publicId,
    "fetch_format=json",
    { fetch_format: "json" }
  );

  const response = await fetch(metaUrl);
  const data = await response.json();

  return {
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    aspectRatio: data.width / data.height,
    publicId: data.public_id,
  };
}

/**
 * Transform image filters
 * Common artistic/effect filters
 */
export const IMAGE_FILTERS = {
  // Brightness adjustments
  brighten: (amount: number) => `e_brightness:${amount}`,
  darken: (amount: number) => `e_brightness:-${amount}`,

  // Contrast
  contrast: (amount: number) => `e_contrast:${amount}`,

  // Saturation
  saturate: (amount: number) => `e_saturation:${amount}`,
  desaturate: `e_saturation:-100`,

  // Blur
  blur: (radius: number = 10) => `e_blur:${radius}`,

  // Sepia (vintage)
  sepia: `e_sepia:100`,

  // Grayscale
  grayscale: `e_grayscale`,

  // Tint
  tint: (color: string) => `e_tint:${color}`,

  // Sharpen
  sharpen: (amount: number = 100) => `e_sharpen:${amount}`,

  // Red-eye removal
  redEyeRemoval: `e_red_eye`,
} as const;

/**
 * Crop modes for image transformation
 */
export const CROP_MODES = {
  // Fill entire area, crop if needed
  fill: "c_fill",

  // Fit inside area, no crop
  fit: "c_fit",

  // Fill with padding if needed
  pad: "c_pad",

  // Crop to exact size
  crop: "c_crop",

  // Thumb (smart crop focusing on face)
  thumb: "c_thumb",

  // Auto (intelligent cropping)
  auto: "c_auto",
} as const;

/**
 * Gravity options (focus point for cropping)
 */
export const GRAVITY_OPTIONS = {
  auto: "g_auto",
  face: "g_face",
  faces: "g_faces",
  center: "g_center",
  north: "g_north",
  northeast: "g_north_east",
  east: "g_east",
  southeast: "g_south_east",
  south: "g_south",
  southwest: "g_south_west",
  west: "g_west",
  northwest: "g_north_west",
} as const;

/**
 * Build image transformation string
 * Chainable builder for complex transforms
 *
 * @example
 * new CloudinaryTransformBuilder(publicId)
 *   .width(300)
 *   .crop('fill')
 *   .gravity('face')
 *   .quality('auto')
 *   .build()
 */
export class CloudinaryTransformBuilder {
  private transforms: string[] = [];
  private publicId: string;

  constructor(publicId: string) {
    this.publicId = publicId;
  }

  width(w: number): this {
    this.transforms.push(`w_${w}`);
    return this;
  }

  height(h: number): this {
    this.transforms.push(`h_${h}`);
    return this;
  }

  crop(mode: keyof typeof CROP_MODES): this {
    this.transforms.push(CROP_MODES[mode]);
    return this;
  }

  gravity(g: keyof typeof GRAVITY_OPTIONS): this {
    this.transforms.push(GRAVITY_OPTIONS[g]);
    return this;
  }

  quality(q: string | number): this {
    this.transforms.push(`q_${q}`);
    return this;
  }

  fetch_format(f: string): this {
    this.transforms.push(`f_${f}`);
    return this;
  }

  radius(r: number | "max"): this {
    this.transforms.push(`r_${r}`);
    return this;
  }

  angle(degrees: number): this {
    this.transforms.push(`a_${degrees}`);
    return this;
  }

  overlay(overlayId: string): this {
    this.transforms.push(`l_${overlayId}`);
    return this;
  }

  custom(transform: string): this {
    this.transforms.push(transform);
    return this;
  }

  build(): string {
    return buildCloudinaryUrl(this.publicId, this.transforms.join(","));
  }

  toString(): string {
    return this.build();
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID
 *
 * @example
 * extractPublicId('https://res.cloudinary.com/cloud/image/upload/v1/folder/image')
 * // "folder/image"
 */
export function extractPublicId(url: string): string {
  const match = url.match(/\/([^/]+\/[^/]+)$/);
  return match ? match[1] : url;
}

/**
 * Generate signed upload signature
 * For client-side direct uploads
 *
 * @param folder - Folder to upload to
 * @param timestamp - Current timestamp
 * @param apiSecret - Cloudinary API secret
 * @returns Generated signature
 *
 * @note This should be called server-side, not in client code
 */
export function generateUploadSignature(
  folder: string,
  timestamp: number,
  apiSecret: string
): string {
  const crypto = require("crypto");

  const params = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(params).digest("hex");
}

/**
 * Video transformation helpers
 */
export const VIDEO_TRANSFORMS = {
  // Thumbnail from video
  thumbnail: (seconds: number = 0) => `so_${seconds}s`,

  // Video quality
  videoCodec: (codec: "h264" | "vp8" | "vp9") => `vc_${codec}`,

  // Bitrate
  bitrate: (kbps: number) => `b_${kbps}k`,

  // Audio codec
  audioCodec: (codec: "aac" | "opus" | "vorbis") => `ac_${codec}`,
} as const;

/**
 * Check if URL is Cloudinary URL
 * @param url - URL to check
 * @returns true if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  return url.includes(`res.cloudinary.com/${cloudName}`);
}

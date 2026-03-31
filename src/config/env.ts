/**
 * Environment Variables Configuration
 * Type-safe environment access with validation
 * Uses a schema-based approach to ensure all required vars exist at build time
 */

export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || defaultValue || '';
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Firebase Client Configuration (public, safe for browser)
 */
export const firebaseClientConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
} as const;

/**
 * Firebase Admin Configuration (server-side only, never exposed to browser)
 * Requires service account credentials
 */
export const firebaseAdminConfig = {
  projectId: getEnv('FIREBASE_ADMIN_PROJECT_ID'),
  clientEmail: getEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
  privateKey: getEnv('FIREBASE_ADMIN_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
} as const;

/**
 * Cloudinary Configuration
 */
export const cloudinaryConfig = {
  cloudName: getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  uploadPreset: getEnv('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'),
  apiKey: getEnv('CLOUDINARY_API_KEY'),
  apiSecret: getEnv('CLOUDINARY_API_SECRET'),
} as const;

/**
 * Application Configuration
 */
export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000'),
  appName: 'Smart Student Hub',
  appDescription: 'Production-grade SaaS platform for Higher Education Institutions',
  defaultLocale: 'en-US',
  enableDebug: getEnvBoolean('NEXT_PUBLIC_DEBUG', false),
} as const;

/**
 * Animation Configuration
 */
export const animationConfig = {
  enableAnimations: getEnvBoolean('NEXT_PUBLIC_ENABLE_ANIMATIONS', true),
  reduceMotion: getEnvBoolean('NEXT_PUBLIC_REDUCE_MOTION', false),
} as const;

/**
 * Validation: Ensure all required configs are present
 */
const validateConfigs = (): void => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingKeys.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing critical environment variables: ${missingKeys.join(', ')}`);
    }
  }
};

// Run validation on import, but catch errors in dev
if (typeof window === 'undefined') {
  try {
    validateConfigs();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export default {
  firebaseClientConfig,
  firebaseAdminConfig,
  cloudinaryConfig,
  appConfig,
  animationConfig,
};

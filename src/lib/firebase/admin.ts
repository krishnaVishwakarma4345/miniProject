/**
 * Firebase Admin SDK Initialization
 * ============================================================
 * Server-side Firebase Admin SDK for privileged operations:
 * - Creating/revoking session cookies
 * - Verifying ID tokens
 * - Administrative user operations
 * - Batch operations for security rules
 *
 * Usage (server-side only):
 *   import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
 *   const decodedToken = await adminAuth.verifyIdToken(token);
 */

import {
  initializeApp,
  cert,
  getApps,
  App,
  ServiceAccount,
} from "firebase-admin/app";
import {
  getAuth,
  Auth,
} from "firebase-admin/auth";
import {
  getFirestore,
  Firestore,
} from "firebase-admin/firestore";

import { FIREBASE_ADMIN_CONFIG } from "@/config/firebase.admin.config";

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminFirestore: Firestore | null = null;

/**
 * Initialize Firebase Admin App (singleton pattern)
 * Must be called only on server-side
 * @returns Initialized Admin App instance
 */
const initializeFirebaseAdminApp = (): App => {
  // Check if app is already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    app = initializeApp({
      credential: cert(FIREBASE_ADMIN_CONFIG as ServiceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin App:", error);
    throw error;
  }
};

/**
 * Initialize Firebase Admin Auth
 * @returns Initialized Admin Auth instance
 */
const initializeAdminAuth = (): Auth => {
  if (adminAuth) {
    return adminAuth;
  }

  const app = initializeFirebaseAdminApp();
  adminAuth = getAuth(app);

  return adminAuth;
};

/**
 * Initialize Firebase Admin Firestore
 * @returns Initialized Admin Firestore instance
 */
const initializeAdminFirestore = (): Firestore => {
  if (adminFirestore) {
    return adminFirestore;
  }

  const app = initializeFirebaseAdminApp();
  adminFirestore = getFirestore(app);

  return adminFirestore;
};

/**
 * Get or initialize Admin Auth instance
 * Server-side only
 */
export const getAdminAuth = (): Auth => {
  if (!adminAuth) {
    return initializeAdminAuth();
  }
  return adminAuth;
};

/**
 * Get or initialize Admin Firestore instance
 * Server-side only
 */
export const getAdminFirestore = (): Firestore => {
  if (!adminFirestore) {
    return initializeAdminFirestore();
  }
  return adminFirestore;
};

/**
 * Get current admin auth instance without initialization
 * Used to check if admin SDK is initialized
 */
export const getAdminAuthIfInitialized = (): Auth | null => {
  return adminAuth;
};

/**
 * Get current admin firestore instance without initialization
 */
export const getAdminFirestoreIfInitialized = (): Firestore | null => {
  return adminFirestore;
};

/**
 * Reset admin instances (used in tests)
 */
export const resetAdminInstances = (): void => {
  app = null;
  adminAuth = null;
  adminFirestore = null;
};

export default {
  getAdminAuth,
  getAdminFirestore,
  getAdminAuthIfInitialized,
  getAdminFirestoreIfInitialized,
  resetAdminInstances,
};

/**
 * Firebase Admin SDK Configuration
 * SERVER-SIDE ONLY - Never expose to browser
 * Used for session verification, user creation, and server-side Firestore operations
 */

import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig, appConfig } from './env';

let adminApp: any = null;
let adminAuth: any = null;
let adminDb: any = null;

/**
 * Initialize Firebase Admin SDK
 * Only runs on server-side (Node.js runtime)
 */
const initializeAdmin = () => {
  // Prevent initialization in browser
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK should only be initialized on the server!');
  }

  // Check if already initialized
  if (getApps().length > 0) {
    adminApp = getApp();
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return;
  }

  try {
    // Initialize with service account credentials
    adminApp = initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey,
      }),
    });

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    // Configure Firestore settings
    adminDb.settings({
      projectId: firebaseAdminConfig.projectId,
      ignoreUndefinedProperties: true,
    });

    if (appConfig.isDevelopment) {
      console.log('✅ Firebase Admin SDK initialized (server-side only)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

/**
 * Lazy initialize on first use
 */
const getAdminApp = () => {
  if (!adminApp) {
    initializeAdmin();
  }
  return adminApp;
};

const getAdminAuth = () => {
  if (!adminAuth) {
    initializeAdmin();
  }
  return adminAuth;
};

const getAdminDb = () => {
  if (!adminDb) {
    initializeAdmin();
  }
  return adminDb;
};

export const FIREBASE_ADMIN_CONFIG = firebaseAdminConfig;

export { getAdminApp, getAdminAuth, getAdminDb };
export default { getAdminApp, getAdminAuth, getAdminDb };

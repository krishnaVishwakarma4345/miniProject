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

const normalizePrivateKey = (value: string): string => {
  const trimmed = value.trim();
  const unwrapped =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unwrapped.replace(/\\n/g, '\n');
};

const readServerEnv = (...keys: string[]): string => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
};

const resolveFirebaseAdminConfig = () => {
  const serviceAccountRaw = readServerEnv('FIREBASE_SERVICE_ACCOUNT_JSON', 'GOOGLE_APPLICATION_CREDENTIALS_JSON');

  if (serviceAccountRaw) {
    try {
      const parsed = JSON.parse(serviceAccountRaw) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };

      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: normalizePrivateKey(parsed.private_key),
        };
      }
    } catch {
      // Ignore malformed JSON and continue with key-based env resolution.
    }
  }

  const projectId =
    readServerEnv('FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT') ||
    firebaseAdminConfig.projectId;

  const clientEmail =
    readServerEnv('FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL') ||
    firebaseAdminConfig.clientEmail;

  const privateKeyRaw =
    readServerEnv('FIREBASE_ADMIN_PRIVATE_KEY', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY') ||
    firebaseAdminConfig.privateKey;

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKeyRaw),
  };
};

const assertFirebaseAdminConfig = (config: { projectId: string; clientEmail: string; privateKey: string }) => {
  const missing: string[] = [];

  if (!config.projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID or FIREBASE_PROJECT_ID');
  if (!config.clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_CLIENT_EMAIL');
  if (!config.privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Firebase Admin env missing: ${missing.join(', ')}`);
  }
};

const resolvedAdminConfig = resolveFirebaseAdminConfig();

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
    assertFirebaseAdminConfig(resolvedAdminConfig);

    // Initialize with service account credentials
    adminApp = initializeApp({
      credential: cert({
        projectId: resolvedAdminConfig.projectId,
        clientEmail: resolvedAdminConfig.clientEmail,
        privateKey: resolvedAdminConfig.privateKey,
      }),
      projectId: resolvedAdminConfig.projectId,
    });

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    // Configure Firestore settings
    adminDb.settings({
      projectId: resolvedAdminConfig.projectId,
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

export const FIREBASE_ADMIN_CONFIG = resolvedAdminConfig;

export { getAdminApp, getAdminAuth, getAdminDb };
export default { getAdminApp, getAdminAuth, getAdminDb };

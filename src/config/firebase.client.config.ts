/**
 * Firebase Client SDK Configuration
 * Safely initialized for browser-side operations
 * Used for authentication, Firestore queries, and real-time listeners
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseClientConfig, appConfig } from './env';

// Prevent multiple initializations
let firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);

// Initialize services
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (typeof window !== 'undefined') {
  try {
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Firebase Auth initialization failed. Check NEXT_PUBLIC_FIREBASE_* values.', error);
  }

  // Firestore/Storage are optional at app boot to keep public pages responsive.
  try {
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.warn('Firestore unavailable during startup. Database features will be disabled until config is fixed.');
  }

  try {
    storage = getStorage(firebaseApp);
  } catch (error) {
    console.warn('Storage unavailable during startup. Upload features will be disabled until config is fixed.');
  }
}

/**
 * Configure Firebase Authentication
 */
if (appConfig.isDevelopment && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true') {
  try {
    if (auth) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('🔥 Firebase Auth Emulator connected (dev only)');
    }
  } catch (error) {
    // Emulator already connected or unavailable
  }
}

/**
 * Configure Firestore
 */
if (appConfig.isDevelopment && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true') {
  try {
    if (db) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔥 Firebase Firestore Emulator connected (dev only)');
    }
  } catch (error) {
    // Emulator already connected or unavailable
  }
} else {
  /**
   * Enable offline persistence for production
   * Caches data locally for offline support
   * Only works in browser (not in SSR)
   */
  if (typeof window !== 'undefined') {
    if (db) {
      enableIndexedDbPersistence(db).catch((error) => {
        if (error.code === 'failed-precondition') {
          console.warn('⚠️ Multiple tabs open. IndexedDb persistence disabled.');
        } else if (error.code === 'unimplemented') {
          console.warn('⚠️ Browser does not support persistence.');
        }
      });
    }
  }
}

/**
 * Configure Storage (if using emulator in dev)
 */
if (appConfig.isDevelopment && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true') {
  try {
    if (storage) {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('🔥 Firebase Storage Emulator connected (dev only)');
    }
  } catch (error) {
    // Emulator already connected or unavailable
  }
}

export const FIREBASE_CLIENT_CONFIG = firebaseClientConfig;

export { firebaseApp, auth, db, storage };
export default firebaseApp;

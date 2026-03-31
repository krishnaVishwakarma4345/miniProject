/**
 * Firebase Client SDK Initialization
 * ============================================================
 * Initializes Firebase Auth and Firestore for client-side use.
 * Singleton pattern ensures one instance across the entire app.
 *
 * Usage:
 *   import { auth, firestore } from '@/lib/firebase/client';
 *   const user = await getUser(auth.currentUser?.uid);
 */

import { initializeApp, getApp, App } from "firebase/app";
import {
  getAuth,
  Auth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from "firebase/firestore";

import { FIREBASE_CLIENT_CONFIG } from "@/config/firebase.client.config";

let app: App | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Initialize Firebase App (singleton pattern)
 * @returns Initialized Firebase App instance
 */
const initializeFirebaseApp = (): App => {
  try {
    // Check if app is already initialized
    app = getApp();
    return app;
  } catch (_) {
    // App not yet initialized, create new one
    app = initializeApp(FIREBASE_CLIENT_CONFIG);
    return app;
  }
};

/**
 * Initialize Firebase Auth with persistence
 * @returns Initialized Auth instance
 */
const initializeAuth = async (): Promise<Auth> => {
  if (auth) {
    return auth;
  }

  const app = initializeFirebaseApp();
  auth = getAuth(app);

  // Enable local persistence (default on web, but explicit for clarity)
  await setPersistence(auth, browserLocalPersistence);

  // Connect to emulator in development if FIREBASE_USE_EMULATOR is true
  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !auth.emulatorConfig
  ) {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
  }

  return auth;
};

/**
 * Initialize Firestore with offline persistence
 * @returns Initialized Firestore instance
 */
const initializeFirestore = async (): Promise<Firestore> => {
  if (firestore) {
    return firestore;
  }

  const app = initializeFirebaseApp();
  firestore = getFirestore(app);

  // Enable offline persistence for better UX
  try {
    if (typeof window !== "undefined") {
      await enableIndexedDbPersistence(firestore);
    }
  } catch (err: any) {
    if (err.code === "failed-precondition") {
      // Multiple tabs open
      console.warn(
        "IndexedDB persistence failed: Multiple tabs open or quota exceeded"
      );
    } else if (err.code === "unimplemented") {
      console.warn("IndexedDB persistence not available in this environment");
    }
  }

  // Connect to emulator in development
  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !firestore._persistenceKey
  ) {
    connectFirestoreEmulator(firestore, "localhost", 8080);
  }

  return firestore;
};

/**
 * Get or initialize Auth instance
 */
export const getAuthInstance = async (): Promise<Auth> => {
  if (!auth) {
    return initializeAuth();
  }
  return auth;
};

/**
 * Get or initialize Firestore instance
 */
export const getFirestoreInstance = async (): Promise<Firestore> => {
  if (!firestore) {
    return initializeFirestore();
  }
  return firestore;
};

/**
 * Synchronously get current auth instance (must be called after initialization)
 * Use this in event handlers or non-async contexts
 */
export const getCurrentAuth = (): Auth => {
  if (!auth) {
    throw new Error(
      "Auth not initialized. Call getAuthInstance() first in your layout or provider."
    );
  }
  return auth;
};

/**
 * Synchronously get current firestore instance (must be called after initialization)
 * Use this in event handlers or non-async contexts
 */
export const getCurrentFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error(
      "Firestore not initialized. Call getFirestoreInstance() first in your layout or provider."
    );
  }
  return firestore;
};

/**
 * Reset instances (used in tests)
 */
export const resetFirebaseInstances = (): void => {
  app = null;
  auth = null;
  firestore = null;
};

export default {
  getAuthInstance,
  getFirestoreInstance,
  getCurrentAuth,
  getCurrentFirestore,
  resetFirebaseInstances,
};

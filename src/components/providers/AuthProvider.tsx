/**
 * AuthProvider Component
 * Manages global authentication state
 * Listens to Firebase Auth changes and syncs with Zustand store
 */

'use client';

import React, { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase.client.config';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider - Initialize Firebase auth listener on app load
 * Will be connected to a Zustand store in Phase 4
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    if (!auth) {
      console.warn('AuthProvider skipped: Firebase Auth is unavailable. Check NEXT_PUBLIC_FIREBASE_* values.');
      return;
    }

    /**
     * Set up real-time auth state listener
     * This will sync with Zustand store once it's created
     */
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // User is signed in
        console.log('✅ User authenticated:', user.uid);

        // Store will be connected in Phase 4
        // For now, just confirm listener is working
      } else {
        // User is signed out
        console.log('❌ User signed out');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
};

export default AuthProvider;

/**
 * Firebase configuration and analytics service layer.
 *
 * Provides event tracking and screen view analytics for the Sanchara app.
 *
 * Firebase services used (all free Spark plan, no billing required):
 * - Firebase Analytics: page views + custom events
 *
 * To enable full Firebase Analytics:
 * 1. Run: npm install firebase
 * 2. Replace the dummy config values below with real ones from Firebase Console
 *
 * @module lib/firebase
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

/**
 * Firebase project configuration (public identifiers, safe for client-side).
 * Replace with actual values from Firebase Console → Project Settings.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForStructure",
  authDomain: "prompt-wars-493103.firebaseapp.com",
  projectId: "prompt-wars-493103",
  storageBucket: "prompt-wars-493103.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
  measurementId: "G-XXXXXXXXXX"
};

/** Whether Firebase has been initialized (prevents double-init) */
let initialized = false;

/** Holds { logEvent, analytics } when Firebase is ready */
let firebaseAnalytics: { logEvent: typeof logEvent; analytics: ReturnType<typeof getAnalytics> } | null = null;

export async function initFirebase(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const app = initializeApp(firebaseConfig);
    const supported = await isSupported();
    if (supported) {
      const analytics = getAnalytics(app);
      firebaseAnalytics = { logEvent, analytics };
      console.info('[Firebase] Analytics initialized');
    }
  } catch (e) {
    console.info('[Firebase] SDK fallback — using console analytics fallback', e);
  }
}

/**
 * Track a custom analytics event.
 * Routes to Firebase Analytics when available, falls back to console.log in dev mode.
 *
 * @param eventName - GA4 event name (e.g., 'add_to_cart', 'place_order')
 * @param params - Optional key-value parameters for the event
 */
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>): void {
  if (firebaseAnalytics) {
    try {
      firebaseAnalytics.logEvent(firebaseAnalytics.analytics, eventName, params);
    } catch {
      // Silently fail — analytics should never break the app
    }
  } else if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, params ?? '');
  }
}

/**
 * Track a page/screen view in Firebase Analytics.
 *
 * @param screenName - Screen identifier (e.g., 'home', 'order', 'profile')
 */
export function trackScreenView(screenName: string): void {
  trackEvent('screen_view', { firebase_screen: screenName, firebase_screen_class: screenName });
}

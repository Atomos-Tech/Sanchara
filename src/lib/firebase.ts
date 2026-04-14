/**
 * Firebase configuration and analytics service layer.
 *
 * Provides event tracking and screen view analytics for the Sanchara app.
 * Uses the new Function() pattern to dynamically load Firebase SDK at runtime,
 * which avoids build-time resolution errors when the package is not installed.
 * Falls back to console logging in development mode.
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
let firebaseAnalytics: { logEvent: (a: unknown, e: string, p?: Record<string, unknown>) => void; analytics: unknown } | null = null;

/**
 * Initialize Firebase services.
 * Uses `new Function` to perform a truly dynamic import at RUNTIME — this avoids
 * Rollup/Vite build-time resolution errors when the `firebase` package is not
 * installed, while remaining fully compatible with Safari's security model.
 * The `new Function` wrapper prevents the bundler from statically analysing
 * the import path, making it treat it as an external runtime dependency.
 */
export async function initFirebase(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const dynamicImport = new Function('specifier', 'return import(specifier)');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appMod: any = await dynamicImport('firebase/app');
    const app = appMod.initializeApp(firebaseConfig);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyticsMod: any = await dynamicImport('firebase/analytics');
    const supported = await analyticsMod.isSupported();
    if (supported) {
      const analytics = analyticsMod.getAnalytics(app);
      firebaseAnalytics = { logEvent: analyticsMod.logEvent, analytics };
      console.info('[Firebase] Analytics initialized');
    }
  } catch {
    // Firebase SDK not installed — gracefully fall back to console logging
    console.info('[Firebase] SDK not available — using console analytics fallback');
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

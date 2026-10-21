import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Default to user's specified project: smys-food-count-b378a
const DEFAULT_PROJECT_ID = 'smys-food-count-b378a';

function getActiveConfig(): FirebaseConfigOptions {
  // Check local storage custom config override first (client only)
  if (typeof window !== 'undefined') {
    try {
      const storedConfig = localStorage.getItem('smys_firebase_config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // Fallback to Vite env variables or standard defaults
  const envSource = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  return {
    apiKey: envSource.VITE_FIREBASE_API_KEY || '',
    authDomain: envSource.VITE_FIREBASE_AUTH_DOMAIN || `${DEFAULT_PROJECT_ID}.firebaseapp.com`,
    projectId: envSource.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
    storageBucket: envSource.VITE_FIREBASE_STORAGE_BUCKET || `${DEFAULT_PROJECT_ID}.appspot.com`,
    messagingSenderId: envSource.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: envSource.VITE_FIREBASE_APP_ID || ''
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isConfigured = false;
let configErrorMessage = '';

try {
  const config = getActiveConfig();
  if (config.apiKey && config.apiKey.length > 5) {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;
  } else {
    configErrorMessage = 'Firebase API Key not set. Running in connected Demo/Mock Store mode. You can enter your API keys in Settings.';
  }
} catch (err: any) {
  console.warn('Firebase initialization error, fallback to offline demo mode:', err);
  configErrorMessage = err?.message || 'Error initializing Firebase';
  isConfigured = false;
}

export { app, db, auth };

export function isFirebaseReady(): boolean {
  return isConfigured && db !== null;
}

export function getFirebaseStatus(): { isConfigured: boolean; message: string; projectId: string } {
  const currentConfig = getActiveConfig();
  return {
    isConfigured,
    message: configErrorMessage || 'Connected to Firebase Firestore (' + currentConfig.projectId + ')',
    projectId: currentConfig.projectId
  };
}

export function saveCustomFirebaseConfig(config: FirebaseConfigOptions): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('smys_firebase_config', JSON.stringify(config));
    window.location.reload();
  }
}

export function resetFirebaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smys_firebase_config');
    window.location.reload();
  }
}

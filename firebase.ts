import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getAuth, 
  browserLocalPersistence, 
  indexedDBLocalPersistence, 
  inMemoryPersistence,
  browserPopupRedirectResolver,
  initializeAuth
} from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, setLogLevel, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from './firebase-applet-config.json';

// Suppress Firestore verbose SDK logs to keep console clean
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyBz12x3E2X8Ca8HwmESlfGiHO0GlP4L26Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "cskaian.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "cskaian",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "cskaian.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "1029382634420",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:1029382634420:web:69de0f0dce9c43a426d0e1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (appletConfig as any).measurementId || "G-Z4L0NGCHTY"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics safely
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback in restricted iframe/browser environments
  });
}

/**
 * Check if storage is actually available. 
 * In some restricted iframes (Safari), just accessing localStorage or indexedDB throws "The operation is insecure".
 */
const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined') return false;
    const storage = (window as any)['localStorage'];
    if (!storage) return false;
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const isIndexedDBAvailable = () => {
  try {
    if (typeof window === 'undefined') return false;
    const idb = (window as any)['indexedDB'];
    return !!idb;
  } catch {
    return false;
  }
};

// Initialize Auth with multiple persistence strategies to prevent crashes in restricted iframes
const persistenceChoices = [];
if (isStorageAvailable()) {
  persistenceChoices.push(browserLocalPersistence);
}
if (isIndexedDBAvailable()) {
  persistenceChoices.push(indexedDBLocalPersistence);
}
persistenceChoices.push(inMemoryPersistence);

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: persistenceChoices,
    popupRedirectResolver: typeof window !== 'undefined' ? browserPopupRedirectResolver : undefined
  });
} catch {
  try {
    authInstance = getAuth(app);
  } catch {
    authInstance = {} as any;
  }
}

export const auth = authInstance;

// Firestore with memory cache and long polling for iframe resilience
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true
  });
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const storage = getStorage(app);
export { app, analytics };
export default app;

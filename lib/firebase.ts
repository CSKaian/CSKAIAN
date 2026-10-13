import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import appletConfig from "../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyBz12x3E2X8Ca8HwmESlfGiHO0GlP4L26Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "cskaian.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "cskaian",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "cskaian.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "1029382634420",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:1029382634420:web:69de0f0dce9c43a426d0e1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (appletConfig as any).measurementId || "G-Z4L0NGCHTY"
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (appletConfig as any).firestoreDatabaseId;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
export { app, analytics };
export default app;

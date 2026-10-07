import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456789",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduverse-learning.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduverse-learning",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduverse-learning.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export interface GoogleAuthResult {
  email: string;
  name: string;
  avatarUrl: string;
  googleId: string;
  idToken?: string;
}

/**
 * Triggers Google Sign-In popup with Firebase Auth.
 * Returns normalized profile data for the Eduverse backend.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    if (!user.email) {
      throw new Error("No email address returned from Google account.");
    }

    return {
      email: user.email,
      name: user.displayName || user.email.split("@")[0],
      avatarUrl: user.photoURL || "",
      googleId: user.uid,
      idToken,
    };
  } catch (error: any) {
    // Provide clean, understandable error messages for common Firebase Auth codes
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign in window was closed before completing.");
    }
    if (error.code === "auth/cancelled-popup-request") {
      throw new Error("Sign in was cancelled.");
    }
    if (error.code === "auth/popup-blocked") {
      throw new Error("Sign in popup was blocked by browser. Please allow popups for this site.");
    }
    if (error.code === "auth/unauthorized-domain") {
      throw new Error("This domain is not authorized in Firebase Console. Please add localhost to Authorized Domains in Firebase Auth settings.");
    }
    if (error.code === "auth/api-key-not-valid" || error.code === "auth/invalid-api-key") {
      throw new Error("Firebase API key is invalid or not yet configured in frontend/.env.");
    }
    throw error;
  }
}

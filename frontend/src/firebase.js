import { initializeApp } from 'firebase/app'
import {
    getAuth, GoogleAuthProvider, signInWithPopup, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification
} from 'firebase/auth'

const config = (typeof window !== 'undefined' && window.__CAMPUSCOIN_CONFIG__) || {}

const apiKey = config.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY
const authDomain = config.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
const projectId = config.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID

// Only initialize Firebase if ALL required config values are present.
// This lets the rest of the app render normally even without a .env.local file —
// the Google Sign-In button will simply show an informative error when clicked.
const isConfigured = !!(apiKey && authDomain && projectId)

let _auth = null

if (isConfigured) {
    const firebaseConfig = {
        apiKey,
        authDomain,
        projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }
    const app = initializeApp(firebaseConfig)
    _auth = getAuth(app)
}

export const auth = _auth

/**
 * Open Google Sign-In popup.
 * Throws a user-friendly error if Firebase is not configured.
 */
export async function signInWithGoogle() {
    if (!isConfigured || !_auth) {
        throw Object.assign(new Error(
            'Firebase is not configured. Add your Firebase credentials to frontend/.env.local and restart the dev server.'
        ), { code: 'auth/not-configured' })
    }

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const result = await signInWithPopup(_auth, provider)
    return result
}

/**
 * Sign out from Firebase (no-op if not configured).
 */
export async function firebaseSignOut() {
    if (_auth) await signOut(_auth)
}

export {
    isConfigured as firebaseIsConfigured,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
}

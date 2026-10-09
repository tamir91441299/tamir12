import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose internal Firestore stream logs
try {
  setLogLevel('error');
} catch {}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configure resilient Firestore client with automatic long-polling fallback for mobile webviews & iframes
let firestoreDb;
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, dbId);
} catch {
  // If already initialized or fallback
  firestoreDb = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = firestoreDb;
export default app;


import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const config = firebaseConfig as Record<string, any>;
const databaseId = config.firestoreDatabaseId || 'ai-studio-kinoclassic-88851b34-bc79-405b-873f-c5f583fe2a3d';

// Note: If databaseId is specified and not default, pass it to getFirestore
export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export default app;

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore/lite';

try {
  setLogLevel('silent');
} catch {}

let serverDb: Firestore | null = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(raw);
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
    serverDb = dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
} catch (err) {
  console.error('Failed to initialize server-side Firestore:', err);
}

export const getServerDb = (): Firestore | null => serverDb;
export default getServerDb;

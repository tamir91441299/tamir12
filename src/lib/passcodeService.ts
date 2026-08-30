import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const LOCAL_STORAGE_PASSCODE_KEY = 'ioio_window_passcode';
const SESSION_VERIFIED_KEY = 'ioio_window_pin_verified';
export const DEFAULT_WINDOW_PASSCODE = '9144';

/**
 * Get the current secret passcode for entering protected new window
 */
export function getProtectedWindowPasscode(): string {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PASSCODE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.error('Error reading window passcode from localStorage:', e);
  }
  return DEFAULT_WINDOW_PASSCODE;
}

/**
 * Check if the user has already verified the passcode in this browser session
 */
export function isPasscodeVerifiedInSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_VERIFIED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark session as verified
 */
export function setSessionPasscodeVerified(verified: boolean = true): void {
  try {
    if (verified) {
      sessionStorage.setItem(SESSION_VERIFIED_KEY, 'true');
    } else {
      sessionStorage.removeItem(SESSION_VERIFIED_KEY);
    }
  } catch (e) {
    console.error('Error setting session passcode verified:', e);
  }
}

/**
 * Verify input code against the active passcode or master admin override code
 */
export function verifyProtectedPasscode(inputCode: string): boolean {
  if (!inputCode || !inputCode.trim()) return false;
  const currentPasscode = getProtectedWindowPasscode().trim();
  const cleanInput = inputCode.trim();

  // Allow current passcode or master admin override (9144, 1234, 8888)
  const isValid =
    cleanInput === currentPasscode ||
    cleanInput === DEFAULT_WINDOW_PASSCODE ||
    cleanInput === '9144' ||
    cleanInput === '8888';

  if (isValid) {
    setSessionPasscodeVerified(true);
  }
  return isValid;
}

/**
 * Set new secret passcode (Admin only) and sync to Firestore
 */
export async function setProtectedWindowPasscode(newCode: string): Promise<boolean> {
  const cleanCode = (newCode || '').trim();
  if (!cleanCode || cleanCode.length < 3) {
    return false;
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_PASSCODE_KEY, cleanCode);
    const docRef = doc(db, 'settings', 'window_security');
    await setDoc(
      docRef,
      {
        passcode: cleanCode,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin',
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving window passcode to Firestore:', err);
    return true;
  }
}

/**
 * Subscribe to real-time passcode updates from Firestore
 */
export function subscribePasscodeFromFirestore(callback: (code: string) => void) {
  try {
    const docRef = doc(db, 'settings', 'window_security');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.passcode) {
            const code = String(data.passcode).trim();
            localStorage.setItem(LOCAL_STORAGE_PASSCODE_KEY, code);
            callback(code);
            return;
          }
        }
        callback(getProtectedWindowPasscode());
      },
      () => {
        callback(getProtectedWindowPasscode());
      }
    );
  } catch (err) {
    console.error('Error subscribing to passcode:', err);
    callback(getProtectedWindowPasscode());
    return () => {};
  }
}

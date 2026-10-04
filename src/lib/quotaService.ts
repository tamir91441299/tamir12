/**
 * Firebase Firestore Quota Management & Resilient Fallback Service
 * Ensures the app stays 100% operational with graceful server & local fallbacks,
 * without permanently locking out active database operations.
 */

const QUOTA_STORAGE_KEY = 'ioio_firestore_quota_exceeded_timestamp';

// Clear any stale local quota flag immediately on load
try {
  localStorage.removeItem(QUOTA_STORAGE_KEY);
} catch {}

let inMemoryQuotaExceeded = false;

export function isFirestoreQuotaExceeded(): boolean {
  // Always allow fresh attempts; never hard-lock the app for hours
  return inMemoryQuotaExceeded;
}

export function markFirestoreQuotaExceeded(): void {
  inMemoryQuotaExceeded = true;
  // Automatically reset after 10 seconds so subsequent interactions retry
  setTimeout(() => {
    inMemoryQuotaExceeded = false;
  }, 10000);
}

export function resetFirestoreQuotaFlag(): void {
  inMemoryQuotaExceeded = false;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ioio_quota_exceeded', { detail: { exceeded: false } }));
  } catch {}
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err?.message || err?.code || '');
  return (
    err?.code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('quota metric') ||
    msg.includes('Free daily read units') ||
    msg.includes('Free daily write units') ||
    msg.includes('Quota exceeded')
  );
}

export const FIRESTORE_UPGRADE_URL =
  'https://console.firebase.google.com/project/corded-mariner-tmbw7/firestore/databases/ai-studio-kinoclassic-88851b34-bc79-405b-873f-c5f583fe2a3d/data?openUpgradeDialog=true';

/**
 * Execute a Firestore write with automatic error handling and fallback.
 */
export async function safeFirestoreWrite<T>(
  writeFn: () => Promise<T>,
  fallbackFn?: () => T | Promise<T>
): Promise<T | null> {
  try {
    return await writeFn();
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
      console.warn('⚠️ Firestore daily quota notice. Using local/server persistence.');
    } else {
      console.warn('Firestore write warning:', err?.message || err);
    }
    if (fallbackFn) return await fallbackFn();
    return null;
  }
}

/**
 * Execute a Firestore read with automatic error handling and fallback.
 */
export async function safeFirestoreRead<T>(
  readFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    return await readFn();
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
      console.warn('⚠️ Firestore daily read quota notice. Using cache/server.');
    } else {
      console.warn('Firestore read warning:', err?.message || err);
    }
    return await fallbackFn();
  }
}

/**
 * Firebase Firestore Quota Management & Resilient Fallback Service
 * Automatically detects quota exhaustion ('resource-exhausted') and gracefully
 * shifts operations to local storage + server endpoints to keep the app 100% operational.
 */

const QUOTA_STORAGE_KEY = 'ioio_firestore_quota_exceeded_timestamp';
const QUOTA_RESET_HOURS = 12; // Check reset after 12 hours or new day

let inMemoryQuotaExceeded = false;

export function isFirestoreQuotaExceeded(): boolean {
  if (inMemoryQuotaExceeded) return true;
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (saved) {
      const timestamp = Number(saved);
      const hoursPassed = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (hoursPassed < QUOTA_RESET_HOURS) {
        inMemoryQuotaExceeded = true;
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    }
  } catch {}
  return false;
}

export function markFirestoreQuotaExceeded(): void {
  inMemoryQuotaExceeded = true;
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent('ioio_quota_exceeded', { detail: { exceeded: true } }));
  } catch {}
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
 * Execute a Firestore write with automatic quota detection and local fallback.
 */
export async function safeFirestoreWrite<T>(
  writeFn: () => Promise<T>,
  fallbackFn?: () => T | Promise<T>
): Promise<T | null> {
  if (isFirestoreQuotaExceeded()) {
    if (fallbackFn) return await fallbackFn();
    return null;
  }

  try {
    return await writeFn();
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
      console.warn('⚠️ Firestore daily quota limit reached. Safely switched to offline/local storage mode.');
      if (fallbackFn) return await fallbackFn();
      return null;
    }

    console.warn('Firestore write warning:', err?.message || err);
    if (fallbackFn) return await fallbackFn();
    return null;
  }
}

/**
 * Execute a Firestore read with automatic quota detection and fallback.
 */
export async function safeFirestoreRead<T>(
  readFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  if (isFirestoreQuotaExceeded()) {
    return await fallbackFn();
  }

  try {
    return await readFn();
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
      console.warn('⚠️ Firestore daily read quota limit reached. Switched to offline/local cache mode.');
      return await fallbackFn();
    }
    console.warn('Firestore read warning:', err?.message || err);
    return await fallbackFn();
  }
}

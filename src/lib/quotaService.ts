/**
 * Firebase Firestore Quota Management & Resilient Fallback Service
 * Ensures the app stays 100% operational with graceful server & local fallbacks,
 * without permanently locking out active database operations.
 */

const QUOTA_STORAGE_KEY = 'ioio_firestore_quota_exceeded_timestamp';

let inMemoryQuotaExceeded = false;
let quotaExceededUntil = 0;

// Initialize quota state from localStorage without wiping it on load
try {
  const savedUntil = localStorage.getItem(QUOTA_STORAGE_KEY);
  if (savedUntil) {
    const val = Number(savedUntil);
    if (!isNaN(val) && Date.now() < val) {
      inMemoryQuotaExceeded = true;
      quotaExceededUntil = val;
    } else if (!isNaN(val) && Date.now() >= val) {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  }
} catch {}

export function isFirestoreQuotaExceeded(): boolean {
  if (!inMemoryQuotaExceeded) return false;
  if (Date.now() > quotaExceededUntil) {
    inMemoryQuotaExceeded = false;
    try {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    } catch {}
    return false;
  }
  return true;
}

export function markFirestoreQuotaExceeded(cooldownMs: number = 3600000): void {
  inMemoryQuotaExceeded = true;
  quotaExceededUntil = Date.now() + cooldownMs;
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, String(quotaExceededUntil));
    window.dispatchEvent(new CustomEvent('ioio_quota_exceeded', { detail: { exceeded: true, until: quotaExceededUntil } }));
  } catch {}
}

export function resetFirestoreQuotaFlag(): void {
  inMemoryQuotaExceeded = false;
  quotaExceededUntil = 0;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ioio_quota_exceeded', { detail: { exceeded: false, until: 0 } }));
  } catch {}
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err?.message || err?.code || String(err));
  return (
    err?.code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('quota metric') ||
    msg.includes('Free daily read units') ||
    msg.includes('Free daily write units') ||
    msg.includes('Quota exceeded') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('exceeded free quota limits') ||
    msg.includes('firestore.googleapis.com')
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

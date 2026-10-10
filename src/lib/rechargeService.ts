import { collection, doc, setDoc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sendAdminNotification, topUpUserBalanceInFirestore } from './userService';
import { safeFirestoreWrite, isQuotaError, markFirestoreQuotaExceeded, isFirestoreQuotaExceeded } from './quotaService';

export type PlanDurationKey = '15d' | '1m' | '2m' | '3m' | '6m' | '1y';

export interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  planId: PlanDurationKey;
  planLabel: string;
  durationDays: number;
  amount: number;
  packageType: 'anime'; // Зөвхөн анимэ эрх олгогдоно
  method: 'monpay' | 'qpay' | 'wallet' | 'bank' | 'code' | 'instant';
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  timestamp?: any;
}

const STORAGE_KEY = 'ioio_recharge_requests';

// Helper to robustly extract milliseconds for sorting
export function parseRechargeTime(r: any): number {
  if (!r) return 0;
  if (r.timestamp?.seconds) return r.timestamp.seconds * 1000;
  if (typeof r.timestamp === 'number') return r.timestamp;
  if (r.createdAt) {
    const t = new Date(r.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (r.id && r.id.startsWith('req_')) {
    const parts = r.id.split('_');
    const num = Number(parts[1] === 'instant' ? parts[2] : parts[1]);
    if (!isNaN(num) && num > 1000000000000) return num;
  }
  return 0;
}

/**
 * Check if the given user currently has an unapproved/pending recharge request.
 * While pending, content must remain strictly locked until admin approval.
 */
export function hasUserPendingRechargeRequest(user?: { id?: string; phone?: string; email?: string } | null): boolean {
  if (!user) return false;
  try {
    const localStr = localStorage.getItem(STORAGE_KEY);
    if (!localStr) return false;
    const list: RechargeRequest[] = JSON.parse(localStr);
    if (!Array.isArray(list)) return false;

    const cleanPhone = (user.phone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const userId = user.id || '';

    return list.some((req) => {
      if (req.status !== 'pending') return false;
      const reqPhone = (req.userPhone || '').trim().replace(/\s+/g, '');
      const reqEmail = (req.userEmail || '').trim().toLowerCase();
      return (
        (userId && req.userId === userId) ||
        (cleanPhone && cleanPhone !== '99110000' && reqPhone === cleanPhone) ||
        (cleanEmail && reqEmail === cleanEmail)
      );
    });
  } catch (e) {
    return false;
  }
}

/**
 * Clear or cancel pending recharge requests for a user without granting free points.
 * Strict security: NEVER mark as 'approved' automatically! Only manual admin approval grants points.
 */
export function clearUserPendingRechargeRequests(user?: { id?: string; phone?: string; email?: string } | null): void {
  if (!user) return;
  try {
    const localStr = localStorage.getItem(STORAGE_KEY);
    if (!localStr) return;
    const list: RechargeRequest[] = JSON.parse(localStr);
    if (!Array.isArray(list)) return;

    const cleanPhone = (user.phone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const userId = user.id || '';

    let changed = false;
    list.forEach((req) => {
      const reqPhone = (req.userPhone || '').trim().replace(/\s+/g, '');
      const reqEmail = (req.userEmail || '').trim().toLowerCase();
      if (
        (userId && req.userId === userId) ||
        (cleanPhone && cleanPhone !== '99110000' && reqPhone === cleanPhone) ||
        (cleanEmail && reqEmail === cleanEmail)
      ) {
        if (req.status === 'pending') {
          // Keep as pending or cancelled - NEVER auto-approve!
          req.status = 'rejected';
          req.processedAt = new Date().toISOString();
          req.processedBy = 'Систем цуцалсан';
          changed = true;
        }
      }
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ioio_recharges_updated'));
    }
  } catch (e) {}
}

/**
 * Get user's latest recharge request if any
 */
export function getUserLatestRechargeRequest(user?: { id?: string; phone?: string; email?: string } | null): RechargeRequest | null {
  if (!user) return null;
  try {
    const localStr = localStorage.getItem(STORAGE_KEY);
    if (!localStr) return null;
    const list: RechargeRequest[] = JSON.parse(localStr);
    if (!Array.isArray(list)) return null;

    const cleanPhone = (user.phone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const userId = user.id || '';

    const found = list.find((req) => {
      const reqPhone = (req.userPhone || '').trim().replace(/\s+/g, '');
      const reqEmail = (req.userEmail || '').trim().toLowerCase();
      return (
        (userId && req.userId === userId) ||
        (cleanPhone && cleanPhone !== '99110000' && reqPhone === cleanPhone) ||
        (cleanEmail && reqEmail === cleanEmail)
      );
    });
    return found || null;
  } catch {
    return null;
  }
}

/**
 * One-time fetch of all recharge requests from Firestore
 */
export async function fetchRechargesFromFirestore(): Promise<RechargeRequest[]> {
  if (isFirestoreQuotaExceeded()) {
    return [];
  }
  try {
    const colRef = collection(db, 'recharge_requests');
    const snap = await getDocs(colRef);
    const list: RechargeRequest[] = [];
    snap.forEach((d) => {
      const data = d.data() as RechargeRequest;
      if (data) {
        list.push({
          ...data,
          id: d.id,
          createdAt: data.createdAt || (data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000).toISOString() : new Date().toISOString()),
        });
      }
    });
    return list;
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    } else {
      console.warn('fetchRechargesFromFirestore error:', err);
    }
    return [];
  }
}

/**
 * Submit a points/recharge request to Admin Tamir
 */
export async function submitRechargeRequest(data: {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  planId: PlanDurationKey;
  planLabel: string;
  durationDays: number;
  amount: number;
  method: 'monpay' | 'qpay' | 'wallet' | 'bank' | 'code' | 'instant';
  note?: string;
}): Promise<{ success: boolean; id: string; message: string }> {
  try {
    const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newReq: RechargeRequest = {
      id,
      userId: data.userId,
      userName: data.userName || 'Хэрэглэгч',
      userPhone: data.userPhone || '',
      userEmail: data.userEmail || '',
      planId: data.planId,
      planLabel: data.planLabel,
      durationDays: data.durationDays,
      amount: data.amount,
      packageType: 'anime', // Цэнэглэлтийн хүсэлтээр зөвхөн анимэ эрх олгоно
      method: data.method,
      status: 'pending',
      note: data.note || '',
      createdAt: new Date().toISOString(),
    };

    // 1. Save locally
    try {
      const existingStr = localStorage.getItem(STORAGE_KEY);
      const list: RechargeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(newReq);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ioio_recharges_updated', { detail: list }));
    } catch (e) {
      console.error('Local storage save error:', e);
    }

    // 2. Save to Server REST API for 100% reliable cross-device delivery
    try {
      fetch('/api/recharges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      }).catch((e) => console.warn('Server recharge sync error (non-fatal):', e));
    } catch {}

    // 3. Save to Firestore
    try {
      await setDoc(doc(db, 'recharge_requests', id), {
        ...newReq,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore setDoc recharge request warning:', err);
    }

    // 4. Notify Admin (Explicitly mentions Anime only permission)
    sendAdminNotification({
      type: 'TOP_UP_REQUEST',
      title: '🎌 Зөвхөн Анимэ эрх авах шинэ цэнэглэлтийн хүсэлт',
      message: `${data.userName} (${data.userPhone || data.userEmail}) ${data.planLabel} (${data.amount.toLocaleString()}₮) шилжүүлж ЗӨВХӨН АНИМЭ үзэх эрх авах хүсэлт илгээлээ.`,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
    });

    return {
      success: true,
      id,
      message: 'Таны цэнэглэлтийн хүсэлт амжилттай илгээгдлээ! Админ шалгаад зөвхөн анимэ үзэх эрх олгоно.',
    };
  } catch (err: any) {
    console.error('Error submitting recharge request:', err);
    return {
      success: false,
      id: '',
      message: 'Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.',
    };
  }
}

/**
 * Execute direct instant top-up: immediately credits points to user's wallet
 * in Firestore and active session, clears pending flags, and logs approved transaction.
 */
export async function executeDirectInstantTopUp(data: {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  amount: number;
  method?: 'monpay' | 'qpay' | 'wallet' | 'bank' | 'instant';
  note?: string;
}): Promise<{ success: boolean; newBalance: number; id: string; message: string }> {
  try {
    const id = 'req_instant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const cleanAmount = Math.max(0, Number(data.amount) || 0);

    // 1. Immediately credit points into Firestore and local store
    const topUpRes = await topUpUserBalanceInFirestore(data.userId, cleanAmount, data.note || 'Шууд цэнэглэлт');

    // 2. Clear any pending recharge block for this user
    clearUserPendingRechargeRequests({ id: data.userId, phone: data.userPhone, email: data.userEmail });

    // 3. Record transaction in recharge_requests with status 'approved'
    const newReq: RechargeRequest = {
      id,
      userId: data.userId,
      userName: data.userName || 'Хэрэглэгч',
      userPhone: data.userPhone || '',
      userEmail: data.userEmail || '',
      planId: '1m',
      planLabel: `Шууд цэнэглэлт (+${cleanAmount.toLocaleString()}₮)`,
      durationDays: 30,
      amount: cleanAmount,
      packageType: 'anime',
      method: (data.method as any) || 'monpay',
      status: 'approved',
      note: data.note || 'Шууд дансанд оноо орсон',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: 'Шууд Систем',
    };

    try {
      const existingStr = localStorage.getItem(STORAGE_KEY);
      const list: RechargeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(newReq);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}

    try {
      await setDoc(doc(db, 'recharge_requests', id), {
        ...newReq,
        timestamp: serverTimestamp(),
      });
    } catch {}

    try {
      fetch('/api/recharges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      }).catch(() => {});
    } catch {}

    return {
      success: true,
      newBalance: topUpRes.newBalance,
      id,
      message: `🎉 ТАНЫ ДАНС АМЖИЛТТАЙ ЦЭНЭГЛЭГДЛЭЭ!\n+${cleanAmount.toLocaleString()} ₮ оноо шууд таны дансанд орлоо. Шинэ үлдэгдэл: ${topUpRes.newBalance.toLocaleString()} ₮.`,
    };
  } catch (err: any) {
    console.error('executeDirectInstantTopUp error:', err);
    return {
      success: false,
      newBalance: 0,
      id: '',
      message: 'Цэнэглэлт хийхэд алдаа гарлаа: ' + (err?.message || 'Дахин оролдоно уу'),
    };
  }
}

/**
 * Real-time subscription to recharge requests across Firestore, Server API, and LocalStorage
 */
export function subscribeRechargeRequests(callback: (requests: RechargeRequest[]) => void) {
  let isUnsubscribed = false;
  let latestFirestoreList: RechargeRequest[] = [];
  let latestServerList: RechargeRequest[] = [];

  const emitMerged = () => {
    if (isUnsubscribed) return;
    const map = new Map<string, RechargeRequest>();

    // 1. LocalStorage
    try {
      const localStr = localStorage.getItem(STORAGE_KEY);
      if (localStr) {
        const localList: RechargeRequest[] = JSON.parse(localStr);
        if (Array.isArray(localList)) {
          localList.forEach((r) => {
            if (r && r.id) map.set(r.id, r);
          });
        }
      }
    } catch {}

    // 2. Server API (High authority cross-device)
    latestServerList.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    // 3. Firestore (Real-time authority)
    latestFirestoreList.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    const combined = Array.from(map.values());
    combined.sort((a, b) => parseRechargeTime(b) - parseRechargeTime(a));
    callback(combined);
  };

  emitMerged();

  // Poll server /api/recharges every 3 seconds to guarantee reception across all devices
  const fetchServerRequests = async () => {
    try {
      const res = await fetch('/api/recharges');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.requests)) {
          latestServerList = data.requests;
          emitMerged();
        }
      }
    } catch {}
  };

  fetchServerRequests();
  const serverInterval = setInterval(fetchServerRequests, 10000);

  const handleCustomUpdated = () => {
    fetchServerRequests();
    emitMerged();
  };
  window.addEventListener('ioio_recharges_updated', handleCustomUpdated);

  // Firestore real-time listener (skip if daily quota is exceeded)
  let unsubFirestore = () => {};
  if (!isFirestoreQuotaExceeded()) {
    try {
      const colRef = collection(db, 'recharge_requests');
      unsubFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          const list: RechargeRequest[] = [];
          snapshot.forEach((d) => {
            const item = d.data() as RechargeRequest;
            if (item && item.id) {
              list.push({
                ...item,
                id: d.id,
                createdAt: item.createdAt || (item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000).toISOString() : new Date().toISOString()),
              });
            }
          });
          latestFirestoreList = list;
          emitMerged();
        },
        (err) => {
          if (isQuotaError(err)) {
            markFirestoreQuotaExceeded();
          } else {
            console.warn('subscribeRechargeRequests onSnapshot notice:', err?.message || err);
          }
          emitMerged();
        }
      );
    } catch (e) {
      if (isQuotaError(e)) {
        markFirestoreQuotaExceeded();
      } else {
        console.warn('subscribeRechargeRequests setup fallback:', e);
      }
    }
  }

  return () => {
    isUnsubscribed = true;
    clearInterval(serverInterval);
    window.removeEventListener('ioio_recharges_updated', handleCustomUpdated);
    unsubFirestore();
  };
}

export async function updateRechargeRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  adminName: string = 'Admin'
): Promise<void> {
  try {
    // 1. Update Server REST API
    try {
      await fetch(status === 'approved' ? '/api/recharges/approve' : '/api/recharges/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, processedBy: adminName, reason: adminName }),
      });
    } catch (e) {
      console.warn('Server recharge status update error:', e);
    }

    // 2. Update local storage
    try {
      const localStr = localStorage.getItem(STORAGE_KEY);
      if (localStr) {
        const list: RechargeRequest[] = JSON.parse(localStr);
        const idx = list.findIndex((r) => r.id === requestId);
        if (idx >= 0) {
          list[idx].status = status;
          list[idx].processedAt = new Date().toISOString();
          list[idx].processedBy = adminName;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {}

    // 3. Update Firestore
    try {
      await setDoc(
        doc(db, 'recharge_requests', requestId),
        {
          status,
          processedAt: new Date().toISOString(),
          processedBy: adminName,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore recharge update error:', err);
    }

    try {
      window.dispatchEvent(new CustomEvent('ioio_recharges_updated'));
    } catch {}
  } catch (err) {
    console.error('Error updating recharge request status:', err);
  }
}

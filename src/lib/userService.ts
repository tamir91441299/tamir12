import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { UserDetail, INITIAL_USERS } from '../components/UserManagementModal';
import { UserAccount } from '../components/AuthModal';
import {
  safeFirestoreWrite,
  safeFirestoreRead,
  markFirestoreQuotaExceeded,
  isFirestoreQuotaExceeded,
  isQuotaError,
} from './quotaService';

/**
 * Check if a user is a mock sample or bot user that should not appear in production management
 */
export function isBotOrMockUser(u: Partial<UserDetail> | null | undefined): boolean {
  if (!u) return false;
  if (u.isMockUser === true) return true;
  const id = String(u.id || '').trim();
  const email = String(u.email || '').trim().toLowerCase();
  const name = String(u.name || '').trim();

  // Known sample / bot IDs only
  if (['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005'].includes(id)) return true;
  if (id.startsWith('visitor_') || id.startsWith('test_mock_')) return true;

  // Known sample / bot emails
  const botEmails = ['admin@ioio.mn'];
  if (botEmails.includes(email)) return true;
  if (email.includes('@ioio.mn') || email.includes('visitor_')) return true;

  if (name.startsWith('Шинэ Зочин (Тест)')) return true;

  return false;
}

export interface AuthRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: 'NEW_USER' | 'TOP_UP_REQUEST' | 'PACKAGE_PURCHASE' | 'NEW_ANIME';
  title: string;
  message: string;
  movieId?: string;
  movieTitle?: string;
  poster?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt: string;
}

// Initial anime announcements for all users
export const INITIAL_ANIME_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_init_korra_s3',
    type: 'NEW_ANIME',
    title: 'Шинэ Цуврал Нэмэгдлээ! 🌪️',
    message: '«Коррагийн Домог Бүлэг 3: Өөрчлөлт (Book 3: Change)» бүх 13 анги амжилттай нэмэгдлээ. Багцын эрхээ авч шууд үзээрэй!',
    movieId: 'm_legend_of_korra_s3',
    movieTitle: 'Коррагийн Домог Бүлэг 3',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjA5MTY2ODk4MV5BMl5BanBnXkFtZTgwNTI4MDY4MTE@._V1_FMjpg_UX1000_.jpg',
    createdAt: 'Өнөөдөр 15:00',
  },
  {
    id: 'notif_init_korra_s4',
    type: 'NEW_ANIME',
    title: 'Төгсгөлийн Бүлэг Нэмэгдлээ! ⚙️',
    message: '«Коррагийн Домог Бүлэг 4: Тэнцвэр (Book 4: Balance)» бүх 13 анги нэмэгдлээ. Аватар Коррагийн сүүлчийн агуу тулааныг үзээрэй!',
    movieId: 'm_legend_of_korra_s4',
    movieTitle: 'Коррагийн Домог Бүлэг 4',
    poster: 'https://m.media-amazon.com/images/M/MV5BNTBhOGY2N2QtMDQ4Ny00OTM2LWI3NDYtY2ZhZjM3MDk2NjY2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    createdAt: 'Өнөөдөр 15:30',
  },
];

/**
 * Broadcast notification when a new anime is added to the system
 */
export async function sendNewAnimeNotification(movie: {
  id: string;
  title: string;
  titleMongolian: string;
  poster?: string;
}) {
  try {
    const notifId = 'notif_anime_' + Date.now();
    const docRef = doc(db, 'notifications', notifId);
    const payload: AppNotification = {
      id: notifId,
      type: 'NEW_ANIME',
      title: 'Шинэ Анимэ Нэмэгдлээ! 🎉',
      message: `«${movie.titleMongolian || movie.title}» анимэ амжилттай нэмэгдлээ. Анимэ багцын эрхээ авч одоо шууд үзээрэй!`,
      movieId: movie.id,
      movieTitle: movie.titleMongolian || movie.title,
      poster: movie.poster,
      createdAt: new Date().toLocaleString('mn-MN'),
    };

    // 1. Cache to local storage
    try {
      const saved = localStorage.getItem('flicknime_anime_notifs');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem('flicknime_anime_notifs', JSON.stringify([payload, ...list.slice(0, 20)]));
    } catch {}

    // 2. Persist to Firestore with quota fallback
    await safeFirestoreWrite(() => setDoc(docRef, payload));
    return payload;
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('New anime notification warning (saved locally):', err);
    return null;
  }
}

/**
 * Send notification to Firestore "notifications" collection
 */
export async function sendAdminNotification(notif: Omit<AppNotification, 'id' | 'createdAt'>) {
  try {
    const notifId = 'notif_' + Date.now();
    const docRef = doc(db, 'notifications', notifId);
    const payload: AppNotification = {
      ...notif,
      id: notifId,
      createdAt: new Date().toLocaleString('mn-MN'),
    };
    await safeFirestoreWrite(() => setDoc(docRef, payload));
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('Admin notification warning (fallback):', err);
  }
}

/**
 * Subscribe to real-time notifications from Firestore (with seed fallback)
 */
export function subscribeNotificationsFromFirestore(callback: (notifications: AppNotification[]) => void) {
  try {
    // Initial load with local storage + seeds
    let localAnimeNotifs: AppNotification[] = [];
    try {
      const saved = localStorage.getItem('flicknime_anime_notifs');
      if (saved) localAnimeNotifs = JSON.parse(saved);
    } catch {}

    const initialCombined = [...localAnimeNotifs, ...INITIAL_ANIME_NOTIFICATIONS];
    callback(initialCombined);

    // If quota already exceeded, avoid unnecessary Firestore call
    if (isFirestoreQuotaExceeded()) {
      return () => {};
    }

    const notifCol = collection(db, 'notifications');
    const q = query(notifCol, limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreNotifs: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppNotification;
          if (data) firestoreNotifs.push(data);
        });

        const map = new Map<string, AppNotification>();
        [...firestoreNotifs, ...localAnimeNotifs, ...INITIAL_ANIME_NOTIFICATIONS].forEach((n) => {
          if (!map.has(n.id)) {
            map.set(n.id, n);
          }
        });

        const notifs = Array.from(map.values());
        // Sort newest first
        notifs.sort((a, b) => (b.id > a.id ? 1 : -1));
        callback(notifs);
      },
      (err) => {
        if (isQuotaError(err)) {
          markFirestoreQuotaExceeded();
          console.warn('Firestore daily read quota limit reached, using local notifications fallback.');
        } else {
          console.warn('Notification subscription warning (using local):', err);
        }
      }
    );
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('Notification subscription setup fallback active:', err);
    return () => {};
  }
}

/**
 * Broadcast channel for instant cross-tab / cross-window registration sync
 */
const usersSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('flicknime_users_channel') : null;

/**
 * Helper to deduplicate users by ID, Email, and Phone
 */
export function deduplicateUserList(users: UserDetail[]): UserDetail[] {
  const map = new Map<string, UserDetail>();

  // Filter out any mock/bot users first
  const cleanSource = users.filter((u) => !isBotOrMockUser(u));

  // Sort input so newest registered users are processed with high fidelity
  const prioritized = [...cleanSource].sort((a, b) => {
    return (b.registeredTimestamp || 0) - (a.registeredTimestamp || 0);
  });

  prioritized.forEach((u, idx) => {
    if (!u) return;
    const cleanId = (u.id || '').trim() || (u.email ? u.email.replace(/[^a-zA-Z0-9_-]/g, '_') : `user_${idx}_${Date.now()}`);
    const cleanEmail = (u.email || '').trim().toLowerCase();
    const cleanPhone = (u.phone || '').trim().replace(/\s+/g, '');

    // Look for existing user with identical ID or clear alias
    let foundKey: string | null = null;
    for (const [key, existing] of map.entries()) {
      const exEmail = (existing.email || '').trim().toLowerCase();

      // Only merge if exact same ID or alias for the exact same user
      if (
        key === cleanId ||
        existing.id === cleanId ||
        (cleanEmail && exEmail && exEmail === cleanEmail && !cleanEmail.endsWith('@flicknime.mn'))
      ) {
        foundKey = key;
        break;
      }
    }

    const baseObj = foundKey ? map.get(foundKey) : null;
    const targetKey = foundKey || cleanId;

    const resolvedIsMock = false;

    const parsedTimestamp =
      u.registeredTimestamp ||
      baseObj?.registeredTimestamp ||
      (u.registeredAt && !isNaN(new Date(u.registeredAt.replace(/\./g, '-').replace(/\//g, '-')).getTime())
        ? new Date(u.registeredAt.replace(/\./g, '-').replace(/\//g, '-')).getTime()
        : Date.now());

    // 1. Resolve Package Type: Keep active paid package over 'free'
    let resolvedPackage = u.packageType || baseObj?.packageType || 'free';
    if (resolvedPackage === 'free' && baseObj?.packageType && baseObj.packageType !== 'free') {
      resolvedPackage = baseObj.packageType;
    } else if (u.packageType && u.packageType !== 'free') {
      resolvedPackage = u.packageType;
    }

    // 2. Resolve Package Expiry: Keep valid date over '-' or 'Идэвхгүй'
    let resolvedExpiry = u.packageExpiry || baseObj?.packageExpiry || 'Идэвхгүй';
    if ((resolvedExpiry === 'Идэвхгүй' || resolvedExpiry === '-') && baseObj?.packageExpiry && baseObj.packageExpiry !== '-' && baseObj.packageExpiry !== 'Идэвхгүй') {
      resolvedExpiry = baseObj.packageExpiry;
    }

    // 3. Resolve Wallet Balance: Keep the user's own balance, NEVER overwrite with another account's balance
    const resolvedBalance = typeof u.walletBalance === 'number'
      ? u.walletBalance
      : typeof baseObj?.walletBalance === 'number'
      ? baseObj.walletBalance
      : 0;

    // 4. Phone and Email: Prefer non-empty values
    const resolvedPhone = cleanPhone && cleanPhone !== '99110000'
      ? cleanPhone
      : (baseObj?.phone || cleanPhone || '');
    const resolvedEmail = cleanEmail || baseObj?.email || '';

    // 5. Name: Prefer real user's custom name over generic placeholder
    let resolvedName = u.name || baseObj?.name || 'Хэрэглэгч';
    if (resolvedName === 'Хэрэглэгч' && baseObj?.name && baseObj.name !== 'Хэрэглэгч') {
      resolvedName = baseObj.name;
    }

    const merged: UserDetail = {
      ...baseObj,
      ...u,
      id: targetKey,
      email: resolvedEmail,
      phone: resolvedPhone,
      name: resolvedName,
      walletBalance: resolvedBalance,
      packageType: resolvedPackage as any,
      packageExpiry: resolvedExpiry,
      role: (resolvedEmail === 'tamir91441299@gmail.com' || resolvedPhone === '91441299') ? 'admin' : (u.role || baseObj?.role || 'user'),
      status: u.status || baseObj?.status || 'active',
      registeredAt: u.registeredAt || baseObj?.registeredAt || new Date().toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      registeredTimestamp: parsedTimestamp,
      isMockUser: resolvedIsMock,
      lastLogin: u.lastLogin || baseObj?.lastLogin || 'Идэвхтэй одоо',
      watchedCount: Math.max(u.watchedCount ?? 0, baseObj?.watchedCount ?? 0),
      favoriteCount: Math.max(u.favoriteCount ?? 0, baseObj?.favoriteCount ?? 0),
    };

    map.set(targetKey, merged);
  });

  return Array.from(map.values());
}

/**
 * Sorts users so real registered users appear first, and newest registrations appear at the top.
 */
export function sortUsersByNewest(users: UserDetail[]): UserDetail[] {
  return [...users].sort((a, b) => {
    // Non-mock users always come before mock sample users
    if (a.isMockUser && !b.isMockUser) return 1;
    if (!a.isMockUser && b.isMockUser) return -1;
    const timeA = a.registeredTimestamp || 0;
    const timeB = b.registeredTimestamp || 0;
    return timeB - timeA;
  });
}

/**
 * Top up user balance in Firestore and local storage authoritative state.
 * Directly increments wallet balance and triggers real-time updates.
 */
export async function topUpUserBalanceInFirestore(
  userIdOrTarget: string | { id?: string; phone?: string; email?: string; name?: string },
  pointsAmount: number,
  note?: string,
  explicitNewBalance?: number
): Promise<{ success: boolean; newBalance: number; user?: UserDetail; message: string }> {
  try {
    const rawId = typeof userIdOrTarget === 'string' ? userIdOrTarget.trim() : (userIdOrTarget.id || '').trim();
    const phoneInput = typeof userIdOrTarget === 'object' ? userIdOrTarget.phone : '';
    const emailInput = typeof userIdOrTarget === 'object' ? userIdOrTarget.email : '';

    let currentBal = 0;
    let targetUser: UserDetail | undefined;
    const matchingDocIds = new Set<string>();
    if (rawId) matchingDocIds.add(rawId);

    // 1. Check local storage list
    const savedListStr = localStorage.getItem('ioio_registered_users_list');
    let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
    if (Array.isArray(list)) {
      targetUser = list.find((u) => {
        if (!u) return false;
        const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        const pPhone = (phoneInput || '').trim().replace(/\s+/g, '');
        const pEmail = (emailInput || '').trim().toLowerCase();
        return (
          (rawId && u.id === rawId) ||
          (pPhone && pPhone !== '99110000' && uPhone === pPhone) ||
          (pEmail && uEmail === pEmail) ||
          u.phone === rawId ||
          (u.email && u.email.toLowerCase() === rawId.toLowerCase())
        );
      });
      if (targetUser && typeof targetUser.walletBalance === 'number') {
        currentBal = targetUser.walletBalance;
        if (targetUser.id) matchingDocIds.add(targetUser.id);
      }
    }

    const cleanPhone = (phoneInput || targetUser?.phone || (rawId.match(/^[0-9]{8}$/) ? rawId : '')).trim().replace(/\s+/g, '');
    const cleanEmail = (emailInput || targetUser?.email || (rawId.includes('@') ? rawId : '')).trim().toLowerCase();

    // 2. Fetch from Firestore by ID if available
    if (rawId) {
      try {
        const snap = await getDoc(doc(db, 'users', rawId));
        if (snap.exists()) {
          const d = snap.data() as UserDetail;
          if (d) {
            if (!targetUser) targetUser = { ...d, id: snap.id };
            if (typeof d.walletBalance === 'number') {
              currentBal = Math.max(currentBal, d.walletBalance);
            }
          }
        }
      } catch (e) {}
    }

    // 3. Query Firestore by phone
    if (cleanPhone && cleanPhone !== '99110000') {
      try {
        const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone), limit(5));
        const phoneSnaps = await getDocs(qPhone);
        phoneSnaps.forEach((docSnap) => {
          matchingDocIds.add(docSnap.id);
          const d = docSnap.data();
          if (typeof d.walletBalance === 'number') {
            currentBal = Math.max(currentBal, d.walletBalance);
          }
          if (!targetUser) targetUser = { ...d, id: docSnap.id } as UserDetail;
        });
      } catch (e) {}
    }

    // 4. Query Firestore by email
    if (cleanEmail && cleanEmail.includes('@') && !cleanEmail.endsWith('@flicknime.mn')) {
      try {
        const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(5));
        const emailSnaps = await getDocs(qEmail);
        emailSnaps.forEach((docSnap) => {
          matchingDocIds.add(docSnap.id);
          const d = docSnap.data();
          if (typeof d.walletBalance === 'number') {
            currentBal = Math.max(currentBal, d.walletBalance);
          }
          if (!targetUser) targetUser = { ...d, id: docSnap.id } as UserDetail;
        });
      } catch (e) {}
    }

    // Determine new balance
    const newBalance = explicitNewBalance !== undefined ? Math.max(0, explicitNewBalance) : Math.max(0, currentBal + pointsAmount);

    const primaryDocId = rawId || targetUser?.id || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);
    matchingDocIds.add(primaryDocId);

    // 5. Persist to primary Firestore document with quota-safe wrapper
    await safeFirestoreWrite(() =>
      setDoc(
        doc(db, 'users', primaryDocId),
        {
          id: primaryDocId,
          name: targetUser?.name || 'Хэрэглэгч',
          phone: cleanPhone || targetUser?.phone || '',
          email: cleanEmail || targetUser?.email || '',
          walletBalance: newBalance,
          updatedAt: new Date().toISOString(),
          lastTopUpAmount: pointsAmount,
          lastTopUpAt: new Date().toISOString(),
        },
        { merge: true }
      )
    );

    // 6. Update local storage registered users list
    if (targetUser) {
      targetUser.walletBalance = newBalance;
      targetUser.isMockUser = false;
    }
    const updatedList = list.map((u) => {
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      if (
        (primaryDocId && u.id === primaryDocId) ||
        (rawId && u.id === rawId) ||
        (cleanPhone && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
        (cleanEmail && uEmail === cleanEmail)
      ) {
        return { ...u, walletBalance: newBalance, isMockUser: false };
      }
      return u;
    });
    localStorage.setItem('ioio_registered_users_list', JSON.stringify(sortUsersByNewest(deduplicateUserList(updatedList))));

    // 7. Update active session ONLY if target matches current user
    let isActiveUser = false;
    try {
      const activeStr = localStorage.getItem('ioio_user');
      if (activeStr) {
        const activeU = JSON.parse(activeStr);
        const actPhone = (activeU.phone || '').trim().replace(/\s+/g, '');
        const actEmail = (activeU.email || '').trim().toLowerCase();
        if (
          matchingDocIds.has(activeU.id) ||
          (cleanPhone && cleanPhone !== '99110000' && actPhone === cleanPhone && activeU.id === primaryDocId) ||
          (cleanEmail && actEmail === cleanEmail && activeU.id === primaryDocId)
        ) {
          isActiveUser = true;
          activeU.walletBalance = newBalance;
          persistActiveSession(activeU, true);
          localStorage.setItem('ioio_balance', String(newBalance));
        }
      }
    } catch (e) {}

    // Dispatch balance event strictly with target details
    try {
      window.dispatchEvent(new CustomEvent('ioio_balance_updated', {
        detail: {
          newBalance,
          userId: primaryDocId,
          phone: cleanPhone,
          email: cleanEmail,
          isActiveUser
        }
      }));
      window.dispatchEvent(new CustomEvent('ioio_users_updated', { detail: updatedList }));
    } catch (e) {}

    // 8. Broadcast top-up notification
    await sendAdminNotification({
      type: 'TOP_UP_REQUEST',
      title: '💰 Хэтэвч амжилттай цэнэглэгдлээ!',
      message: `${targetUser?.name || 'Хэрэглэгч'} (${cleanPhone || cleanEmail || primaryDocId})-д ${pointsAmount >= 0 ? '+' : ''}${pointsAmount.toLocaleString()}₮ оноо орлоо. Нийт үлдэгдэл: ${newBalance.toLocaleString()}₮.`,
      userName: targetUser?.name,
      userEmail: cleanEmail,
      userPhone: cleanPhone,
    });

    return {
      success: true,
      newBalance,
      user: targetUser,
      message: `✓ ${targetUser?.name || 'Хэрэглэгч'}-д ${pointsAmount >= 0 ? '+' : ''}${pointsAmount.toLocaleString()}₮ оноо амжилттай орлоо! Нийт үлдэгдэл: ${newBalance.toLocaleString()}₮`,
    };
  } catch (err: any) {
    console.error('Error in topUpUserBalanceInFirestore:', err);
    return {
      success: false,
      newBalance: 0,
      message: '⚠️ Алдаа гарлаа: ' + (err?.message || 'Дахин оролдоно уу'),
    };
  }
}

/**
 * Authoritative admin action: Approves a recharge request and delivers points (onoo)
 * and anime access directly to the user in Firestore and across all sessions.
 */
export async function approveAndCreditRechargeRequest(
  req: {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    userEmail?: string;
    planId?: string;
    planLabel?: string;
    durationDays?: number;
    amount: number;
    packageType?: string;
  },
  adminName: string = 'Админ Тамир'
): Promise<{
  success: boolean;
  newBalance: number;
  expiryDate: string;
  targetUser?: UserDetail;
  message: string;
}> {
  try {
    const cleanAmount = Math.max(0, Number(req.amount) || 0);
    const cleanPhone = (req.userPhone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (req.userEmail || '').trim().toLowerCase();
    const rawUserId = (req.userId || '').trim();
    const durationDays = req.durationDays || (
      (req.planId as string) === '15d' ? 15 :
      (req.planId as string) === '2m' ? 60 :
      (req.planId as string) === '3m' ? 90 :
      (req.planId as string) === '6m' ? 180 :
      (req.planId as string) === '1y' ? 365 : 30
    );

    // 1. Mark request as approved in Firestore `recharge_requests` collection with quota safety
    await safeFirestoreWrite(() =>
      setDoc(
        doc(db, 'recharge_requests', req.id),
        {
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: adminName,
        },
        { merge: true }
      )
    );

    // 2. Mark request as approved in LocalStorage
    try {
      const localReqsStr = localStorage.getItem('ioio_recharge_requests');
      if (localReqsStr) {
        const list = JSON.parse(localReqsStr);
        if (Array.isArray(list)) {
          const idx = list.findIndex((r) => r.id === req.id);
          if (idx >= 0) {
            list[idx].status = 'approved';
            list[idx].processedAt = new Date().toISOString();
            list[idx].processedBy = adminName;
            localStorage.setItem('ioio_recharge_requests', JSON.stringify(list));
          }
        }
      }
    } catch (e) {}

    // 3. Locate existing user record and current balance
    let currentBalance = 0;
    let targetUser: UserDetail | undefined;
    const matchingDocIds = new Set<string>();
    if (rawUserId) matchingDocIds.add(rawUserId);

    // A. Check registered users list in LocalStorage
    const savedListStr = localStorage.getItem('ioio_registered_users_list');
    let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
    if (Array.isArray(list)) {
      targetUser = list.find((u) => {
        if (!u) return false;
        const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        const uId = (u.id || '').trim();
        return (
          (rawUserId && uId === rawUserId) ||
          (cleanPhone && cleanPhone !== '99110000' && uPhone && uPhone === cleanPhone) ||
          (cleanEmail && uEmail && uEmail === cleanEmail)
        );
      });
      if (targetUser && typeof targetUser.walletBalance === 'number') {
        currentBalance = Math.max(currentBalance, targetUser.walletBalance);
        if (targetUser.id) matchingDocIds.add(targetUser.id);
      }
    }

    // B. Check active session
    try {
      const activeStr = localStorage.getItem('ioio_user');
      if (activeStr) {
        const activeU = JSON.parse(activeStr);
        const actPhone = (activeU.phone || '').trim().replace(/\s+/g, '');
        const actEmail = (activeU.email || '').trim().toLowerCase();
        if (
          (rawUserId && activeU.id === rawUserId) ||
          (cleanPhone && cleanPhone !== '99110000' && actPhone === cleanPhone) ||
          (cleanEmail && actEmail === cleanEmail)
        ) {
          if (typeof activeU.walletBalance === 'number') {
            currentBalance = Math.max(currentBalance, activeU.walletBalance);
          }
          if (activeU.id) matchingDocIds.add(activeU.id);
        }
      }
    } catch (e) {}

    // C. Check Firestore documents by rawUserId
    if (rawUserId) {
      try {
        const snap = await getDoc(doc(db, 'users', rawUserId));
        if (snap.exists()) {
          const d = snap.data();
          if (d) {
            if (typeof d.walletBalance === 'number') {
              currentBalance = Math.max(currentBalance, d.walletBalance);
            }
            if (!targetUser) targetUser = { ...d, id: snap.id } as UserDetail;
          }
        }
      } catch (e) {}
    }

    // D. If cleanPhone exists, query Firestore by phone
    if (cleanPhone && cleanPhone !== '99110000') {
      try {
        const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone), limit(3));
        const phoneSnaps = await getDocs(qPhone);
        phoneSnaps.forEach((docSnap) => {
          matchingDocIds.add(docSnap.id);
          const d = docSnap.data();
          if (typeof d.walletBalance === 'number') {
            currentBalance = Math.max(currentBalance, d.walletBalance);
          }
          if (!targetUser) targetUser = { ...d, id: docSnap.id } as UserDetail;
        });
      } catch (e) {}
    }

    // E. Query Firestore by email
    if (cleanEmail) {
      try {
        const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(3));
        const emailSnaps = await getDocs(qEmail);
        emailSnaps.forEach((docSnap) => {
          matchingDocIds.add(docSnap.id);
          const d = docSnap.data();
          if (typeof d.walletBalance === 'number') {
            currentBalance = Math.max(currentBalance, d.walletBalance);
          }
          if (!targetUser) targetUser = { ...d, id: docSnap.id } as UserDetail;
        });
      } catch (e) {}
    }

    // 4. Calculate new balance and extended package expiry
    const newBalance = currentBalance + cleanAmount;

    let baseDate = new Date();
    if (
      targetUser &&
      (targetUser.packageType === 'anime' || targetUser.packageType === 'full_vip') &&
      targetUser.packageExpiry &&
      targetUser.packageExpiry !== '-' &&
      targetUser.packageExpiry !== 'Идэвхгүй'
    ) {
      const currentExp = new Date(targetUser.packageExpiry.replace(/\./g, '-').replace(/\//g, '-'));
      if (!isNaN(currentExp.getTime()) && currentExp.getTime() > Date.now()) {
        baseDate = currentExp;
      }
    }
    baseDate.setDate(baseDate.getDate() + durationDays);
    const expiryStr = baseDate.toISOString().split('T')[0];

    const resolvedRole = (cleanEmail === 'tamir91441299@gmail.com' || cleanPhone === '91441299') ? 'admin' : (targetUser?.role || 'user');
    const resolvedPackage = targetUser?.packageType === 'full_vip' ? 'full_vip' : 'anime';
    const primaryId = rawUserId || targetUser?.id || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);

    const updatedUserDetail: UserDetail = {
      ...(targetUser || {}),
      id: primaryId,
      name: req.userName || targetUser?.name || 'Хэрэглэгч',
      email: cleanEmail || targetUser?.email || (cleanPhone ? `${cleanPhone}@flicknime.mn` : ''),
      phone: cleanPhone || targetUser?.phone || '',
      registeredAt: targetUser?.registeredAt || new Date().toLocaleString('mn-MN'),
      registeredTimestamp: targetUser?.registeredTimestamp || Date.now(),
      role: resolvedRole,
      status: 'active',
      packageType: resolvedPackage,
      packageExpiry: expiryStr,
      walletBalance: newBalance,
      lastLogin: targetUser?.lastLogin || 'Идэвхтэй одоо',
      watchedCount: targetUser?.watchedCount ?? 0,
      favoriteCount: targetUser?.favoriteCount ?? 0,
      isMockUser: false,
    };

    // 5. Write to ALL matching Firestore document IDs so onSnapshot always triggers!
    matchingDocIds.add(primaryId);
    for (const docId of matchingDocIds) {
      if (!docId) continue;
      try {
        await setDoc(
          doc(db, 'users', docId),
          {
            id: docId,
            name: updatedUserDetail.name,
            phone: updatedUserDetail.phone,
            email: updatedUserDetail.email,
            role: updatedUserDetail.role,
            status: 'active',
            packageType: resolvedPackage,
            packageExpiry: expiryStr,
            walletBalance: newBalance,
            updatedAt: new Date().toISOString(),
            lastTopUpAmount: cleanAmount,
            lastTopUpAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`Firestore setDoc users/${docId} error:`, err);
      }
    }

    // 6. Update local storage list
    let updatedList = list.filter((u) => {
      if (!u) return false;
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uId = (u.id || '').trim();
      return !(
        (primaryId && uId === primaryId) ||
        (cleanPhone && cleanPhone !== '99110000' && uPhone && uPhone === cleanPhone) ||
        (cleanEmail && uEmail && uEmail === cleanEmail)
      );
    });
    updatedList.unshift(updatedUserDetail);
    updatedList = sortUsersByNewest(deduplicateUserList(updatedList));
    localStorage.setItem('ioio_registered_users_list', JSON.stringify(updatedList));

    // 7. Update current active session ONLY if it matches the recharge recipient
    let isActiveUser = false;
    try {
      const activeStr = localStorage.getItem('ioio_user');
      if (activeStr) {
        const activeU = JSON.parse(activeStr);
        const actPhone = (activeU.phone || '').trim().replace(/\s+/g, '');
        const actEmail = (activeU.email || '').trim().toLowerCase();
        if (
          matchingDocIds.has(activeU.id) ||
          (cleanPhone && cleanPhone !== '99110000' && actPhone === cleanPhone && activeU.id === primaryId) ||
          (cleanEmail && actEmail === cleanEmail && activeU.id === primaryId)
        ) {
          isActiveUser = true;
          activeU.walletBalance = newBalance;
          activeU.packageType = resolvedPackage;
          activeU.packageExpiry = expiryStr;
          activeU.status = 'active';
          persistActiveSession(activeU, true);
          localStorage.setItem('ioio_balance', String(newBalance));
        }
      }
    } catch (e) {}

    // 8. Clear pending recharge blocks in LocalStorage
    try {
      const reqsStr = localStorage.getItem('ioio_recharge_requests');
      if (reqsStr) {
        const listReqs = JSON.parse(reqsStr);
        if (Array.isArray(listReqs)) {
          let ch = false;
          listReqs.forEach((r) => {
            const rPhone = (r.userPhone || '').trim().replace(/\s+/g, '');
            const rEmail = (r.userEmail || '').trim().toLowerCase();
            if (
              (r.userId && matchingDocIds.has(r.userId)) ||
              (cleanPhone && cleanPhone !== '99110000' && rPhone === cleanPhone) ||
              (cleanEmail && rEmail === cleanEmail)
            ) {
              if (r.status === 'pending') {
                r.status = 'approved';
                r.processedAt = new Date().toISOString();
                r.processedBy = adminName;
                ch = true;
              }
            }
          });
          if (ch) {
            localStorage.setItem('ioio_recharge_requests', JSON.stringify(listReqs));
          }
        }
      }
    } catch (e) {}

    // 9. Dispatch custom events
    try {
      window.dispatchEvent(new CustomEvent('ioio_users_updated', { detail: updatedList }));
      window.dispatchEvent(new CustomEvent('ioio_balance_updated', {
        detail: {
          newBalance,
          userId: primaryId,
          phone: cleanPhone,
          email: cleanEmail,
          isActiveUser
        }
      }));
    } catch (e) {}

    // 10. Broadcast admin notification
    await sendAdminNotification({
      type: 'TOP_UP_REQUEST',
      title: '🎉 Данс амжилттай цэнэглэгдлээ',
      message: `${updatedUserDetail.name} (${cleanPhone || cleanEmail})-д +${cleanAmount.toLocaleString()}₮ ОНОО орлоо. Шинэ үлдэгдэл: ${newBalance.toLocaleString()}₮. Анимэ эрх дуусах: ${expiryStr}.`,
      userName: updatedUserDetail.name,
      userEmail: updatedUserDetail.email,
      userPhone: updatedUserDetail.phone,
    });

    return {
      success: true,
      newBalance,
      expiryDate: expiryStr,
      targetUser: updatedUserDetail,
      message: `✓ ${updatedUserDetail.name} хэрэглэгчид +${cleanAmount.toLocaleString()}₮ ОНОО амжилттай орлоо! Нийт үлдэгдэл: ${newBalance.toLocaleString()}₮ (Анимэ эрх: ${expiryStr} хүртэл).`,
    };
  } catch (err: any) {
    console.error('Error in approveAndCreditRechargeRequest:', err);
    return {
      success: false,
      newBalance: 0,
      expiryDate: '',
      message: '⚠️ Алдаа гарлаа: ' + (err?.message || 'Дахин оролдоно уу'),
    };
  }
}

/**
 * Authoritative admin action to grant anime package access to any user.
 * Directly updates packageType to 'anime', computes expiry date,
 * persists to Firestore, updates local caches, and notifies user in real-time.
 */
export async function grantAnimeAccessToUser(
  userId: string,
  durationDays: number,
  customExpiryDate?: string
): Promise<{ success: boolean; expiryDate: string; user?: UserDetail; message: string }> {
  try {
    let expiryStr: string;

    if (customExpiryDate && customExpiryDate.trim() && customExpiryDate !== '-') {
      expiryStr = customExpiryDate.trim();
    } else {
      let baseDate = new Date();
      // Try to read current package expiry if already active to extend seamlessly
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      if (savedListStr) {
        try {
          const list: UserDetail[] = JSON.parse(savedListStr);
          const current = list.find((u) => u.id === userId);
          if (
            current?.packageExpiry &&
            current.packageExpiry !== '-' &&
            current.packageExpiry !== 'Идэвхгүй' &&
            !isNaN(new Date(current.packageExpiry).getTime())
          ) {
            const exp = new Date(current.packageExpiry);
            if (exp.getTime() > Date.now()) {
              baseDate = exp;
            }
          }
        } catch {}
      }

      baseDate.setDate(baseDate.getDate() + durationDays);
      expiryStr = baseDate.toISOString().split('T')[0];
    }

    // 1. Update Firestore document
    const docRef = doc(db, 'users', userId);
    await setDoc(
      docRef,
      {
        packageType: 'anime',
        packageExpiry: expiryStr,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. Update local storage users list
    let updatedUser: UserDetail | undefined;
    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
      if (Array.isArray(list)) {
        list = list.map((u) => {
          if (u.id === userId) {
            updatedUser = {
              ...u,
              packageType: 'anime',
              packageExpiry: expiryStr,
            };
            return updatedUser;
          }
          return u;
        });
        localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));
      }
    } catch {}

    // 3. If target user is the currently logged-in user in this session, update session
    try {
      const activeStr = localStorage.getItem('ioio_user');
      if (activeStr) {
        const activeU = JSON.parse(activeStr);
        if (activeU.id === userId) {
          activeU.packageType = 'anime';
          activeU.packageExpiry = expiryStr;
          persistActiveSession(activeU, true);
        }
      }
    } catch {}

    // 4. Send admin broadcast notification
    await sendAdminNotification({
      type: 'PACKAGE_PURCHASE',
      title: '🎌 Анимэ эрх амжилттай олгогдлоо',
      message: `${updatedUser?.name || 'Хэрэглэгч'} (${updatedUser?.phone || updatedUser?.email || userId})-д Анимэ үзэх эрх (${durationDays} хоног) олгогдлоо. Дуусах: ${expiryStr}`,
      userName: updatedUser?.name,
      userEmail: updatedUser?.email,
      userPhone: updatedUser?.phone,
    });

    return {
      success: true,
      expiryDate: expiryStr,
      user: updatedUser,
      message: `✓ ${updatedUser?.name || 'Хэрэглэгч'}-д ${durationDays} хоногийн Анимэ эрх амжилттай олгогдлоо! (Дуусах: ${expiryStr})`,
    };
  } catch (err: any) {
    console.error('Error granting anime access:', err);
    return {
      success: false,
      expiryDate: '',
      message: '⚠️ Алдаа гарлаа: ' + (err?.message || 'Дахин оролдоно уу'),
    };
  }
}

/**
 * Revoke user package and return to Free tier
 */
export async function revokeUserPackage(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    await safeFirestoreWrite(() =>
      setDoc(
        docRef,
        {
          packageType: 'free',
          packageExpiry: '-',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    );

    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
      if (Array.isArray(list)) {
        list = list.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              packageType: 'free',
              packageExpiry: '-',
            };
          }
          return u;
        });
        localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));
      }
    } catch {}

    return true;
  } catch {
    return false;
  }
}

/**
 * Save or update user in Firestore "users" collection
 */
export async function saveUserToFirestore(
  user: UserAccount | UserDetail,
  extraData?: Partial<UserDetail>
): Promise<void> {
  try {
    const rawId = (user.id || (user.email ? user.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'usr_' + Date.now())).trim();
    const docRef = doc(db, 'users', rawId);

    const nowTimestamp = Date.now();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const cleanPhone = (user.phone || '').trim().replace(/\s+/g, '');

    // Check existing record from local storage to avoid erasing balance or active packages
    let existingRecord: UserDetail | undefined;
    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      const list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
      if (Array.isArray(list)) {
        existingRecord = list.find((u) => u && (
          (rawId && u.id === rawId) ||
          (cleanEmail && !cleanEmail.endsWith('@flicknime.mn') && u.email && u.email.toLowerCase() === cleanEmail) ||
          (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        ));
      }
    } catch {}

    // Resolve Wallet Balance: respect 0 balance for newly registered users
    const resolvedBalance = typeof extraData?.walletBalance === 'number'
      ? extraData.walletBalance
      : typeof (user as UserDetail).walletBalance === 'number'
      ? (user as UserDetail).walletBalance
      : (existingRecord?.walletBalance ?? 0);

    const resolvedPackage = extraData?.packageType
      ? extraData.packageType
      : ((user as UserDetail).packageType && (user as UserDetail).packageType !== 'free')
      ? (user as UserDetail).packageType
      : (existingRecord?.packageType || (user as UserDetail).packageType || 'free');

    const resolvedExpiry = extraData?.packageExpiry
      ? extraData.packageExpiry
      : ((user as UserDetail).packageExpiry && (user as UserDetail).packageExpiry !== '-' && (user as UserDetail).packageExpiry !== 'Идэвхгүй')
      ? (user as UserDetail).packageExpiry
      : (existingRecord?.packageExpiry || (user as UserDetail).packageExpiry || 'Идэвхгүй');

    const userPayload: UserDetail = {
      id: rawId,
      name: user.name || existingRecord?.name || 'Хэрэглэгч',
      email: cleanEmail || existingRecord?.email || '',
      phone: cleanPhone || existingRecord?.phone || '',
      registeredAt: user.registeredAt || existingRecord?.registeredAt || new Date().toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      registeredTimestamp: (user as UserDetail).registeredTimestamp || existingRecord?.registeredTimestamp || nowTimestamp,
      role: (cleanEmail === 'tamir91441299@gmail.com' || cleanPhone === '91441299') ? 'admin' : (user as UserDetail).role || existingRecord?.role || 'user',
      status: (user as UserDetail).status || existingRecord?.status || 'active',
      packageType: resolvedPackage,
      packageExpiry: resolvedExpiry,
      walletBalance: resolvedBalance,
      lastLogin: (user as UserDetail).lastLogin || new Date().toLocaleString('mn-MN'),
      watchedCount: Math.max((user as UserDetail).watchedCount ?? 0, existingRecord?.watchedCount ?? 0),
      favoriteCount: Math.max((user as UserDetail).favoriteCount ?? 0, existingRecord?.favoriteCount ?? 0),
      isMockUser: false,
      ...extraData,
    };

    // Immediately persist into local storage registered users list so admin sees new user right away
    let currentList: UserDetail[] = [];
    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
      if (!Array.isArray(list)) list = [];

      const existingIndex = list.findIndex(
        (u) => u && (u.id === rawId || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) || (cleanPhone && cleanPhone !== '99110000' && u.phone === cleanPhone))
      );
      const isNew = existingIndex < 0;

      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...userPayload };
      } else {
        list.unshift(userPayload);
      }

      list = sortUsersByNewest(deduplicateUserList(list));
      currentList = list;
      localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));

      // 1. Immediately notify current window via CustomEvent
      try {
        window.dispatchEvent(new CustomEvent('ioio_users_updated', { detail: list }));
      } catch {}

      // 2. Immediately notify other tabs/windows via BroadcastChannel
      try {
        usersSyncChannel?.postMessage({ type: 'USERS_UPDATED', users: list, newUser: isNew ? userPayload : null });
      } catch {}

      // 3. Send real-time notification to Firebase & Admin Toast if new user
      if (isNew) {
        try {
          window.dispatchEvent(new CustomEvent('ioio_new_user_registered', { detail: userPayload }));
        } catch {}

        sendAdminNotification({
          type: 'NEW_USER',
          title: '🎉 Шинэ хэрэглэгч бүртгэгдлээ',
          message: `${userPayload.name} (${userPayload.phone || userPayload.email}) системд шинээр бүртгэгдлээ.`,
          userName: userPayload.name,
          userEmail: userPayload.email,
          userPhone: userPayload.phone,
        });
      }
    } catch (e) {
      console.error('Error updating local registered users list:', e);
    }

    // 4. Background sync with Server REST API
    try {
      fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      }).catch((e) => console.warn('Server user sync error (non-fatal):', e));
    } catch {}

    // 5. Write primary doc to Firestore with quota protection
    await safeFirestoreWrite(() => setDoc(docRef, userPayload, { merge: true }));

    // 6. If phone exists, also alias under user_phone_{cleanPhone} so phone-based lookups are instantaneous
    if (!isFirestoreQuotaExceeded() && cleanPhone && cleanPhone !== '99110000' && rawId !== `user_phone_${cleanPhone}`) {
      try {
        await safeFirestoreWrite(() => setDoc(doc(db, 'users', `user_phone_${cleanPhone}`), userPayload, { merge: true }));
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

/**
 * Real-time listener for all users in Firestore "users" collection with server & local fallbacks
 */
export function subscribeUsersFromFirestore(callback: (users: UserDetail[]) => void) {
  let isUnsubscribed = false;

  const emitMerged = (firestoreList: UserDetail[], serverList: UserDetail[]) => {
    if (isUnsubscribed) return;
    const rawList: UserDetail[] = [];

    // 1. High-authority Firestore docs
    firestoreList.forEach((u) => rawList.push({ ...u, isMockUser: false }));

    // 2. High-authority Server docs
    serverList.forEach((u) => rawList.push({ ...u, isMockUser: false }));

    // Local storage registered users list (clean bots out)
    try {
      const savedList = localStorage.getItem('ioio_registered_users_list');
      if (savedList) {
        const parsed: UserDetail[] = JSON.parse(savedList);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (u && !isBotOrMockUser(u)) rawList.push({ ...u, isMockUser: false });
          });
        }
      }
    } catch (e) {}

    // 4. Current user in active session
    try {
      const savedUser = localStorage.getItem('ioio_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && (u.email || u.id || u.phone) && !isBotOrMockUser(u)) {
          const uId = u.id || (u.email ? u.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'usr_active');
          rawList.push({
            id: uId,
            name: u.name || 'Хэрэглэгч',
            email: u.email || '',
            phone: u.phone || '',
            registeredAt: u.registeredAt || new Date().toLocaleString('mn-MN'),
            registeredTimestamp: u.registeredTimestamp || Date.now(),
            role: (u.email === 'tamir91441299@gmail.com' || u.phone === '91441299') ? 'admin' : (u.role || 'user'),
            status: u.status || 'active',
            packageType: u.packageType || 'free',
            packageExpiry: u.packageExpiry || 'Идэвхгүй',
            walletBalance: typeof u.walletBalance === 'number' ? u.walletBalance : 0,
            lastLogin: 'Идэвхтэй одоо',
            watchedCount: 1,
            favoriteCount: 0,
            isMockUser: false,
          });
        }
      }
    } catch (e) {}

    const deduplicated = deduplicateUserList(rawList);
    const sorted = sortUsersByNewest(deduplicated);
    callback(sorted);
  };

  try {
    let latestFirestoreList: UserDetail[] = [];
    let latestServerList: UserDetail[] = [];

    // Periodic Server Poller to guarantee cross-device registration sync
    const fetchServerUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            latestServerList = data.users.filter((u: any) => !isBotOrMockUser(u));
            emitMerged(latestFirestoreList, latestServerList);
          }
        }
      } catch (e) {}
    };

    fetchServerUsers();
    const serverInterval = setInterval(fetchServerUsers, 3500);

    // BroadcastChannel listener
    const handleBroadcast = (ev: MessageEvent) => {
      if (ev.data?.type === 'USERS_UPDATED' && Array.isArray(ev.data?.users)) {
        emitMerged(latestFirestoreList, ev.data.users.filter((u: any) => !isBotOrMockUser(u)));
      }
    };
    usersSyncChannel?.addEventListener('message', handleBroadcast);

    // Window event listener
    const handleWindowUsersUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        emitMerged(latestFirestoreList, e.detail.filter((u: any) => !isBotOrMockUser(u)));
      }
    };
    window.addEventListener('ioio_users_updated', handleWindowUsersUpdated);

    // Initial emit from local
    emitMerged([], []);

    if (isFirestoreQuotaExceeded()) {
      return () => {
        isUnsubscribed = true;
        clearInterval(serverInterval);
        usersSyncChannel?.removeEventListener('message', handleBroadcast);
        window.removeEventListener('ioio_users_updated', handleWindowUsersUpdated);
      };
    }

    const usersCol = collection(db, 'users');
    const unsubFirestore = onSnapshot(
      usersCol,
      (snapshot) => {
        const list: UserDetail[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as UserDetail;
          if (d && !isBotOrMockUser(d) && !isBotOrMockUser({ id: docSnap.id })) {
            list.push({
              ...d,
              id: docSnap.id || d.id,
              isMockUser: false,
            });
          }
        });
        latestFirestoreList = list;
        emitMerged(latestFirestoreList, latestServerList);
      },
      (err) => {
        if (isQuotaError(err)) {
          markFirestoreQuotaExceeded();
          console.warn('Firestore daily read quota reached for users, using local/server users.');
        } else {
          console.warn('Firestore users subscription warning:', err);
        }
        emitMerged([], latestServerList);
      }
    );

    return () => {
      isUnsubscribed = true;
      clearInterval(serverInterval);
      usersSyncChannel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('ioio_users_updated', handleWindowUsersUpdated);
      unsubFirestore();
    };
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('Firestore users subscription setup fallback:', err);
    callback([]);
    return () => {};
  }
}

/**
 * One-time fetch of all users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<UserDetail[]> {
  const getLocalUsers = () => {
    const rawList: UserDetail[] = [];
    try {
      const savedList = localStorage.getItem('ioio_registered_users_list');
      if (savedList) {
        const parsed: UserDetail[] = JSON.parse(savedList);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (u && !isBotOrMockUser(u)) rawList.push({ ...u, isMockUser: false });
          });
        }
      }
    } catch {}
    return sortUsersByNewest(deduplicateUserList(rawList));
  };

  if (isFirestoreQuotaExceeded()) {
    return getLocalUsers();
  }

  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const rawList: UserDetail[] = [];

    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as UserDetail;
      if (d && !isBotOrMockUser(d) && !isBotOrMockUser({ id: docSnap.id })) {
        rawList.push({
          ...d,
          id: docSnap.id || d.id,
          isMockUser: false,
        });
      }
    });

    try {
      const savedList = localStorage.getItem('ioio_registered_users_list');
      if (savedList) {
        const parsed: UserDetail[] = JSON.parse(savedList);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (u && !isBotOrMockUser(u)) rawList.push({ ...u, isMockUser: false });
          });
        }
      }
    } catch {}

    return sortUsersByNewest(deduplicateUserList(rawList));
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('Firestore users fetch warning, using local list:', err);
    return getLocalUsers();
  }
}

/**
 * Delete a user from Firestore, REST Server, and LocalStorage permanently
 */
export async function deleteUserFromFirestoreAndServer(userId: string): Promise<boolean> {
  try {
    const cleanId = (userId || '').trim();
    if (!cleanId) return false;

    // 1. Remove from Firestore
    try {
      await deleteDoc(doc(db, 'users', cleanId));
    } catch (e) {
      console.warn(`Firestore deleteDoc failed for ${cleanId}:`, e);
    }

    // 2. Remove from Server
    try {
      await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanId }),
      });
    } catch (e) {
      console.warn(`Server user delete failed for ${cleanId}:`, e);
    }

    // 3. Remove from LocalStorage
    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      if (savedListStr) {
        const list: UserDetail[] = JSON.parse(savedListStr);
        if (Array.isArray(list)) {
          const updated = list.filter((u) => u && u.id !== cleanId && u.phone !== cleanId && u.email !== cleanId);
          localStorage.setItem('ioio_registered_users_list', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('ioio_users_updated', { detail: updated }));
        }
      }
    } catch (e) {}

    return true;
  } catch (err) {
    console.error('Error in deleteUserFromFirestoreAndServer:', err);
    return false;
  }
}

/**
 * Remove all mock and bot users from Firestore, server, and local storage
 */
export async function cleanupAllBotUsers(): Promise<{ deletedCount: number; message: string }> {
  let deletedCount = 0;

  // 1. Scan and delete all bot docs from Firestore
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as UserDetail;
      if (isBotOrMockUser(data) || isBotOrMockUser({ id: docSnap.id })) {
        try {
          await deleteDoc(doc(db, 'users', docSnap.id));
          deletedCount++;
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Firestore bot cleanup warning:', err);
  }

  // 2. Delete bot records on server
  try {
    await fetch('/api/users/cleanup-bots', { method: 'POST' }).catch(() => {});
  } catch (e) {}

  // 3. Clean local storage
  try {
    const savedListStr = localStorage.getItem('ioio_registered_users_list');
    if (savedListStr) {
      const list: UserDetail[] = JSON.parse(savedListStr);
      if (Array.isArray(list)) {
        const filtered = list.filter((u) => !isBotOrMockUser(u));
        localStorage.setItem('ioio_registered_users_list', JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('ioio_users_updated', { detail: filtered }));
      }
    }
  } catch (e) {}

  return {
    deletedCount,
    message: `Бүх бот болон туршилтын хэрэглэгчдийг амжилттай устгаж цэвэрлэлээ. (${deletedCount} бот устгагдсан)`,
  };
}

/**
 * Save user credentials to both Firestore and LocalStorage for permanent persistence
 */
export async function saveUserAuthRecord(record: {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}): Promise<void> {
  const cleanEmail = (record.email || '').trim().toLowerCase();
  const cleanPhone = (record.phone || '').trim().replace(/\s+/g, '');
  const cleanId = record.id || (cleanEmail ? cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_') : 'usr_' + Date.now());

  // 1. Save to localStorage auth records
  try {
    const existingStr = localStorage.getItem('ioio_user_auth_records');
    const credMap = existingStr ? JSON.parse(existingStr) : {};
    const entryData = {
      id: cleanId,
      name: record.name,
      email: cleanEmail,
      phone: cleanPhone,
      password: record.password || '',
      updatedAt: new Date().toISOString(),
    };
    if (cleanEmail) credMap[cleanEmail] = entryData;
    if (cleanPhone) credMap[cleanPhone] = entryData;
    localStorage.setItem('ioio_user_auth_records', JSON.stringify(credMap));

    // Save last saved account info for fast-fill / auto-login
    localStorage.setItem('ioio_last_account_info', JSON.stringify({
      name: record.name,
      email: cleanEmail,
      phone: cleanPhone,
    }));
  } catch (e) {
    console.error('Error saving credentials to localStorage:', e);
  }

  // 2. Save securely to Firestore `users` document with quota fallback
  try {
    const docRef = doc(db, 'users', cleanId);
    await safeFirestoreWrite(() =>
      setDoc(
        docRef,
        {
          id: cleanId,
          name: record.name,
          email: cleanEmail,
          phone: cleanPhone,
          password: record.password || '',
          lastLogin: new Date().toLocaleString('mn-MN'),
        },
        { merge: true }
      )
    );
  } catch (err) {
    console.error('Error saving auth record to Firestore users:', err);
  }
}

/**
 * Authenticate user by Phone or Email from Firestore and LocalStorage
 */
export async function authenticateUserCredentials(
  identifier: string,
  inputPassword?: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const clean = identifier.trim();
  const cleanLower = clean.toLowerCase();
  const cleanPhone = clean.replace(/\s+/g, '');
  const isPhone = /^[0-9]{6,12}$/.test(cleanPhone);
  const password = inputPassword ? inputPassword.trim() : '';

  // Special Admin Shortcut
  const isAdmin = cleanPhone === '91441299' || cleanLower === 'tamir91441299@gmail.com';
  if (isAdmin) {
    const adminUser: UserAccount = {
      id: 'usr_admin_tamir',
      name: 'Тамир (Админ)',
      email: 'tamir91441299@gmail.com',
      phone: '91441299',
      registeredAt: '2026-01-01',
      role: 'admin',
      status: 'active',
      packageType: 'full_vip',
      packageExpiry: '2030-01-01',
      walletBalance: 999999,
      purchasedMovies: [],
    };
    persistActiveSession(adminUser, true);
    return { success: true, user: adminUser };
  }

  // 1. Query Firestore `users` collection first for authoritative account state
  try {
    const usersCol = collection(db, 'users');
    let matchedDoc: any = null;

    if (isPhone) {
      const qPhone = query(usersCol, where('phone', '==', cleanPhone), limit(1));
      const snap = await getDocs(qPhone);
      if (!snap.empty) {
        matchedDoc = { ...snap.docs[0].data(), id: snap.docs[0].id };
      }
    }

    if (!matchedDoc && cleanLower.includes('@')) {
      const qEmail = query(usersCol, where('email', '==', cleanLower), limit(1));
      const snap = await getDocs(qEmail);
      if (!snap.empty) {
        matchedDoc = { ...snap.docs[0].data(), id: snap.docs[0].id };
      }
    }

    if (matchedDoc) {
      if (matchedDoc.password && password && matchedDoc.password !== password) {
        return { success: false, error: '⚠️ Нууц үг буруу байна. Шалгаад дахин оролдоно уу.' };
      }

      const bal = typeof matchedDoc.walletBalance === 'number' ? matchedDoc.walletBalance : 0;
      const userAcc: UserAccount = {
        id: matchedDoc.id || ('user_phone_' + cleanPhone),
        name: matchedDoc.name || 'Хэрэглэгч',
        email: matchedDoc.email || (isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower),
        phone: matchedDoc.phone || (isPhone ? cleanPhone : '99110000'),
        registeredAt: matchedDoc.registeredAt || new Date().toLocaleDateString('mn-MN'),
        role: matchedDoc.role || 'user',
        status: matchedDoc.status || 'active',
        packageType: matchedDoc.packageType || 'free',
        packageExpiry: matchedDoc.packageExpiry || '-',
        walletBalance: bal,
        purchasedMovies: matchedDoc.purchasedMovies || [],
      };

      // Save credentials locally for faster future auth
      saveUserAuthRecord({
        id: userAcc.id,
        name: userAcc.name,
        email: userAcc.email,
        phone: userAcc.phone,
        password: password || matchedDoc.password,
      });

      persistActiveSession(userAcc, true);
      try {
        localStorage.setItem('ioio_balance', String(bal));
      } catch {}
      return { success: true, user: userAcc };
    }
  } catch (err) {
    console.error('Error querying Firestore for user auth:', err);
  }

  // 1.5. Query Server /api/users for authoritative cross-device state
  try {
    const sRes = await fetch('/api/users');
    if (sRes.ok) {
      const sData = await sRes.json();
      if (sData.success && Array.isArray(sData.users)) {
        const foundServerUser = sData.users.find((u: any) => {
          if (!u || isBotOrMockUser(u)) return false;
          const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
          const uEmail = (u.email || '').trim().toLowerCase();
          return (
            (cleanPhone && cleanPhone.length >= 8 && uPhone === cleanPhone) ||
            (cleanLower && cleanLower.includes('@') && uEmail === cleanLower)
          );
        });
        if (foundServerUser) {
          const sBal = typeof foundServerUser.walletBalance === 'number' ? foundServerUser.walletBalance : 0;
          const userAcc: UserAccount = {
            id: foundServerUser.id || (isPhone ? 'user_phone_' + cleanPhone : 'user_' + Date.now()),
            name: foundServerUser.name || (isPhone ? `Хэрэглэгч (${cleanPhone})` : cleanLower.split('@')[0]),
            email: foundServerUser.email || (isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower),
            phone: foundServerUser.phone || (isPhone ? cleanPhone : ''),
            registeredAt: foundServerUser.registeredAt || new Date().toLocaleDateString('mn-MN'),
            registeredTimestamp: foundServerUser.registeredTimestamp || Date.now(),
            role: (foundServerUser.email === 'tamir91441299@gmail.com' || foundServerUser.phone === '91441299') ? 'admin' : (foundServerUser.role || 'user'),
            status: foundServerUser.status || 'active',
            packageType: foundServerUser.packageType || 'free',
            packageExpiry: foundServerUser.packageExpiry || '-',
            walletBalance: sBal,
            purchasedMovies: foundServerUser.purchasedMovies || [],
          };
          saveUserAuthRecord({
            id: userAcc.id,
            name: userAcc.name,
            email: userAcc.email,
            phone: userAcc.phone,
            password: password,
          });
          persistActiveSession(userAcc, true);
          try {
            localStorage.setItem('ioio_balance', String(sBal));
          } catch {}
          return { success: true, user: userAcc };
        }
      }
    }
  } catch (err) {
    console.warn('Server auth lookup warning:', err);
  }

  // 2. Check LocalStorage Auth Records as local fallback
  try {
    const credMapStr = localStorage.getItem('ioio_user_auth_records');
    if (credMapStr) {
      const credMap = JSON.parse(credMapStr);
      let found = (cleanLower && credMap[cleanLower]) || (cleanPhone && credMap[cleanPhone]);
      if (!found) {
        const entry = Object.values(credMap).find(
          (v: any) => v && ((cleanPhone && cleanPhone.length >= 8 && v.phone && v.phone.replace(/\s+/g, '') === cleanPhone) || (cleanLower && cleanLower.includes('@') && v.email && v.email.toLowerCase() === cleanLower))
        );
        if (entry) found = entry;
      }

      if (found) {
        if (found.password && password && found.password !== password) {
          return { success: false, error: '⚠️ Нууц үг буруу байна. Шалгаад дахин оруулна уу.' };
        }

        let currentBalance = 0;
        let currentPackage = found.packageType || 'free';
        let currentExpiry = found.packageExpiry || '-';
        try {
          const listStr = localStorage.getItem('ioio_registered_users_list');
          if (listStr) {
            const list: UserDetail[] = JSON.parse(listStr);
            const reg = list.find((u) => u && ((found.id && u.id === found.id) || (cleanLower && cleanLower.includes('@') && u.email && u.email.toLowerCase() === cleanLower) || (cleanPhone && cleanPhone.length >= 8 && u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)));
            if (reg) {
              if (typeof reg.walletBalance === 'number') currentBalance = reg.walletBalance;
              if (reg.packageType) currentPackage = reg.packageType;
              if (reg.packageExpiry) currentExpiry = reg.packageExpiry;
            }
          }
        } catch {}

        const userAcc: UserAccount = {
          id: found.id || (isPhone ? 'user_phone_' + cleanPhone : 'usr_' + Date.now()),
          name: found.name || (isPhone ? `Хэрэглэгч (${cleanPhone})` : cleanLower.split('@')[0]),
          email: found.email || (isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower),
          phone: found.phone || (isPhone ? cleanPhone : ''),
          registeredAt: found.registeredAt || new Date().toLocaleDateString('mn-MN'),
          role: found.role || 'user',
          status: found.status || 'active',
          packageType: currentPackage as any,
          packageExpiry: currentExpiry,
          walletBalance: currentBalance,
          purchasedMovies: found.purchasedMovies || [],
        };
        persistActiveSession(userAcc, true);
        try {
          localStorage.setItem('ioio_balance', String(currentBalance));
        } catch {}
        return { success: true, user: userAcc };
      }
    }
  } catch (e) {
    console.error('Error checking local auth records:', e);
  }

  // 3. Fallback: If not found in DB, allow seamless user experience if credentials provided
  const nowTs = Date.now();
  const fallbackEmail = isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower;
  const fallbackUser: UserAccount = {
    id: isPhone ? 'user_phone_' + cleanPhone : 'user_' + nowTs,
    name: isPhone ? `Хэрэглэгч (${cleanPhone})` : cleanLower.split('@')[0],
    email: fallbackEmail,
    phone: isPhone ? cleanPhone : '99110000',
    registeredAt: new Date().toLocaleString('mn-MN'),
    registeredTimestamp: nowTs,
    role: isAdmin ? 'admin' : 'user',
    status: 'active',
    packageType: isAdmin ? 'full_vip' : 'free',
    packageExpiry: isAdmin ? '2030-01-01' : '-',
    walletBalance: 0,
    purchasedMovies: [],
    isMockUser: false,
  };

  saveUserAuthRecord({
    id: fallbackUser.id,
    name: fallbackUser.name,
    email: fallbackUser.email,
    phone: fallbackUser.phone,
    password: password,
  });

  saveUserToFirestore(fallbackUser, {
    role: isAdmin ? 'admin' : 'user',
    status: 'active',
    packageType: isAdmin ? 'full_vip' : 'free',
    packageExpiry: isAdmin ? '2030-01-01' : '-',
    walletBalance: 0,
    purchasedMovies: [],
    registeredTimestamp: nowTs,
    isMockUser: false,
  });

  persistActiveSession(fallbackUser, true);
  return { success: true, user: fallbackUser };
}

/**
 * Real-time subscription to the current user's document in Firestore.
 * Listens across primary ID, phone number, and email queries to ensure
 * admin recharges, points updates, and package grants arrive immediately.
 */
export function subscribeUserAccount(
  userOrId: string | UserAccount,
  onUpdate: (user: UserAccount) => void
): () => void {
  let targetId = typeof userOrId === 'string' ? userOrId.trim() : ((userOrId as any).id || '').trim();
  let targetPhone = typeof userOrId === 'object' ? (userOrId as any).phone : '';
  let targetEmail = typeof userOrId === 'object' ? (userOrId as any).email : '';

  if (!targetPhone || !targetEmail) {
    try {
      const activeStr = localStorage.getItem('ioio_user');
      if (activeStr) {
        const u = JSON.parse(activeStr);
        if (!targetPhone && u.phone) targetPhone = u.phone;
        if (!targetEmail && u.email) targetEmail = u.email;
        if (!targetId && u.id) targetId = u.id;
      }
    } catch {}
  }

  const cleanPhone = (targetPhone || '').trim().replace(/\s+/g, '');
  const cleanEmail = (targetEmail || '').trim().toLowerCase();

  const unsubscribes: (() => void)[] = [];

  if (isFirestoreQuotaExceeded()) {
    return () => {};
  }

  const handleDocData = (data: any, docId: string) => {
    if (!data) return;
    const currentSession = getPersistedActiveSession();
    const updatedUser: UserAccount = {
      ...(currentSession || {}),
      id: targetId || docId,
      name: data.name || currentSession?.name || 'Хэрэглэгч',
      email: data.email || currentSession?.email || (cleanPhone ? `${cleanPhone}@flicknime.mn` : ''),
      phone: data.phone || currentSession?.phone || cleanPhone,
      registeredAt: data.registeredAt || currentSession?.registeredAt || new Date().toLocaleString('mn-MN'),
      role: (data.email === 'tamir91441299@gmail.com' || data.phone === '91441299') ? 'admin' : (data.role || currentSession?.role || 'user'),
      status: data.status || currentSession?.status || 'active',
      packageType: data.packageType || currentSession?.packageType || 'free',
      packageExpiry: data.packageExpiry || currentSession?.packageExpiry || '-',
      walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : 0,
      purchasedMovies: Array.isArray(data.purchasedMovies) ? data.purchasedMovies : (currentSession?.purchasedMovies || []),
    };

    const isCurrentSessionUser = currentSession && (
      currentSession.id === targetId ||
      currentSession.id === docId ||
      (cleanEmail && currentSession.email && currentSession.email.toLowerCase() === cleanEmail) ||
      (cleanPhone && cleanPhone !== '99110000' && currentSession.phone === cleanPhone)
    );

    if (isCurrentSessionUser) {
      // Check if actual values changed compared to currentSession to avoid infinite renders
      const hasChanged =
        currentSession.id !== updatedUser.id ||
        currentSession.walletBalance !== updatedUser.walletBalance ||
        currentSession.packageType !== updatedUser.packageType ||
        currentSession.packageExpiry !== updatedUser.packageExpiry ||
        currentSession.status !== updatedUser.status ||
        currentSession.role !== updatedUser.role ||
        currentSession.name !== updatedUser.name ||
        JSON.stringify(currentSession.purchasedMovies || []) !== JSON.stringify(updatedUser.purchasedMovies || []);

      if (hasChanged) {
        persistActiveSession(updatedUser, true);
        try {
          localStorage.setItem('ioio_balance', String(updatedUser.walletBalance ?? 0));
        } catch {}
        onUpdate(updatedUser);
      }
    }
  };

  // 1. If targetId exists, attach direct document listener only to prevent listener duplication
  if (targetId) {
    try {
      const userDocRef = doc(db, 'users', targetId);
      const unsub = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            handleDocData(docSnap.data(), docSnap.id);
          }
        },
        (err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
            markFirestoreQuotaExceeded();
          }
          console.warn('Doc subscription warning:', err);
        }
      );
      unsubscribes.push(unsub);
    } catch (e) {
      console.warn('Failed to listen to doc by ID:', e);
    }
  } else if (cleanPhone && cleanPhone !== '99110000') {
    // 2. Real-time phone query listener only if targetId not available
    try {
      const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone), limit(1));
      const unsub = onSnapshot(
        qPhone,
        (snapshot) => {
          snapshot.forEach((docSnap) => {
            if (docSnap.exists()) {
              handleDocData(docSnap.data(), docSnap.id);
            }
          });
        },
        (err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
            markFirestoreQuotaExceeded();
          }
          console.warn('Phone query subscription warning:', err);
        }
      );
      unsubscribes.push(unsub);
    } catch (e) {
      console.warn('Failed to listen to phone query:', e);
    }
  } else if (cleanEmail && cleanEmail.includes('@') && !cleanEmail.endsWith('@flicknime.mn')) {
    // 3. Real-time email query listener only if ID and phone not available
    try {
      const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
      const unsub = onSnapshot(
        qEmail,
        (snapshot) => {
          snapshot.forEach((docSnap) => {
            if (docSnap.exists()) {
              handleDocData(docSnap.data(), docSnap.id);
            }
          });
        },
        (err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
            markFirestoreQuotaExceeded();
          }
          console.warn('Email query subscription warning:', err);
        }
      );
      unsubscribes.push(unsub);
    } catch (e) {
      console.warn('Failed to listen to email query:', e);
    }
  }

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}

/**
 * Get active user session with deep fallback for 100% persistent login
 */
export function getPersistedActiveSession(): UserAccount | null {
  try {
    // 1. Primary session
    const primary = localStorage.getItem('ioio_user');
    if (primary) {
      const parsed = JSON.parse(primary);
      if (parsed && (parsed.email || parsed.phone || parsed.id)) {
        return parsed;
      }
    }

    // 2. Backup session key
    const backup = localStorage.getItem('ioio_active_session');
    if (backup) {
      const parsed = JSON.parse(backup);
      if (parsed && (parsed.email || parsed.phone || parsed.id)) {
        return parsed;
      }
    }

    // 3. Remembered user credentials
    const remembered = localStorage.getItem('ioio_remember_user');
    if (remembered) {
      const parsed = JSON.parse(remembered);
      if (parsed && (parsed.email || parsed.phone || parsed.id)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading persisted session:', e);
  }
  return null;
}

/**
 * Persist active session across tabs, refreshes and browser sessions
 */
export function persistActiveSession(user: UserAccount | null, rememberMe: boolean = true): void {
  try {
    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem('ioio_user', serialized);
      localStorage.setItem('ioio_active_session', serialized);
      if (rememberMe) {
        localStorage.setItem('ioio_remember_user', serialized);
      }
      localStorage.setItem('ioio_session_persist', 'true');
      localStorage.setItem('ioio_last_logged_time', String(Date.now()));
    } else {
      localStorage.removeItem('ioio_user');
      localStorage.removeItem('ioio_active_session');
      localStorage.removeItem('ioio_remember_user');
      localStorage.removeItem('ioio_session_persist');
    }
  } catch (e) {
    console.error('Error persisting active session:', e);
  }
}

/**
 * Get the last saved account info for fast-login suggestion
 */
export function getLastSavedAccount(): { name: string; email: string; phone: string } | null {
  try {
    const saved = localStorage.getItem('ioio_last_account_info');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

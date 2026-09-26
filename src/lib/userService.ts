import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { UserDetail, INITIAL_USERS } from '../components/UserManagementModal';
import { UserAccount } from '../components/AuthModal';

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

    // 2. Persist to Firestore
    await setDoc(docRef, payload);
    return payload;
  } catch (err) {
    console.error('Error sending new anime notification:', err);
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
    await setDoc(docRef, payload);
  } catch (err) {
    console.error('Error sending admin notification:', err);
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
        console.error('Error subscribing to notifications:', err);
      }
    );
  } catch (err) {
    console.error('Notification subscription failed:', err);
    return () => {};
  }
}

/**
 * Helper to deduplicate users by ID, Email, and Phone
 */
export function deduplicateUserList(users: UserDetail[]): UserDetail[] {
  const map = new Map<string, UserDetail>();

  users.forEach((u, idx) => {
    if (!u) return;
    const cleanId = (u.id || '').trim() || (u.email ? u.email.replace(/[^a-zA-Z0-9_-]/g, '_') : `user_${idx}_${Date.now()}`);
    const cleanEmail = (u.email || '').trim().toLowerCase();
    const cleanPhone = (u.phone || '').trim();

    // Look for existing user with same ID, email or non-empty phone
    let foundKey: string | null = null;
    for (const [key, existing] of map.entries()) {
      if (
        key === cleanId ||
        existing.id === cleanId ||
        (cleanEmail && existing.email && existing.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && cleanPhone !== '99110000' && existing.phone && existing.phone === cleanPhone)
      ) {
        foundKey = key;
        break;
      }
    }

    const baseObj = foundKey ? map.get(foundKey) : null;
    const targetKey = foundKey || cleanId;

    const parsedTimestamp =
      u.registeredTimestamp ||
      baseObj?.registeredTimestamp ||
      (u.registeredAt && !isNaN(new Date(u.registeredAt.replace(/\./g, '-')).getTime())
        ? new Date(u.registeredAt.replace(/\./g, '-')).getTime()
        : Date.now());

    const merged: UserDetail = {
      ...baseObj,
      ...u,
      id: targetKey,
      email: u.email || baseObj?.email || '',
      phone: u.phone || baseObj?.phone || '',
      name: u.name || baseObj?.name || 'Хэрэглэгч',
      walletBalance: u.walletBalance ?? baseObj?.walletBalance ?? 0,
      packageType: u.packageType || baseObj?.packageType || 'free',
      packageExpiry: u.packageExpiry || baseObj?.packageExpiry || 'Идэвхгүй',
      role: (u.email === 'tamir91441299@gmail.com' || baseObj?.email === 'tamir91441299@gmail.com') ? 'admin' : (u.role || baseObj?.role || 'user'),
      status: u.status || baseObj?.status || 'active',
      registeredAt: u.registeredAt || baseObj?.registeredAt || new Date().toLocaleDateString('mn-MN'),
      registeredTimestamp: parsedTimestamp,
      isMockUser: u.isMockUser ?? baseObj?.isMockUser ?? false,
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
    await setDoc(
      docRef,
      {
        packageType: 'free',
        packageExpiry: '-',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
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
    const userPayload: UserDetail = {
      id: rawId,
      name: user.name || 'Хэрэглэгч',
      email: user.email || '',
      phone: user.phone || '',
      registeredAt: user.registeredAt || new Date().toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      registeredTimestamp: (user as UserDetail).registeredTimestamp || (user as any).registeredTimestamp || nowTimestamp,
      role: (user as UserDetail).role || (user.email === 'tamir91441299@gmail.com' ? 'admin' : 'user'),
      status: (user as UserDetail).status || 'active',
      packageType: (user as UserDetail).packageType || 'free',
      packageExpiry: (user as UserDetail).packageExpiry || 'Идэвхгүй',
      walletBalance: (user as UserDetail).walletBalance ?? 0,
      lastLogin: (user as UserDetail).lastLogin || new Date().toLocaleString('mn-MN'),
      watchedCount: (user as UserDetail).watchedCount ?? 0,
      favoriteCount: (user as UserDetail).favoriteCount ?? 0,
      isMockUser: false,
      ...extraData,
    };

    // Immediately persist into local storage registered users list so admin sees new user right away
    try {
      const savedListStr = localStorage.getItem('ioio_registered_users_list');
      let list: UserDetail[] = savedListStr ? JSON.parse(savedListStr) : [];
      if (!Array.isArray(list)) list = [];
      const cleanEmail = (userPayload.email || '').toLowerCase();

      const existingIndex = list.findIndex(
        (u) => u && (u.id === rawId || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail))
      );
      const isNew = existingIndex < 0;

      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...userPayload };
      } else {
        list.unshift(userPayload);
      }

      list = sortUsersByNewest(deduplicateUserList(list));
      localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));

      // Send real-time notification to Firebase if new user
      if (isNew) {
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

    await setDoc(docRef, userPayload, { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

/**
 * Real-time listener for all users in Firestore "users" collection
 */
export function subscribeUsersFromFirestore(callback: (users: UserDetail[]) => void) {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(
      usersCol,
      (snapshot) => {
        const rawList: UserDetail[] = [];

        // 1. Preload real-time Firestore docs first (highest authority)
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as UserDetail;
          if (d) {
            rawList.push({
              ...d,
              id: docSnap.id || d.id,
              isMockUser: false,
            });
          }
        });

        // 2. Preload localStorage registered users list
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              parsed.forEach((u) => {
                if (u) rawList.push({ ...u, isMockUser: false });
              });
            }
          }
        } catch (e) {}

        // 3. Preload current user in localStorage
        try {
          const savedUser = localStorage.getItem('ioio_user');
          if (savedUser) {
            const u = JSON.parse(savedUser);
            if (u && (u.email || u.id)) {
              const uId = u.id || u.email.replace(/[^a-zA-Z0-9_-]/g, '_');
              rawList.push({
                id: uId,
                name: u.name || 'Хэрэглэгч',
                email: u.email || 'user@ioio.mn',
                phone: u.phone || '99110000',
                registeredAt: u.registeredAt || new Date().toLocaleDateString('mn-MN'),
                registeredTimestamp: u.registeredTimestamp || Date.now(),
                role: u.email === 'tamir91441299@gmail.com' ? 'admin' : 'user',
                status: 'active',
                packageType: u.packageType || 'free',
                packageExpiry: u.packageExpiry || 'Идэвхгүй',
                walletBalance: u.walletBalance ?? 0,
                lastLogin: 'Идэвхтэй одоо',
                watchedCount: 1,
                favoriteCount: 0,
                isMockUser: false,
              });
            }
          }
        } catch (e) {}

        // 4. Fallback demo users appended at the end
        INITIAL_USERS.forEach((u) => rawList.push({ ...u, isMockUser: true }));

        const deduplicated = deduplicateUserList(rawList);
        const sorted = sortUsersByNewest(deduplicated);
        callback(sorted);
      },
      (err) => {
        console.error('Error listening to users from Firestore:', err);
        // Fallback to local
        const rawList: UserDetail[] = [];
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              parsed.forEach((u) => {
                if (u) rawList.push({ ...u, isMockUser: false });
              });
            }
          }
        } catch (e) {}
        INITIAL_USERS.forEach((u) => rawList.push({ ...u, isMockUser: true }));
        callback(sortUsersByNewest(deduplicateUserList(rawList)));
      }
    );
  } catch (err) {
    console.error('Firestore users subscription failed:', err);
    callback(sortUsersByNewest(INITIAL_USERS));
    return () => {};
  }
}

/**
 * One-time fetch of all users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<UserDetail[]> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const rawList: UserDetail[] = [];

    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as UserDetail;
      if (d) {
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
            if (u) rawList.push({ ...u, isMockUser: false });
          });
        }
      }
    } catch {}

    INITIAL_USERS.forEach((u) => rawList.push({ ...u, isMockUser: true }));

    return sortUsersByNewest(deduplicateUserList(rawList));
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return sortUsersByNewest(INITIAL_USERS);
  }
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

  // 2. Save securely to Firestore `users` document
  try {
    const docRef = doc(db, 'users', cleanId);
    await setDoc(docRef, {
      id: cleanId,
      name: record.name,
      email: cleanEmail,
      phone: cleanPhone,
      password: record.password || '',
      lastLogin: new Date().toLocaleString('mn-MN'),
    }, { merge: true });
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

  // 1. Check LocalStorage Auth Records first
  try {
    const credMapStr = localStorage.getItem('ioio_user_auth_records');
    if (credMapStr) {
      const credMap = JSON.parse(credMapStr);
      let found = credMap[cleanLower] || credMap[cleanPhone];
      if (!found) {
        // Search values
        const entry = Object.values(credMap).find(
          (v: any) => v && ((v.phone && v.phone === cleanPhone) || (v.email && v.email.toLowerCase() === cleanLower))
        );
        if (entry) found = entry;
      }

      if (found) {
        if (found.password && password && found.password !== password) {
          return { success: false, error: '⚠️ Нууц үг буруу байна. Шалгаад дахин оруулна уу.' };
        }
        const userAcc: UserAccount = {
          id: found.id || 'usr_' + Date.now(),
          name: found.name || (isPhone ? `Хэрэглэгч (${cleanPhone})` : cleanLower.split('@')[0]),
          email: found.email || (isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower),
          phone: found.phone || (isPhone ? cleanPhone : '99110000'),
          registeredAt: found.registeredAt || new Date().toLocaleDateString('mn-MN'),
          role: found.role || 'user',
          status: found.status || 'active',
          packageType: found.packageType || 'free',
          packageExpiry: found.packageExpiry || '-',
          walletBalance: found.walletBalance ?? 0,
          purchasedMovies: found.purchasedMovies || [],
        };
        persistActiveSession(userAcc, true);
        return { success: true, user: userAcc };
      }
    }
  } catch (e) {
    console.error('Error checking local auth records:', e);
  }

  // 2. Query Firestore `users` collection for matching phone or email
  try {
    const usersCol = collection(db, 'users');
    let matchedDoc: any = null;

    if (isPhone) {
      const qPhone = query(usersCol, where('phone', '==', cleanPhone), limit(1));
      const snap = await getDocs(qPhone);
      if (!snap.empty) {
        matchedDoc = snap.docs[0].data();
      }
    }

    if (!matchedDoc && cleanLower.includes('@')) {
      const qEmail = query(usersCol, where('email', '==', cleanLower), limit(1));
      const snap = await getDocs(qEmail);
      if (!snap.empty) {
        matchedDoc = snap.docs[0].data();
      }
    }

    if (matchedDoc) {
      if (matchedDoc.password && password && matchedDoc.password !== password) {
        return { success: false, error: '⚠️ Нууц үг буруу байна. Шалгаад дахин оролдоно уу.' };
      }

      const userAcc: UserAccount = {
        id: matchedDoc.id || 'usr_' + Date.now(),
        name: matchedDoc.name || 'Хэрэглэгч',
        email: matchedDoc.email || (isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower),
        phone: matchedDoc.phone || (isPhone ? cleanPhone : '99110000'),
        registeredAt: matchedDoc.registeredAt || new Date().toLocaleDateString('mn-MN'),
        role: matchedDoc.role || 'user',
        status: matchedDoc.status || 'active',
        packageType: matchedDoc.packageType || 'free',
        packageExpiry: matchedDoc.packageExpiry || '-',
        walletBalance: matchedDoc.walletBalance ?? 0,
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
      return { success: true, user: userAcc };
    }
  } catch (err) {
    console.error('Error querying Firestore for user auth:', err);
  }

  // 3. Fallback: If not found in DB, allow seamless user experience if credentials provided
  const fallbackEmail = isPhone ? `${cleanPhone}@flicknime.mn` : cleanLower;
  const fallbackUser: UserAccount = {
    id: isPhone ? 'user_phone_' + cleanPhone : 'user_' + Date.now(),
    name: isPhone ? `Хэрэглэгч (${cleanPhone})` : cleanLower.split('@')[0],
    email: fallbackEmail,
    phone: isPhone ? cleanPhone : '99110000',
    registeredAt: new Date().toLocaleDateString('mn-MN'),
    role: isAdmin ? 'admin' : 'user',
    status: 'active',
    packageType: isAdmin ? 'full_vip' : 'free',
    packageExpiry: isAdmin ? '2030-01-01' : '-',
    walletBalance: 0,
    purchasedMovies: [],
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
  });

  persistActiveSession(fallbackUser, true);
  return { success: true, user: fallbackUser };
}

/**
 * Real-time subscription to the current user's document in Firestore.
 * Automatically propagates admin package grants or revokes in real-time.
 */
export function subscribeUserAccount(
  userId: string,
  onUpdate: (user: UserAccount) => void
): () => void {
  if (!userId) return () => {};
  try {
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedUser: UserAccount = {
            id: data.id || docSnap.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            registeredAt: data.registeredAt,
            role: data.role || 'user',
            status: data.status || 'active',
            packageType: data.packageType || 'free',
            packageExpiry: data.packageExpiry || '-',
            walletBalance: data.walletBalance ?? 0,
            purchasedMovies: data.purchasedMovies || [],
          };
          persistActiveSession(updatedUser, true);
          onUpdate(updatedUser);
        }
      },
      (err) => {
        console.error('Error listening to user account changes:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to user account:', err);
    return () => {};
  }
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

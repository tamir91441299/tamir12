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
  type: 'NEW_USER' | 'TOP_UP_REQUEST' | 'PACKAGE_PURCHASE';
  title: string;
  message: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt: string;
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
 * Subscribe to real-time notifications from Firestore
 */
export function subscribeNotificationsFromFirestore(callback: (notifications: AppNotification[]) => void) {
  try {
    const notifCol = collection(db, 'notifications');
    const q = query(notifCol, limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const notifs: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppNotification;
          if (data) notifs.push(data);
        });
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
      lastLogin: u.lastLogin || baseObj?.lastLogin || 'Идэвхтэй одоо',
      watchedCount: Math.max(u.watchedCount ?? 0, baseObj?.watchedCount ?? 0),
      favoriteCount: Math.max(u.favoriteCount ?? 0, baseObj?.favoriteCount ?? 0),
    };

    map.set(targetKey, merged);
  });

  return Array.from(map.values());
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

    const userPayload: UserDetail = {
      id: rawId,
      name: user.name || 'Хэрэглэгч',
      email: user.email || '',
      phone: user.phone || '',
      registeredAt: user.registeredAt || new Date().toLocaleDateString('mn-MN'),
      role: (user as UserDetail).role || (user.email === 'tamir91441299@gmail.com' ? 'admin' : 'user'),
      status: (user as UserDetail).status || 'active',
      packageType: (user as UserDetail).packageType || 'free',
      packageExpiry: (user as UserDetail).packageExpiry || 'Идэвхгүй',
      walletBalance: (user as UserDetail).walletBalance ?? 0,
      lastLogin: (user as UserDetail).lastLogin || new Date().toLocaleString('mn-MN'),
      watchedCount: (user as UserDetail).watchedCount ?? 0,
      favoriteCount: (user as UserDetail).favoriteCount ?? 0,
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

      list = deduplicateUserList(list);
      localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));

      // Send real-time notification to Firebase if new user
      if (isNew) {
        sendAdminNotification({
          type: 'NEW_USER',
          title: '🎉 Шинэ хэрэглэгч бүртгэгдлээ',
          message: `${userPayload.name} (${userPayload.email || userPayload.phone}) системд шинээр бүртгэгдлээ.`,
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

        // 1. Preload initial demo users
        INITIAL_USERS.forEach((u) => rawList.push(u));

        // 2. Preload localStorage registered users list
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              parsed.forEach((u) => {
                if (u) rawList.push(u);
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
                role: u.email === 'tamir91441299@gmail.com' ? 'admin' : 'user',
                status: 'active',
                packageType: 'free',
                packageExpiry: 'Идэвхгүй',
                walletBalance: 0,
                lastLogin: 'Идэвхтэй одоо',
                watchedCount: 1,
                favoriteCount: 0,
              });
            }
          }
        } catch (e) {}

        // 4. Merge with real-time Firestore docs
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as UserDetail;
          if (d) {
            rawList.push({
              ...d,
              id: docSnap.id || d.id,
            });
          }
        });

        const deduplicated = deduplicateUserList(rawList);
        callback(deduplicated);
      },
      (err) => {
        console.error('Error listening to users from Firestore:', err);
        // Fallback to local
        const rawList: UserDetail[] = [...INITIAL_USERS];
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              parsed.forEach((u) => {
                if (u) rawList.push(u);
              });
            }
          }
        } catch (e) {}
        callback(deduplicateUserList(rawList));
      }
    );
  } catch (err) {
    console.error('Firestore users subscription failed:', err);
    callback(INITIAL_USERS);
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
    const rawList: UserDetail[] = [...INITIAL_USERS];

    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as UserDetail;
      if (d) {
        rawList.push({
          ...d,
          id: docSnap.id || d.id,
        });
      }
    });

    return deduplicateUserList(rawList);
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return INITIAL_USERS;
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
          registeredAt: new Date().toLocaleDateString('mn-MN'),
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
  });

  persistActiveSession(fallbackUser, true);
  return { success: true, user: fallbackUser };
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

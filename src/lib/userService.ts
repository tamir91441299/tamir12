import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { UserDetail, INITIAL_USERS } from '../components/UserManagementModal';
import { UserAccount } from '../components/AuthModal';

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

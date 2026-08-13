import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserDetail, INITIAL_USERS } from '../components/UserManagementModal';
import { UserAccount } from '../components/AuthModal';

/**
 * Save or update user in Firestore "users" collection
 */
export async function saveUserToFirestore(
  user: UserAccount | UserDetail,
  extraData?: Partial<UserDetail>
): Promise<void> {
  try {
    const rawId = user.id || (user.email ? user.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'usr_' + Date.now());
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
      const idx = list.findIndex((u) => u.id === rawId || (u.email && userPayload.email && u.email === userPayload.email));
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...userPayload };
      } else {
        list = [userPayload, ...list];
      }
      localStorage.setItem('ioio_registered_users_list', JSON.stringify(list));
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
        const fetchedMap = new Map<string, UserDetail>();

        // 1. Preload initial demo users
        INITIAL_USERS.forEach((u) => fetchedMap.set(u.id, u));

        // 2. Preload localStorage registered users list
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            parsed.forEach((u) => {
              if (u && u.id) fetchedMap.set(u.id, u);
            });
          }
        } catch (e) {}

        // 3. Preload current user in localStorage
        try {
          const savedUser = localStorage.getItem('ioio_user');
          if (savedUser) {
            const u = JSON.parse(savedUser);
            if (u && (u.email || u.id)) {
              const uId = u.id || u.email.replace(/[^a-zA-Z0-9_-]/g, '_');
              if (!fetchedMap.has(uId)) {
                fetchedMap.set(uId, {
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
          }
        } catch (e) {}

        // 4. Override with real-time Firestore docs
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as UserDetail;
          if (d) {
            fetchedMap.set(docSnap.id, {
              ...d,
              id: docSnap.id,
            });
          }
        });

        const resultList = Array.from(fetchedMap.values());
        callback(resultList);
      },
      (err) => {
        console.error('Error listening to users from Firestore:', err);
        // Fallback to local
        const fetchedMap = new Map<string, UserDetail>();
        INITIAL_USERS.forEach((u) => fetchedMap.set(u.id, u));
        try {
          const savedList = localStorage.getItem('ioio_registered_users_list');
          if (savedList) {
            const parsed: UserDetail[] = JSON.parse(savedList);
            parsed.forEach((u) => {
              if (u && u.id) fetchedMap.set(u.id, u);
            });
          }
        } catch (e) {}
        callback(Array.from(fetchedMap.values()));
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
    const fetchedMap = new Map<string, UserDetail>();

    INITIAL_USERS.forEach((u) => fetchedMap.set(u.id, u));

    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as UserDetail;
      fetchedMap.set(docSnap.id, {
        ...d,
        id: docSnap.id,
      });
    });

    return Array.from(fetchedMap.values());
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return INITIAL_USERS;
  }
}

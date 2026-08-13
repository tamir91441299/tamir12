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

    const userPayload: Partial<UserDetail> = {
      id: rawId,
      name: user.name || 'Хэрэглэгч',
      email: user.email || '',
      phone: user.phone || '',
      registeredAt: user.registeredAt || new Date().toLocaleDateString('mn-MN'),
      role: (user as UserDetail).role || (user.email === 'tamir91441299@gmail.com' ? 'admin' : 'user'),
      status: (user as UserDetail).status || 'active',
      packageType: (user as UserDetail).packageType || 'free',
      packageExpiry: (user as UserDetail).packageExpiry || 'Идэвхгүй',
      walletBalance: (user as UserDetail).walletBalance ?? 5000,
      lastLogin: (user as UserDetail).lastLogin || new Date().toLocaleString('mn-MN'),
      watchedCount: (user as UserDetail).watchedCount ?? 0,
      favoriteCount: (user as UserDetail).favoriteCount ?? 0,
      ...extraData,
    };

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

        // Preload initial static users
        INITIAL_USERS.forEach((u) => fetchedMap.set(u.id, u));

        // Override/append Firestore users
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as UserDetail;
          fetchedMap.set(docSnap.id, {
            ...d,
            id: docSnap.id,
          });
        });

        const resultList = Array.from(fetchedMap.values());
        callback(resultList);
      },
      (err) => {
        console.error('Error listening to users from Firestore:', err);
        callback(INITIAL_USERS);
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

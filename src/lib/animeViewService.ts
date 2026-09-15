import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { UserAccount } from '../components/AuthModal';

export interface AnimeWatcher {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  avatarUrl?: string;
  episodeNumber: number;
  watchedAt: number; // timestamp ms
  formattedTime: string;
  userRole?: string;
  packageType?: string;
}

// Realistic initial watcher community seed so every anime shows authentic viewer history immediately
const SEED_VIEWER_NAMES = [
  { name: 'Тамир (Админ)', role: 'admin', phone: '9144****', packageType: 'full_vip', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' },
  { name: 'Бат-Эрдэнэ', role: 'user', phone: '9911****', packageType: 'anime', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' },
  { name: 'Анужин М.', role: 'user', phone: '8812****', packageType: 'full_vip', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
  { name: 'Төгөлдөр', role: 'user', phone: '9588****', packageType: 'free', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  { name: 'Цэнгүүн Б.', role: 'user', phone: '8090****', packageType: 'anime', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
  { name: 'Тэмүүлэн О.', role: 'user', phone: '9923****', packageType: 'free', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
  { name: 'Номин-Эрдэнэ', role: 'user', phone: '8901****', packageType: 'full_vip', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
  { name: 'Эрхэмбаяр', role: 'user', phone: '9199****', packageType: 'anime', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80' },
  { name: 'Саруул Т.', role: 'user', phone: '8877****', packageType: 'free', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80' },
  { name: 'Ананд Х.', role: 'user', phone: '9444****', packageType: 'anime', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80' },
];

export function getInitialSeedWatchers(movieId: string): AnimeWatcher[] {
  const now = Date.now();
  // Generate deterministic pseudo-random seed based on movieId
  let hash = 0;
  for (let i = 0; i < movieId.length; i++) {
    hash = (hash << 5) - hash + movieId.charCodeAt(i);
    hash |= 0;
  }
  const count = 5 + (Math.abs(hash) % 5); // 5 to 9 initial watchers

  const watchers: AnimeWatcher[] = [];
  for (let i = 0; i < count; i++) {
    const person = SEED_VIEWER_NAMES[(Math.abs(hash) + i) % SEED_VIEWER_NAMES.length];
    const minutesAgo = (i + 1) * 18 + (Math.abs(hash) % 45);
    const timeMs = now - minutesAgo * 60 * 1000;
    const epNum = i === 0 ? 1 : (i % 3 === 0 ? 1 : (i % 6) + 1);

    watchers.push({
      id: `seed_${movieId}_${i}`,
      movieId,
      userId: `seed_user_${i}`,
      userName: person.name,
      userPhone: person.phone,
      userRole: person.role,
      packageType: person.packageType,
      avatarUrl: person.avatar,
      episodeNumber: epNum,
      watchedAt: timeMs,
      formattedTime: minutesAgo < 60 ? `${minutesAgo} минутын өмнө` : `${Math.floor(minutesAgo / 60)} цагийн өмнө`,
    });
  }

  return watchers;
}

/**
 * Record user watching an anime episode into Firestore and localStorage
 */
export async function recordAnimeView(
  movieId: string,
  user: UserAccount | null,
  episodeNumber: number = 1
) {
  if (!movieId) return;

  const now = Date.now();
  const userId = user?.id || (user?.phone ? `u_phone_${user.phone}` : 'guest_viewer');
  const userName = user?.name || (user?.phone ? `Хэрэглэгч (${user.phone.slice(0, 4)}****)` : 'Зочин хэрэглэгч');
  const phone = user?.phone ? `${user.phone.slice(0, 4)}****` : '';
  const email = user?.email || '';
  const packageType = (user as any)?.packageType || 'free';
  const role = user?.email === 'tamir91441299@gmail.com' ? 'admin' : ((user as any)?.role || 'user');

  const formattedTime = 'Яг одоо';
  const viewRecord: AnimeWatcher = {
    id: `view_${movieId}_${userId}`,
    movieId,
    userId,
    userName,
    userPhone: phone,
    userEmail: email,
    avatarUrl: (user as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    episodeNumber,
    watchedAt: now,
    formattedTime,
    userRole: role,
    packageType,
  };

  // 1. Update localStorage cache immediately
  try {
    const storageKey = `ioio_anime_watchers_${movieId}`;
    const cached = localStorage.getItem(storageKey);
    let list: AnimeWatcher[] = cached ? JSON.parse(cached) : [];
    // Remove if already in list
    list = list.filter((w) => w.userId !== userId);
    list.unshift(viewRecord);
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 50)));

    // Increment overall total views count in localStorage
    const viewsKey = `ioio_anime_total_views_${movieId}`;
    const currentViews = parseInt(localStorage.getItem(viewsKey) || '0', 10);
    localStorage.setItem(viewsKey, String(currentViews + 1));
  } catch (e) {
    console.error('Error saving local anime view:', e);
  }

  // 2. Persist to Firestore "anime_views" collection
  try {
    const docId = `view_${movieId}_${userId}`;
    const docRef = doc(db, 'anime_views', docId);
    await setDoc(docRef, {
      movieId,
      userId,
      userName,
      userPhone: phone,
      userEmail: email,
      episodeNumber,
      watchedAt: now,
      formattedTime: new Date().toLocaleString('mn-MN'),
      userRole: role,
      packageType,
    }, { merge: true });
  } catch (err) {
    // Firestore might be offline, cached state already works
    console.warn('Firestore anime view record failed (using local cache):', err);
  }
}

/**
 * Subscribe to anime watchers in real-time
 */
export function subscribeAnimeWatchers(
  movieId: string,
  baseViewsCount: number,
  callback: (watchers: AnimeWatcher[], totalCount: number) => void
) {
  if (!movieId) return () => {};

  const storageKey = `ioio_anime_watchers_${movieId}`;
  const seedWatchers = getInitialSeedWatchers(movieId);

  // Load from local cache first
  let localList: AnimeWatcher[] = [];
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      localList = JSON.parse(cached);
    }
  } catch {}

  // Merge local and seed
  const initialMergedMap = new Map<string, AnimeWatcher>();
  [...localList, ...seedWatchers].forEach((w) => {
    if (!initialMergedMap.has(w.userId)) {
      initialMergedMap.set(w.userId, w);
    }
  });
  const initialWatchers = Array.from(initialMergedMap.values()).sort((a, b) => b.watchedAt - a.watchedAt);
  const extraLocalViews = parseInt(localStorage.getItem(`ioio_anime_total_views_${movieId}`) || '0', 10);
  callback(initialWatchers, baseViewsCount + extraLocalViews + initialWatchers.length);

  // Real-time Firestore subscription
  try {
    const viewsCol = collection(db, 'anime_views');
    const q = query(viewsCol, where('movieId', '==', movieId), limit(60));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreList: AnimeWatcher[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            firestoreList.push({
              id: docSnap.id,
              movieId: data.movieId || movieId,
              userId: data.userId || docSnap.id,
              userName: data.userName || 'Хэрэглэгч',
              userPhone: data.userPhone || '',
              userEmail: data.userEmail || '',
              avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              episodeNumber: data.episodeNumber || 1,
              watchedAt: data.watchedAt || Date.now(),
              formattedTime: data.formattedTime || 'Сүүлд үзсэн',
              userRole: data.userRole || 'user',
              packageType: data.packageType || 'free',
            });
          }
        });

        const mergedMap = new Map<string, AnimeWatcher>();
        [...firestoreList, ...localList, ...seedWatchers].forEach((w) => {
          if (!mergedMap.has(w.userId)) {
            mergedMap.set(w.userId, w);
          }
        });

        const finalWatchers = Array.from(mergedMap.values()).sort((a, b) => b.watchedAt - a.watchedAt);
        const totalCalculated = Math.max(
          baseViewsCount + finalWatchers.length,
          finalWatchers.length
        );

        callback(finalWatchers, totalCalculated);
      },
      (error) => {
        console.warn('Anime viewers subscription error (fallback active):', error);
      }
    );
  } catch (err) {
    console.warn('Could not establish Firestore subscription for anime views:', err);
    return () => {};
  }
}

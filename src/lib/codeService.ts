import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { ONE_PIECE_PROMO_CODES } from '../codes';

export interface PromoCode {
  id: string;
  code: string;
  type: 'full_vip' | 'anime' | 'movie' | 'points';
  value?: number; // e.g. 5000
  durationDays?: number; // e.g. 30
  description: string;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  type?: 'full_vip' | 'anime' | 'movie' | 'points';
  pointsAdded?: number;
  durationDays?: number;
}

export const INITIAL_PRESET_CODES: PromoCode[] = [
  {
    id: 'promo_vip2025',
    code: 'VIP2025',
    type: 'full_vip',
    durationDays: 30,
    description: '👑 VIP Бүтэн Багц (Бүх кино + анимэ) 30 хоног',
    maxUses: 500,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_anime30',
    code: 'ANIME30',
    type: 'anime',
    durationDays: 30,
    description: '🎌 Бүх анимэ цуврал үзэх 30 хоногийн багц',
    maxUses: 500,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_movie30',
    code: 'MOVIE30',
    type: 'movie',
    durationDays: 30,
    description: '🎬 Бүх уран сайхны кино үзэх 30 хоногийн багц',
    maxUses: 500,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_suirel',
    code: 'SUIREL2025',
    type: 'movie',
    durationDays: 30,
    description: '🌍 "Дэлхийн Сүйрэл" 1 ангит кино болон 30 хоногийн кино багц',
    maxUses: 1000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_delhii',
    code: 'DELHII',
    type: 'movie',
    durationDays: 30,
    description: '💥 "Дэлхийн Сүйрэл" 1 ангит кино үзэх кодын эрх',
    maxUses: 1000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_suirel_short',
    code: 'SUIREL',
    type: 'movie',
    durationDays: 30,
    description: '🎬 "Дэлхийн Сүйрэл" бүрэн кино үзэх шууд код',
    maxUses: 1000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  ...ONE_PIECE_PROMO_CODES,
];

const LOCAL_STORAGE_CODES_KEY = 'ioio_promo_codes_list';

/**
 * Get all codes (Created by Admin in Firestore / LocalStorage)
 */
export function getAllPromoCodes(): PromoCode[] {
  const codeMap = new Map<string, PromoCode>();

  // Always seed initial preset codes
  INITIAL_PRESET_CODES.forEach((c) => {
    if (c && c.code) {
      codeMap.set(c.code.toUpperCase(), c);
    }
  });

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CODES_KEY);
    if (saved) {
      const parsed: PromoCode[] = JSON.parse(saved);
      parsed.forEach((c) => {
        if (c && c.code) {
          codeMap.set(c.code.toUpperCase(), c);
        }
      });
    }
  } catch (e) {
    console.error('Error loading promo codes from localStorage:', e);
  }

  return Array.from(codeMap.values());
}

/**
 * Save custom code to LocalStorage & Firestore
 */
export async function savePromoCode(codeData: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount'> & { id?: string }): Promise<PromoCode> {
  const codeUpper = codeData.code.trim().toUpperCase();
  const id = codeData.id || 'promo_' + codeUpper.replace(/[^A-Z0-9]/g, '_') + '_' + Date.now();
  const newCode: PromoCode = {
    id,
    code: codeUpper,
    type: codeData.type,
    value: codeData.value || (codeData.type === 'points' ? 5000 : 0),
    durationDays: codeData.durationDays || 30,
    description: codeData.description || `${codeUpper} Эрхийн Код`,
    maxUses: codeData.maxUses || 100,
    usedCount: 0,
    createdAt: new Date().toLocaleDateString('mn-MN'),
    createdBy: codeData.createdBy || 'Admin',
    isActive: codeData.isActive !== false,
  };

  try {
    const existing = getAllPromoCodes();
    const filtered = existing.filter((c) => c.code.toUpperCase() !== codeUpper);
    const updated = [newCode, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(updated));

    // Save to Firestore "promo_codes" collection
    const docRef = doc(db, 'promo_codes', newCode.id);
    await setDoc(docRef, newCode, { merge: true });
  } catch (err) {
    console.error('Error saving promo code to Firestore:', err);
  }

  return newCode;
}

/**
 * Delete custom code
 */
export async function deletePromoCode(codeId: string): Promise<void> {
  try {
    const existing = getAllPromoCodes();
    const updated = existing.filter((c) => c.id !== codeId && c.code !== codeId);
    localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(updated));

    const docRef = doc(db, 'promo_codes', codeId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting promo code:', err);
  }
}

/**
 * Real-time listener for promo codes in Firestore
 */
export function subscribePromoCodesFromFirestore(callback: (codes: PromoCode[]) => void) {
  try {
    const colRef = collection(db, 'promo_codes');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const codeMap = new Map<string, PromoCode>();
        INITIAL_PRESET_CODES.forEach((c) => codeMap.set(c.code.toUpperCase(), c));

        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as PromoCode;
          if (d && d.code) {
            codeMap.set(d.code.toUpperCase(), { ...d, id: docSnap.id });
          }
        });

        const list = Array.from(codeMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(list));
        } catch (e) {}
        callback(list);
      },
      () => {
        callback(getAllPromoCodes());
      }
    );
  } catch (err) {
    console.error('Failed to subscribe promo codes:', err);
    callback(getAllPromoCodes());
    return () => {};
  }
}

/**
 * Validate and Redeem any promo / activation / voucher code created by Admin
 */
export function redeemCode(inputCode: string): RedeemResult {
  if (!inputCode || !inputCode.trim()) {
    return { success: false, message: 'Эрхийн кодоо оруулна уу.' };
  }

  const clean = inputCode.trim().toUpperCase().replace(/\s+/g, '');

  if (clean.includes('MEGALO')) {
    return {
      success: false,
      message: '⚠️ Уг багцын код хүчингүй болсон байна. Багцын эрхээ албан ёсны төлбөрийн цэсээр идэвхжүүлнэ үү.',
    };
  }

  // Check Codes from Firestore / LocalStorage created by Admin
  const allCodes = getAllPromoCodes();
  const matched = allCodes.find(
    (c) => c.code.toUpperCase() === clean || c.code.toUpperCase().replace(/-/g, '') === clean.replace(/-/g, '')
  );

  if (matched) {
    if (!matched.isActive) {
      return { success: false, message: '⚠️ Энэ код идэвхгүй болсон байна.' };
    }
    if (matched.maxUses && matched.usedCount >= matched.maxUses) {
      return { success: false, message: '⚠️ Энэ кодын ашиглах дээд хязгаар дууссан байна.' };
    }

    if (matched.type === 'full_vip') {
      return {
        success: true,
        type: 'full_vip',
        durationDays: matched.durationDays || 30,
        message: `👑 ${matched.description || 'VIP Бүтэн Багц'} амжилттай идэвхжлээ!`,
      };
    } else if (matched.type === 'anime') {
      return {
        success: true,
        type: 'anime',
        durationDays: matched.durationDays || 30,
        message: `🎌 ${matched.description || 'Анимэ Багц'} амжилттай идэвхжлээ!`,
      };
    } else if (matched.type === 'movie') {
      return {
        success: true,
        type: 'movie',
        durationDays: matched.durationDays || 30,
        message: `🎬 ${matched.description || 'Кино Багц'} амжилттай идэвхжлээ!`,
      };
    } else if (matched.type === 'points') {
      const pts = matched.value || 5000;
      return {
        success: true,
        type: 'points',
        pointsAdded: pts,
        message: `💰 +${pts.toLocaleString()} оноо таны хэтэвчинд нэмэгдлээ!`,
      };
    }
  }

  return {
    success: false,
    message: '⚠️ Хүчингүй код байна! Админаас авсан албан ёсны эрхийн кодоо шалгана уу.',
  };
}

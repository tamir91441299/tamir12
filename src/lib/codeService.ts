import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeFirestoreWrite, isFirestoreQuotaExceeded, markFirestoreQuotaExceeded, isQuotaError } from './quotaService';

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
  // Single-user targeted fields:
  isSingleUserOnly?: boolean;
  targetUserId?: string; // Target user's id or 5-digit custom ID
  targetUserPhone?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  usedByUserId?: string;
  usedByUserName?: string;
  usedAt?: string;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  type?: 'full_vip' | 'anime' | 'movie' | 'points';
  pointsAdded?: number;
  durationDays?: number;
  matchedCode?: PromoCode;
}

export const INITIAL_PRESET_CODES: PromoCode[] = [
  {
    id: 'preset_bonus2500',
    code: 'BONUS2500',
    type: 'points',
    value: 2500,
    durationDays: 15,
    description: '🎁 +2,500 ₮ Бэлгийн оноо (15 хоногийн эрх)',
    maxUses: 9999,
    usedCount: 0,
    createdAt: '2026-10-16',
    createdBy: 'Админ',
    isActive: true,
  },
  {
    id: 'preset_free5000',
    code: 'FREE5000',
    type: 'points',
    value: 5000,
    durationDays: 30,
    description: '🎉 +5,000 ₮ Урамшууллын оноо (1 сарын эрх)',
    maxUses: 9999,
    usedCount: 0,
    createdAt: '2026-10-16',
    createdBy: 'Админ',
    isActive: true,
  },
  {
    id: 'preset_nova2025',
    code: 'NOVA2025',
    type: 'points',
    value: 5000,
    durationDays: 30,
    description: '🌟 +5,000 ₮ Шинэ гишүүний бэлгийн оноо',
    maxUses: 9999,
    usedCount: 0,
    createdAt: '2026-10-16',
    createdBy: 'Админ',
    isActive: true,
  },
  {
    id: 'preset_vip2025',
    code: 'VIP2025',
    type: 'full_vip',
    durationDays: 365,
    description: '👑 1 Жилийн Бүтэн VIP Эрх (Бүх кино+анимэ)',
    maxUses: 500,
    usedCount: 0,
    createdAt: '2026-10-16',
    createdBy: 'Админ',
    isActive: true,
  },
  {
    id: 'preset_korra',
    code: 'KORRA',
    type: 'anime',
    durationDays: 30,
    description: '🌊 Коррагийн Домог анимэ 30 хоногийн эрх',
    maxUses: 1000,
    usedCount: 0,
    createdAt: '2026-10-16',
    createdBy: 'Админ',
    isActive: true,
  },
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
    maxUses: codeData.isSingleUserOnly ? 1 : (codeData.maxUses || 100),
    usedCount: 0,
    createdAt: new Date().toLocaleDateString('mn-MN'),
    createdBy: codeData.createdBy || 'Admin',
    isActive: codeData.isActive !== false,
    isSingleUserOnly: !!codeData.isSingleUserOnly,
    targetUserId: codeData.targetUserId?.trim() || undefined,
    targetUserPhone: codeData.targetUserPhone?.trim() || undefined,
    targetUserEmail: codeData.targetUserEmail?.trim().toLowerCase() || undefined,
    targetUserName: codeData.targetUserName?.trim() || undefined,
    usedByUserId: codeData.usedByUserId,
    usedByUserName: codeData.usedByUserName,
    usedAt: codeData.usedAt,
  };

  try {
    const existing = getAllPromoCodes();
    const filtered = existing.filter((c) => c.code.toUpperCase() !== codeUpper);
    const updated = [newCode, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(updated));

    // Save to Firestore "promo_codes" collection with quota protection
    const docRef = doc(db, 'promo_codes', newCode.id);
    await safeFirestoreWrite(() => setDoc(docRef, newCode, { merge: true }));
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
    await safeFirestoreWrite(() => deleteDoc(docRef));
  } catch (err) {
    console.error('Error deleting promo code:', err);
  }
}

/**
 * Real-time listener for promo codes in Firestore
 */
export function subscribePromoCodesFromFirestore(callback: (codes: PromoCode[]) => void) {
  // Always emit initial local codes first
  callback(getAllPromoCodes());

  if (isFirestoreQuotaExceeded()) {
    return () => {};
  }

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
      (err) => {
        if (isQuotaError(err)) {
          markFirestoreQuotaExceeded();
          console.warn('Promo codes subscription quota reached, using local codes.');
        } else {
          console.warn('Promo codes subscription warning, using local codes:', err);
        }
        callback(getAllPromoCodes());
      }
    );
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    } else {
      console.warn('Failed to subscribe promo codes, using local codes:', err);
    }
    callback(getAllPromoCodes());
    return () => {};
  }
}

/**
 * Validate and Redeem any promo / activation / voucher code created by Admin.
 * Supports targeting specific users (single-user exclusive code).
 */
export function redeemCode(
  inputCode: string,
  currentUser?: { id?: string; customId?: string; phone?: string; email?: string; name?: string } | null
): RedeemResult {
  if (!inputCode || !inputCode.trim()) {
    return { success: false, message: 'Эрхийн кодоо оруулна уу.' };
  }

  const clean = inputCode.trim().toUpperCase().replace(/\s+/g, '');

  // Check Codes from Firestore / LocalStorage created by Admin
  const allCodes = getAllPromoCodes();
  const matched = allCodes.find(
    (c) => c.code.toUpperCase() === clean || c.code.toUpperCase().replace(/-/g, '') === clean.replace(/-/g, '')
  );

  if (matched) {
    if (!matched.isActive) {
      return { success: false, message: '⚠️ Энэ код ашиглагдсан эсвэл идэвхгүй болсон байна.' };
    }

    // Check Single-User Targeting
    if (matched.isSingleUserOnly || matched.targetUserId || matched.targetUserPhone || matched.targetUserEmail) {
      if (!currentUser) {
        return {
          success: false,
          message: '⚠️ Энэ нь тусгай хувийн онооны код тул эхлээд өөрийн бүртгэлээр нэвтэрч байж ашиглана уу!',
        };
      }

      const cleanTargetId = (matched.targetUserId || '').trim().toLowerCase();
      const cleanTargetPhone = (matched.targetUserPhone || '').trim().replace(/\s+/g, '');
      const cleanTargetEmail = (matched.targetUserEmail || '').trim().toLowerCase();

      const userCurrentId = String(currentUser.id || '').trim().toLowerCase();
      const userCustomId = String(currentUser.customId || '').trim().toLowerCase();
      const userPhone = String(currentUser.phone || '').trim().replace(/\s+/g, '');
      const userEmail = String(currentUser.email || '').trim().toLowerCase();

      const isTargetMatch =
        (cleanTargetId && (userCurrentId === cleanTargetId || userCustomId === cleanTargetId)) ||
        (cleanTargetPhone && cleanTargetPhone.length >= 8 && userPhone === cleanTargetPhone) ||
        (cleanTargetEmail && cleanTargetEmail.includes('@') && userEmail === cleanTargetEmail);

      if (!isTargetMatch) {
        const ownerName = matched.targetUserName || (matched.targetUserPhone ? `дугаартай хэрэглэгч` : `тусгайлсан гишүүн`);
        return {
          success: false,
          message: `⛔ Энэ онооны код нь зөвхөн «${ownerName}»-д зориулагдсан хувийн код тул өөр хэрэглэгч ашиглах боломжгүй!`,
        };
      }
    }

    if (matched.maxUses && matched.usedCount >= matched.maxUses) {
      return { success: false, message: '⚠️ Энэ кодын ашиглах дээд хязгаар дууссан байна.' };
    }

    // Mark as used if single-user or single-use
    const isSingleUse = matched.isSingleUserOnly || (matched.maxUses && matched.maxUses === 1);
    if (isSingleUse) {
      const updatedCode: PromoCode = {
        ...matched,
        usedCount: (matched.usedCount || 0) + 1,
        isActive: false,
        usedByUserId: currentUser?.id || currentUser?.customId || 'unknown',
        usedByUserName: currentUser?.name || 'Хэрэглэгч',
        usedAt: new Date().toLocaleString('mn-MN'),
      };

      // Persist update
      try {
        const all = getAllPromoCodes().map((c) => (c.id === matched.id ? updatedCode : c));
        localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(all));
        const docRef = doc(db, 'promo_codes', matched.id);
        safeFirestoreWrite(() => setDoc(docRef, updatedCode, { merge: true })).catch(() => {});
      } catch (e) {}
    } else {
      // Increment used count
      const updatedCode: PromoCode = {
        ...matched,
        usedCount: (matched.usedCount || 0) + 1,
      };
      try {
        const all = getAllPromoCodes().map((c) => (c.id === matched.id ? updatedCode : c));
        localStorage.setItem(LOCAL_STORAGE_CODES_KEY, JSON.stringify(all));
        const docRef = doc(db, 'promo_codes', matched.id);
        safeFirestoreWrite(() => setDoc(docRef, updatedCode, { merge: true })).catch(() => {});
      } catch (e) {}
    }

    if (matched.type === 'full_vip') {
      return {
        success: true,
        type: 'full_vip',
        durationDays: matched.durationDays || 30,
        message: `👑 ${matched.description || 'VIP Бүтэн Багц'} амжилттай идэвхжлээ!`,
        matchedCode: matched,
      };
    } else if (matched.type === 'anime') {
      return {
        success: true,
        type: 'anime',
        durationDays: matched.durationDays || 30,
        message: `🎌 ${matched.description || 'Анимэ Багц'} амжилттай идэвхжлээ!`,
        matchedCode: matched,
      };
    } else if (matched.type === 'movie') {
      return {
        success: true,
        type: 'movie',
        durationDays: matched.durationDays || 30,
        message: `🎬 ${matched.description || 'Кино Багц'} амжилттай идэвхжлээ!`,
        matchedCode: matched,
      };
    } else if (matched.type === 'points') {
      const pts = matched.value || 5000;
      if (currentUser && (currentUser.id || currentUser.phone || currentUser.email)) {
        try {
          const targetId = currentUser.id || currentUser.phone || currentUser.email;
          const currentBal = typeof (currentUser as any).walletBalance === 'number' ? (currentUser as any).walletBalance : 0;
          fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: targetId,
              updates: {
                walletBalance: currentBal + pts,
                lastTopUpAmount: pts,
                lastTopUpAt: new Date().toISOString(),
              },
            }),
          }).catch(() => {});
        } catch {}
      }
      return {
        success: true,
        type: 'points',
        pointsAdded: pts,
        message: matched.isSingleUserOnly
          ? `🎉 Амжилттай! Зөвхөн танд зориулсан +${pts.toLocaleString()}₮ хувийн оноо хэтэвчинд тань нэмэгдлээ!`
          : `💰 +${pts.toLocaleString()} оноо таны хэтэвчинд амжилттай нэмэгдлээ!`,
        matchedCode: matched,
      };
    }
  }

  return {
    success: false,
    message: '⚠️ Хүчингүй код байна! Админаас авсан албан ёсны эрхийн кодоо шалгана уу.',
  };
}

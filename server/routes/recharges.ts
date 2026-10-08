import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { getServerDb } from '../lib/firestoreDb.ts';
import { readStoredUsers, writeStoredUsers } from './users.ts';

const router = Router();
const RECHARGES_FILE_PATH = path.join(process.cwd(), 'public', 'recharge_requests.json');

// In-memory Firestore cache and quota backoff
let lastFirestoreFetchTime = 0;
let cachedFirestoreRecharges: any[] = [];
let firestoreQuotaBlockedUntil = 0;

// Helper to safely read recharge requests from JSON file
export function readStoredRecharges(): any[] {
  try {
    if (fs.existsSync(RECHARGES_FILE_PATH)) {
      const content = fs.readFileSync(RECHARGES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error reading recharge_requests.json:', err);
  }
  return [];
}

// Helper to safely write recharge requests to JSON file
export function writeStoredRecharges(requests: any[]): void {
  try {
    fs.writeFileSync(RECHARGES_FILE_PATH, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing recharge_requests.json:', err);
  }
}

// Helper to parse timestamps safely
function getReqTimestamp(req: any): number {
  if (!req) return 0;
  if (req.timestamp?.seconds) return req.timestamp.seconds * 1000;
  if (req.createdAt) {
    const t = new Date(req.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

// GET /api/recharges - Fetch all recharge requests (JSON storage + throttled Firestore)
router.get('/', async (req: Request, res: Response) => {
  try {
    const localList = readStoredRecharges();
    const map = new Map<string, any>();

    localList.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    const now = Date.now();
    const db = getServerDb();

    // Only query Firestore if NOT blocked by quota and at least 60s has passed
    if (db && now > firestoreQuotaBlockedUntil && now - lastFirestoreFetchTime > 60000) {
      try {
        lastFirestoreFetchTime = now;
        const snap = await getDocs(collection(db, 'recharge_requests'));
        const firestoreList: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d) {
            const formatted = {
              ...d,
              id: docSnap.id,
              createdAt: d.createdAt || (d.timestamp?.seconds ? new Date(d.timestamp.seconds * 1000).toISOString() : new Date().toISOString()),
            };
            firestoreList.push(formatted);
          }
        });
        cachedFirestoreRecharges = firestoreList;
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('resource-exhausted')) {
          firestoreQuotaBlockedUntil = now + 300000; // 5 min backoff
          console.warn('Firestore daily read quota limit reached on /api/recharges. Using local file cache.');
        } else {
          console.warn('Firestore fetch warning on /api/recharges:', err?.message || err);
        }
      }
    }

    // Merge cached Firestore docs into map
    cachedFirestoreRecharges.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => getReqTimestamp(b) - getReqTimestamp(a));

    // Update local cache file
    writeStoredRecharges(merged);

    return res.json({ success: true, requests: merged, count: merged.length });
  } catch (err: any) {
    console.error('Error in GET /api/recharges:', err);
    const fallback = readStoredRecharges();
    return res.json({ success: true, requests: fallback, count: fallback.length });
  }
});

// POST /api/recharges/submit - Submit a new recharge request
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id || (!payload.userId && !payload.userPhone)) {
      return res.status(400).json({ success: false, error: 'Recharge request details required' });
    }

    const cleanAmount = Number(payload.amount) || 0;
    const cleanPhone = (payload.userPhone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (payload.userEmail || '').trim().toLowerCase();
    const cleanUserId = (payload.userId || '').trim();
    const cleanCustomId = (payload.customId || (cleanUserId.length === 5 ? cleanUserId : '')).trim();
    const cleanId = payload.id;

    const newReq = {
      id: cleanId,
      userId: cleanUserId,
      customId: cleanCustomId,
      userName: payload.userName || 'Хэрэглэгч',
      userPhone: cleanPhone,
      userEmail: cleanEmail,
      planId: payload.planId || '15d',
      planLabel: payload.planLabel || `${cleanAmount.toLocaleString()}₮ Оноо авах хүсэлт`,
      durationDays: Number(payload.durationDays) || 15,
      amount: cleanAmount,
      packageType: 'anime',
      method: payload.method || 'qpay',
      status: payload.status || 'pending',
      note: payload.note || '',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Update recharge requests JSON file
    const list = readStoredRecharges();
    const existingIndex = list.findIndex((r) => r.id === cleanId);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newReq };
    } else {
      list.unshift(newReq);
    }
    writeStoredRecharges(list);

    // 2. Ensure user is in registered_users.json immediately so Admin sees them in user list
    try {
      const users = readStoredUsers();
      const userIdx = users.findIndex((u) => {
        const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        const uId = String(u.id || '').trim();
        const uCustomId = String(u.customId || '').trim();
        return (
          (cleanUserId && (uId === cleanUserId || uCustomId === cleanUserId)) ||
          (cleanCustomId && (uCustomId === cleanCustomId || uId === cleanCustomId)) ||
          (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
          (cleanEmail && cleanEmail.includes('@') && uEmail === cleanEmail)
        );
      });

      if (userIdx < 0) {
        const primaryUserId = cleanCustomId || cleanUserId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);
        users.unshift({
          id: primaryUserId,
          customId: cleanCustomId || (primaryUserId.length === 5 ? primaryUserId : ''),
          name: newReq.userName,
          phone: cleanPhone,
          email: cleanEmail,
          role: (cleanEmail === 'batorgiltamir9@gmail.com') ? 'admin' : 'user',
          status: 'active',
          packageType: 'free',
          packageExpiry: '-',
          walletBalance: 0,
          registeredAt: new Date().toLocaleDateString('mn-MN'),
          registeredTimestamp: Date.now(),
          isMockUser: false,
          updatedAt: new Date().toISOString(),
        });
        writeStoredUsers(users);
      }
    } catch (e) {
      console.warn('Auto-register recharge user warning:', e);
    }

    // 3. Persist to Firestore asynchronously
    const db = getServerDb();
    if (db && Date.now() > firestoreQuotaBlockedUntil) {
      setDoc(doc(db, 'recharge_requests', cleanId), newReq, { merge: true }).catch((err) => {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota')) {
          firestoreQuotaBlockedUntil = Date.now() + 300000;
        }
      });
    }

    return res.json({
      success: true,
      request: newReq,
      message: 'Цэнэглэлтийн хүсэлт амжилттай бүртгэгдлээ.',
    });
  } catch (err: any) {
    console.error('Error submitting recharge request:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error submitting recharge' });
  }
});

// POST /api/recharges/approve - Admin approves a recharge request and credits user points & anime access
router.post('/approve', async (req: Request, res: Response) => {
  try {
    const { id, processedBy } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recharge request ID required' });
    }

    const list = readStoredRecharges();
    const idx = list.findIndex((r) => r.id === id);
    const adminName = processedBy || 'Админ';

    let targetReq = idx >= 0 ? list[idx] : null;

    // Check Firestore if not in local list
    const db = getServerDb();
    if (!targetReq && db && Date.now() > firestoreQuotaBlockedUntil) {
      try {
        const snap = await getDoc(doc(db, 'recharge_requests', id));
        if (snap.exists()) {
          targetReq = snap.data();
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota')) {
          firestoreQuotaBlockedUntil = Date.now() + 300000;
        }
      }
    }

    if (!targetReq) {
      return res.status(404).json({ success: false, error: 'Recharge request not found' });
    }

    // 1. Mark request as approved
    targetReq.status = 'approved';
    targetReq.processedAt = new Date().toISOString();
    targetReq.processedBy = adminName;
    targetReq.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      list[idx] = targetReq;
    } else {
      list.unshift(targetReq);
    }
    writeStoredRecharges(list);

    // 2. CRITICAL: Directly credit user's walletBalance and Anime package in registered_users.json!
    const cleanPhone = (targetReq.userPhone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (targetReq.userEmail || '').trim().toLowerCase();
    const cleanUserId = (targetReq.userId || '').trim();
    const cleanCustomId = (targetReq.customId || (cleanUserId.length === 5 ? cleanUserId : '')).trim();
    const amountToCredit = Math.max(0, Number(targetReq.amount) || 0);

    const durationDays = targetReq.durationDays || (
      targetReq.planId === '15d' ? 15 :
      targetReq.planId === '2m' ? 60 :
      targetReq.planId === '3m' ? 90 :
      targetReq.planId === '6m' ? 180 :
      targetReq.planId === '1y' ? 365 : 30
    );

    let users = readStoredUsers();
    let userIndex = users.findIndex((u) => {
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uId = String(u.id || '').trim();
      const uCustomId = String(u.customId || '').trim();
      return (
        (cleanUserId && (uId === cleanUserId || uCustomId === cleanUserId)) ||
        (cleanCustomId && (uCustomId === cleanCustomId || uId === cleanCustomId)) ||
        (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
        (cleanEmail && cleanEmail.includes('@') && uEmail === cleanEmail)
      );
    });

    let targetUser: any = null;

    // Calculate expiry date
    let baseDate = new Date();
    if (userIndex >= 0) {
      targetUser = users[userIndex];
      if (
        (targetUser.packageType === 'anime' || targetUser.packageType === 'full_vip') &&
        targetUser.packageExpiry &&
        targetUser.packageExpiry !== '-' &&
        targetUser.packageExpiry !== 'Идэвхгүй'
      ) {
        const exp = new Date(targetUser.packageExpiry.replace(/\./g, '-').replace(/\//g, '-'));
        if (!isNaN(exp.getTime()) && exp.getTime() > Date.now()) {
          baseDate = exp;
        }
      }
    }
    baseDate.setDate(baseDate.getDate() + durationDays);
    const newExpiryStr = baseDate.toISOString().split('T')[0];

    const currentBal = typeof targetUser?.walletBalance === 'number' ? targetUser.walletBalance : 0;
    const newBalance = currentBal + amountToCredit;

    if (userIndex >= 0) {
      users[userIndex] = {
        ...targetUser,
        walletBalance: newBalance,
        packageType: targetUser.packageType === 'full_vip' ? 'full_vip' : 'anime',
        packageExpiry: newExpiryStr,
        status: 'active',
        lastTopUpAmount: amountToCredit,
        lastTopUpAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      targetUser = users[userIndex];
    } else {
      // Auto-create user if not found
      const primaryId = cleanCustomId || cleanUserId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);
      targetUser = {
        id: primaryId,
        customId: cleanCustomId || (primaryId.length === 5 ? primaryId : ''),
        name: targetReq.userName || 'Хэрэглэгч',
        phone: cleanPhone,
        email: cleanEmail,
        role: (cleanEmail === 'batorgiltamir9@gmail.com') ? 'admin' : 'user',
        status: 'active',
        packageType: 'anime',
        packageExpiry: newExpiryStr,
        walletBalance: newBalance,
        registeredAt: new Date().toLocaleDateString('mn-MN'),
        registeredTimestamp: Date.now(),
        lastTopUpAmount: amountToCredit,
        lastTopUpAt: new Date().toISOString(),
        isMockUser: false,
        updatedAt: new Date().toISOString(),
      };
      users.unshift(targetUser);
    }

    writeStoredUsers(users);

    // 3. Persist to Firestore asynchronously
    if (db && Date.now() > firestoreQuotaBlockedUntil) {
      setDoc(
        doc(db, 'recharge_requests', id),
        {
          status: 'approved',
          processedAt: targetReq.processedAt,
          processedBy: adminName,
        },
        { merge: true }
      ).catch(() => {});

      if (targetUser && targetUser.id) {
        setDoc(
          doc(db, 'users', targetUser.id),
          {
            walletBalance: newBalance,
            packageType: targetUser.packageType,
            packageExpiry: newExpiryStr,
            status: 'active',
            lastTopUpAmount: amountToCredit,
            lastTopUpAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    }

    return res.json({
      success: true,
      request: targetReq,
      user: targetUser,
      newBalance,
      expiryDate: newExpiryStr,
      message: `✓ Хүсэлт амжилттай баталгаажиж, ${targetUser.name}-д +${amountToCredit.toLocaleString()}₮ оноо (Анимэ эрх: ${newExpiryStr} хүртэл) орлоо!`,
    });
  } catch (err: any) {
    console.error('Approve recharge error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Approve error' });
  }
});

// POST /api/recharges/reject - Admin rejects a recharge request
router.post('/reject', async (req: Request, res: Response) => {
  try {
    const { id, reason, processedBy } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recharge request ID required' });
    }

    const list = readStoredRecharges();
    const idx = list.findIndex((r) => r.id === id);
    const adminName = processedBy || 'Админ';

    let targetReq = idx >= 0 ? list[idx] : null;
    const db = getServerDb();
    if (!targetReq && db && Date.now() > firestoreQuotaBlockedUntil) {
      try {
        const snap = await getDoc(doc(db, 'recharge_requests', id));
        if (snap.exists()) targetReq = snap.data();
      } catch {}
    }

    if (!targetReq) {
      return res.status(404).json({ success: false, error: 'Recharge request not found' });
    }

    targetReq.status = 'rejected';
    targetReq.note = reason ? `${targetReq.note ? targetReq.note + ' | ' : ''}Цуцалсан шалтгаан: ${reason}` : targetReq.note;
    targetReq.processedAt = new Date().toISOString();
    targetReq.processedBy = adminName;
    targetReq.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      list[idx] = targetReq;
    } else {
      list.unshift(targetReq);
    }
    writeStoredRecharges(list);

    if (db && Date.now() > firestoreQuotaBlockedUntil) {
      setDoc(
        doc(db, 'recharge_requests', id),
        {
          status: 'rejected',
          note: targetReq.note,
          processedAt: targetReq.processedAt,
          processedBy: adminName,
        },
        { merge: true }
      ).catch(() => {});
    }

    return res.json({ success: true, request: targetReq, message: 'Хүсэлт цуцлагдлаа.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Reject error' });
  }
});

export default router;


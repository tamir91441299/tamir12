import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { getServerDb } from '../lib/firestoreDb.ts';

const router = Router();
const USERS_FILE_PATH = path.join(process.cwd(), 'public', 'registered_users.json');
const RECHARGES_FILE_PATH = path.join(process.cwd(), 'public', 'recharge_requests.json');

// In-memory Firestore cache and quota backoff to prevent burning Firestore read units
let lastFirestoreFetchTime = 0;
let cachedFirestoreUsers: any[] = [];
let firestoreQuotaBlockedUntil = 0;

// Helper to identify mock/sample bots
export function isBotUser(u: any): boolean {
  if (!u) return true;
  if (u.isMockUser === true) return true;
  const id = String(u.id || '').trim();
  const customId = String(u.customId || '').trim();
  const email = String(u.email || '').trim().toLowerCase();
  const name = String(u.name || '').trim();
  const phone = String(u.phone || '').trim().replace(/\s+/g, '');

  // Real users with valid phone or customId or real email are NEVER bots
  if (phone && phone.length >= 8 && phone !== '99110000') return false;
  if ((id && id.length === 5 && /^[A-Z0-9]{5}$/i.test(id)) || (customId && customId.length === 5)) return false;
  if (email && email.includes('@') && !email.includes('visitor_') && !email.includes('test_mock') && !email.includes('bot_')) return false;

  // Explicit mock/sample bot IDs
  if (['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005', 'usr_admin_tamir'].includes(id)) return true;
  if (id.startsWith('visitor_') || id.startsWith('test_mock_') || id.startsWith('bot_') || id.startsWith('mock_')) return true;

  // Bot / mock names
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes('mock_bot') ||
    lowerName.includes('test_bot') ||
    lowerName.includes('bot_user')
  ) return true;

  const botEmails = ['admin@ioio.mn'];
  if (botEmails.includes(email)) return true;
  if (email.includes('visitor_') || email.includes('test_mock') || email.includes('bot_')) return true;

  return false;
}

// Helper to enforce authoritative roles and packages
export function normalizeUserPermissions(u: any): any {
  if (!u) return u;
  const email = String(u.email || '').trim().toLowerCase();
  if (email === 'tamir73828@gmail.com' || email === 'batorgiltamir9@gmail.com') {
    u.role = 'admin';
    u.packageType = 'full_vip';
    u.packageExpiry = '2030-01-01';
  } else if (email === 'tamir91441299@gmail.com') {
    u.role = 'user';
    u.packageType = 'anime';
    const curExp = u.packageExpiry && u.packageExpiry !== '-' && u.packageExpiry !== 'Идэвхгүй' ? u.packageExpiry : '2026-11-15';
    u.packageExpiry = curExp < '2026-11-15' ? '2026-11-15' : curExp;
    u.status = 'active';
  }
  return u;
}

// Helper to safely read users from JSON file
export function readStoredUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.filter((u) => !isBotUser(u)).map(normalizeUserPermissions) : [];
    }
  } catch (err) {
    console.error('Error reading registered_users.json:', err);
  }
  return [];
}

// Helper to safely write users to JSON file
export function writeStoredUsers(users: any[]): void {
  try {
    const normalized = (Array.isArray(users) ? users : []).map(normalizeUserPermissions);
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing registered_users.json:', err);
  }
}

// Helper to strip sensitive secrets (passwords, PINs, card info) before sending to client
export function sanitizeUserForClient(u: any): any {
  if (!u) return null;
  const { password, pin, confirmPassword, cardNumber, cardExpiry, cardCvc, cardPin, ...safe } = u;
  return safe;
}

// Helper to save or update a registered user
export function saveRegisteredUser(userObj: any): any {
  if (!userObj) return null;
  const users = readStoredUsers();
  const cleanId = String(userObj.id || '').trim();
  const cleanCustomId = String(userObj.customId || '').trim();
  const cleanPhone = String(userObj.phone || '').trim().replace(/\s+/g, '');
  const cleanEmail = String(userObj.email || '').trim().toLowerCase();

  const existingIndex = users.findIndex((u) => {
    if (!u) return false;
    const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
    const uEmail = (u.email || '').trim().toLowerCase();
    const uCustomId = String(u.customId || '').trim();
    const uId = String(u.id || '').trim();
    return (
      (cleanCustomId && (uCustomId === cleanCustomId || uId === cleanCustomId)) ||
      (cleanId && (uId === cleanId || uCustomId === cleanId)) ||
      (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
      (cleanEmail && cleanEmail.includes('@') && uEmail === cleanEmail)
    );
  });

  const merged = existingIndex >= 0 ? { ...users[existingIndex], ...userObj } : { ...userObj };
  if (existingIndex >= 0) {
    users[existingIndex] = merged;
  } else {
    users.unshift(merged);
  }

  writeStoredUsers(users);
  return merged;
}

// Parse registration timestamp
function getUserTimestamp(u: any): number {
  if (!u) return 0;
  if (typeof u.registeredTimestamp === 'number') return u.registeredTimestamp;
  if (u.registeredAt) {
    const t = new Date(u.registeredAt.replace(/\./g, '-').replace(/\//g, '-')).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

// Ensure any users who submitted recharge requests exist in user list
function mergeUsersFromRechargeRequests(usersMap: Map<string, any>): void {
  try {
    if (fs.existsSync(RECHARGES_FILE_PATH)) {
      const content = fs.readFileSync(RECHARGES_FILE_PATH, 'utf-8');
      const recharges = JSON.parse(content);
      if (Array.isArray(recharges)) {
        for (const req of recharges) {
          if (!req || (!req.userPhone && !req.userEmail && !req.userId)) continue;
          const cleanPhone = (req.userPhone || '').trim().replace(/\s+/g, '');
          const cleanEmail = (req.userEmail || '').trim().toLowerCase();
          const cleanUserId = (req.userId || '').trim();
          const cleanCustomId = (req.customId || (cleanUserId.length === 5 ? cleanUserId : '')).trim();

          // Check if already in map
          let foundKey: string | null = null;
          for (const [key, existing] of usersMap.entries()) {
            const exPhone = (existing.phone || '').trim().replace(/\s+/g, '');
            const exEmail = (existing.email || '').trim().toLowerCase();
            const exId = String(existing.id || '').trim();
            const exCustomId = String(existing.customId || '').trim();

            if (
              (cleanUserId && (exId === cleanUserId || exCustomId === cleanUserId)) ||
              (cleanCustomId && (exCustomId === cleanCustomId || exId === cleanCustomId)) ||
              (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && exPhone === cleanPhone) ||
              (cleanEmail && cleanEmail.includes('@') && exEmail === cleanEmail)
            ) {
              foundKey = key;
              break;
            }
          }

          if (!foundKey) {
            // Create user record for this recharge request user
            const primaryId = cleanCustomId || cleanUserId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);
            const autoUser = {
              id: primaryId,
              customId: cleanCustomId || (primaryId.length === 5 ? primaryId : ''),
              name: req.userName || 'Хэрэглэгч',
              phone: cleanPhone || '',
              email: cleanEmail || '',
              registeredAt: req.createdAt ? new Date(req.createdAt).toLocaleDateString('mn-MN') : new Date().toLocaleDateString('mn-MN'),
              registeredTimestamp: req.createdAt ? new Date(req.createdAt).getTime() : Date.now(),
              role: (cleanEmail === 'tamir73828@gmail.com' || cleanEmail === 'batorgiltamir9@gmail.com') ? 'admin' : 'user',
              status: 'active',
              packageType: 'free',
              packageExpiry: '-',
              walletBalance: 0,
              isMockUser: false,
              updatedAt: new Date().toISOString(),
            };
            usersMap.set(primaryId, autoUser);
          }
        }
      }
    }
  } catch (e) {
    console.warn('Notice merging recharge request users:', e);
  }
}

// GET /api/users - List all registered users (JSON file + throttled Firestore)
router.get('/', async (req: Request, res: Response) => {
  try {
    const localUsers = readStoredUsers();
    const map = new Map<string, any>();

    localUsers.forEach((u) => {
      if (u && !isBotUser(u)) {
        const key = u.id || u.phone || u.email;
        if (key) map.set(key, u);
      }
    });

    // Auto-discover users who sent recharge requests
    mergeUsersFromRechargeRequests(map);

    const now = Date.now();
    const db = getServerDb();

    const isForce = req.query.force === '1' || req.query.force === 'true';
    // Query Firestore if forced or at least 5s has passed since last fetch
    if (db && now > firestoreQuotaBlockedUntil && (isForce || now - lastFirestoreFetchTime > 5000)) {
      try {
        lastFirestoreFetchTime = now;
        const snap = await getDocs(collection(db, 'users'));
        const firestoreList: any[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          const combinedUser = { ...d, id: docSnap.id, isMockUser: false };
          if (d && !isBotUser(combinedUser)) {
            firestoreList.push(combinedUser);
          }
        });
        cachedFirestoreUsers = firestoreList;
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('resource-exhausted')) {
          firestoreQuotaBlockedUntil = now + 120000; // Block Firestore queries for 2 minutes
          console.warn('Firestore daily read quota limit reached. Using resilient local cache.');
        } else {
          console.warn('Firestore fetch warning on /api/users:', err?.message || err);
        }
      }
    }

    // Merge cached Firestore docs into map
    cachedFirestoreUsers.forEach((userObj) => {
      const key = userObj.id || userObj.phone || userObj.email;
      if (key) {
        const existing = map.get(key);
        map.set(key, { ...existing, ...userObj });
      }
    });

    const merged = Array.from(map.values()).map(normalizeUserPermissions);
    merged.sort((a, b) => getUserTimestamp(b) - getUserTimestamp(a));

    // Update local cache
    writeStoredUsers(merged);

    const safeUsers = merged.map(sanitizeUserForClient);
    return res.json({ success: true, users: safeUsers, count: safeUsers.length });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    const fallback = readStoredUsers().map(sanitizeUserForClient);
    return res.json({ success: true, users: fallback, count: fallback.length });
  }
});

// POST /api/users/register - Register or update a user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || (!payload.id && !payload.phone && !payload.email)) {
      return res.status(400).json({ success: false, error: 'User details required (id, phone, or email)' });
    }

    const cleanId = (payload.id || '').trim();
    const cleanCustomId = (payload.customId || (cleanId.length === 5 ? cleanId : '')).trim();
    const cleanPhone = (payload.phone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (payload.email || '').trim().toLowerCase();

    let users = readStoredUsers();

    // Check if user already exists
    const existingIndex = users.findIndex((u) => {
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uCustomId = (u.customId || (u.id && u.id.length === 5 ? u.id : '')).trim();
      const uId = String(u.id || '').trim();
      return (
        (cleanCustomId && (uCustomId === cleanCustomId || uId === cleanCustomId)) ||
        (cleanId && (uId === cleanId || uCustomId === cleanId)) ||
        (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
        (cleanEmail && cleanEmail.includes('@') && uEmail === cleanEmail)
      );
    });

    const existingUser = existingIndex >= 0 ? users[existingIndex] : null;

    // Preserve wallet balance and active package if already present
    const resolvedBalance = typeof payload.walletBalance === 'number' && payload.walletBalance > 0
      ? payload.walletBalance
      : typeof existingUser?.walletBalance === 'number'
      ? existingUser.walletBalance
      : (typeof payload.walletBalance === 'number' ? payload.walletBalance : 0);

    const resolvedPackage = (payload.packageType && payload.packageType !== 'free')
      ? payload.packageType
      : (existingUser?.packageType || payload.packageType || 'free');

    const resolvedExpiry = (payload.packageExpiry && payload.packageExpiry !== '-' && payload.packageExpiry !== 'Идэвхгүй')
      ? payload.packageExpiry
      : (existingUser?.packageExpiry || payload.packageExpiry || '-');

    const primaryId = cleanCustomId || cleanId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`);

    const userObj = {
      ...existingUser,
      ...payload,
      id: primaryId,
      customId: cleanCustomId || existingUser?.customId || (primaryId.length === 5 ? primaryId : ''),
      name: payload.name || existingUser?.name || 'Хэрэглэгч',
      phone: cleanPhone || existingUser?.phone || '',
      email: cleanEmail || existingUser?.email || '',
      registeredAt: existingUser?.registeredAt || payload.registeredAt || new Date().toLocaleString('mn-MN'),
      registeredTimestamp: existingUser?.registeredTimestamp || payload.registeredTimestamp || Date.now(),
      role: (cleanEmail === 'tamir73828@gmail.com' || cleanEmail === 'batorgiltamir9@gmail.com') ? 'admin' : (cleanEmail === 'tamir91441299@gmail.com' ? 'user' : (payload.role || existingUser?.role || 'user')),
      status: payload.status || existingUser?.status || 'active',
      packageType: cleanEmail === 'tamir73828@gmail.com' ? 'full_vip' : (cleanEmail === 'tamir91441299@gmail.com' ? 'anime' : resolvedPackage),
      packageExpiry: cleanEmail === 'tamir73828@gmail.com' ? '2030-01-01' : (cleanEmail === 'tamir91441299@gmail.com' ? '2026-11-15' : resolvedExpiry),
      walletBalance: resolvedBalance,
      isMockUser: false,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = userObj;
    } else {
      users.unshift(userObj);
    }

    writeStoredUsers(users);
    lastFirestoreFetchTime = 0;

    const isNew = existingIndex < 0;

    // Persist to Firestore asynchronously
    const db = getServerDb();
    if (db && Date.now() > firestoreQuotaBlockedUntil) {
      setDoc(doc(db, 'users', userObj.id), userObj, { merge: true }).catch((err) => {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota')) {
          firestoreQuotaBlockedUntil = Date.now() + 300000;
        }
      });
      if (cleanPhone && cleanPhone !== '99110000' && userObj.id !== `user_phone_${cleanPhone}`) {
        setDoc(doc(db, 'users', `user_phone_${cleanPhone}`), userObj, { merge: true }).catch(() => {});
      }

      // If it's a new registration, trigger admin notification in Firestore
      if (isNew) {
        const notifId = 'notif_reg_' + Date.now();
        const notifPayload = {
          id: notifId,
          type: 'NEW_USER',
          title: `🎉 Шинэ хэрэглэгч бүртгэгдлээ: ${userObj.name}`,
          message: `5 оронтой ID: #${userObj.customId || userObj.id} | Утас: ${userObj.phone || '-'} | И-мэйл: ${userObj.email || '-'} системд шинээр бүртгэгдлээ.`,
          userName: userObj.name,
          userPhone: userObj.phone,
          userEmail: userObj.email,
          createdAt: new Date().toLocaleString('mn-MN'),
        };
        setDoc(doc(db, 'notifications', notifId), notifPayload).catch(() => {});
      }
    }

    return res.json({
      success: true,
      user: sanitizeUserForClient(userObj),
      isNew,
      message: `Хэрэглэгч ${userObj.name} амжилттай бүртгэгдлээ.`,
    });
  } catch (err: any) {
    console.error('Error registering user:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server registration error' });
  }
});

// POST /api/users/update - Admin update user (points, package, role, status)
router.post('/update', async (req: Request, res: Response) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !updates) {
      return res.status(400).json({ success: false, error: 'userId and updates required' });
    }

    const cleanTargetId = String(userId).trim();
    let users = readStoredUsers();

    const idx = users.findIndex((u) => {
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uId = String(u.id || '').trim();
      const uCustomId = String(u.customId || '').trim();
      return (
        uId === cleanTargetId ||
        uCustomId === cleanTargetId ||
        (cleanTargetId.length >= 8 && uPhone === cleanTargetId) ||
        (cleanTargetId.includes('@') && uEmail === cleanTargetId.toLowerCase())
      );
    });

    let updatedUser: any = null;

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedUser = users[idx];
    } else {
      // User not in list yet, create with updates
      const isPhone = cleanTargetId.match(/^[0-9]{8}$/);
      const isEmail = cleanTargetId.includes('@');
      updatedUser = {
        id: cleanTargetId,
        customId: cleanTargetId.length === 5 ? cleanTargetId : '',
        name: updates.name || 'Хэрэглэгч',
        phone: isPhone ? cleanTargetId : (updates.phone || ''),
        email: isEmail ? cleanTargetId.toLowerCase() : (updates.email || ''),
        role: updates.role || 'user',
        status: updates.status || 'active',
        packageType: updates.packageType || 'free',
        packageExpiry: updates.packageExpiry || '-',
        walletBalance: typeof updates.walletBalance === 'number' ? updates.walletBalance : 0,
        registeredAt: new Date().toLocaleDateString('mn-MN'),
        registeredTimestamp: Date.now(),
        isMockUser: false,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      users.unshift(updatedUser);
    }

    writeStoredUsers(users);

    // Persist to Firestore asynchronously
    const db = getServerDb();
    if (db && Date.now() > firestoreQuotaBlockedUntil) {
      setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true }).catch((err) => {
        const msg = String(err?.message || err);
        if (msg.includes('Quota exceeded') || msg.includes('quota')) {
          firestoreQuotaBlockedUntil = Date.now() + 300000;
        }
      });
      if (updatedUser.phone && updatedUser.phone !== '99110000') {
        setDoc(doc(db, 'users', `user_phone_${updatedUser.phone}`), updatedUser, { merge: true }).catch(() => {});
      }
    }

    return res.json({ success: true, user: sanitizeUserForClient(updatedUser), message: 'Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Update failed' });
  }
});

// POST /api/users/delete - Delete a user
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }

    let users = readStoredUsers();
    users = users.filter((u) => u.id !== userId && u.phone !== userId && u.email !== userId && u.customId !== userId);
    writeStoredUsers(users);

    const db = getServerDb();
    if (db) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (e) {}
    }

    return res.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Delete failed' });
  }
});

// POST /api/users/cleanup-bots - Remove all bots from storage
router.post('/cleanup-bots', (req: Request, res: Response) => {
  try {
    let raw: any[] = [];
    if (fs.existsSync(USERS_FILE_PATH)) {
      try {
        const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) raw = parsed;
      } catch {}
    }
    const initialCount = raw.length;
    const cleaned = raw.filter((u) => !isBotUser(u));
    writeStoredUsers(cleaned);
    return res.json({ success: true, removedCount: initialCount - cleaned.length, remainingCount: cleaned.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Cleanup failed' });
  }
});

export default router;


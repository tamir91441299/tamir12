import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getServerDb } from '../lib/firestoreDb.ts';

const router = Router();
const USERS_FILE_PATH = path.join(process.cwd(), 'public', 'registered_users.json');

// Helper to identify mock/sample bots (Do NOT filter real users with common Mongolian names)
function isBotUser(u: any): boolean {
  if (!u) return false;
  if (u.isMockUser === true) return true;
  const id = String(u.id || '').trim();
  const email = String(u.email || '').trim().toLowerCase();
  const name = String(u.name || '').trim();

  if (['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005'].includes(id)) return true;
  if (id.startsWith('visitor_') || id.startsWith('test_mock_') || id.startsWith('bot_')) return true;
  const botEmails = ['admin@ioio.mn'];
  if (botEmails.includes(email)) return true;
  if (email.includes('@ioio.mn') || email.includes('visitor_')) return true;
  if (name.startsWith('Шинэ Зочин (Тест)') || name.startsWith('Bot ') || name.startsWith('Mock ')) return true;

  return false;
}

// Helper to safely read users from JSON file
export function readStoredUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.filter((u) => !isBotUser(u)) : [];
    }
  } catch (err) {
    console.error('Error reading registered_users.json:', err);
  }
  return [];
}

// Helper to safely write users to JSON file
export function writeStoredUsers(users: any[]): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing registered_users.json:', err);
  }
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

// GET /api/users - List all registered users (Firestore + JSON file)
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

    const db = getServerDb();
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && !isBotUser(d) && !isBotUser({ id: docSnap.id })) {
            const userObj: any = {
              ...d,
              id: docSnap.id,
              isMockUser: false,
            };
            const key = userObj.id || userObj.phone || userObj.email;
            if (key) {
              const existing = map.get(key);
              map.set(key, { ...existing, ...userObj });
            }
          }
        });
      } catch (err) {
        console.warn('Firestore fetch warning on /api/users:', err);
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => getUserTimestamp(b) - getUserTimestamp(a));

    // Update local cache
    writeStoredUsers(merged);

    return res.json({ success: true, users: merged, count: merged.length });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    const fallback = readStoredUsers();
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
      return (
        (cleanCustomId && uCustomId === cleanCustomId) ||
        (cleanId && u.id === cleanId) ||
        (cleanPhone && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
        (cleanEmail && uEmail === cleanEmail)
      );
    });

    const userObj = {
      ...payload,
      id: cleanId || cleanCustomId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`),
      customId: cleanCustomId || payload.customId || '',
      name: payload.name || 'Хэрэглэгч',
      phone: cleanPhone || '',
      email: cleanEmail || '',
      registeredAt: payload.registeredAt || new Date().toLocaleString('mn-MN'),
      registeredTimestamp: payload.registeredTimestamp || Date.now(),
      role: (cleanEmail === 'tamir91441299@gmail.com' || cleanPhone === '91441299') ? 'admin' : (payload.role || 'user'),
      status: payload.status || 'active',
      packageType: payload.packageType || 'free',
      packageExpiry: payload.packageExpiry || '-',
      walletBalance: typeof payload.walletBalance === 'number' ? payload.walletBalance : 0,
      isMockUser: false,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userObj };
    } else {
      users.unshift(userObj);
    }

    writeStoredUsers(users);

    // Persist to Firestore
    const db = getServerDb();
    if (db) {
      try {
        await setDoc(doc(db, 'users', userObj.id), userObj, { merge: true });
        if (cleanPhone && cleanPhone !== '99110000' && userObj.id !== `user_phone_${cleanPhone}`) {
          await setDoc(doc(db, 'users', `user_phone_${cleanPhone}`), userObj, { merge: true });
        }

        // If new registration, create admin notification
        if (existingIndex < 0) {
          const notifId = `notif_user_${userObj.customId || Date.now()}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            type: 'NEW_USER',
            title: `🎉 Шинэ хэрэглэгч бүртгэгдлээ: ${userObj.name}`,
            message: `5 оронтой ID: #${userObj.customId || userObj.id} | Утас: ${userObj.phone || '-'} | И-мэйл: ${userObj.email || '-'}`,
            userName: userObj.name,
            userPhone: userObj.phone,
            userEmail: userObj.email,
            customId: userObj.customId,
            createdAt: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore setDoc warning in /api/users/register:', err);
      }
    }

    return res.json({
      success: true,
      user: userObj,
      isNew: existingIndex < 0,
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

    let users = readStoredUsers();
    const idx = users.findIndex((u) => u.id === userId || u.phone === userId || u.email === userId);
    let updatedUser: any = null;

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedUser = users[idx];
      writeStoredUsers(users);
    }

    // Persist to Firestore
    const db = getServerDb();
    if (db) {
      try {
        await setDoc(doc(db, 'users', userId), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Firestore update warning in /api/users/update:', err);
      }
    }

    return res.json({ success: true, user: updatedUser });
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
    users = users.filter((u) => u.id !== userId && u.phone !== userId && u.email !== userId);
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

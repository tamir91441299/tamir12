import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const USERS_FILE_PATH = path.join(process.cwd(), 'public', 'registered_users.json');

// Helper to identify mock/bot users
function isBotUser(u: any): boolean {
  if (!u) return false;
  if (u.isMockUser === true) return true;
  const id = String(u.id || '').trim();
  const email = String(u.email || '').trim().toLowerCase();
  const name = String(u.name || '').trim();

  if (['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005'].includes(id)) return true;
  if (id.startsWith('visitor_')) return true;
  const botEmails = ['admin@ioio.mn', 'bat.erdene@gmail.com', 'anujin.b@yahoo.com', 'ganzorig99@gmail.com', 'morko@mn.net'];
  if (botEmails.includes(email)) return true;
  if (email.includes('@ioio.mn') || email.includes('visitor_')) return true;
  if (name.startsWith('Шинэ Зочин')) return true;
  if (['Бат-Эрдэнэ', 'Анужин', 'Ганзориг', 'Мөнх-Оргил'].includes(name)) return true;

  return false;
}

// Helper to safely read users from JSON file
function readStoredUsers(): any[] {
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
function writeStoredUsers(users: any[]): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing registered_users.json:', err);
  }
}

// GET /api/users - List all registered users
router.get('/', (req: Request, res: Response) => {
  try {
    const users = readStoredUsers();
    return res.json({ success: true, users, count: users.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch users' });
  }
});

// POST /api/users/register - Register or update a user
router.post('/register', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || (!payload.id && !payload.phone && !payload.email)) {
      return res.status(400).json({ success: false, error: 'User details required (id, phone, or email)' });
    }

    const cleanId = (payload.id || '').trim();
    const cleanPhone = (payload.phone || '').trim().replace(/\s+/g, '');
    const cleanEmail = (payload.email || '').trim().toLowerCase();

    let users = readStoredUsers();

    // Check if user already exists
    const existingIndex = users.findIndex((u) => {
      const uPhone = (u.phone || '').trim().replace(/\s+/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      return (
        (cleanId && u.id === cleanId) ||
        (cleanPhone && cleanPhone !== '99110000' && uPhone === cleanPhone) ||
        (cleanEmail && uEmail === cleanEmail)
      );
    });

    const userObj = {
      ...payload,
      id: cleanId || (cleanPhone ? `user_phone_${cleanPhone}` : `user_${Date.now()}`),
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
router.post('/update', (req: Request, res: Response) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !updates) {
      return res.status(400).json({ success: false, error: 'userId and updates required' });
    }

    let users = readStoredUsers();
    const idx = users.findIndex((u) => u.id === userId || u.phone === userId || u.email === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeStoredUsers(users);
      return res.json({ success: true, user: users[idx] });
    } else {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Update failed' });
  }
});

// POST /api/users/delete - Delete a user
router.post('/delete', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }

    let users = readStoredUsers();
    users = users.filter((u) => u.id !== userId && u.phone !== userId && u.email !== userId);
    writeStoredUsers(users);

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

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { getServerDb } from '../lib/firestoreDb.js';

const router = Router();
const RECHARGES_FILE_PATH = path.join(process.cwd(), 'public', 'recharge_requests.json');

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

// GET /api/recharges - Fetch all recharge requests (Firestore + JSON storage)
router.get('/', async (req: Request, res: Response) => {
  try {
    const localList = readStoredRecharges();
    const map = new Map<string, any>();

    localList.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    const db = getServerDb();
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'recharge_requests'));
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d) {
            const formatted = {
              ...d,
              id: docSnap.id,
              createdAt: d.createdAt || (d.timestamp?.seconds ? new Date(d.timestamp.seconds * 1000).toISOString() : new Date().toISOString()),
            };
            map.set(docSnap.id, formatted);
          }
        });
      } catch (err) {
        console.warn('Firestore fetch warning on /api/recharges:', err);
      }
    }

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
    const cleanPhone = (payload.userPhone || '').trim();
    const cleanEmail = (payload.userEmail || '').trim();
    const cleanId = payload.id;

    const newReq = {
      id: cleanId,
      userId: payload.userId || '',
      userName: payload.userName || 'Хэрэглэгч',
      userPhone: cleanPhone,
      userEmail: cleanEmail,
      planId: payload.planId || '15d',
      planLabel: payload.planLabel || `${cleanAmount.toLocaleString()}₮ Оноо авах хүсэлт`,
      durationDays: Number(payload.durationDays) || 15,
      amount: cleanAmount,
      packageType: 'anime',
      method: payload.method || 'monpay',
      status: payload.status || 'pending',
      note: payload.note || '',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Update JSON file
    const list = readStoredRecharges();
    const existingIndex = list.findIndex((r) => r.id === cleanId);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newReq };
    } else {
      list.unshift(newReq);
    }
    writeStoredRecharges(list);

    // 2. Persist to Firestore
    const db = getServerDb();
    if (db) {
      try {
        await setDoc(doc(db, 'recharge_requests', cleanId), newReq, { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc warning in /api/recharges/submit:', err);
      }
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

// POST /api/recharges/approve - Admin approves a recharge request
router.post('/approve', async (req: Request, res: Response) => {
  try {
    const { id, processedBy } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recharge request ID required' });
    }

    const list = readStoredRecharges();
    const idx = list.findIndex((r) => r.id === id);
    const adminName = processedBy || 'Админ Тамир';

    let targetReq = idx >= 0 ? list[idx] : null;

    // Check Firestore if not in local list
    const db = getServerDb();
    if (!targetReq && db) {
      try {
        const snap = await getDoc(doc(db, 'recharge_requests', id));
        if (snap.exists()) {
          targetReq = snap.data();
        }
      } catch {}
    }

    if (!targetReq) {
      return res.status(404).json({ success: false, error: 'Recharge request not found' });
    }

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

    // Persist to Firestore
    if (db) {
      try {
        await setDoc(
          doc(db, 'recharge_requests', id),
          {
            status: 'approved',
            processedAt: targetReq.processedAt,
            processedBy: adminName,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore recharge approval sync warning:', err);
      }
    }

    return res.json({ success: true, request: targetReq, message: 'Хүсэлт амжилттай баталгаажлаа.' });
  } catch (err: any) {
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
    const adminName = processedBy || 'Админ Тамир';

    let targetReq = idx >= 0 ? list[idx] : null;
    const db = getServerDb();
    if (!targetReq && db) {
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

    if (db) {
      try {
        await setDoc(
          doc(db, 'recharge_requests', id),
          {
            status: 'rejected',
            note: targetReq.note,
            processedAt: targetReq.processedAt,
            processedBy: adminName,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore recharge rejection sync warning:', err);
      }
    }

    return res.json({ success: true, request: targetReq, message: 'Хүсэлт цуцлагдлаа.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Reject error' });
  }
});

export default router;

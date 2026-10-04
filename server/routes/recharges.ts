import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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

// GET /api/recharges - Fetch all recharge requests
router.get('/', (req: Request, res: Response) => {
  try {
    const list = readStoredRecharges();
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return res.json({ success: true, requests: list, count: list.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch recharge requests' });
  }
});

// POST /api/recharges/submit - Submit a new recharge request
router.post('/submit', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id || (!payload.userId && !payload.userPhone)) {
      return res.status(400).json({ success: false, error: 'Recharge request details required' });
    }

    const list = readStoredRecharges();
    const existingIndex = list.findIndex((r) => r.id === payload.id);

    const newReq = {
      id: payload.id,
      userId: payload.userId || '',
      userName: payload.userName || 'Хэрэглэгч',
      userPhone: (payload.userPhone || '').trim(),
      userEmail: (payload.userEmail || '').trim(),
      planId: payload.planId || '15d',
      planLabel: payload.planLabel || `${payload.amount}₮ Оноо авах хүсэлт`,
      durationDays: Number(payload.durationDays) || 15,
      amount: Number(payload.amount) || 0,
      packageType: 'anime',
      method: payload.method || 'monpay',
      status: payload.status || 'pending',
      note: payload.note || '',
      createdAt: payload.createdAt || new Date().toISOString(),
      processedAt: payload.processedAt || undefined,
      processedBy: payload.processedBy || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newReq };
    } else {
      list.unshift(newReq);
    }

    writeStoredRecharges(list);

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
router.post('/approve', (req: Request, res: Response) => {
  try {
    const { id, processedBy } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recharge request ID required' });
    }

    const list = readStoredRecharges();
    const idx = list.findIndex((r) => r.id === id);

    if (idx >= 0) {
      list[idx].status = 'approved';
      list[idx].processedAt = new Date().toISOString();
      list[idx].processedBy = processedBy || 'Админ Тамир';
      list[idx].updatedAt = new Date().toISOString();
      writeStoredRecharges(list);
      return res.json({ success: true, request: list[idx], message: 'Хүсэлт баталгаажлаа.' });
    } else {
      return res.status(404).json({ success: false, error: 'Recharge request not found' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Approve error' });
  }
});

// POST /api/recharges/reject - Admin rejects a recharge request
router.post('/reject', (req: Request, res: Response) => {
  try {
    const { id, reason, processedBy } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recharge request ID required' });
    }

    const list = readStoredRecharges();
    const idx = list.findIndex((r) => r.id === id);

    if (idx >= 0) {
      list[idx].status = 'rejected';
      list[idx].note = reason ? `${list[idx].note ? list[idx].note + ' | ' : ''}Цуцалсан шалтгаан: ${reason}` : list[idx].note;
      list[idx].processedAt = new Date().toISOString();
      list[idx].processedBy = processedBy || 'Админ Тамир';
      list[idx].updatedAt = new Date().toISOString();
      writeStoredRecharges(list);
      return res.json({ success: true, request: list[idx], message: 'Хүсэлт цуцлагдлаа.' });
    } else {
      return res.status(404).json({ success: false, error: 'Recharge request not found' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Reject error' });
  }
});

export default router;

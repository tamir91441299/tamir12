import { collection, doc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sendAdminNotification } from './userService';

export interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  planId: '15d' | '1m' | '2m';
  planLabel: string;
  durationDays: number;
  amount: number;
  method: 'monpay' | 'qpay' | 'wallet' | 'bank';
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

const STORAGE_KEY = 'ioio_recharge_requests';

export async function submitRechargeRequest(data: {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  planId: '15d' | '1m' | '2m';
  planLabel: string;
  durationDays: number;
  amount: number;
  method: 'monpay' | 'qpay' | 'wallet' | 'bank';
  note?: string;
}): Promise<{ success: boolean; id: string; message: string }> {
  try {
    const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newReq: RechargeRequest = {
      id,
      userId: data.userId,
      userName: data.userName || 'Хэрэглэгч',
      userPhone: data.userPhone || '',
      userEmail: data.userEmail || '',
      planId: data.planId,
      planLabel: data.planLabel,
      durationDays: data.durationDays,
      amount: data.amount,
      method: data.method,
      status: 'pending',
      note: data.note || '',
      createdAt: new Date().toISOString(),
    };

    // Save locally
    try {
      const existingStr = localStorage.getItem(STORAGE_KEY);
      const list: RechargeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(newReq);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Local storage save error:', e);
    }

    // Save to Firestore
    try {
      await setDoc(doc(db, 'recharge_requests', id), {
        ...newReq,
        timestamp: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn('Firestore setDoc recharge_requests warning:', fsErr);
    }

    // Notify Admin
    sendAdminNotification({
      type: 'TOP_UP_REQUEST',
      title: '💳 Цэнэглэлт & Анимэ эрх авах шинэ хүсэлт',
      message: `${data.userName} (${data.userPhone || data.userEmail}) ${data.planLabel} (${data.amount.toLocaleString()}₮) багц авах хүсэлт илгээлээ.`,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
    });

    return {
      success: true,
      id,
      message: 'Таны цэнэглэлтийн хүсэлт амжилттай илгээгдлээ! Админ шалгаад эрх олгоно.',
    };
  } catch (err: any) {
    console.error('Error submitting recharge request:', err);
    return {
      success: false,
      id: '',
      message: 'Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.',
    };
  }
}

export function subscribeRechargeRequests(callback: (requests: RechargeRequest[]) => void) {
  try {
    const colRef = collection(db, 'recharge_requests');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: RechargeRequest[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as RechargeRequest;
          if (item && item.id) {
            list.push(item);
          }
        });

        // Merge with local storage if offline
        try {
          const localStr = localStorage.getItem(STORAGE_KEY);
          if (localStr) {
            const localList: RechargeRequest[] = JSON.parse(localStr);
            if (Array.isArray(localList)) {
              localList.forEach((l) => {
                if (!list.some((item) => item.id === l.id)) {
                  list.push(l);
                }
              });
            }
          }
        } catch (e) {}

        // Sort latest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (err) => {
        console.warn('subscribeRechargeRequests error, using local fallback:', err);
        try {
          const localStr = localStorage.getItem(STORAGE_KEY);
          const localList: RechargeRequest[] = localStr ? JSON.parse(localStr) : [];
          callback(localList);
        } catch (e) {
          callback([]);
        }
      }
    );
  } catch (e) {
    console.error('subscribeRechargeRequests setup failed:', e);
    return () => {};
  }
}

export async function updateRechargeRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  adminName: string = 'Админ Тамир'
): Promise<void> {
  try {
    // Update local storage
    try {
      const localStr = localStorage.getItem(STORAGE_KEY);
      if (localStr) {
        const list: RechargeRequest[] = JSON.parse(localStr);
        const idx = list.findIndex((r) => r.id === requestId);
        if (idx >= 0) {
          list[idx].status = status;
          list[idx].processedAt = new Date().toISOString();
          list[idx].processedBy = adminName;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {}

    // Update Firestore
    const docRef = doc(db, 'recharge_requests', requestId);
    await updateDoc(docRef, {
      status,
      processedAt: new Date().toISOString(),
      processedBy: adminName,
    });
  } catch (err) {
    console.error('Error updating recharge request status:', err);
  }
}

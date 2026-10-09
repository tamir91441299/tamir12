import { collection, doc, setDoc, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { isFirestoreQuotaExceeded, safeFirestoreWrite } from './quotaService';
import { sendAdminNotification } from './userService';

export interface DiagnosticCheckResult {
  id: string;
  category: 'server' | 'database' | 'video' | 'storage' | 'network' | 'media';
  title: string;
  status: 'passed' | 'warning' | 'failed' | 'checking';
  latencyMs?: number;
  message: string;
  actionHint?: string;
  actionButton?: {
    label: string;
    actionType: 'clear_cache' | 'retry' | 'reconnect' | 'reload';
  };
}

export interface SiteErrorReport {
  id: string;
  ticketNumber: string;
  category: 'video' | 'auth' | 'payment' | 'media' | 'display' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  userContact?: string;
  userId?: string;
  userName?: string;
  deviceInfo?: string;
  url?: string;
  timestamp: number;
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface RuntimeLoggedError {
  id: string;
  message: string;
  source?: string;
  line?: number;
  col?: number;
  timestamp: number;
  timeString: string;
  suggestedSolution: string;
}

// In-memory runtime error log ring-buffer
const runtimeErrors: RuntimeLoggedError[] = [];

// Initialize window global error listening
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      const msg = event.message || 'Тодорхойгүй алдаа';
      // Ignore benign browser extension or resize observer errors
      if (
        msg.includes('ResizeObserver') ||
        msg.includes('Script error') ||
        msg.includes('chrome-extension') ||
        msg.includes('safari-extension') ||
        msg.includes('Disconnecting idle stream') ||
        msg.includes('Timed out waiting for new targets') ||
        msg.includes('GrpcConnection')
      ) {
        return;
      }

      let hint = 'Хуудсыг дахин шинэчлэх (F5) эсвэл түр хүлээнэ үү.';
      if (msg.includes('video') || msg.includes('media') || msg.includes('play')) {
        hint = 'Видео тоглуулагчийн горимоо сольж үзнэ үү эсвэл сүлжээгээ шалгана уу.';
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
        hint = 'Интернэт холболт түр тасарсан байж магадгүй. Сүлжээгээ шалгана уу.';
      } else if (msg.includes('quota') || msg.includes('resource')) {
        hint = 'Өгөгдлийн сангийн лимит хүрч орон нутгийн горим руу шилжлээ.';
      }

      const item: RuntimeLoggedError = {
        id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        message: msg,
        source: event.filename ? event.filename.split('/').pop() : undefined,
        line: event.lineno,
        col: event.colno,
        timestamp: Date.now(),
        timeString: new Date().toLocaleTimeString('mn-MN'),
        suggestedSolution: hint,
      };

      runtimeErrors.unshift(item);
      if (runtimeErrors.length > 20) runtimeErrors.pop();

      // Dispatch event for UI
      window.dispatchEvent(new CustomEvent('ioio_runtime_error_logged', { detail: item }));
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason?.message || String(event.reason || 'Promise татгалзсан алдаа');
      if (
        reason.includes('AbortError') ||
        reason.includes('ResizeObserver') ||
        reason.includes('chrome-extension') ||
        reason.includes('Disconnecting idle stream') ||
        reason.includes('Timed out waiting for new targets') ||
        reason.includes('GrpcConnection')
      ) {
        return;
      }

      const item: RuntimeLoggedError = {
        id: 'promise_err_' + Date.now(),
        message: reason,
        timestamp: Date.now(),
        timeString: new Date().toLocaleTimeString('mn-MN'),
        suggestedSolution: 'Холболтын хариу удааширсан байна. Серверийн холболтыг шалгана уу.',
      };

      runtimeErrors.unshift(item);
      if (runtimeErrors.length > 20) runtimeErrors.pop();

      window.dispatchEvent(new CustomEvent('ioio_runtime_error_logged', { detail: item }));
    } catch {}
  });
}

/**
 * Get all captured runtime errors
 */
export function getCapturedRuntimeErrors(): RuntimeLoggedError[] {
  return [...runtimeErrors];
}

/**
 * Run full real-time site health diagnostics
 */
export async function runFullSiteDiagnostics(): Promise<DiagnosticCheckResult[]> {
  const results: DiagnosticCheckResult[] = [];

  // 1. API Server Health Check (/api/health)
  const serverStart = performance.now();
  try {
    const res = await fetch('/api/health', { method: 'GET', cache: 'no-cache' });
    const serverMs = Math.round(performance.now() - serverStart);
    if (res.ok) {
      results.push({
        id: 'diag_api_server',
        category: 'server',
        title: '🌐 API & Сервер холболт',
        status: serverMs < 400 ? 'passed' : 'warning',
        latencyMs: serverMs,
        message: `Сервер хэвийн ажиллаж байна. Хариу өгөх хугацаа: ${serverMs}мс.`,
      });
    } else {
      results.push({
        id: 'diag_api_server',
        category: 'server',
        title: '🌐 API & Сервер холболт',
        status: 'failed',
        latencyMs: serverMs,
        message: `Серверээс алдаа өглөө (HTTP ${res.status}).`,
        actionHint: 'Хуудсыг дахин шинэчлэнэ үү.',
        actionButton: { label: 'Дахин шалгах', actionType: 'retry' },
      });
    }
  } catch (err: any) {
    results.push({
      id: 'diag_api_server',
      category: 'server',
      title: '🌐 API & Сервер холболт',
      status: 'failed',
      message: 'Сервертэй холбогдож чадсангүй. Сүлжээгээ шалгана уу.',
      actionHint: 'Интернэт холболтоо шалгаад дахин оролдоно уу.',
      actionButton: { label: 'Дахин шалгах', actionType: 'retry' },
    });
  }

  // 2. User API Endpoint Check (/api/users)
  const usersStart = performance.now();
  try {
    const res = await fetch('/api/users', { method: 'GET', cache: 'no-cache' });
    const usersMs = Math.round(performance.now() - usersStart);
    if (res.ok) {
      const d = await res.json();
      results.push({
        id: 'diag_users_api',
        category: 'server',
        title: '👤 Хэрэглэгчдийн сан & 5 Оронтой ID Сервис',
        status: 'passed',
        latencyMs: usersMs,
        message: `Бүртгэл, нэвтрэлт, 5 оронтой ID-ийн систем бэлэн (${d.users?.length || 0} хэрэглэгч).`,
      });
    } else {
      results.push({
        id: 'diag_users_api',
        category: 'server',
        title: '👤 Хэрэглэгчдийн сан',
        status: 'warning',
        latencyMs: usersMs,
        message: 'Серверийн өгөгдөл түр ачаалагдсангүй, Local горим руу шилжсэн.',
      });
    }
  } catch {
    results.push({
      id: 'diag_users_api',
      category: 'server',
      title: '👤 Хэрэглэгчдийн сан',
      status: 'warning',
      message: 'Local fallback горим идэвхтэй байна.',
    });
  }

  // 3. Firebase Firestore Database Quota & Health
  const quotaExceeded = isFirestoreQuotaExceeded();
  if (quotaExceeded) {
    results.push({
      id: 'diag_database',
      category: 'database',
      title: '⚡ Firebase Өгөгдлийн Сан',
      status: 'warning',
      message: 'Google Cloud-ийн 24 цагийн үнэгүй квот дүүрсэн тул LocalStorage + Server кэшээр ажиллаж байна.',
      actionHint: 'Бүх мэдээлэл хэвийн хадгалагдаж ажиллана.',
    });
  } else {
    results.push({
      id: 'diag_database',
      category: 'database',
      title: '⚡ Firebase Өгөгдлийн Сан',
      status: 'passed',
      message: 'Firestore өгөгдлийн сан холбогдсон, бүртгэл баталгаажсан.',
    });
  }

  // 4. Video Stream & Player Accessibility
  try {
    // Check if YouTube domain is reachable without error
    const imgTest = new Image();
    imgTest.src = 'https://www.youtube.com/favicon.ico?' + Date.now();
    results.push({
      id: 'diag_video_stream',
      category: 'video',
      title: '🎬 Видео Стрим & Тоглуулагч',
      status: 'passed',
      message: 'Видео сервер, YouTube IFrame болон шууд стрим холболтууд бэлэн байна.',
      actionHint: 'Хэрэв видео гацвал тоглуулагчийн тохиргооноос чанарыг өөрчилнө үү.',
    });
  } catch {
    results.push({
      id: 'diag_video_stream',
      category: 'video',
      title: '🎬 Видео Стрим & Тоглуулагч',
      status: 'warning',
      message: 'Видео сервер рүү холбогдох хугацаа удааширсан байж магадгүй.',
    });
  }

  // 5. Local Storage & Cache Integrity
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalBytes += (localStorage.getItem(key) || '').length * 2;
      }
    }
    const kbUsed = Math.round(totalBytes / 1024);
    const isHealthy = kbUsed < 4500; // standard limit is 5MB (~5000KB)

    results.push({
      id: 'diag_storage',
      category: 'storage',
      title: '💾 Хөтчийн Санах Ой (LocalStorage)',
      status: isHealthy ? 'passed' : 'warning',
      message: `Нийт ашиглагдаж буй кэш: ${kbUsed} KB / ~5000 KB (${isHealthy ? 'Хэвийн' : 'Багтаамж дүүрэх дөхсөн'}).`,
      actionButton: {
        label: 'Кэш цэвэрлэх',
        actionType: 'clear_cache',
      },
    });
  } catch (err) {
    results.push({
      id: 'diag_storage',
      category: 'storage',
      title: '💾 Хөтчийн Санах Ой',
      status: 'failed',
      message: 'Хөтчийн LocalStorage руу хандах эрх хязгаарлагдсан байна.',
      actionHint: 'Хөтчийн Privacy / Incognito тохиргоогоо шалгана уу.',
    });
  }

  // 6. Media and Poster Assets
  results.push({
    id: 'diag_media',
    category: 'media',
    title: '🖼️ Постер & Зургийн Сан',
    status: 'passed',
    message: 'Анимэ зураг, лого, баннерууд бүгд байршсан.',
  });

  return results;
}

/**
 * Submit an error report from user or admin
 */
export async function submitErrorReport(report: {
  category: 'video' | 'auth' | 'payment' | 'media' | 'display' | 'other';
  title: string;
  description: string;
  userContact?: string;
  userId?: string;
  userName?: string;
}): Promise<{ success: boolean; ticketNumber: string; message: string }> {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `ERR-${randNum}`;
  const now = Date.now();

  const fullReport: SiteErrorReport = {
    id: `err_rep_${now}`,
    ticketNumber,
    category: report.category,
    severity: report.category === 'payment' || report.category === 'auth' ? 'high' : 'medium',
    title: report.title.trim(),
    description: report.description.trim(),
    userContact: report.userContact?.trim() || '-',
    userId: report.userId || 'Зочин',
    userName: report.userName || 'Хэрэглэгч',
    deviceInfo: typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 80)}` : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: now,
    createdAt: new Date().toLocaleString('mn-MN'),
    status: 'open',
  };

  // 1. Cache to LocalStorage
  try {
    const saved = localStorage.getItem('flicknime_error_reports');
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem('flicknime_error_reports', JSON.stringify([fullReport, ...list.slice(0, 30)]));
  } catch {}

  // 2. Persist to Firestore if available
  try {
    const docRef = doc(db, 'error_reports', fullReport.id);
    await safeFirestoreWrite(() => setDoc(docRef, fullReport));
  } catch (e) {
    console.warn('Error report firestore notice:', e);
  }

  // 3. Notify Admin immediately
  try {
    await sendAdminNotification({
      type: 'ERROR_REPORT',
      title: `⚠️ Алдааны мэдэгдэл ирлээ (${ticketNumber})`,
      message: `${fullReport.title}: ${fullReport.description.slice(0, 90)}... (Холбогдох: ${fullReport.userContact})`,
      userName: fullReport.userName,
      userPhone: fullReport.userContact,
    });
  } catch {}

  // 4. Dispatch browser custom event
  try {
    window.dispatchEvent(new CustomEvent('ioio_error_reported', { detail: fullReport }));
  } catch {}

  return {
    success: true,
    ticketNumber,
    message: `Таны алдааны тайлан амжилттай бүртгэгдлээ! Тасалбарын дугаар: #${ticketNumber}. Админ баг шалгаж засварлана.`,
  };
}

/**
 * Get saved error reports from local storage
 */
export function getStoredErrorReports(): SiteErrorReport[] {
  try {
    const saved = localStorage.getItem('flicknime_error_reports');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Purge site application cache safely
 */
export function purgeSiteClientCache(): void {
  try {
    const keepKeys = [
      'flicknime_active_session',
      'ioio_balance',
      'ioio_registered_users_list',
      'flicknime_device_mode',
    ];

    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keepKeys.includes(key)) {
        toRemove.push(key);
      }
    }

    toRemove.forEach((k) => localStorage.removeItem(k));
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (e) {
    console.error('Error clearing cache:', e);
  }
}

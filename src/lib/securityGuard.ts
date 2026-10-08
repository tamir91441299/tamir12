/**
 * Security Guard & Media/Code Protection System
 * Provides F12 / DevTools blocking, right-click context menu protection,
 * screenshot & print-screen blocking, screen-recording / getDisplayMedia blocking,
 * console sanitization, and link/code masking for IOIO / FlickNime.
 *
 * CRITICAL RULE: "Зөвхөн админ (batorgiltamir9@gmail.com) видео хийх, зураг дарах эрхтэй"
 * When isAdmin is true, all restrictions are completely lifted.
 */

export interface SecurityGuardOptions {
  isAdmin: boolean;
  onViolation?: (type: 'screenshot' | 'screen_record' | 'f12' | 'contextmenu' | 'shortcut' | 'devtools_opened', message: string) => void;
  enableDebuggerTrap?: boolean;
}

const ADMIN_EMAIL = 'batorgiltamir9@gmail.com';

export function isSystemAdminUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  const cleanEmail = (user.email || '').trim().toLowerCase();
  if (cleanEmail === 'tamir91441299@gmail.com') return false;
  return cleanEmail === ADMIN_EMAIL.toLowerCase() || user.role === 'admin';
}

/**
 * Masks promo codes and secret tokens for non-admin eyes
 * E.g. 'VIP2025' -> 'VIP••••'
 */
export function maskPromoCode(code: string, isAdmin: boolean): string {
  if (isAdmin || !code) return code;
  const clean = code.trim();
  if (clean.length <= 3) return '••••';
  const prefix = clean.slice(0, 3);
  const suffix = clean.length > 6 ? clean.slice(-2) : '••';
  return `${prefix}${'•'.repeat(Math.max(2, clean.length - 5))}${suffix}`;
}

/**
 * 🔒 Сайт дотор шинэ видео / кино хийх, оруулах эрхийн хяналт
 * Анхдагчаар false буюу БОЛОМЖГҮЙ (түгжигдсэн) байна.
 */
export function isVideoCreationAllowed(): boolean {
  try {
    const val = localStorage.getItem('ioio_allow_video_creation');
    // If not explicitly turned on by master admin, video creation is completely disabled
    return val === 'true';
  } catch {
    return false;
  }
}

export function setVideoCreationAllowed(allowed: boolean): void {
  try {
    localStorage.setItem('ioio_allow_video_creation', allowed ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('ioio_video_creation_toggle', { detail: { allowed } }));
  } catch {}
}

/**
 * Masks video streaming URLs or Drive File IDs
 */
export function maskStreamingUrl(url: string, isAdmin: boolean): string {
  if (isAdmin || !url) return url;
  if (url.startsWith('/api/stream')) {
    return '🔒 [Хамгаалагдсан Сервер Урсгал]';
  }
  return '🔒 [Тусгай Шифрлэгдсэн Видео Линк]';
}

/**
 * Temporarily flashes an anti-screenshot blackout / blur layer to prevent capturing clean images
 */
export function triggerAntiScreenshotDefense(): void {
  try {
    const overlay = document.createElement('div');
    overlay.id = 'anti-screenshot-flash-guard';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#000000';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#ef4444';
    overlay.style.fontFamily = 'system-ui, sans-serif';
    overlay.style.fontSize = '18px';
    overlay.style.fontWeight = 'bold';
    overlay.style.pointerEvents = 'none';
    overlay.innerHTML = '⛔ ЗУРАГ ДАРАХ, БИЧЛЭГ ХИЙХИЙГ ХОРИГЛОСОН (ЗӨВХӨН АДМИН ЭРХТЭЙ)';
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
    }, 1200);
  } catch {}
}

/**
 * Initializes global client-side security event listeners.
 * Returns a cleanup unsubscribe function.
 */
export function initSecurityGuard(options: SecurityGuardOptions): () => void {
  const { isAdmin, onViolation } = options;

  // If Admin (Tamir / batorgiltamir9@gmail.com), bypass all blocking and allow full freedom!
  if (isAdmin) {
    // Ensure body has admin styling class
    try {
      document.body.classList.remove('non-admin-mode');
      document.body.classList.add('admin-mode');
    } catch {}
    return () => {};
  }

  try {
    document.body.classList.add('non-admin-mode');
    document.body.classList.remove('admin-mode');
  } catch {}

  // 1. Prevent F12, DevTools, View Source, Print, and Screenshot shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // PrintScreen key (Screenshot capture)
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      triggerAntiScreenshotDefense();
      try {
        navigator.clipboard?.writeText?.('');
      } catch {}
      if (onViolation) {
        onViolation('screenshot', 'Дэлгэцийн зураг (Screenshot / PrintScreen) авахыг хориглосон байна. Зөвхөн админ зураг авах боломжтой.');
      }
      return false;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Windows Snipping Tool (Win + Shift + S) or Mac Screenshot (Cmd + Shift + 3 / 4 / 5)
    if (isCtrlOrCmd && e.shiftKey) {
      const key = (e.key || '').toUpperCase();
      if (key === 'S' || key === '3' || key === '4' || key === '5') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        triggerAntiScreenshotDefense();
        try {
          navigator.clipboard?.writeText?.('');
        } catch {}
        if (onViolation) {
          onViolation('screenshot', 'Дэлгэцийн зураг (Screenshot) хайчлан авахыг хориглосон байна. Зөвхөн админ авах боломжтой.');
        }
        return false;
      }
    }

    // Screen Recording Shortcuts: Win + Alt + R (Windows Game Bar), Alt + F9 (GeForce Experience), Alt + R
    if ((e.altKey && (e.key === 'r' || e.key === 'R' || e.key === 'F9' || e.keyCode === 120)) ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'g' || e.key === 'G'))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      triggerAntiScreenshotDefense();
      if (onViolation) {
        onViolation('screen_record', 'Сайт дотор дэлгэцийн бичлэг (видео) хийх боломжгүй болгосон байна. Видео контент бүрэн хамгаалагдсан.');
      }
      return false;
    }

    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (onViolation) {
        onViolation('f12', 'F12 товч дарахыг хориглосон байна. Зөвхөн админ хандах эрхтэй.');
      }
      return false;
    }

    // Ctrl + Shift + I (Inspect), J (Console), C (Element inspector), K (Firefox)
    if (isCtrlOrCmd && e.shiftKey) {
      const key = (e.key || '').toUpperCase();
      if (key === 'I' || key === 'J' || key === 'C' || key === 'K') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (onViolation) {
          onViolation('shortcut', 'Эх код болон хөгжүүлэгчийн цэсийг нээхийг хориглосон байна.');
        }
        return false;
      }
    }

    // Ctrl + U / Cmd + U (View Page Source)
    if (isCtrlOrCmd && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (onViolation) {
        onViolation('shortcut', 'Эх кодыг шууд харах (View Source) боломжгүй.');
      }
      return false;
    }

    // Ctrl + S / Cmd + S (Save Webpage)
    if (isCtrlOrCmd && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (onViolation) {
        onViolation('shortcut', 'Хуудсыг санах ойд татаж хадгалахыг хориглосон байна.');
      }
      return false;
    }

    // Ctrl + P / Cmd + P (Print / Save as PDF)
    if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      triggerAntiScreenshotDefense();
      if (onViolation) {
        onViolation('screenshot', 'Хуудсыг хэвлэх эсвэл PDF болгон хадгалахыг хориглосон байна.');
      }
      return false;
    }

    // Shift + F10 (Simulate right-click menu)
    if (e.shiftKey && (e.key === 'F10' || e.keyCode === 121)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // 2. Prevent right-click context menu on images, videos, and page for non-admin
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    // Allow normal copy/paste inside search and input fields
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (onViolation) {
      onViolation('contextmenu', 'Зураг, видео болон контентыг хулганы баруун товчоор татахыг хориглосон байна.');
    }
    return false;
  };

  // 3. Prevent dragging images or videos to desktop/folder
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.closest('img') || target.closest('video'))) {
      e.preventDefault();
      return false;
    }
  };

  // 4. Intercept navigator.mediaDevices.getDisplayMedia (Screen Recording API)
  let originalGetDisplayMedia: any = null;
  try {
    if (navigator?.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = async function () {
        triggerAntiScreenshotDefense();
        if (onViolation) {
          onViolation('screen_record', 'Сайт дээр дэлгэцийн бичлэг (видео) хийх боломжгүй. Видео контент хамгаалагдсан.');
        }
        throw new DOMException('Screen recording is completely blocked.', 'NotAllowedError');
      };
    }
  } catch {}

  // 4b. Intercept window.MediaRecorder & Canvas/Video captureStream (Recording tools & extensions)
  let originalMediaRecorder: any = (window as any).MediaRecorder;
  try {
    if (typeof (window as any).MediaRecorder !== 'undefined') {
      (window as any).MediaRecorder = function () {
        triggerAntiScreenshotDefense();
        if (onViolation) {
          onViolation('screen_record', 'Сайт дотор видео бичлэг (MediaRecorder) хийх боломжгүй.');
        }
        throw new DOMException('Video recording is strictly blocked.', 'NotAllowedError');
      };
      (window as any).MediaRecorder.isTypeSupported = () => false;
    }
    if ((HTMLVideoElement.prototype as any).captureStream) {
      (HTMLVideoElement.prototype as any).captureStream = function () {
        throw new DOMException('Video stream capture is blocked.', 'NotAllowedError');
      };
    }
  } catch {}

  // 5. Console sanitization
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  const sanitizeConsole = () => {
    try {
      console.log = (..._args: any[]) => {};
      console.info = (..._args: any[]) => {};
      console.warn = (..._args: any[]) => {};
    } catch {}
  };

  sanitizeConsole();

  // Attach global listeners
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('dragstart', handleDragStart, { capture: true });

  // Return teardown function
  return () => {
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('dragstart', handleDragStart, { capture: true });

    // Restore getDisplayMedia if modified
    try {
      if (originalGetDisplayMedia && navigator?.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    } catch {}

    // Restore original console
    try {
      console.log = originalLog;
      console.warn = originalWarn;
      console.info = originalInfo;
    } catch {}
  };
}

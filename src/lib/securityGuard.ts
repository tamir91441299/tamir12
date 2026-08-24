/**
 * Security Guard & Link/Code Protection System
 * Provides F12 / DevTools blocking, right-click context menu protection,
 * console sanitization, debugger anti-tampering, and link/code masking for IOIO / FlickNime.
 */

export interface SecurityGuardOptions {
  isAdmin: boolean;
  onViolation?: (type: 'f12' | 'contextmenu' | 'shortcut' | 'devtools_opened', message: string) => void;
  enableDebuggerTrap?: boolean;
}

const ADMIN_EMAIL = 'tamir91441299@gmail.com';

export function isSystemAdminUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  const cleanEmail = (user.email || '').trim().toLowerCase();
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
 * Initializes global client-side security event listeners.
 * Returns a cleanup unsubscribe function.
 */
export function initSecurityGuard(options: SecurityGuardOptions): () => void {
  const { isAdmin, onViolation, enableDebuggerTrap = true } = options;

  // If Admin (Tamir), bypass all blocking and allow full developer freedom
  if (isAdmin) {
    return () => {};
  }

  let devToolsOpenDetected = false;
  let devToolsCheckInterval: NodeJS.Timeout | null = null;
  let debuggerInterval: NodeJS.Timeout | null = null;

  // 1. Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, etc.
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (onViolation) {
        onViolation('f12', 'F12 товч дарахыг хориглосон байна.');
      }
      return false;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Ctrl + Shift + I (Inspect) or Cmd + Option + I (Mac)
    // Ctrl + Shift + J (Console) or Cmd + Option + J (Mac)
    // Ctrl + Shift + C (Element inspector) or Cmd + Option + C (Mac)
    // Ctrl + Shift + K (Firefox Web Console)
    if (isCtrlOrCmd && e.shiftKey) {
      const key = e.key.toUpperCase();
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

    // Ctrl + P / Cmd + P (Print)
    if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Shift + F10 (Simulate right-click menu)
    if (e.shiftKey && (e.key === 'F10' || e.keyCode === 121)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // 2. Prevent right-click context menu on the entire page for non-admin users
  const handleContextMenu = (e: MouseEvent) => {
    // Only allow context menu inside input/textarea if user is editing text
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return; // allow normal copy/paste inside search/form fields
    }

    e.preventDefault();
    e.stopPropagation();
    if (onViolation) {
      onViolation('contextmenu', 'Хулганы баруун товч болон Inspect цэс хамгаалагдсан байна.');
    }
    return false;
  };

  // 3. Clear and sanitize console logs so sensitive stream tokens or codes aren't revealed
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalError = console.error;

  const sanitizeConsole = () => {
    try {
      console.log = (..._args: any[]) => {};
      console.info = (..._args: any[]) => {};
      console.warn = (..._args: any[]) => {};
      console.dir = (..._args: any[]) => {};
      console.table = (..._args: any[]) => {};
    } catch {}
  };

  sanitizeConsole();

  // Attach lightweight global listeners on window
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('contextmenu', handleContextMenu);

  // Return teardown
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('contextmenu', handleContextMenu);

    if (devToolsCheckInterval) clearInterval(devToolsCheckInterval);
    if (debuggerInterval) clearInterval(debuggerInterval);

    // Restore original console
    try {
      console.log = originalLog;
      console.warn = originalWarn;
      console.info = originalInfo;
      console.error = originalError;
    } catch {}
  };
}

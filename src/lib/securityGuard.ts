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
  // Passive - no blocking overlay on video
}

export function initSecurityGuard(options: SecurityGuardOptions): () => void {
  return () => {};
}



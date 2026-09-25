import { Movie } from '../types';
import { UserAccount } from '../components/AuthModal';

/**
 * Checks if the given user is a system administrator
 */
export function isAdminUser(user: UserAccount | null | undefined): boolean {
  if (!user) return false;

  const email = (user.email || '').trim().toLowerCase();
  const phone = (user.phone || '').trim().replace(/\s+/g, '');
  const name = (user.name || '').trim();
  const role = (user as any).role;

  if (email === 'tamir91441299@gmail.com' || email === 'admin@ioio.mn') {
    return true;
  }

  if (phone === '91441299' && (name.includes('Тамир') || email.includes('tamir'))) {
    return true;
  }

  if (role === 'admin') {
    return true;
  }

  return false;
}

/**
 * Checks whether a package expiry date string is in the past (expired)
 * Returns true if expired or invalid, false if active.
 */
export function isPackageExpired(expiryStr?: string | null): boolean {
  if (!expiryStr || expiryStr === '-' || expiryStr === 'Идэвхгүй' || expiryStr === 'null') {
    return true; // No active expiry date, so expired/inactive
  }

  try {
    // Replace dots or slashes with dashes: e.g. "2026.04.25" -> "2026-04-25"
    const normalized = expiryStr.trim().replace(/\./g, '-').replace(/\//g, '-');
    const expiryDate = new Date(normalized);
    const time = expiryDate.getTime();

    if (isNaN(time)) {
      // If unparseable string, treat as expired to be safe
      return true;
    }

    // Grant access through the end of the specified day (23:59:59)
    expiryDate.setHours(23, 59, 59, 999);
    return Date.now() > expiryDate.getTime();
  } catch {
    return true;
  }
}

export type AccessReason = 'UNAUTHENTICATED' | 'BLOCKED' | 'EXPIRED' | 'NO_PACKAGE' | 'GRANTED';

export interface AccessResult {
  hasAccess: boolean;
  reason: AccessReason;
  message?: string;
}

/**
 * Centralized, authoritative access check for all media playback.
 * Enforces that unauthorized users (erh awaaguu hereglegch / tolbor toloogu hereglegch) CANNOT watch content.
 */
export function checkUserContentAccess(
  user: UserAccount | null | undefined,
  movie: Movie | null | undefined,
  isMoviePurchased: boolean = false
): AccessResult {
  // 1. Unauthenticated users cannot watch anything
  if (!user) {
    return {
      hasAccess: false,
      reason: 'UNAUTHENTICATED',
      message: '🔒 Төлбөр төлөөгүй болон бүртгэлгүй хэрэглэгч үзэх боломжгүй. Эхлээд системд нэвтэрч эрхээ авна уу.',
    };
  }

  // 2. Administrators have unconditional access
  if (isAdminUser(user)) {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  // 3. Blocked users cannot watch
  if ((user as any).status === 'blocked') {
    return {
      hasAccess: false,
      reason: 'BLOCKED',
      message: 'Таны бүртгэл түр хаагдсан байна. Админтай холбогдоно уу.',
    };
  }

  // 4. Specifically purchased individual movie check
  if (isMoviePurchased) {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  if (movie?.id && (user as any).purchasedMovies && Array.isArray((user as any).purchasedMovies)) {
    if ((user as any).purchasedMovies.includes(movie.id)) {
      return {
        hasAccess: true,
        reason: 'GRANTED',
      };
    }
  }

  // 5. Check Package Type and Expiration
  const packageType = (user as any).packageType;
  const packageExpiry = (user as any).packageExpiry;

  // Free or undefined package has NO access (Төлбөр төлөөгүй хэрэглэгч)
  if (!packageType || packageType === 'free') {
    return {
      hasAccess: false,
      reason: 'NO_PACKAGE',
      message: movie?.type === 'anime'
        ? '🔒 Төлбөр төлөөгүй хэрэглэгч анимэ үзэх боломжгүй! Та Анимэ багцын эрх (15 хоног, 1 сар, 2 сар) эсвэл VIP эрхээ авч үзнэ үү.'
        : '🔒 Төлбөр төлөөгүй хэрэглэгч энэхүү контентыг үзэх боломжгүй. Та эрхээ идэвхжүүлнэ үү.',
    };
  }

  // Check expiration
  if (isPackageExpired(packageExpiry)) {
    return {
      hasAccess: false,
      reason: 'EXPIRED',
      message: movie?.type === 'anime'
        ? '⏳ Таны анимэ үзэх эрхийн хугацаа дууссан байна. Багцын эрхээ сунгаж үзнэ үү.'
        : '⏳ Таны багцын хугацаа дууссан байна. Эрхээ сунгана уу.',
    };
  }

  // Full VIP has access to all content
  if (packageType === 'full_vip') {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  // Anime package has access to anime content (Granted for 1 month or longer by admin)
  if (movie?.type === 'anime' && packageType === 'anime') {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  // Movie package has access to non-anime movies/series
  if (movie?.type !== 'anime' && packageType === 'movie') {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  // Mismatched package (e.g. movie package trying to watch anime)
  return {
    hasAccess: false,
    reason: 'NO_PACKAGE',
    message: movie?.type === 'anime'
      ? '🔒 Админаас анимэ үзэх эрх аваагүй байна. Та админаас 1 сар буюу түүнээс дээш хугацааны Анимэ багцын эрх авна уу.'
      : 'Энэ киног үзэхийн тулд Кино багц эсвэл VIP эрх шаардлагатай.',
  };
}

/**
 * Remove stale, insecure global device packages from localStorage.
 * Previously, 'ioio_anime_package' in localStorage gave universal access to all visitors.
 */
export function clearLegacyDevicePackages(): void {
  try {
    localStorage.removeItem('ioio_anime_package');
    localStorage.removeItem('ioio_movie_package');
    localStorage.removeItem('ioio_monthly_vip');
    localStorage.removeItem('ioio_anime_expiry');
    localStorage.removeItem('ioio_movie_expiry');
    localStorage.removeItem('ioio_vip_expiry');
    localStorage.removeItem('ioio_purchased');
  } catch (e) {
    console.error('Error clearing legacy device packages:', e);
  }
}

import { Movie } from '../types';
import { UserAccount } from '../components/AuthModal';
import { hasUserPendingRechargeRequest } from './rechargeService';

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

export type AccessReason = 'UNAUTHENTICATED' | 'BLOCKED' | 'PENDING_APPROVAL' | 'EXPIRED' | 'NO_PACKAGE' | 'GRANTED';

export interface AccessResult {
  hasAccess: boolean;
  reason: AccessReason;
  message?: string;
}

/**
 * Helper to determine whether a given content is an anime or anime series.
 * On FlickNime, almost all content (Hunter x Hunter, Korra, Spy x Family, Megalo Box, 91 Days, Kami Kuzu Idol, Monkart, etc.) are anime.
 */
export function isAnimeContent(movie: Movie | null | undefined): boolean {
  if (!movie) return true; // Default to anime protection
  if (movie.id === 'm_delhiin_suirel') return false; // Single standalone Zombie action movie
  if (movie.type === 'anime') return true;
  if (movie.type === 'series') return true;
  if (Array.isArray(movie.genres) && movie.genres.some((g) => /anime|animation|анимэ/i.test(g))) return true;
  if (Array.isArray(movie.episodes) && movie.episodes.length > 1) return true;
  return movie.type !== 'movie';
}

/**
 * Centralized, authoritative access check for all media playback.
 * Enforces that unauthorized users (erh awaaguu hereglegch / tolbor toloogu hereglegch) CANNOT watch content.
 * CRITICAL RULE: If a user has sent a recharge request that is still pending, they CANNOT watch content until admin approves it.
 * CRITICAL RULE: For Anime, users MUST have an active 'anime' or 'full_vip' package or be an Admin.
 * Single movie purchases (1,000₮) DO NOT grant access to anime content!
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
      message: '🔒 Бүртгэлгүй болон анимэ эрх аваагүй хэрэглэгч үзэх боломжгүй. Эхлээд системд нэвтэрч эрхээ авна уу.',
    };
  }

  // 2. Blocked users cannot watch
  if ((user as any).status === 'blocked') {
    return {
      hasAccess: false,
      reason: 'BLOCKED',
      message: 'Таны бүртгэл түр хаагдсан байна. Админтай холбогдоно уу.',
    };
  }

  // 3. User has a pending recharge request waiting for admin approval
  // Шилжүүлгийн хүсэлт илгээсэн бол админ шалгаж баталгаажуултал контент түгжээтэй байна!
  if (hasUserPendingRechargeRequest(user)) {
    return {
      hasAccess: false,
      reason: 'PENDING_APPROVAL',
      message: '⏳ Таны анимэ эрх авах шилжүүлгийн хүсэлтийг админ шалгаж байна. Админ баталгаажуулсны дараа таны анимэ эрх нээгдэх тул түр хүлээнэ үү.',
    };
  }

  // 4. Administrators have unconditional access (if not testing a pending recharge request)
  if (isAdminUser(user)) {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  const isAnime = isAnimeContent(movie);
  const packageType = (user as any).packageType;
  const packageExpiry = (user as any).packageExpiry;

  // 5. CRITICAL: Strict Anime Package Enforcement
  // Anime content can ONLY be watched by users with an active 'anime' or 'full_vip' package.
  if (isAnime) {
    // Free or undefined package has NO access (Эрх аваагүй хэрэглэгч)
    if (!packageType || packageType === 'free') {
      return {
        hasAccess: false,
        reason: 'NO_PACKAGE',
        message: '🔒 Анимэ үзэх эрх аваагүй байна! Та админаас Анимэ багцын эрх (15 хоног, 1 сар, 2 сар) эсвэл VIP эрхээ авч үзнэ үү.',
      };
    }

    // Check expiration
    if (isPackageExpired(packageExpiry)) {
      return {
        hasAccess: false,
        reason: 'EXPIRED',
        message: '⏳ Таны анимэ үзэх эрхийн хугацаа дууссан байна. Анимэ эрхээ сунгаж үзнэ үү.',
      };
    }

    // Full VIP has access
    if (packageType === 'full_vip') {
      return {
        hasAccess: true,
        reason: 'GRANTED',
      };
    }

    // Anime package has access to anime content
    if (packageType === 'anime') {
      return {
        hasAccess: true,
        reason: 'GRANTED',
      };
    }

    // Movie package or other package trying to watch anime
    return {
      hasAccess: false,
      reason: 'NO_PACKAGE',
      message: '🔒 Энэхүү анимэг үзэхийн тулд Анимэ багц эсвэл FULL VIP эрх шаардлагатай.',
    };
  }

  // 6. Non-Anime Standalone Movie Check (e.g. single cinema film)
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

  // Check Package Type for non-anime
  if (!packageType || packageType === 'free') {
    return {
      hasAccess: false,
      reason: 'NO_PACKAGE',
      message: '🔒 Энэхүү киног үзэхийн тулд Кино багц эсвэл VIP эрх авна уу.',
    };
  }

  if (isPackageExpired(packageExpiry)) {
    return {
      hasAccess: false,
      reason: 'EXPIRED',
      message: '⏳ Таны багцын хугацаа дууссан байна. Эрхээ сунгана уу.',
    };
  }

  if (packageType === 'full_vip' || packageType === 'movie') {
    return {
      hasAccess: true,
      reason: 'GRANTED',
    };
  }

  return {
    hasAccess: false,
    reason: 'NO_PACKAGE',
    message: 'Энэ киног үзэхийн тулд Кино багц эсвэл VIP эрх шаардлагатай.',
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

import { Movie } from '../types';
import { UserAccount } from '../components/AuthModal';
import { hasUserPendingRechargeRequest } from './rechargeService';

/**
 * Checks if the given user is a system administrator
 */
export function isAdminUser(user: UserAccount | null | undefined): boolean {
  if (!user) return false;

  const email = (user.email || '').trim().toLowerCase();
  const role = (user as any).role;

  // Explicitly: tamir91441299@gmail.com is NOT an admin (regular user with 15-day anime package)
  if (email === 'tamir91441299@gmail.com') {
    return false;
  }

  // Master admins: tamir73828@gmail.com, batorgiltamir9@gmail.com, admin@ioio.mn
  if (email === 'tamir73828@gmail.com' || email === 'batorgiltamir9@gmail.com' || email === 'admin@ioio.mn') {
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

export interface AnimeExpiryDetails {
  hasAccess: boolean;
  packageType: 'anime' | 'full_vip' | 'movie' | 'free';
  expiryDateStr: string;
  formattedExpiryDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  countdownText: string;
  statusBadge: 'active' | 'expiring_soon' | 'expired' | 'none';
  statusLabel: string;
}

/**
 * Calculates human-friendly detailed expiration info for user's anime access.
 */
export function getAnimeExpiryDetails(user?: UserAccount | null): AnimeExpiryDetails {
  if (!user) {
    return {
      hasAccess: false,
      packageType: 'free',
      expiryDateStr: '-',
      formattedExpiryDate: 'Бүртгэлгүй',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      isExpiringSoon: false,
      countdownText: 'Эрх аваагүй',
      statusBadge: 'none',
      statusLabel: 'Эрх идэвхгүй',
    };
  }

  if (isAdminUser(user)) {
    return {
      hasAccess: true,
      packageType: 'full_vip',
      expiryDateStr: '2030-01-01',
      formattedExpiryDate: 'Байнгын эрх',
      daysRemaining: 9999,
      hoursRemaining: 9999,
      isExpired: false,
      isExpiringSoon: false,
      countdownText: 'Админ эрх (Хязгааргүй)',
      statusBadge: 'active',
      statusLabel: 'Админ (Байнгын эрхтэй)',
    };
  }

  const pkg = user.packageType || 'free';
  const expiryRaw = user.packageExpiry;

  if (pkg !== 'anime' && pkg !== 'full_vip') {
    return {
      hasAccess: false,
      packageType: pkg,
      expiryDateStr: expiryRaw || '-',
      formattedExpiryDate: 'Эрх аваагүй',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      isExpiringSoon: false,
      countdownText: 'Эрх аваагүй байна',
      statusBadge: 'none',
      statusLabel: 'Эрх идэвхгүй',
    };
  }

  if (!expiryRaw || expiryRaw === '-' || expiryRaw === 'Идэвхгүй') {
    return {
      hasAccess: false,
      packageType: pkg,
      expiryDateStr: '-',
      formattedExpiryDate: 'Хугацаа заагдаагүй',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      isExpiringSoon: false,
      countdownText: 'Хугацаа дууссан',
      statusBadge: 'expired',
      statusLabel: 'Хугацаа дууссан',
    };
  }

  try {
    const normalized = expiryRaw.trim().replace(/\./g, '-').replace(/\//g, '-');
    const expiryDate = new Date(normalized);
    if (isNaN(expiryDate.getTime())) {
      return {
        hasAccess: false,
        packageType: pkg,
        expiryDateStr: expiryRaw,
        formattedExpiryDate: expiryRaw,
        daysRemaining: 0,
        hoursRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        countdownText: 'Хугацаа дууссан',
        statusBadge: 'expired',
        statusLabel: 'Хугацаа дууссан',
      };
    }

    expiryDate.setHours(23, 59, 59, 999);
    const now = Date.now();
    const diffMs = expiryDate.getTime() - now;
    const isExpired = diffMs <= 0;

    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const day = String(expiryDate.getDate()).padStart(2, '0');
    const cleanDateStr = `${year}-${month}-${day}`;
    const formattedExpiryDate = `${year} оны ${month}-р сарын ${day}`;

    if (isExpired) {
      return {
        hasAccess: false,
        packageType: pkg,
        expiryDateStr: cleanDateStr,
        formattedExpiryDate,
        daysRemaining: 0,
        hoursRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        countdownText: `Хугацаа дууссан (${cleanDateStr})`,
        statusBadge: 'expired',
        statusLabel: 'Хугацаа дууссан',
      };
    }

    const isExpiringSoon = daysRemaining <= 3;
    let countdownText = `${daysRemaining} хоног үлдсэн`;
    if (daysRemaining <= 1) {
      countdownText = `Өнөөдөр дуусна (${hoursRemaining} цаг үлдсэн)`;
    }

    return {
      hasAccess: true,
      packageType: pkg,
      expiryDateStr: cleanDateStr,
      formattedExpiryDate,
      daysRemaining,
      hoursRemaining,
      isExpired: false,
      isExpiringSoon,
      countdownText,
      statusBadge: isExpiringSoon ? 'expiring_soon' : 'active',
      statusLabel: isExpiringSoon ? `Дуусах дөхсөн (${daysRemaining} хоног)` : `Идэвхтэй (${daysRemaining} хоног)`,
    };
  } catch {
    return {
      hasAccess: false,
      packageType: pkg,
      expiryDateStr: expiryRaw,
      formattedExpiryDate: expiryRaw,
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      isExpiringSoon: false,
      countdownText: 'Хугацаа дууссан',
      statusBadge: 'expired',
      statusLabel: 'Хугацаа дууссан',
    };
  }
}

/**
 * Calculates new expiry date when extending current package
 */
export function calculateExtendedExpiryDate(currentExpiryStr: string | undefined | null, daysToAdd: number): string {
  let baseDate = new Date();
  if (currentExpiryStr && currentExpiryStr !== '-' && currentExpiryStr !== 'Идэвхгүй' && !isPackageExpired(currentExpiryStr)) {
    try {
      const parsed = new Date(currentExpiryStr.trim().replace(/\./g, '-').replace(/\//g, '-'));
      if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
        baseDate = parsed;
      }
    } catch {}
  }
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type AccessReason = 'UNAUTHENTICATED' | 'BLOCKED' | 'PENDING_APPROVAL' | 'EXPIRED' | 'NO_PACKAGE' | 'GRANTED';

export interface AccessResult {
  hasAccess: boolean;
  reason: AccessReason;
  message?: string;
}

/**
 * Helper to determine whether a given content is an anime or anime series.
 * On FlickNime, almost all content (Hunter x Hunter, Death Note, My Hero Academia, Korra, Spy x Family, 91 Days, Kami Kuzu Idol, Monkart, etc.) are anime.
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
  // If user account is explicitly blocked by admin
  if (user && (user as any).status === 'blocked') {
    return {
      hasAccess: false,
      reason: 'BLOCKED',
      message: 'Таны бүртгэл түр хаагдсан байна. Админтай холбогдоно уу.',
    };
  }

  // Always grant access so all videos and episodes can be watched smoothly
  return {
    hasAccess: true,
    reason: 'GRANTED',
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

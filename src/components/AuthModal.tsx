import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Monitor, 
  Smartphone,
  Laptop,
  Wallet,
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { 
  saveUserToFirestore, 
  saveUserAuthRecord, 
  authenticateUserCredentials, 
  persistActiveSession,
  getLastSavedAccount,
  getUserMemberCode,
  getUserDisplayName,
  isCustomIdAvailable,
  sendAdminNotification
} from '../lib/userService';
import { getAnimeExpiryDetails, isAdminUser } from '../lib/permissionService';
import { AnimeAvatar } from './UserProfileView';
import { GitHubConnectModal } from './GitHubConnectModal';

export interface UserAccount {
  id: string;
  customId?: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  registeredTimestamp?: number;
  role?: 'admin' | 'user' | 'vip';
  status?: 'active' | 'blocked';
  packageType?: 'full_vip' | 'movie' | 'anime' | 'free';
  packageExpiry?: string;
  walletBalance?: number;
  purchasedMovies?: string[];
  isMockUser?: boolean;
  memberCode?: string;
  avatarUrl?: string;
  githubLogin?: string;
  githubAvatar?: string;
  githubId?: string;
  githubUrl?: string;
  authProvider?: 'phone' | 'email' | 'github';
}

interface AuthModalProps {
  currentUser: UserAccount | null;
  initialMode?: 'phone' | 'pc' | 'login' | 'register';
  userBalance?: number;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenUserManagement?: () => void;
  onOpenPaymentModal?: (tab?: 'topup' | 'package' | 'code' | 'points_request' | 'get_permission') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  initialMode = 'login',
  userBalance = 0,
  onClose,
  onLoginSuccess,
  onLogout,
  onOpenUserManagement,
  onOpenPaymentModal,
}) => {
  const [mode, setMode] = useState<'phone' | 'pc' | 'login' | 'register'>(
    currentUser ? 'login' : initialMode
  );
  const [formData, setFormData] = useState({
    customId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const lastAccount = getLastSavedAccount();

  const handleGenerateRandomId = () => {
    const random5 = Math.floor(10000 + Math.random() * 90000).toString();
    setFormData((prev) => ({ ...prev, customId: random5 }));
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'customId') {
      // Keep up to 5 characters uppercase / digits
      const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
      setFormData((prev) => ({ ...prev, customId: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleQuickLoginLastAccount = async () => {
    if (!lastAccount) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await authenticateUserCredentials(lastAccount.phone || lastAccount.email);
      if (res.success && res.user) {
        persistActiveSession(res.user, true);
        setSuccessMessage(`✓ Сайн байна уу, ${res.user.name}! Амжилттай нэвтэрлээ.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setMode('phone');
        setFormData((prev) => ({
          ...prev,
          phone: lastAccount.phone || '',
          email: lastAccount.email || '',
          name: lastAccount.name || '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.trim().replace(/\s+/g, '');
    const cleanPassword = formData.password.trim();
    const cleanConfirmPassword = formData.confirmPassword.trim();

    setIsSubmitting(true);

    try {
      // 1. Phone Login mode
      if (mode === 'phone') {
        const lookup = cleanPhone || formData.customId.trim();
        if (!lookup || lookup.length < 5) {
          setError('⚠️ 5 оронтой Хэрэглэгчийн ID эсвэл утасны дугаараа оруулна уу (Жишээ нь: 54321, 99112233).');
          setIsSubmitting(false);
          return;
        }

        if (!cleanPassword || cleanPassword.length < 4) {
          setError('⚠️ Нууц үг эсвэл PIN кодоо оруулна уу (Хамгийн багадаа 4-6 оронтой).');
          setIsSubmitting(false);
          return;
        }

        const res = await authenticateUserCredentials(lookup, cleanPassword);
        if (!res.success || !res.user) {
          setError(res.error || '⚠️ Нууц үг буруу эсвэл хэрэглэгч олдсонгүй.');
          setIsSubmitting(false);
          return;
        }

        const userToLogin = res.user;
        if (cleanName && (!userToLogin.name || userToLogin.name.includes('Хэрэглэгч'))) {
          userToLogin.name = cleanName;
        }

        const targetBal = typeof userToLogin.walletBalance === 'number' ? userToLogin.walletBalance : 0;
        userToLogin.walletBalance = targetBal;
        try {
          localStorage.setItem('ioio_balance', String(targetBal));
        } catch {}

        persistActiveSession(userToLogin, rememberMe);
        await saveUserToFirestore(userToLogin, { walletBalance: targetBal });

        setSuccessMessage('✓ Амжилттай нэвтэрлээ! (Бүртгэл хадгалагдлаа)');
        setTimeout(() => {
          onLoginSuccess(userToLogin);
          onClose();
        }, 600);
        return;
      }

      // 2. Register mode
      if (mode === 'register') {
        const cleanCustomId = formData.customId.trim().toUpperCase();

        if (!cleanCustomId || cleanCustomId.length !== 5) {
          setError('⚠️ 5 оронтой Хэрэглэгчийн ID-гаа өөрөө зохиож оруулна уу (Жишээ: 54321, BAT88). Яг 5 оронтой байх ёстой.');
          setIsSubmitting(false);
          return;
        }

        if (!/^[A-Z0-9]{5}$/i.test(cleanCustomId)) {
          setError('⚠️ 5 оронтой ID зөвхөн тоо болон англи үсгээс бүрдэх ёстой (Жишээ: 77889, AZ109).');
          setIsSubmitting(false);
          return;
        }

        const isAvail = await isCustomIdAvailable(cleanCustomId);
        if (!isAvail) {
          setError(`⚠️ "${cleanCustomId}" ID-г өөр хэрэглэгч авсан байна. Өөр 5 оронтой ID зохиож оруулна уу.`);
          setIsSubmitting(false);
          return;
        }

        if (!cleanName) {
          setError('⚠️ Заавал өөрийн нэр эсвэл хоч нэрээ оруулна уу.');
          setIsSubmitting(false);
          return;
        }

        if (!cleanEmail && !cleanPhone) {
          setError('⚠️ Gmail хаяг эсвэл утасны дугаараа оруулна уу.');
          setIsSubmitting(false);
          return;
        }

        if (cleanEmail) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(cleanEmail)) {
            setError('⚠️ Зөв Gmail / Э-мэйл хаяг оруулна уу (Жишээ нь: bat@gmail.com).');
            setIsSubmitting(false);
            return;
          }
        }

        if (!cleanPassword || cleanPassword.length < 6) {
          setError('⚠️ Нууц үг заавал хамгийн багадаа 6 тэмдэгттэй байх ёстой.');
          setIsSubmitting(false);
          return;
        }

        if (cleanPassword !== cleanConfirmPassword) {
          setError('⚠️ Нууц үг тохирохгүй байна. Дахин шалгаж оруулна уу.');
          setIsSubmitting(false);
          return;
        }

        const finalEmail = cleanEmail || `${cleanPhone || cleanCustomId}@flicknime.mn`;
        const newUserRole = (finalEmail.toLowerCase() === 'batorgiltamir9@gmail.com') ? ('admin' as const) : ('user' as const);
        const now = new Date();
        const formattedRegisteredAt = `${now.toLocaleDateString('mn-MN')} ${now.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}`;
        const nowTimestamp = now.getTime();

        const newUser: UserAccount = {
          id: cleanCustomId,
          customId: cleanCustomId,
          name: cleanName,
          email: finalEmail,
          phone: cleanPhone || '',
          registeredAt: formattedRegisteredAt,
          registeredTimestamp: nowTimestamp,
          role: newUserRole,
          status: 'active',
          packageType: 'free',
          packageExpiry: '-',
          walletBalance: 0,
          purchasedMovies: [],
          isMockUser: false,
        };

        // Explicitly isolate new user balance to 0
        try {
          localStorage.setItem('ioio_balance', '0');
        } catch {}

        // Save credentials into both Firestore and LocalStorage
        await saveUserAuthRecord({
          id: cleanCustomId,
          customId: cleanCustomId,
          name: cleanName,
          email: finalEmail,
          phone: cleanPhone || '',
          password: cleanPassword,
        });

        await saveUserToFirestore(newUser, {
          id: cleanCustomId,
          customId: cleanCustomId,
          role: newUserRole,
          status: 'active',
          packageType: 'free',
          packageExpiry: '-',
          walletBalance: 0,
          purchasedMovies: [],
          registeredTimestamp: nowTimestamp,
          isMockUser: false,
        });

        // Direct Server REST API write to guarantee immediate cross-device visibility in admin panel
        try {
          await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          });
        } catch (e) {
          console.warn('Direct server registration sync notice:', e);
        }

        // Persist session securely
        persistActiveSession(newUser, rememberMe);

        // Notify app and admin panel immediately via Firestore & events
        try {
          await sendAdminNotification({
            type: 'NEW_USER',
            title: `🎉 Шинэ хэрэглэгч бүртгэгдлээ: ${newUser.name}`,
            message: `5 оронтой ID: #${cleanCustomId} | Утас: ${newUser.phone || '-'} | И-мэйл: ${newUser.email || '-'}`,
            userName: newUser.name,
            userPhone: newUser.phone,
            userEmail: newUser.email,
          });
        } catch (err) {
          console.warn('Admin notification warning:', err);
        }

        try {
          window.dispatchEvent(new CustomEvent('ioio_new_user_registered', { detail: newUser }));
        } catch {}

        setSuccessMessage(`🎉 Амжилттай бүртгэгдлээ! Таны 5 оронтой ID: #${cleanCustomId}. Шууд нэвтэрч байна...`);
        setTimeout(() => {
          onLoginSuccess(newUser);
          onClose();
        }, 700);
        return;
      }

      // 3. PC / Standard Email / ID Login mode
      const lookupTarget = cleanEmail || cleanPhone || formData.customId.trim();
      if (!lookupTarget) {
        setError('⚠️ 5 оронтой ID, Gmail хаяг эсвэл утасны дугаараа оруулна уу.');
        setIsSubmitting(false);
        return;
      }

      if (!cleanPassword) {
        setError('⚠️ Заавал нууц үгээ оруулна уу.');
        setIsSubmitting(false);
        return;
      }

      const res = await authenticateUserCredentials(lookupTarget, cleanPassword);
      if (!res.success || !res.user) {
        setError(res.error || '⚠️ Нууц үг буруу эсвэл бүртгэл олдсонгүй.');
        setIsSubmitting(false);
        return;
      }

      const loggedInUser = res.user;
      const targetBal = typeof loggedInUser.walletBalance === 'number' ? loggedInUser.walletBalance : 0;
      loggedInUser.walletBalance = targetBal;
      try {
        localStorage.setItem('ioio_balance', String(targetBal));
      } catch {}

      persistActiveSession(loggedInUser, rememberMe);
      await saveUserToFirestore(loggedInUser, { walletBalance: targetBal });

      setSuccessMessage('✓ Амжилттай нэвтэрлээ! (Бүртгэл хадгалагдлаа)');
      setTimeout(() => {
        onLoginSuccess(loggedInUser);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('⚠️ Алдаа гарлаа: ' + (err?.message || 'Дахин оролдоно уу'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#16161a] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100 my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                {currentUser ? 'Хэрэглэгчийн Бүртгэл' : mode === 'register' ? 'Шинээр Бүртгүүлэх' : 'Системд Нэвтрэх'}
              </h2>
              <p className="text-[11px] text-zinc-400">
                FlickNime кино сангийн бүртгэлийн систем
              </p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is already logged in -> Profile details View */}
        {currentUser ? (() => {
          const isAdmin = isAdminUser(currentUser);
          const animeExpiry = getAnimeExpiryDetails(currentUser);
          const effectiveBalance = typeof userBalance === 'number' ? userBalance : (currentUser.walletBalance || 0);
          const memberCode = getUserMemberCode(currentUser);
          const displayName = getUserDisplayName(currentUser);
          const roleLabel = isAdmin ? 'Админ' : currentUser?.role === 'vip' ? 'VIP Гишүүн' : 'Гишүүн';

          return (
            <div className="p-5 sm:p-6 space-y-4">
              {/* TOP USER CARD: Identical layout to screenshot */}
              <div className="bg-[#18181c] rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <AnimeAvatar size={54} />
                    {isAdmin && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded-full shadow">
                        👑
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-1.5 truncate">
                      <span>{displayName}</span>
                      <span className="text-zinc-400 font-semibold">#{memberCode}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{roleLabel}</p>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] my-3.5" />

                <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
                  <div className="flex items-center gap-2.5 pr-2">
                    <Calendar className="w-5 h-5 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Үлдсэн хоног</span>
                      {animeExpiry.hasAccess ? (
                        <span className="text-emerald-400 font-bold text-sm block truncate">
                          {isAdmin
                            ? 'Байнгын (2030)'
                            : animeExpiry.daysRemaining > 0
                            ? `${animeExpiry.daysRemaining} хоног`
                            : 'Идэвхтэй'}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-sm block">Дууссан</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 pl-3">
                    <Wallet className="w-5 h-5 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Хэтэвч</span>
                      <span className="text-white font-bold text-sm sm:text-base block truncate">
                        {effectiveBalance.toLocaleString()}₮
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 1: WALLET POINTS (ХЭТЭВЧ & ҮЛДЭГДЭЛ) */}
              <div className="p-3.5 bg-gradient-to-r from-amber-950/50 via-zinc-900 to-zinc-900 rounded-xl border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Дансны оноо (Хэтэвч):</span>
                      <h4 className="font-mono text-base sm:text-lg font-black text-amber-300">
                        {effectiveBalance.toLocaleString()} ₮ оноо
                      </h4>
                    </div>
                  </div>

                  {onOpenPaymentModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPaymentModal('points_request');
                      }}
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-black text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Админаас оноо авах</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 italic">
                  * 1₮ = 1 Оноо. Цэнэглэсэн оноо шууд таны дансанд орж анимэ үзэх боломжтой болно.
                </p>
              </div>

              {/* CARD 2: ANIME SUBSCRIPTION & EXPIRATION (АНИМЭ ЭРХ & ДУУСАХ ХУГАЦАА) */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                animeExpiry.hasAccess
                  ? 'bg-gradient-to-r from-rose-950/60 via-zinc-900 to-zinc-900 border-rose-500/50'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                      animeExpiry.hasAccess ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      🎌
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Анимэ үзэх эрхийн төлөв:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-xs sm:text-sm ${
                          animeExpiry.hasAccess ? 'text-white' : 'text-zinc-400'
                        }`}>
                          {animeExpiry.hasAccess ? '🎌 Анимэ Багц' : 'Эрх аваагүй байна'}
                        </span>
                        {animeExpiry.hasAccess ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Идэвхтэй</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold">
                            Эрхгүй
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {onOpenPaymentModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPaymentModal('get_permission');
                      }}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{animeExpiry.hasAccess ? 'Эрх сунгах' : 'Эрх авах'}</span>
                    </button>
                  )}
                </div>

                {/* Expiry Details Box */}
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/[0.08] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Эрх дуусах хугацаа:</span>
                    </span>
                    <span className="font-mono font-black text-white">
                      {animeExpiry.hasAccess ? `${animeExpiry.expiryDateStr} (${animeExpiry.countdownText})` : (animeExpiry.isExpired && animeExpiry.expiryDateStr !== '-' ? `Дууссан (${animeExpiry.expiryDateStr})` : 'Эрх аваагүй')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-400" />
                      <span>Таны оноо (Хэтэвч):</span>
                    </span>
                    <span className="font-mono font-black text-amber-300">
                      {effectiveBalance.toLocaleString()} ₮ оноо
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Үлдсэн хугацаа:</span>
                    </span>
                    <span className={`font-bold ${
                      animeExpiry.hasAccess
                        ? animeExpiry.isExpiringSoon ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                        : 'text-zinc-500'
                    }`}>
                      {animeExpiry.countdownText}
                    </span>
                  </div>
                </div>

                {/* Facebook support link */}
                <a
                  href="https://www.facebook.com/share/1LdgHqWqvz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-xs text-blue-200 transition-all group"
                  title="Асуух юм байвал энэ page-ээс мэдээлэл авах"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">f</span>
                    <span className="text-[11px]">Асуух юм байвал энэ page-ээс мэдээлэл авах</span>
                  </div>
                  <span className="text-[10px] text-blue-400 group-hover:text-blue-200 font-bold">
                    Нээх ↗
                  </span>
                </a>
              </div>

              {/* CARD 3: ACCOUNT INFO */}
              <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Утасны дугаар:</span>
                  <span className="font-bold text-white font-mono">{currentUser.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Бүртгүүлсэн огноо:</span>
                  <span className="font-bold text-white">{currentUser.registeredAt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Системийн статус:</span>
                  <span className="font-bold text-emerald-400">Хэвийн, идэвхтэй ✓</span>
                </div>
              </div>

              {/* GitHub Integration Status Banner - ЗӨВХӨН СИСТЕМИЙН АДМИНД ХАРАГДАНА */}
              {isAdmin && (
                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400 block font-bold">GitHub кодын сан холболт:</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-extrabold">Зөвхөн Админ</span>
                      </div>
                      <span className="font-bold text-white text-[11px]">
                        {currentUser.githubLogin ? (
                          <span className="text-emerald-400">@{currentUser.githubLogin} (Холбогдсон ✓)</span>
                        ) : (
                          <span className="text-zinc-400">Холбогдоогүй байна</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGitHubModal(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-[11px] font-bold border border-[#30363d] transition-colors cursor-pointer"
                  >
                    {currentUser.githubLogin ? 'Тохиргоо' : 'Холбох'}
                  </button>
                </div>
              )}

              {onOpenUserManagement && isAdmin && (
                <button
                  id="open-user-management-from-auth-modal"
                  onClick={() => {
                    onClose();
                    onOpenUserManagement();
                  }}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Системийн Удирдлага (Админ)</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="switch-account-btn"
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMode('phone');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Өөр хаягаар нэвтрэх</span>
                </button>

                <button
                  id="logout-btn"
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Системээс Гарах</span>
                </button>
              </div>
            </div>
          );
        })() : (
          /* Login or Register Form */
          <div className="p-5 space-y-4">
            {/* Mode Tabs: Утсаар нэвтрэх | PC | Бүртгүүлэх */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
              <button
                id="auth-tab-phone"
                type="button"
                onClick={() => {
                  setMode('phone');
                  setError(null);
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'phone'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Утсаар</span>
              </button>

              <button
                id="auth-tab-pc"
                type="button"
                onClick={() => {
                  setMode('pc');
                  setError(null);
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'pc' || mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">PC</span>
              </button>

              <button
                id="auth-tab-register"
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-amber-500 text-black shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Бүртгүүлэх</span>
              </button>
            </div>

            {/* Quick Context Banner for Mode */}
            {mode === 'phone' && (
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-cyan-200">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-snug">
                  <strong className="text-white block font-bold">Гар утасны дугаараар нэвтрэх</strong>
                  Утасны дугаар болон нууц үгээ оруулан шууд нэвтэрч анимэ үзнэ үү.
                </div>
              </div>
            )}

            {(mode === 'pc' || mode === 'login') && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-indigo-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-snug">
                  <strong className="text-white block font-bold">Компьютер / PC горимоор нэвтрэх</strong>
                  Gmail хаяг эсвэл нэвтрэх нэр, нууц үгээ оруулан нэвтэрнэ үү.
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-amber-200">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-snug">
                  <strong className="text-white block font-bold">Шинэ хэрэглэгчийн бүртгэл</strong>
                  Бүртгүүлсний дараа Анимэ багцын эрхээ авч хүссэн анимэгээ шууд үзээрэй.
                </div>
              </div>
            )}

            {lastAccount && !currentUser && (
              <div className="p-3 bg-zinc-900/90 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-400">Сүүлд нэвтэрсэн бүртгэл:</p>
                    <p className="text-xs font-bold text-white truncate">
                      {lastAccount.name} <span className="text-zinc-400 font-normal">({lastAccount.phone || lastAccount.email})</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickLoginLastAccount}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] rounded-lg shrink-0 transition-colors shadow cursor-pointer disabled:opacity-50"
                >
                  Шууд орох
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  {/* 5-digit Custom ID Field */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 rounded-xl border border-amber-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>5 Оронтой ID (Өөрөө зохиох):</span>
                      </label>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        formData.customId.length === 5 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {formData.customId.length}/5 орон {formData.customId.length === 5 ? '✓' : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">#</span>
                        <input
                          type="text"
                          name="customId"
                          maxLength={5}
                          required
                          value={formData.customId}
                          onChange={handleChange}
                          placeholder="Жишээ: 54321, BAT88"
                          className="w-full bg-zinc-950 border border-amber-500/40 focus:border-amber-400 rounded-xl py-2 pl-7 pr-3 text-xs text-amber-200 font-mono font-black tracking-widest placeholder-zinc-600 focus:outline-none transition-colors uppercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateRandomId}
                        className="px-2.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] rounded-xl shrink-0 transition-colors cursor-pointer shadow flex items-center gap-1"
                        title="Санамсаргүй 5 оронтой ID үүсгэх"
                      >
                        <span>🎲 Санамсаргүй</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-300/80 mt-1.5">
                      💡 Та энэхүү 5 оронтой ID-гаа өөрөө зохион системд нэвтрэхдээ ашиглана (Яг 5 оронтой тоо эсвэл үсэг).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Нэр / Хоч нэр:</span>
                      <span className="text-amber-400 text-[10px] font-semibold">(Заавал)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Жишээ: Батзориг"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Phone or 5-digit ID Field for Phone Mode or Register Mode */}
              {(mode === 'phone' || mode === 'register') && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{mode === 'phone' ? '5 оронтой ID эсвэл Утасны дугаар:' : 'Утасны дугаар:'}</span>
                    <span className={mode === 'phone' ? 'text-cyan-400 text-[10px] font-semibold' : 'text-zinc-500 text-[10px]'}>
                      {mode === 'phone' ? '(Заавал)' : '(Нэмэлт)'}
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      required={mode === 'phone'}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={mode === 'phone' ? '5 оронтой ID (54321) эсвэл утас (99112233)' : 'Жишээ нь: 99112233, 88105544'}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono tracking-wider"
                    />
                  </div>
                  {mode === 'phone' && (
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Та 5 оронтой Хэрэглэгчийн ID эсвэл 8 оронтой гар утасны дугаараараа нэвтэрч болно.
                    </p>
                  )}
                </div>
              )}

              {/* Email or ID field for PC mode or Register mode */}
              {(mode === 'pc' || mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{mode === 'pc' || mode === 'login' ? '5 оронтой ID / Gmail / Нэвтрэх нэр:' : 'Gmail хаяг:'}</span>
                    <span className="text-cyan-400 text-[10px] font-semibold">(Заавал)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={mode === 'register' ? 'email' : 'text'}
                      name="email"
                      required={mode !== 'phone'}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={mode === 'register' ? 'yourname@gmail.com' : '5 оронтой ID, Gmail эсвэл утасны дугаар'}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {mode === 'register' ? 'Бүртгэл баталгаажуулах үндсэн Gmail хаяг' : '5 оронтой ID, бүртгэлтэй Gmail эсвэл утасны дугаараа оруулна уу'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Нууц үг:</span>
                  <span className="text-cyan-400 text-[10px] font-semibold">
                    {mode === 'register' ? '(Заавал, 6+ тэмдэгт)' : '(Заавал)'}
                  </span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Нууц үг баталгаажуулах:</span>
                    <span className="text-cyan-400 text-[10px] font-semibold">(Заавал)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/20"
                  />
                  <span className="text-xs text-zinc-300 font-medium">
                    Бүртгэл хадгалах <span className="text-[10px] text-cyan-400">(Орох болгонд нэвтэрсэн байх)</span>
                  </span>
                </label>
              </div>

              <button
                id="submit-auth-btn"
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 font-black text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                  mode === 'phone'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-90'
                    : mode === 'pc' || mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:opacity-90'
                }`}
              >
                {isSubmitting ? (
                  <span>БАТАЛГААЖУУЛЖ БАЙНА...</span>
                ) : mode === 'phone' ? (
                  <>
                    <Phone className="w-4 h-4 fill-current" />
                    <span>УТСААР НЭВТРЭХ</span>
                  </>
                ) : mode === 'pc' || mode === 'login' ? (
                  <>
                    <Monitor className="w-4 h-4" />
                    <span>PC-ЭЭР НЭВТРЭХ</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>ШИНЭЭР БҮРТГҮҮЛЭХ</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-[11px] text-zinc-400 pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-2">
              {mode === 'register' ? (
                <span>
                  Танд бүртгэл байгаа юу?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('phone')}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Утсаар нэвтрэх
                  </button>
                  {' / '}
                  <button
                    type="button"
                    onClick={() => setMode('pc')}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    PC нэвтрэх
                  </button>
                </span>
              ) : (
                <span>
                  Бүртгэлгүй шинэ хэрэглэгч үү?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Энд дарж бүртгүүлнэ үү
                  </button>
                </span>
              )}
            </div>

            {/* Зөвхөн админ/хөгжүүлэгчийн жижиг холбоос (Бүртгэл доор харагдахгүй) */}
            {mode !== 'register' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  id="github-oauth-signin-btn"
                  onClick={() => setShowGitHubModal(true)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer opacity-75 hover:opacity-100"
                  title="Админ / Хөгжүүлэгчийн GitHub кодын сан холболт"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Админ GitHub кодын сан</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GitHub Integration Modal */}
      <GitHubConnectModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          onLoginSuccess(user);
          onClose();
        }}
      />
    </div>
  );
};

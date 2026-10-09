import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Wallet,
  BookOpen,
  Fingerprint,
  LogOut,
  ChevronRight,
  Calendar,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  X,
  CreditCard,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Film,
  Zap,
} from 'lucide-react';
import { UserAccount } from './AuthModal';
import { TabType } from '../types';
import {
  getUserMemberCode,
  getUserDisplayName,
  changeUserPassword,
  updateUserProfile,
} from '../lib/userService';
import { getAnimeExpiryDetails, isAdminUser } from '../lib/permissionService';
import { GitHubConnectModal } from './GitHubConnectModal';

// Crisp illustrated Anime Character avatar matching the screenshot
export const AnimeAvatar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 56,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-[#1e2025] border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background dark circle */}
        <circle cx="50" cy="50" r="50" fill="#24262c" />

        {/* Neck */}
        <path d="M42 66 H58 V80 H42 Z" fill="#e6b88a" />

        {/* Gray Shirt / High Collar */}
        <path
          d="M20 98 C20 82 32 74 44 74 H56 C68 74 80 82 80 98 Z"
          fill="#4a525d"
        />
        {/* Shirt Collar detail */}
        <path d="M44 74 L50 82 L56 74 Z" fill="#363c45" />
        <circle cx="50" cy="88" r="1.5" fill="#f0c674" />
        <circle cx="50" cy="94" r="1.5" fill="#f0c674" />

        {/* Face */}
        <path
          d="M32 40 C32 28 40 24 50 24 C60 24 68 28 68 40 C68 54 60 66 50 66 C40 66 32 54 32 40 Z"
          fill="#fddcb4"
        />

        {/* Ears */}
        <ellipse cx="31" cy="45" rx="3" ry="5" fill="#f5caa1" />
        <ellipse cx="69" cy="45" rx="3" ry="5" fill="#f5caa1" />

        {/* Eyes (Anime friendly eyes) */}
        <ellipse cx="43" cy="43" rx="2" ry="2.6" fill="#1e1e1e" />
        <ellipse cx="57" cy="43" rx="2" ry="2.6" fill="#1e1e1e" />
        <circle cx="43.8" cy="42.2" r="0.8" fill="#ffffff" />
        <circle cx="57.8" cy="42.2" r="0.8" fill="#ffffff" />

        {/* Eyebrows */}
        <path
          d="M39 37 Q43 35 47 37"
          stroke="#5a3d28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M53 37 Q57 35 61 37"
          stroke="#5a3d28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Smile */}
        <path
          d="M47 52 Q50 55 53 52"
          stroke="#b87258"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Anime Hair (Brown bangs and side tufts) */}
        <path
          d="M30 38 C28 26 38 18 50 18 C62 18 72 26 70 38 C68 35 64 33 60 34 C56 31 52 30 50 33 C46 30 42 32 38 35 C35 34 32 36 30 38 Z"
          fill="#70482b"
        />
        <path
          d="M32 38 Q37 42 41 37 Q45 44 51 36 Q55 43 60 37 Q65 42 68 38 C67 30 63 24 50 24 C37 24 33 30 32 38 Z"
          fill="#7f5332"
        />
      </svg>
    </div>
  );
};

interface UserProfileViewProps {
  currentUser: UserAccount | null;
  userBalance: number;
  onLogout: () => void;
  onOpenAuthModal: (mode?: 'phone' | 'pc' | 'login' | 'register') => void;
  onOpenPaymentModal: (tab?: 'topup' | 'package' | 'code' | 'points_request' | 'get_permission') => void;
  onOpenUserManagement?: () => void;
  onNavigateToTab?: (tab: TabType) => void;
  onUpdateCurrentUser?: (user: UserAccount) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  userBalance,
  onLogout,
  onOpenAuthModal,
  onOpenPaymentModal,
  onOpenUserManagement,
  onNavigateToTab,
  onUpdateCurrentUser,
}) => {
  // Biometric toggle state
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flicknime_biometric_enabled') === 'true';
    } catch {
      return false;
    }
  });

  // Modals state
  const [showMyProfileModal, setShowMyProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Edit name state inside profile modal
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(currentUser?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Change password form state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const animeExpiry = getAnimeExpiryDetails(currentUser);
  const memberCode = getUserMemberCode(currentUser);
  const displayName = getUserDisplayName(currentUser);

  const isAdmin = isAdminUser(currentUser);

  const roleLabel = isAdmin ? 'Админ' : currentUser?.role === 'vip' ? 'VIP Гишүүн' : 'Гишүүн';

  // Toggle biometrics handler
  const handleToggleBiometrics = () => {
    const nextState = !biometricsEnabled;
    setBiometricsEnabled(nextState);
    try {
      localStorage.setItem('flicknime_biometric_enabled', String(nextState));
    } catch {}

    if (nextState) {
      showToast('✓ Хурууны хээгээр хурдан нэвтрэх тохиргоо идэвхжлээ');
    } else {
      showToast('Хурууны хээгээр нэвтрэх тохиргоог цуцаллаа');
    }
  };

  // Copy Member ID
  const handleCopyId = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(`#${memberCode}`);
      setCopiedId(true);
      showToast(`Хэрэглэгчийн ID хуулагдлаа: #${memberCode}`);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  // Save new username
  const handleSaveName = async () => {
    if (!currentUser || !newNameInput.trim()) return;
    setIsSavingName(true);
    const res = await updateUserProfile(currentUser.id, { name: newNameInput.trim() });
    setIsSavingName(false);
    if (res.success) {
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({ ...currentUser, name: newNameInput.trim() });
      }
      setIsEditingName(false);
      showToast('✓ Нэр амжилттай солигдлоо!');
    } else {
      showToast(res.message);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentUser) return;
    if (!pwdNew || pwdNew.length < 6) {
      setPwdError('Шинэ нууц үг хамгийн багадаа 6 оронтой байх ёстой.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('Шинэ нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    setIsSubmittingPwd(true);
    const res = await changeUserPassword(
      currentUser.id,
      pwdNew,
      currentUser.email,
      currentUser.phone
    );
    setIsSubmittingPwd(false);

    if (res.success) {
      setPwdSuccess('✓ Нууц үг амжилттай солигдлоо!');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPwdSuccess(null);
      }, 1500);
    } else {
      setPwdError(res.message);
    }
  };

  // If user is not logged in, show friendly login hero
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="bg-[#18181c] rounded-3xl p-6 border border-white/[0.08] shadow-2xl text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800/80 border-2 border-white/10 flex items-center justify-center">
            <AnimeAvatar size={70} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Тавтай морил</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Та нэвтэрч орсноор эрх дуусах хугацаа, хэтэвчний үлдэгдэл оноо болон хадгалсан анимэгээ удирдах боломжтой.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal('phone')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 rounded-2xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Утсаар нэвтрэх
            </button>
            <button
              onClick={() => onOpenAuthModal('login')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-2xl text-xs border border-white/10 transition-transform active:scale-95 cursor-pointer"
            >
              Gmail-ээр нэвтрэх
            </button>
          </div>

          <button
            onClick={() => onOpenAuthModal('register')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer block mx-auto pt-1"
          >
            Шинээр бүртгэл үүсгэх үү?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-4 select-none pb-28">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-amber-500/80 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP USER CARD: Matches uploaded screenshot */}
      <div className="bg-[#18181c] rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Top Header Row with Avatar + Name #ID + Role */}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-bold text-base sm:text-lg tracking-tight truncate flex items-center gap-1.5">
                <span>{displayName}</span>
                <span className="text-zinc-400 font-semibold">#{memberCode}</span>
              </h1>
              <button
                onClick={handleCopyId}
                className="text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="ID хуулах"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-zinc-400 text-xs sm:text-sm font-medium">{roleLabel}</span>
              {isAdmin && (
                <button
                  onClick={onOpenUserManagement}
                  className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  Админ самбар ⚙️
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="border-t border-white/[0.08] my-4" />

        {/* Bottom Metrics: Left = Үлдсэн хоног, Right = Хэтэвч */}
        <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
          {/* Left Column: Үлдсэн хоног */}
          <div
            onClick={() => onOpenPaymentModal('get_permission')}
            className="flex items-center gap-3 pr-3 cursor-pointer group"
            title="Эрх сунгах эсвэл харах"
          >
            <Calendar className="w-5 h-5 text-zinc-400 shrink-0 group-hover:text-amber-400 transition-colors" />
            <div className="min-w-0">
              <span className="text-[11px] text-zinc-400 block font-medium">Үлдсэн хоног</span>
              {animeExpiry.hasAccess ? (
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold text-sm truncate">
                    {isAdmin
                      ? 'Байнгын (2030)'
                      : animeExpiry.daysRemaining > 0
                      ? `${animeExpiry.daysRemaining} хоног`
                      : 'Идэвхтэй'}
                  </span>
                </div>
              ) : (
                <span className="text-red-500 font-bold text-sm block">Дууссан</span>
              )}
            </div>
          </div>

          {/* Right Column: Хэтэвч */}
          <div
            onClick={() => onOpenPaymentModal('points_request')}
            className="flex items-center gap-3 pl-4 cursor-pointer group"
            title="Хэтэвч цэнэглэх"
          >
            <Wallet className="w-5 h-5 text-zinc-400 shrink-0 group-hover:text-amber-400 transition-colors" />
            <div className="min-w-0">
              <span className="text-[11px] text-zinc-400 block font-medium">Хэтэвч</span>
              <span className="text-white font-bold text-sm sm:text-base block truncate">
                {userBalance.toLocaleString()}₮
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MENU LIST: Matches screenshot layout */}
      <div className="bg-[#18181c] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden shadow-lg">
        {/* 1. Миний профайл */}
        <button
          id="profile-menu-item-details"
          onClick={() => {
            setNewNameInput(currentUser.name || '');
            setShowMyProfileModal(true);
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-zinc-300 shrink-0" />
            <span className="text-sm font-medium text-zinc-100">Миний профайл</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
        </button>

        {/* 2. Нууц үг солих */}
        <button
          id="profile-menu-item-password"
          onClick={() => {
            setPwdError(null);
            setPwdSuccess(null);
            setShowChangePasswordModal(true);
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-zinc-300 shrink-0" />
            <span className="text-sm font-medium text-zinc-100">Нууц үг солих</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
        </button>

        {/* 3. Хэтэвч */}
        <button
          id="profile-menu-item-wallet"
          onClick={() => onOpenPaymentModal('points_request')}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-zinc-300 shrink-0" />
            <span className="text-sm font-medium text-zinc-100">Хэтэвч</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold">
              {userBalance.toLocaleString()}₮
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
          </div>
        </button>

        {/* 4. Манга / Хадгалсан сан */}
        <button
          id="profile-menu-item-manga"
          onClick={() => {
            if (onNavigateToTab) {
              onNavigateToTab('favorites');
            }
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-zinc-300 shrink-0" />
            <span className="text-sm font-medium text-zinc-100">Манга</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
        </button>

        {/* 5. Хурууны хээгээр нэвтрэх with Toggle Switch */}
        <div
          id="profile-menu-item-biometrics"
          onClick={handleToggleBiometrics}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Fingerprint className="w-5 h-5 text-zinc-300 shrink-0" />
            <span className="text-sm font-medium text-zinc-100">Хурууны хээгээр нэвтрэх</span>
          </div>

          {/* Toggle pill matching screenshot */}
          <div
            className={`w-11 h-6 rounded-full transition-colors p-0.5 relative flex items-center ${
              biometricsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* RED LOGOUT BUTTON: Matches screenshot down to exact red aesthetic */}
      <div className="pt-4">
        <button
          id="profile-logout-button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-[#e50914] hover:bg-red-700 active:scale-[0.98] transition-all text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base shadow-xl cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Системээс гарах</span>
        </button>
      </div>

      {/* Support / Facebook link */}
      <div className="text-center pt-2">
        <a
          href="https://www.facebook.com/share/1LdgHqWqvz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-black inline-flex items-center justify-center">
            f
          </span>
          <span>Тусламж & Дэмжлэг авах (Facebook)</span>
        </a>
      </div>

      {/* SUB-MODAL 1: МИНИЙ ПРОФАЙЛ ДЭЛГЭРЭНГҮЙ */}
      {showMyProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#18181c] border border-white/10 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <User className="w-5 h-5 text-amber-400" />
                <span>Миний Профайл</span>
              </div>
              <button
                onClick={() => setShowMyProfileModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-white/[0.04] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <AnimeAvatar size={50} />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-400 block font-medium">Хэрэглэгчийн ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-400 text-base">
                    #{memberCode}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-white/[0.08] px-2 py-0.5 rounded cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Хуулагдлаа' : 'Хуулах'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Name editing */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-zinc-400">Нэр:</span>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newNameInput}
                      onChange={(e) => setNewNameInput(e.target.value)}
                      className="bg-black/60 text-white px-2 py-1 rounded text-xs border border-amber-400/50 focus:outline-none w-28"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="bg-amber-400 text-black px-2 py-1 rounded font-bold cursor-pointer"
                    >
                      {isSavingName ? '...' : 'Хадгалах'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{currentUser.name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-zinc-400">Имэйл хаяг:</span>
                <span className="font-medium text-white truncate max-w-[180px]">
                  {currentUser.email || '-'}
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-zinc-400">Утасны дугаар:</span>
                <span className="font-mono font-bold text-white">
                  {currentUser.phone || '-'}
                </span>
              </div>

              {/* Package Expiry */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-zinc-400">Үлдсэн хугацаа:</span>
                <span className={`font-bold ${animeExpiry.hasAccess ? 'text-emerald-400' : 'text-red-500'}`}>
                  {animeExpiry.hasAccess
                    ? isAdmin
                      ? 'Байнгын эрх'
                      : `${animeExpiry.daysRemaining} хоног (${animeExpiry.expiryDateStr})`
                    : 'Дууссан'}
                </span>
              </div>

              {/* Wallet */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-zinc-400">Хэтэвчний оноо:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {userBalance.toLocaleString()}₮
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setShowMyProfileModal(false);
                  onOpenPaymentModal('get_permission');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Эрх авах / сунгах
              </button>
              <button
                onClick={() => setShowMyProfileModal(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: НУУЦ ҮГ СОЛИХ */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#18181c] border border-white/10 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Нууц үг солих</span>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-white/[0.04] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  Шинэ нууц үг:
                </label>
                <input
                  type="password"
                  placeholder="Дор хаяж 6 тэмдэгт"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full bg-black/60 text-white placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 border border-white/[0.08] focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  Шинэ нууц үг баталгаажуулах:
                </label>
                <input
                  type="password"
                  placeholder="Дахин оруулна уу"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  className="w-full bg-black/60 text-white placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 border border-white/[0.08] focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingPwd}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  {isSubmittingPwd ? 'Шинэчилж байна...' : 'Нууц үг хадгалах'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
                >
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#18181c] border border-white/10 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Системээс гарах уу?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Та системээс гарснаар таны идэвхтэй нэвтрэлт дуусах болно.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
              >
                Тийм, гарах
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
              >
                Үгүй, буцах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  Laptop
} from 'lucide-react';
import { 
  saveUserToFirestore, 
  saveUserAuthRecord, 
  authenticateUserCredentials, 
  persistActiveSession,
  getLastSavedAccount 
} from '../lib/userService';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

interface AuthModalProps {
  currentUser: UserAccount | null;
  initialMode?: 'phone' | 'pc' | 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenUserManagement?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  onLogout,
  onOpenUserManagement,
}) => {
  const [mode, setMode] = useState<'phone' | 'pc' | 'login' | 'register'>(
    currentUser ? 'login' : initialMode
  );
  const [formData, setFormData] = useState({
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
  const lastAccount = getLastSavedAccount();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        if (!cleanPhone || cleanPhone.length < 6) {
          setError('⚠️ Зөв утасны дугаараа оруулна уу (Жишээ нь: 99112233, 88105544).');
          setIsSubmitting(false);
          return;
        }

        if (!cleanPassword || cleanPassword.length < 4) {
          setError('⚠️ Нууц үг эсвэл PIN кодоо оруулна уу (Хамгийн багадаа 4-6 оронтой).');
          setIsSubmitting(false);
          return;
        }

        const res = await authenticateUserCredentials(cleanPhone, cleanPassword);
        if (!res.success || !res.user) {
          setError(res.error || '⚠️ Нууц үг буруу эсвэл хэрэглэгч олдсонгүй.');
          setIsSubmitting(false);
          return;
        }

        const userToLogin = res.user;
        if (cleanName && (!userToLogin.name || userToLogin.name.includes('Хэрэглэгч'))) {
          userToLogin.name = cleanName;
        }

        persistActiveSession(userToLogin, rememberMe);
        saveUserToFirestore(userToLogin);

        setSuccessMessage('✓ Утасны дугаараар амжилттай нэвтэрлээ! (Бүртгэл хадгалагдлаа)');
        setTimeout(() => {
          onLoginSuccess(userToLogin);
          onClose();
        }, 600);
        return;
      }

      // 2. Register mode
      if (mode === 'register') {
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

        const finalEmail = cleanEmail || `${cleanPhone || Date.now()}@flicknime.mn`;
        const newUser: UserAccount = {
          id: 'user_' + Date.now(),
          name: cleanName,
          email: finalEmail,
          phone: cleanPhone || '99110000',
          registeredAt: new Date().toLocaleDateString('mn-MN'),
        };

        // Save credentials into both Firestore and LocalStorage
        await saveUserAuthRecord({
          id: newUser.id,
          name: cleanName,
          email: finalEmail,
          phone: cleanPhone || '99110000',
          password: cleanPassword,
        });

        await saveUserToFirestore(newUser, {
          role: finalEmail === 'tamir91441299@gmail.com' ? 'admin' : 'user',
          status: 'active',
          packageType: 'free',
          walletBalance: 0,
        });

        // Persist session securely so user never gets logged out on refresh
        persistActiveSession(newUser, rememberMe);

        setSuccessMessage('🎉 Бүртгэл амжилттай үүсэж хадгалагдлаа! Шууд нэвтэрч байна...');
        setTimeout(() => {
          onLoginSuccess(newUser);
          onClose();
        }, 700);
        return;
      }

      // 3. PC / Standard Email Login mode
      if (!cleanEmail && !cleanPhone) {
        setError('⚠️ Бүртгүүлсэн Gmail хаяг эсвэл нэвтрэх нэрээ оруулна уу.');
        setIsSubmitting(false);
        return;
      }

      if (!cleanPassword) {
        setError('⚠️ Заавал нууц үгээ оруулна уу.');
        setIsSubmitting(false);
        return;
      }

      const lookupTarget = cleanEmail || cleanPhone;
      const res = await authenticateUserCredentials(lookupTarget, cleanPassword);
      if (!res.success || !res.user) {
        setError(res.error || '⚠️ Нууц үг буруу эсвэл бүртгэл олдсонгүй.');
        setIsSubmitting(false);
        return;
      }

      const loggedInUser = res.user;
      persistActiveSession(loggedInUser, rememberMe);
      saveUserToFirestore(loggedInUser);

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
          const isAdmin = currentUser.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';
          return (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black font-black text-2xl flex items-center justify-center shadow-lg uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-zinc-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                    {isAdmin ? 'Админ Систем Удирдагч' : 'Баталгаажсан Хэрэглэгч'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Утасны дугаар:</span>
                  <span className="font-bold text-white">{currentUser.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Бүртгүүлсэн огноо:</span>
                  <span className="font-bold text-white">{currentUser.registeredAt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Бүртгэлийн төлөв:</span>
                  <span className="font-bold text-emerald-400">Идэвхтэй ✓</span>
                </div>
              </div>

              {onOpenUserManagement && isAdmin && (
                <button
                  id="open-user-management-from-auth-modal"
                  onClick={() => {
                    onClose();
                    onOpenUserManagement();
                  }}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Системийн Удирдлага (Админ)</span>
                </button>
              )}

              <button
                id="logout-btn"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Системээс Гарах
              </button>
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
                  Бүртгүүлснээр кино сангийн 1-р ангиудыг үнэгүй үзэх эрх нээгдэнэ.
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
              )}

              {/* Phone Field for Phone Mode or Register Mode */}
              {(mode === 'phone' || mode === 'register') && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Утасны дугаар:</span>
                    <span className={mode === 'phone' ? 'text-cyan-400 text-[10px] font-semibold' : 'text-zinc-500 text-[10px]'}>
                      {mode === 'phone' ? '(Заавал)' : '(Нэмэлт)'}
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      required={mode === 'phone'}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Жишээ нь: 99112233, 88105544"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono tracking-wider"
                    />
                  </div>
                  {mode === 'phone' && (
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Монгол улсын 8 оронтой гар утасны дугаараа бичнэ үү.
                    </p>
                  )}
                </div>
              )}

              {/* Email field for PC mode or Register mode */}
              {(mode === 'pc' || mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{mode === 'pc' || mode === 'login' ? 'Gmail / Нэвтрэх нэр:' : 'Gmail хаяг:'}</span>
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
                      placeholder={mode === 'register' ? 'yourname@gmail.com' : 'Gmail хаяг эсвэл утасны дугаар'}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {mode === 'register' ? 'Бүртгэл баталгаажуулах үндсэн Gmail хаяг' : 'Бүртгэлтэй Gmail хаягаа оруулна уу'}
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

            <div className="text-center text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex items-center justify-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
};

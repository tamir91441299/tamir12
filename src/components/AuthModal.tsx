import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, UserPlus, LogIn, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { saveUserToFirestore } from '../lib/userService';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

interface AuthModalProps {
  currentUser: UserAccount | null;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenUserManagement?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
  onOpenUserManagement,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(currentUser ? 'login' : 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.trim();
    const cleanPassword = formData.password.trim();
    const cleanConfirmPassword = formData.confirmPassword.trim();

    if (mode === 'register') {
      if (!cleanName) {
        setError('⚠️ Заавал өөрийн нэр эсвэл хоч нэрээ оруулна уу.');
        return;
      }

      if (!cleanEmail) {
        setError('⚠️ Заавал Gmail хаягаа оруулна уу (Жишээ нь: yourname@gmail.com).');
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        setError('⚠️ Зөв Gmail / Э-мэйл хаяг оруулна уу (Жишээ нь: bat@gmail.com).');
        return;
      }

      if (!cleanPassword || cleanPassword.length < 6) {
        setError('⚠️ Нууц үг заавал хамгийн багадаа 6 тэмдэгттэй байх ёстой.');
        return;
      }

      if (cleanPassword !== cleanConfirmPassword) {
        setError('⚠️ Нууц үг тохирохгүй байна. Дахин шалгаж оруулна уу.');
        return;
      }

      // Save user credentials locally for login verification
      try {
        const credentialsMapStr = localStorage.getItem('ioio_user_auth_records');
        const credMap = credentialsMapStr ? JSON.parse(credentialsMapStr) : {};
        credMap[cleanEmail] = {
          password: cleanPassword,
          name: cleanName,
          phone: cleanPhone || '99110000',
        };
        localStorage.setItem('ioio_user_auth_records', JSON.stringify(credMap));
      } catch (e) {
        console.error('Error saving credentials:', e);
      }

      const newUser: UserAccount = {
        id: 'user_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || '99110000',
        registeredAt: new Date().toLocaleDateString('mn-MN'),
      };

      saveUserToFirestore(newUser, {
        role: cleanEmail === 'tamir91441299@gmail.com' ? 'admin' : 'user',
        status: 'active',
        packageType: 'free',
        walletBalance: 0,
      });

      setSuccessMessage('🎉 Амжилттай бүртгэгдлээ! Системд нэвтэрч байна...');
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 1000);
    } else {
      // Login mode
      if (!cleanEmail) {
        setError('⚠️ Заавал бүртгүүлсэн Gmail хаягаа оруулна уу.');
        return;
      }

      if (!cleanPassword) {
        setError('⚠️ Заавал нууц үгээ оруулна уу.');
        return;
      }

      // Check registered credentials if available
      try {
        const credentialsMapStr = localStorage.getItem('ioio_user_auth_records');
        if (credentialsMapStr) {
          const credMap = JSON.parse(credentialsMapStr);
          if (credMap[cleanEmail] && credMap[cleanEmail].password) {
            if (credMap[cleanEmail].password !== cleanPassword) {
              setError('⚠️ Нууц үг буруу байна. Шалгаад дахин оролдоно уу.');
              return;
            }
          }
        }
      } catch (e) {
        console.error('Error verifying credentials:', e);
      }

      const loggedInUser: UserAccount = {
        id: currentUser ? currentUser.id : 'user_' + Date.now(),
        name: cleanName || cleanEmail.split('@')[0] || 'Хэрэглэгч',
        email: cleanEmail,
        phone: cleanPhone || '99106883',
        registeredAt: new Date().toLocaleDateString('mn-MN'),
      };

      saveUserToFirestore(loggedInUser);

      setSuccessMessage('✓ Амжилттай нэвтэрлээ!');
      setTimeout(() => {
        onLoginSuccess(loggedInUser);
        onClose();
      }, 800);
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
            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                id="auth-tab-register"
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-cyan-500 text-black shadow font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Бүртгүүлэх</span>
              </button>
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-cyan-500 text-black shadow font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Нэвтрэх</span>
              </button>
            </div>

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
                    <span className="text-cyan-400 text-[10px] font-semibold">(Заавал)</span>
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
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Gmail хаяг:</span>
                  <span className="text-cyan-400 text-[10px] font-semibold">(Заавал)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Жишээ: yourname@gmail.com"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {mode === 'register' ? 'Бүртгэл баталгаажуулах үндсэн Gmail хаяг' : 'Бүртгүүлсэн Gmail хаягаа оруулна уу'}
                </p>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Утасны дугаар:</span>
                    <span className="text-zinc-500 text-[10px] font-normal">(Нэмэлт)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9910XXXX (заавал биш)"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Нууц үг:</span>
                  <span className="text-cyan-400 text-[10px] font-semibold">(Заавал, 6+ тэмдэгт)</span>
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

              <button
                id="submit-auth-btn"
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{mode === 'register' ? 'БҮРТГҮҮЛЭХ' : 'НЭВТРЭХ'}</span>
              </button>
            </form>

            <div className="text-center text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
              {mode === 'register' ? (
                <span>
                  Танд бүртгэл байгаа юу?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Энд дарж нэвтэрнэ үү
                  </button>
                </span>
              ) : (
                <span>
                  Бүртгэлгүй юу?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Шинээр бүртгүүлэх
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

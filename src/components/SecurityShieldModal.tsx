import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, KeyRound, X, Check, Terminal, EyeOff, Sparkles, UserCheck } from 'lucide-react';
import { UserAccount } from './AuthModal';

interface SecurityShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
}

export const SecurityShieldModal: React.FC<SecurityShieldModalProps> = ({
  isOpen,
  onClose,
  reason = 'F12 болон хөгжүүлэгчийн хэрэгсэл (DevTools) хаалттай байна.',
  currentUser,
  onOpenAuthModal,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  return (
    <div
      id="security-shield-modal-container"
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div
        id="security-shield-modal-card"
        className="w-full max-w-lg bg-zinc-950 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden flex flex-col items-center text-center space-y-6"
      >
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-security-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-pulse">
          <ShieldCheck className="w-10 h-10" />
        </div>

        {/* Text Header */}
        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Аюулгүй Байдлын Хамгаалалт</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Эх Код & Видео Линк Хамгаалагдсан
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
            Энэхүү платформ нь эх код, киноны шууд холбоосууд (Streaming Links), болон эрхийн кодуудыг хуулбарлахаас сэргийлсэн хамгаалалтын системтэй тул{' '}
            <strong className="text-emerald-400">F12</strong>, <strong className="text-emerald-400">Inspect</strong>, болон хулганы баруун товч хязгаарлагдсан байна.
          </p>
        </div>

        {/* Feature List Badges */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>F12 & Shortcut түгжигдсэн</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>Видео урсгал шифрлэгдсэн</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>Эрхийн кодууд далдлагдсан</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            <span>Зөвхөн Админд нээлттэй</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdmin ? (
            <div className="w-full bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Админ эрхээр нэвтэрсэн байна. Бүрэн хандах эрх нээлттэй.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-emerald-500 text-black font-extrabold rounded-lg hover:bg-emerald-400 cursor-pointer"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          ) : (
            <>
              <button
                id="btn-admin-auth-from-shield"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full sm:w-auto px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Зөвхөн админ нэвтрэх</span>
              </button>

              <button
                id="btn-understood-security"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Ойлголоо, үзэх
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

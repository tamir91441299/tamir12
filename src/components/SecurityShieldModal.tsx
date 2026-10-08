import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, KeyRound, X, Check, Terminal, EyeOff, Sparkles, UserCheck, Camera, Video, AlertTriangle } from 'lucide-react';
import { UserAccount } from './AuthModal';
import { isAdminUser } from '../lib/permissionService';

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
  reason = 'Сайт дотор зураг дарах, видео хийх болон эх код харахыг хориглосон байна.',
  currentUser,
  onOpenAuthModal,
}) => {
  if (!isOpen) return null;

  const isAdmin = isAdminUser(currentUser);

  return (
    <div
      id="security-shield-modal-container"
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div
        id="security-shield-modal-card"
        className="w-full max-w-lg bg-zinc-950 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-500/20 text-white relative overflow-hidden flex flex-col items-center text-center space-y-6"
      >
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

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
        <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/30 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Text Header */}
        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Агуулгын Хамгаалалт</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Зураг Дарах & Видео Хийх Хориглогдсон
          </h3>

          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 text-left space-y-1">
            <p className="text-xs font-bold text-rose-200 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed pt-1">
            Энэхүү платформ дээрх кино, анимэ контент болон дүрслэлийг хамгаалах үүднээс <strong className="text-rose-400">зураг дарах (Screenshot)</strong> болон <strong className="text-rose-400">видео бичлэг хийхийг</strong> бүрэн хориглосон байна.{' '}
            <span className="block mt-1 font-bold text-amber-300">
              👑 Зөвхөн админ (batorgiltamir9@gmail.com) эдгээрийг хийх эрхтэй.
            </span>
          </p>
        </div>

        {/* Feature List Badges */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-300">
            <Camera className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Зураг дарах (PrtScn) хаалттай</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Video className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Видео бичлэг хийх хориотой</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>Шууд линк & F12 түгжигдсэн</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Зөвхөн Админд бүрэн нээлттэй</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdmin ? (
            <div className="w-full bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Админ эрхээр нэвтэрсэн байна. Та зураг авч, видео хийж болно.
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
                <span>Админ эрхээр нэвтрэх</span>
              </button>

              <button
                id="btn-understood-security"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Ойлголоо, хаах
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

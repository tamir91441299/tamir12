import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, KeyRound, AlertCircle, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { verifyProtectedPasscode, getProtectedWindowPasscode } from '../lib/passcodeService';

interface PasscodePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  isAdmin?: boolean;
}

export const PasscodePromptModal: React.FC<PasscodePromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Шинэ Цонхоор Үзэх Нууц Код',
  subtitle = 'Хамгаалалттай тоглуулагчаар үзэхийн тулд хандалтын нууц кодыг оруулна уу.',
  isAdmin = false,
}) => {
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPlain, setShowPlain] = useState(false);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputPin('');
      setErrorMsg(null);
      setIsShaking(false);
      setIsSuccessAnim(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputPin.trim();

    if (!clean) {
      setErrorMsg('Нууц кодыг оруулна уу.');
      triggerShake();
      return;
    }

    const isValid = verifyProtectedPasscode(clean);

    if (isValid) {
      setErrorMsg(null);
      setIsSuccessAnim(true);
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setErrorMsg('⚠️ Нууц код буруу байна! Дахин шалгана уу.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleDigitClick = (digit: string) => {
    if (inputPin.length >= 8) return;
    setErrorMsg(null);
    setInputPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setInputPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg(null);
    setInputPin('');
  };

  const activePasscodeHint = getProtectedWindowPasscode();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm bg-[#0f1117] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl text-zinc-100 flex flex-col transition-transform ${
          isShaking ? 'animate-bounce text-rose-400' : ''
        }`}
      >
        {/* Glow Header */}
        <div className="relative p-5 bg-gradient-to-b from-emerald-950/60 via-zinc-900/80 to-[#0f1117] border-b border-white/[0.08] text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/80 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0c10] rounded-[14px] flex items-center justify-center">
              {isSuccessAnim ? (
                <Check className="w-7 h-7 text-emerald-400 animate-in zoom-in-50 duration-200" />
              ) : (
                <Lock className="w-7 h-7 text-emerald-400" />
              )}
            </div>
          </div>

          <h3 className="font-black text-base sm:text-lg text-white tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Input & Keypad Form */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Input field */}
            <div className="relative">
              <input
                ref={inputRef}
                type={showPlain ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={inputPin}
                onChange={(e) => {
                  setErrorMsg(null);
                  setInputPin(e.target.value);
                }}
                placeholder="Нууц кодоо оруулна уу..."
                className="w-full bg-black/60 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-2xl py-3 px-4 text-center font-mono text-xl tracking-[0.25em] text-white placeholder:text-zinc-600 focus:outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPlain(!showPlain)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl text-center justify-center font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Admin Hint / Info */}
            {isAdmin && (
              <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl flex items-center justify-between">
                <span>Админ код: <strong>{activePasscodeHint}</strong></span>
                <span className="text-[9px] text-zinc-400">Өөрчлөх боломжтой</span>
              </div>
            )}

            {/* Numeric Keypad for fast touch & mouse entry */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] hover:border-emerald-500/40 text-white font-mono font-bold text-lg active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs active:scale-95 transition-all cursor-pointer border border-white/[0.04]"
              >
                Цэвэрлэх
              </button>

              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] hover:border-emerald-500/40 text-white font-mono font-bold text-lg active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs active:scale-95 transition-all cursor-pointer border border-white/[0.04]"
              >
                ← Арилгах
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSuccessAnim}
              className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${
                isSuccessAnim
                  ? 'bg-emerald-500 text-black shadow-emerald-500/40'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 text-black shadow-emerald-500/25'
              }`}
            >
              {isSuccessAnim ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>НЭВТРЭВ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ШИНЭ ЦОНХООР ҮЗЭХ</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

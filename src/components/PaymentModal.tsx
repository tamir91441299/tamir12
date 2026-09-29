import React, { useState } from 'react';
import { X, CheckCircle, QrCode, Wallet, CreditCard, ShieldCheck, RefreshCw, Copy, Check, Ticket, KeyRound, Send, Phone, Zap, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Movie } from '../types';
import { UserAccount } from './AuthModal';
import { redeemCode } from '../lib/codeService';
import { submitRechargeRequest, clearUserPendingRechargeRequests, executeDirectInstantTopUp } from '../lib/rechargeService';
import { getAnimeExpiryDetails, calculateExtendedExpiryDate, isAdminUser } from '../lib/permissionService';

interface PaymentModalProps {
  movie: Movie | null;
  currentUser?: UserAccount | null;
  userBalance: number;
  isMonthlyVip?: boolean;
  isAnimePackage: boolean;
  isMoviePackage?: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
  onPaymentSuccess: (movieId: string, deductedAmount?: number) => void;
  onSubscribePackage: (
    packageType: 'anime' | 'movie' | 'full_vip',
    deductedAmount: number,
    durationMonths?: number,
    durationDays?: number,
    isCodeRedemption?: boolean
  ) => void;
  onTopUpBalance: (amount: number) => void;
}

export type PlanDurationId = '15d' | '1m' | '2m' | '3m' | '6m' | '1y';

export interface PlanConfig {
  id: PlanDurationId;
  label: string;
  subLabel: string;
  durationDays: number;
  durationMonths: number;
  price: number;
  badge?: string;
  badgeStyle?: string;
}

const PLANS: PlanConfig[] = [
  {
    id: '15d',
    label: '15 ХОНОГ',
    subLabel: '15 Хоног эрх',
    durationDays: 15,
    durationMonths: 0.5,
    price: 2500,
    badge: '2.5k Богино',
    badgeStyle: 'bg-rose-600 text-white',
  },
  {
    id: '1m',
    label: '1 САР',
    subLabel: '30 Хоног эрх',
    durationDays: 30,
    durationMonths: 1,
    price: 5000,
    badge: '5k Түгээмэл',
    badgeStyle: 'bg-emerald-600 text-white',
  },
  {
    id: '2m',
    label: '2 САР',
    subLabel: '60 Хоног эрх',
    durationDays: 60,
    durationMonths: 2,
    price: 8500,
    badge: '8.5k Хэмнэлт',
    badgeStyle: 'bg-amber-400 text-black font-black',
  },
  {
    id: '3m',
    label: '3 САР',
    subLabel: '90 Хоног эрх',
    durationDays: 90,
    durationMonths: 3,
    price: 12000,
    badge: 'Онцлох',
    badgeStyle: 'bg-cyan-500 text-black font-black',
  },
  {
    id: '6m',
    label: '6 САР',
    subLabel: '180 Хоног эрх',
    durationDays: 180,
    durationMonths: 6,
    price: 22000,
    badge: 'Супер хэмнэлт',
    badgeStyle: 'bg-purple-600 text-white font-black',
  },
  {
    id: '1y',
    label: '1 ЖИЛ',
    subLabel: '365 Хоног эрх',
    durationDays: 365,
    durationMonths: 12,
    price: 40000,
    badge: 'Бүтэн жил Анимэ',
    badgeStyle: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black',
  },
];

const TOP_UP_PRESETS = [
  { amount: 2500, label: '2,500 ₮', note: '15 хоногийн анимэ эрх' },
  { amount: 5000, label: '5,000 ₮', note: '1 сарын анимэ эрх' },
  { amount: 8500, label: '8,500 ₮', note: '2 сарын анимэ эрх' },
  { amount: 10000, label: '10,000 ₮', note: 'Хэмнэлттэй цэнэглэлт' },
  { amount: 20000, label: '20,000 ₮', note: 'VIP хэтэвч цэнэглэлт' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  movie,
  currentUser,
  userBalance,
  isMonthlyVip,
  isAnimePackage,
  isMoviePackage,
  onClose,
  onOpenAuthModal,
  onPaymentSuccess,
  onSubscribePackage,
  onTopUpBalance,
}) => {
  // Main Tab: 'topup' (Шууд оноо авах) | 'package' (Анимэ багц идэвхжүүлэх) | 'code' (Эрхийн код)
  const [mainTab, setMainTab] = useState<'topup' | 'package' | 'code'>(movie ? 'package' : 'topup');

  // Top Up Points state
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number>(2500);
  const [customTopUpInput, setCustomTopUpInput] = useState<string>('');

  // Subscription package duration
  const [selectedPlanId, setSelectedPlanId] = useState<PlanDurationId>('15d');
  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];
  const activePrice = currentPlan.price;

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'monpay' | 'qpay' | 'code'>('monpay');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsgText, setSuccessMsgText] = useState<string>('');
  const [topUpRequestSent, setTopUpRequestSent] = useState(false);
  const [topUpSuccessNotice, setTopUpSuccessNotice] = useState<string>('');
  const [copiedMonpay, setCopiedMonpay] = useState(false);

  // User contact input for recharge confirmation
  const [userPhoneInput, setUserPhoneInput] = useState<string>(currentUser?.phone || '');
  const [userNoteInput, setUserNoteInput] = useState<string>('');

  // Activation Code States
  const [inputActivationCode, setInputActivationCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const monpayNumber = '99106883518';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMonpay(true);
    setTimeout(() => setCopiedMonpay(false), 2000);
  };

  const handleRedeemActivationCode = (codeToRedeem?: string) => {
    const targetCode = (codeToRedeem || inputActivationCode).trim();
    if (!targetCode) {
      setCodeError('Идэвхжүүлэх кодоо оруулна уу.');
      return;
    }

    setCodeError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const res = redeemCode(targetCode);

      if (res.success) {
        setIsSuccess(true);
        setSuccessMsgText(res.message);

        setTimeout(() => {
          onSubscribePackage('anime', 0, res.durationDays ? Math.round(res.durationDays / 30) : 1, res.durationDays, true);
          if (res.type === 'points' && res.pointsAdded) {
            onTopUpBalance(res.pointsAdded);
          }
        }, 1200);
      } else {
        setCodeError(res.message);
      }
    }, 600);
  };

  const isUserAdmin = isAdminUser(currentUser);
  const animeExpiryInfo = getAnimeExpiryDetails(currentUser);
  const projectedExpiryDate = calculateExtendedExpiryDate(currentUser?.packageExpiry, currentPlan.durationDays);

  // Helper to determine the effective top-up amount
  const getEffectiveTopUpAmount = (): number => {
    const custom = parseInt(customTopUpInput.replace(/\D/g, ''), 10);
    if (!isNaN(custom) && custom > 0) return custom;
    return selectedTopUpAmount;
  };

  // 1. Top-Up Points Handler: For non-admins, sends transfer request to Admin Tamir. Admin can instantly test.
  const handleInstantTopUpPoints = async (overrideAmount?: number) => {
    const amountToCredit = overrideAmount || getEffectiveTopUpAmount();
    if (amountToCredit <= 0) {
      alert('Цэнэглэх онооны дүнгээ зөв оруулна уу.');
      return;
    }

    if (!isUserAdmin) {
      // Non-admins must submit transfer request for Admin review
      await handleSubmitPendingTransfer(amountToCredit, `${amountToCredit.toLocaleString()}₮ Данс цэнэглэлт`);
      return;
    }

    setIsVerifying(true);
    try {
      if (currentUser?.id) {
        await executeDirectInstantTopUp({
          userId: currentUser.id,
          userName: currentUser.name || 'Хэрэглэгч',
          userPhone: userPhoneInput.trim() || currentUser.phone || '',
          userEmail: currentUser.email || '',
          amount: amountToCredit,
          method: paymentMethod,
          note: `[Админ] Шууд данс цэнэглэлт (+${amountToCredit.toLocaleString()}₮)`,
        });
      }
    } catch (e) {
      console.error('Instant top-up background sync:', e);
    }

    onTopUpBalance(amountToCredit);
    clearUserPendingRechargeRequests(currentUser);
    setIsVerifying(false);
    setIsSuccess(true);
    setSuccessMsgText(
      `🎉 [АДМИН] ТАНЫ ДАНС АМЖИЛТТАЙ ЦЭНЭГЛЭГДЛЭЭ!\n\n+${amountToCredit.toLocaleString()} ₮ оноо шууд таны дансанд орлоо.\nТаны шинэ үлдэгдэл: ${(userBalance + amountToCredit).toLocaleString()} ₮.`
    );
  };

  // 2. Direct Instant Anime Package Activation: Only available to Admin for testing. Non-admins CANNOT use this!
  const handleInstantActivatePackage = async () => {
    if (!isUserAdmin) {
      alert('⛔ Оноогүй хэрэглэгч анимэ эрх авах боломжгүй! Та эхлээд дансаа оноогоор цэнэглэнэ үү эсвэл шилжүүлгийн хүсэлтээ илгээнэ үү.');
      return;
    }

    setIsVerifying(true);
    const newExpiry = calculateExtendedExpiryDate(currentUser?.packageExpiry, currentPlan.durationDays);
    clearUserPendingRechargeRequests(currentUser);

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setSuccessMsgText(
        `🎉 [АДМИН ТЕСТ] АНИМЭ БАГЦ ШУУД ИДЭВХЖИЛЭЭ!\n\n${currentPlan.label} (${currentPlan.durationDays} хоног) эрх амжилттай нээгдлээ.\nДуусах хугацаа: ${newExpiry} хүртэл.`
      );
      setTimeout(() => {
        onSubscribePackage('anime', 0, currentPlan.durationMonths, currentPlan.durationDays, true);
      }, 1000);
    }, 600);
  };

  // 3. Submit payment transfer request to Admin queue (Points are NOT credited until Admin Tamir approves!)
  const handleSubmitPendingTransfer = async (targetAmount: number, targetLabel: string) => {
    if (!currentUser) {
      alert('⚠️ Анимэ эрх авах болон төлбөр төлөхийн тулд эхлээд системд нэвтэрнэ үү.');
      onClose();
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const phone = (userPhoneInput.trim() || currentUser.phone || '').trim();
    if (!phone) {
      alert('⚠️ Гүйлгээ шалгахад шаардлагатай утасны дугаараа оруулна уу.');
      return;
    }

    setIsVerifying(true);

    try {
      await submitRechargeRequest({
        userId: currentUser.id,
        userName: currentUser.name || 'Хэрэглэгч',
        userPhone: phone,
        userEmail: currentUser.email || '',
        planId: currentPlan.id,
        planLabel: targetLabel,
        durationDays: currentPlan.durationDays,
        amount: targetAmount,
        method: paymentMethod === 'qpay' ? 'qpay' : 'monpay',
        note: userNoteInput.trim() || `${targetLabel} (${targetAmount.toLocaleString()}₮) шилжүүлэг илгээв`,
      });
    } catch (e) {
      console.error('Recharge request submission error:', e);
    }

    setIsVerifying(false);
    setTopUpRequestSent(true);
    setTopUpSuccessNotice(
      `📩 Таны ${targetAmount.toLocaleString()} ₮ дүнтэй шилжүүлгийн хүсэлтийг Админ Тамирт амжилттай илгээлээ.\n\nАдмин таны шилжүүлгийг (MonPay: ${monpayNumber}) шалгаж баталгаажуулсны дараа таны дансанд оноо орж, анимэ үзэх эрх нээгдэнэ.\n\n⚠️ Админ шалгаж баталгаажуулах хүртэл оноогүй тул анимэ түр түгжээтэй байна.`
    );
  };

  // Main Confirm Handler
  const handleConfirmPayment = async () => {
    if (mainTab === 'code' || paymentMethod === 'code') {
      handleRedeemActivationCode();
      return;
    }

    if (mainTab === 'topup') {
      handleSubmitPendingTransfer(effectiveTopUp, `${effectiveTopUp.toLocaleString()}₮ Данс цэнэглэлт`);
      return;
    }

    // Package mode with wallet points
    if (paymentMethod === 'wallet') {
      if (userBalance < activePrice) {
        alert(
          `⛔ Оноо хүрэлцэхгүй байна! Танд ${userBalance.toLocaleString()}₮ оноо байна. Энэ анимэ багцыг авахад ${activePrice.toLocaleString()}₮ оноо шаардлагатай.\n\nОноогүй хэрэглэгч анимэ эрх авах боломжгүй! Та "⚡ Оноо Цэнэглэх" цэснээс MonPay (${monpayNumber}) эсвэл QPay-ээр шилжүүлэг хийж дансаа цэнэглэнэ үү.`
        );
        setMainTab('topup');
        return;
      }

      setIsVerifying(true);
      const newExpiry = calculateExtendedExpiryDate(currentUser?.packageExpiry, currentPlan.durationDays);
      setTimeout(() => {
        setIsVerifying(false);
        setIsSuccess(true);
        setSuccessMsgText(
          `🎉 АНИМЭ БАГЦ ОНООГООР АМЖИЛТТАЙ ИДЭВХЖЛЭЭ!\n\n${currentPlan.label} (${activePrice.toLocaleString()}₮ оноо хасагдлаа).\nДуусах хугацаа: ${newExpiry} хүртэл сунгагдлаа.\n\nҮлдсэн онооны үлдэгдэл: ${(userBalance - activePrice).toLocaleString()} ₮.`
        );

        setTimeout(() => {
          onSubscribePackage('anime', activePrice, currentPlan.durationMonths, currentPlan.durationDays);
        }, 1200);
      }, 700);
      return;
    }

    // Package mode with MonPay / QPay transfer request
    handleSubmitPendingTransfer(activePrice, currentPlan.label);
  };

  const effectiveTopUp = getEffectiveTopUpAmount();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#17171a] border border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-[#121214] to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>ДАНС & БАГЦ ЦЭНЭГЛЭЛТ</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                  {userBalance.toLocaleString()} ₮
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Оноо шууд цэнэглэх • 15 хоног, 1 сар, 2 сарын Анимэ эрх авах
              </p>
            </div>
          </div>

          <button
            id="close-payment-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top-Level Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-2 border-b border-zinc-800 shrink-0 text-xs font-black">
          <button
            type="button"
            id="tab-mode-topup"
            onClick={() => setMainTab('topup')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'topup'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-black shadow-md font-extrabold ring-1 ring-amber-400'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Оноо Цэнэглэх</span>
          </button>

          <button
            type="button"
            id="tab-mode-package"
            onClick={() => setMainTab('package')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'package'
                ? 'bg-rose-600 text-white shadow-md font-extrabold ring-1 ring-rose-400'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <span>🎌 Анимэ Багц</span>
          </button>

          <button
            type="button"
            id="tab-mode-code"
            onClick={() => {
              setMainTab('code');
              setPaymentMethod('code');
            }}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'code'
                ? 'bg-cyan-500 text-black shadow-md font-extrabold ring-1 ring-cyan-400'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>🎟️ Эрхийн Код</span>
          </button>
        </div>

        {/* Content with smooth independent scrolling */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* TAB 1: DIRECT TOP-UP POINTS */}
          {mainTab === 'topup' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Wallet Status Card */}
              <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 rounded-xl border border-amber-500/40 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-xl shadow shrink-0">
                    💰
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                      Одоогийн дансны үлдэгдэл:
                    </span>
                    <h3 className="font-mono text-lg font-black text-amber-300">
                      {userBalance.toLocaleString()} ₮
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Шууд дансанд орно
                  </span>
                </div>
              </div>

              {/* Amount Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block">
                    Цэнэглэх дүнгээ сонгох:
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">1₮ = 1 Оноо</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOP_UP_PRESETS.map((p) => {
                    const isSelected = selectedTopUpAmount === p.amount && !customTopUpInput;
                    return (
                      <button
                        key={`preset_${p.amount}`}
                        type="button"
                        onClick={() => {
                          setSelectedTopUpAmount(p.amount);
                          setCustomTopUpInput('');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-mono text-sm font-black text-amber-300 block">
                          +{p.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-1">{p.note}</span>
                      </button>
                    );
                  })}

                  {/* Custom input tile */}
                  <div className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-col justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold block">Дурын дүн:</span>
                    <input
                      type="number"
                      placeholder="Жишээ: 3000"
                      value={customTopUpInput}
                      onChange={(e) => setCustomTopUpInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Amount Summary */}
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Сонгосон цэнэглэлт:</span>
                  <span className="text-sm font-extrabold text-white">
                    +{effectiveTopUp.toLocaleString()} ₮ оноо нэмэгдэнэ
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-emerald-400">
                    {effectiveTopUp.toLocaleString()} ₮
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANIME PACKAGES */}
          {mainTab === 'package' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Active Package Banner with Detailed Expiry */}
              <div className="p-3.5 bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-900 rounded-xl border border-rose-500/40 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-xl shadow shrink-0">
                      🎌
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>Анимэ Үзэх Эрх</span>
                        {animeExpiryInfo.hasAccess ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Идэвхтэй ({animeExpiryInfo.countdownText})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded font-bold">
                            Эрх аваагүй
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Бүх анимэ цуврал, шинэ ангиуд хязгааргүй үзэх эрх
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expiry Details Row */}
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Эрх дуусах хугацаа:</span>
                  </div>
                  <div className="font-mono font-bold text-right">
                    {animeExpiryInfo.hasAccess ? (
                      <span className="text-amber-300 font-black">
                        {animeExpiryInfo.expiryDateStr} <span className="text-[11px] text-emerald-400 font-semibold">({animeExpiryInfo.countdownText})</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">Идэвхгүй (Цэнэглэж авна уу)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection: 15 Honog (2.5k), 1 Sar (5k), 2 Sar (8.5k) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    Хугацаа сонгох:
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">15 хоног 2.5k • 1 сар 5k • 2 сар 8.5k</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const extendedDate = calculateExtendedExpiryDate(currentUser?.packageExpiry, plan.durationDays);
                    return (
                      <button
                        key={plan.id}
                        id={`select-duration-${plan.id}`}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-zinc-800 border-rose-500 text-white ring-1 ring-rose-500 shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {plan.badge && (
                          <div
                            className={`absolute top-1 right-1 text-[8px] font-black px-1 py-0.5 rounded shadow ${
                              plan.badgeStyle || 'bg-rose-600 text-white'
                            }`}
                          >
                            {plan.badge}
                          </div>
                        )}
                        <div>
                          <span
                            className={`text-[10px] font-bold block uppercase ${
                              isSelected ? 'text-rose-400' : 'text-zinc-400'
                            }`}
                          >
                            {plan.label}
                          </span>
                          <span className="text-xs font-bold text-zinc-200">{plan.subLabel}</span>
                          <div className="mt-1 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Дуусах: <strong className="text-amber-300">{extendedDate}</strong></span>
                          </div>
                        </div>
                        <div className="mt-2 font-black text-xs font-mono text-amber-300">
                          {plan.price.toLocaleString()} ₮
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Package Summary Card */}
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-3 shadow-inner">
                <div className="w-11 h-11 rounded-xl font-black flex items-center justify-center text-xl shadow shrink-0 bg-rose-600 text-white">
                  🎌
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <span>Анимэ Багц</span>
                    <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 text-[10px] px-1.5 py-0.5 rounded font-black">
                      {currentPlan.label} ({currentPlan.durationDays} хоног)
                    </span>
                  </h3>
                  <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Дуусах хугацаа: <strong className="text-white font-mono">{projectedExpiryDate}</strong> (+{currentPlan.durationDays} хоног)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-amber-400 text-base font-black block">
                    {activePrice.toLocaleString()} ₮
                  </span>
                  {currentPlan.id === '2m' && (
                    <span className="text-[9px] text-emerald-400 font-bold">Хэмнэлттэй</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROMO / ACTIVATION CODE */}
          {mainTab === 'code' && (
            <div className="space-y-3 bg-gradient-to-b from-rose-950/30 via-zinc-900 to-zinc-900 p-3.5 rounded-xl border border-rose-500/40">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-xs">
                    🎟️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Идэвхжүүлэх Код / Ваучер</h4>
                    <p className="text-[10px] text-zinc-400">Админаас өгсөн эсвэл урамшууллын кодоо оруулна уу</p>
                  </div>
                </div>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[11px] font-black px-2 py-0.5 rounded-lg">
                  Шууд Идэвхжинэ
                </span>
              </div>

              {/* Code Input Box */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  Админаас авсан эрхийн код:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Эрхийн кодоо энд оруулна уу..."
                    value={inputActivationCode}
                    onChange={(e) => {
                      setInputActivationCode(e.target.value.toUpperCase());
                      setCodeError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRedeemActivationCode();
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-rose-400 text-white font-mono text-sm font-bold px-3 py-2 rounded-xl focus:outline-none uppercase tracking-wider placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRedeemActivationCode()}
                    disabled={isVerifying || !inputActivationCode.trim()}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 disabled:opacity-50 text-black font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1"
                  >
                    {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Идэвхжүүлэх</span>
                  </button>
                </div>

                {codeError && (
                  <p className="text-xs text-rose-400 font-semibold bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                    {codeError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Selector (For topup and package modes) */}
          {mainTab !== 'code' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
                <button
                  id="pay-tab-monpay"
                  type="button"
                  onClick={() => setPaymentMethod('monpay')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'monpay'
                      ? 'bg-rose-600 text-white shadow-md font-extrabold ring-1 ring-rose-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span>MonPay</span>
                </button>

                <button
                  id="pay-tab-qpay"
                  type="button"
                  onClick={() => setPaymentMethod('qpay')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'qpay'
                      ? 'bg-cyan-500 text-black shadow-md font-extrabold ring-1 ring-cyan-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QPay / Банк</span>
                </button>

                {mainTab === 'package' && (
                  <button
                    id="pay-tab-wallet"
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-amber-500 text-black shadow-md font-extrabold ring-1 ring-amber-400'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Оноогоор ({userBalance.toLocaleString()})</span>
                  </button>
                )}
              </div>

              {/* MonPay Details Card */}
              {paymentMethod === 'monpay' && (
                <div className="space-y-3 bg-gradient-to-b from-rose-950/30 to-zinc-900 p-3.5 rounded-xl border border-rose-900/40">
                  <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                        M
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">MonPay (МонПэй) Шилжүүлэг</h4>
                        <p className="text-[10px] text-zinc-400">Шууд дугаарт эсвэл QR кодоор төлөх</p>
                      </div>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-xs font-black px-2.5 py-0.5 rounded-lg">
                      {mainTab === 'topup' ? `${effectiveTopUp.toLocaleString()} ₮` : `${activePrice.toLocaleString()} ₮`}
                    </span>
                  </div>

                  {/* MonPay Account Number Display */}
                  <div className="bg-zinc-900/90 p-3 rounded-xl border border-rose-500/30 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      MonPay Шилжүүлэх Дугаар:
                    </span>
                    <div className="flex items-center justify-between bg-black/60 p-2 rounded-lg border border-zinc-700/80">
                      <div>
                        <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                          {monpayNumber}
                        </span>
                        <span className="text-zinc-400 text-xs ml-2">(Хүлээн авагч: Тамир)</span>
                      </div>
                      <button
                        id="copy-monpay-btn"
                        onClick={() => copyToClipboard(monpayNumber)}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer shadow"
                      >
                        {copiedMonpay ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Хууллаа!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Хуулах</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">
                      * Гүйлгээний утга: <span className="text-rose-300 font-mono font-bold">{currentUser?.phone || currentUser?.name || 'Таны дугаар'}</span>
                    </p>
                  </div>

                  {/* QR Code for MonPay */}
                  <div className="flex items-center gap-3 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                    <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=MONPAY_${monpayNumber}_${mainTab === 'topup' ? effectiveTopUp : activePrice}MNT`}
                        alt="MonPay QR"
                        className="w-14 h-14 object-contain"
                      />
                    </div>
                    <div className="text-xs space-y-0.5 text-zinc-300">
                      <p className="font-bold text-white text-[11px]">MonPay Апп ашиглаж байна уу?</p>
                      <p className="text-[10px] text-zinc-400">
                        {monpayNumber} дугаарт шилжүүлснээр таны данс шууд цэнэглэгдэнэ.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* QPay Details Card */}
              {paymentMethod === 'qpay' && (
                <div className="space-y-3 bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="relative p-2.5 bg-white rounded-xl shadow-lg border-2 border-cyan-400">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IOIO_TOPUP_${mainTab === 'topup' ? effectiveTopUp : activePrice}MNT`}
                        alt="QPay QR Code"
                        className="w-28 h-28 object-contain"
                      />
                      <div className="absolute -bottom-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow left-1/2 -translate-x-1/2">
                        {mainTab === 'topup' ? `${effectiveTopUp.toLocaleString()} ₮` : `${activePrice.toLocaleString()} ₮`}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-medium">
                      Бүх банкны апп (Хаан, Голомт, Хас, TDB, SocialPay)-аар QR кодыг уншуулж төлнө үү.
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Method Card in Package Mode */}
              {paymentMethod === 'wallet' && mainTab === 'package' && (
                <div className="space-y-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <span className="text-xs text-zinc-400 font-medium">
                      Таны хэтэвчийн үлдэгдэл:
                    </span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {userBalance.toLocaleString()} ₮
                    </span>
                  </div>

                  {userBalance >= activePrice ? (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Төлбөр төлөхөд оноо хангалттай байна. Данснаас {activePrice.toLocaleString()} ₮ хасагдаж эрх нээгдэнэ.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
                        Үлдэгдэл хүрэлцэхгүй байна ({activePrice.toLocaleString()} ₮ шаардлагатай). "⚡ Оноо Цэнэглэх" таб руу шилжинэ үү!
                      </div>
                      <button
                        type="button"
                        onClick={() => setMainTab('topup')}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Дутуу {(activePrice - userBalance).toLocaleString()}₮ оноогоо шууд цэнэглэх</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Results & Buttons */}
          {isSuccess ? (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold p-4 rounded-xl flex flex-col items-center justify-center gap-2 animate-in zoom-in-95 text-center">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
              <p className="whitespace-pre-line leading-relaxed font-black text-sm">
                {successMsgText}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-5 py-2 rounded-xl cursor-pointer shadow"
              >
                Ойлголоо, Цонхыг хаах
              </button>
            </div>
          ) : topUpRequestSent ? (
            <div className="bg-gradient-to-b from-amber-950/70 to-zinc-900 border border-amber-500/60 text-amber-200 text-xs p-4 rounded-xl space-y-3 animate-in zoom-in-95 shadow-xl">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white font-black text-sm flex items-center gap-1.5">
                    <span>📩 Шилжүүлгийн хүсэлт илгээгдлээ</span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Шалгагдаж байна
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {topUpSuccessNotice}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 rounded-xl border border-zinc-700 cursor-pointer transition-colors"
              >
                Ойлголоо, Цонхыг хаах
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {/* PRIMARY ACTION BUTTON: TOP-UP POINTS */}
              {mainTab === 'topup' && (
                <div className="space-y-2">
                  <button
                    id="submit-topup-transfer-btn"
                    type="button"
                    onClick={() => handleSubmitPendingTransfer(effectiveTopUp, `${effectiveTopUp.toLocaleString()}₮ Данс цэнэглэлт`)}
                    disabled={isVerifying || effectiveTopUp <= 0}
                    className="w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400 hover:from-amber-300 hover:to-emerald-400 disabled:opacity-50 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Хүсэлт илгээж байна...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{`📩 ШИЛЖҮҮЛЭГ ИЛГЭЭСНЭЭ МЭДЭГДЭХ (+${effectiveTopUp.toLocaleString()} ₮ оноо авах)`}</span>
                      </>
                    )}
                  </button>

                  {isUserAdmin && (
                    <button
                      type="button"
                      onClick={() => handleInstantTopUpPoints()}
                      disabled={isVerifying || effectiveTopUp <= 0}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>[Админ тест] Шууд оноо олгох</span>
                    </button>
                  )}

                  <p className="text-[10px] text-zinc-400 text-center">
                    * Шилжүүлэг (MonPay: {monpayNumber}) хийсний дараа хүсэлт илгээнэ. Админ шалгаж баталгаажуулснаар оноо орно.
                  </p>
                </div>
              )}

              {/* PACKAGE PURCHASE WITH WALLET POINTS */}
              {mainTab === 'package' && paymentMethod === 'wallet' && (
                <div className="space-y-2">
                  {userBalance < activePrice ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-center space-y-1">
                        <p className="text-xs text-rose-300 font-extrabold flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>ОНОО ХҮРЭЛЦЭХГҮЙ - ОНООГҮЙ БОЛ АНИМЭ ЭРХ АВАХ БОЛОМЖГҮЙ!</span>
                        </p>
                        <p className="text-[11px] text-zinc-300">
                          Танд <strong>{userBalance.toLocaleString()} ₮</strong> оноо байна. Энэ багцыг авахад <strong>{activePrice.toLocaleString()} ₮</strong> шаардлагатай.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={true}
                        className="w-full bg-zinc-800 text-zinc-500 font-black text-sm py-3.5 rounded-xl cursor-not-allowed border border-zinc-700 opacity-60 flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span>{`⛔ ОНОО ХҮРЭЛЦЭХГҮЙ (${userBalance.toLocaleString()}₮ / ${activePrice.toLocaleString()}₮)`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMainTab('topup')}
                        className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>⚡ Дутуу {(activePrice - userBalance).toLocaleString()} ₮ оноогоо цэнэглэх</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      id="confirm-payment-wallet-action"
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isVerifying}
                      className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 text-black font-black text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Идэвхжүүлж байна...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>{`ОНООГООР АНИМЭ БАГЦ (${currentPlan.label} - ${activePrice.toLocaleString()}₮) АВАХ`}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* PACKAGE PURCHASE WITH MONPAY / QPAY TRANSFER */}
              {mainTab === 'package' && paymentMethod !== 'wallet' && paymentMethod !== 'code' && (
                <div className="space-y-2">
                  <button
                    id="submit-package-transfer-btn"
                    type="button"
                    onClick={() => handleSubmitPendingTransfer(activePrice, currentPlan.label)}
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 hover:from-rose-500 hover:to-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Хүсэлт илгээж байна...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{`📩 ШИЛЖҮҮЛЭГ ХИЙСНЭЭ АДМИНД МЭДЭГДЭХ (${activePrice.toLocaleString()}₮ ШАЛГУУЛАХ)`}</span>
                      </>
                    )}
                  </button>

                  {isUserAdmin && (
                    <button
                      id="instant-package-activate-btn"
                      type="button"
                      onClick={handleInstantActivatePackage}
                      disabled={isVerifying}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>[Админ тест] Багц шууд идэвхжүүлэх</span>
                    </button>
                  )}

                  <p className="text-[10px] text-zinc-400 text-center">
                    * Та MonPay ({monpayNumber}) эсвэл QPay-ээр шилжүүлэг хийсний дараа хүсэлтээ илгээнэ. Админ шалгаж баталгаажуулснаар таны анимэ эрх идэвхжинэ.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

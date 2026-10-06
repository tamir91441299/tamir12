import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  QrCode,
  Wallet,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Ticket,
  Send,
  Zap,
  Calendar,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Movie } from '../types';
import { UserAccount } from './AuthModal';
import { redeemCode } from '../lib/codeService';
import {
  submitRechargeRequest,
  clearUserPendingRechargeRequests,
  executeDirectInstantTopUp,
  subscribeRechargeRequests
} from '../lib/rechargeService';
import {
  getAnimeExpiryDetails,
  calculateExtendedExpiryDate,
  isAdminUser
} from '../lib/permissionService';

export type PaymentModalTab = 'points_request' | 'get_permission' | 'code' | 'topup' | 'package';

interface PaymentModalProps {
  movie: Movie | null;
  currentUser?: UserAccount | null;
  userBalance: number;
  isMonthlyVip?: boolean;
  isAnimePackage: boolean;
  isMoviePackage?: boolean;
  initialTab?: PaymentModalTab;
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
  { amount: 12000, label: '12,000 ₮', note: '3 сарын анимэ эрх' },
  { amount: 22000, label: '22,000 ₮', note: '6 сарын анимэ эрх' },
  { amount: 40000, label: '40,000 ₮', note: '1 жилийн анимэ эрх' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  movie,
  currentUser,
  userBalance,
  isMonthlyVip,
  isAnimePackage,
  isMoviePackage,
  initialTab = 'get_permission',
  onClose,
  onOpenAuthModal,
  onPaymentSuccess,
  onSubscribePackage,
  onTopUpBalance,
}) => {
  // Normalize initial tab into 3 clear sections:
  // 'points_request' (Админаас оноо авах хүсэлт явуулах хэсэг)
  // 'get_permission' (Эрх авах хэсэг)
  // 'code' (Эрхийн код)
  const resolveInitialTab = (tab?: string | null): 'points_request' | 'get_permission' | 'code' => {
    if (tab === 'points_request' || tab === 'topup') return 'points_request';
    if (tab === 'code') return 'code';
    return 'get_permission';
  };

  const [mainTab, setMainTab] = useState<'points_request' | 'get_permission' | 'code'>(() => resolveInitialTab(initialTab));

  // Sync if initialTab prop changes
  useEffect(() => {
    setMainTab(resolveInitialTab(initialTab));
  }, [initialTab]);

  // Points request state
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number>(2500);
  const [customTopUpInput, setCustomTopUpInput] = useState<string>('');
  const [paymentTransferMethod, setPaymentTransferMethod] = useState<'monpay' | 'qpay'>('monpay');

  // Subscription package duration state
  const [selectedPlanId, setSelectedPlanId] = useState<PlanDurationId>('15d');
  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];
  const activePrice = currentPlan.price;

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsgText, setSuccessMsgText] = useState<string>('');
  const [topUpRequestSent, setTopUpRequestSent] = useState(false);
  const [topUpSuccessNotice, setTopUpSuccessNotice] = useState<string>('');
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [copiedMonpay, setCopiedMonpay] = useState(false);

  // User contact input for recharge confirmation
  const [userPhoneInput, setUserPhoneInput] = useState<string>(currentUser?.phone || '');
  const [userNoteInput, setUserNoteInput] = useState<string>('');

  useEffect(() => {
    if (currentUser?.phone && !userPhoneInput) {
      setUserPhoneInput(currentUser.phone);
    }
  }, [currentUser?.phone]);

  // Real-time listener for current user's recharge request approval by Admin Tamir
  const processedApprovalIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || !submittedRequestId) return;

    const unsubscribe = subscribeRechargeRequests((requests) => {
      if (topUpRequestSent && submittedRequestId) {
        // STRICT CHECK: Only match the exact request that was submitted in this session!
        const approved = requests.find((r) => r.id === submittedRequestId && r.status === 'approved');

        if (approved && !processedApprovalIdsRef.current.has(approved.id)) {
          processedApprovalIdsRef.current.add(approved.id);
          setTopUpRequestSent(false);
          setIsSuccess(true);
          setSuccessMsgText(
            `🎉 ТАНЫ ХҮСЭЛТИЙГ АДМИН ТАМИР БАТАЛГААЖУУЛЛАА!\n\n+${approved.amount.toLocaleString()} ₮ оноо таны дансанд амжилттай орлоо.\n\nТа одоо "2. Эрх Авах" хэсэг рүү орж анимэ үзэх эрхээ шууд идэвхжүүлэх боломжтой!`
          );
          onTopUpBalance(approved.amount);
          clearUserPendingRechargeRequests(currentUser);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, topUpRequestSent, submittedRequestId]);

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

  // 1. Send Point Request to Admin Tamir
  const handleSubmitPointsRequestToAdmin = async () => {
    if (!currentUser) {
      alert('⚠️ Админаас оноо авах хүсэлт илгээхийн тулд эхлээд системд нэвтэрнэ үү.');
      onClose();
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const phone = (userPhoneInput.trim() || currentUser.phone || '').trim();
    if (!phone) {
      alert('⚠️ Админ Тамир таны шилжүүлгийг шалгаж баталгаажуулахад гар утасны дугаар шаардлагатай. Утасны дугаараа оруулна уу.');
      return;
    }

    const amountToRequest = getEffectiveTopUpAmount();
    if (amountToRequest <= 0) {
      alert('⚠️ Авах онооны дүнгээ зөв сонгоно уу.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await submitRechargeRequest({
        userId: currentUser.id,
        userName: currentUser.name || 'Хэрэглэгч',
        userPhone: phone,
        userEmail: currentUser.email || '',
        planId: currentPlan.id,
        planLabel: `${amountToRequest.toLocaleString()}₮ Оноо авах хүсэлт`,
        durationDays: currentPlan.durationDays,
        amount: amountToRequest,
        method: paymentTransferMethod,
        note: userNoteInput.trim() || `[Оноо авах хүсэлт] ${amountToRequest.toLocaleString()}₮ (${paymentTransferMethod.toUpperCase()})`,
      });
      if (res && res.id) {
        setSubmittedRequestId(res.id);
      }

      // Synchronously post to Server REST API for immediate cross-device visibility
      try {
        await fetch('/api/recharges/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: res?.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: currentUser.id,
            userName: currentUser.name || 'Хэрэглэгч',
            userPhone: phone,
            userEmail: currentUser.email || '',
            planId: currentPlan.id,
            planLabel: `${amountToRequest.toLocaleString()}₮ Оноо авах хүсэлт`,
            durationDays: currentPlan.durationDays,
            amount: amountToRequest,
            method: paymentTransferMethod,
            note: userNoteInput.trim() || `[Оноо авах хүсэлт] ${amountToRequest.toLocaleString()}₮ (${paymentTransferMethod.toUpperCase()})`,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }),
        });
      } catch {}
    } catch (e) {
      console.error('Recharge request submission error:', e);
    }

    setIsVerifying(false);
    setTopUpRequestSent(true);
    setTopUpSuccessNotice(
      `📩 Таны +${amountToRequest.toLocaleString()} ₮ оноо авах хүсэлт Админд (admin) амжилттай очлоо.\n\nАдмин таны шилжүүлгийг (MonPay: ${monpayNumber}) шалгаж баталгаажуулсны дараа таны дансанд шууд оноо орж, анимэ эрх авах боломжтой болно.\n\n⚠️ Админ шалгаж зөвшөөрөх хүртэл оноогүй тул контент түр түгжээтэй байна.`
    );
  };

  // 2. Admin direct test point addition
  const handleAdminDirectAddPoints = async () => {
    const amountToCredit = getEffectiveTopUpAmount();
    if (amountToCredit <= 0) return;

    setIsVerifying(true);
    try {
      if (currentUser?.id) {
        await executeDirectInstantTopUp({
          userId: currentUser.id,
          userName: currentUser.name || 'Админ',
          userPhone: userPhoneInput.trim() || currentUser.phone || '',
          userEmail: currentUser.email || '',
          amount: amountToCredit,
          method: paymentTransferMethod,
          note: `[Админ тест] Шууд оноо нэмэлт (+${amountToCredit.toLocaleString()}₮)`,
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
      `🎉 [АДМИН ТЕСТ] ОНОО ШУУД НЭМЭГДЛЭЭ!\n\n+${amountToCredit.toLocaleString()} ₮ оноо дансанд орлоо.\nТаны шинэ оноо: ${(userBalance + amountToCredit).toLocaleString()} ₮.`
    );
  };

  // 3. Purchase Anime Permission using Points (Эрх авах)
  const handlePurchasePermissionWithPoints = () => {
    if (!currentUser) {
      alert('⚠️ Анимэ эрх авахын тулд эхлээд системд нэвтэрнэ үү.');
      onClose();
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    // Check if points are sufficient - STRICT GUARD: Оноогүй хэрэглэгч анимэ эрх авах боломжгүй
    const effectiveBalance = Math.min(
      typeof currentUser?.walletBalance === 'number' ? currentUser.walletBalance : userBalance,
      userBalance
    );

    if (effectiveBalance <= 0 || userBalance <= 0) {
      alert(
        `⛔ ОНООГҮЙ ХЭРЭГЛЭГЧ АНИМЭ ЭРХ АВАХ БОЛОМЖГҮЙ!\n\nТаны данс 0 ₮ (оноогүй) байна.\nАнимэ үзэх эрх авахын тулд хамгийн багадаа 2,500₮ оноо шаардлагатай.\n\nТа эхлээд "1. Админаас Оноо Авах" хэсэг рүү орж MonPay (99106883518) эсвэл QPay-ээр шилжүүлэг хийн хүсэлтээ илгээнэ үү.`
      );
      setSelectedTopUpAmount(activePrice);
      setCustomTopUpInput(String(activePrice));
      setMainTab('points_request');
      return;
    }

    if (effectiveBalance < activePrice || userBalance < activePrice || activePrice <= 0) {
      const diff = activePrice - Math.max(0, effectiveBalance);
      alert(
        `⛔ ТАНЫ ОНОО ХҮРЭЛЦЭХГҮЙ БАЙНА!\n\nТанд одоо ${userBalance.toLocaleString()}₮ оноо байна.\nСонгосон багц (${currentPlan.label}): ${activePrice.toLocaleString()}₮ оноо шаардлагатай.\nДутуу оноо: ${diff.toLocaleString()}₮.\n\nОноогүй эсвэл оноо хүрэлцэхгүй хэрэглэгч анимэ эрх авах боломжгүй тул эхлээд "1. Админаас Оноо Авах" хэсэг рүү орж шилжүүлэг хийнэ үү.`
      );
      // Auto prefill missing amount and switch to points request
      setSelectedTopUpAmount(diff > 0 ? diff : activePrice);
      setCustomTopUpInput(String(diff > 0 ? diff : activePrice));
      setMainTab('points_request');
      return;
    }

    setIsVerifying(true);
    const newExpiry = calculateExtendedExpiryDate(currentUser?.packageExpiry, currentPlan.durationDays);

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setSuccessMsgText(
        `🎉 АНИМЭ ҮЗЭХ ЭРХ АМЖИЛТТАЙ НЭЭГДЛЭЭ!\n\nСонгосон хугацаа: ${currentPlan.label} (${currentPlan.durationDays} хоног)\nХасагдсан оноо: -${activePrice.toLocaleString()} ₮\nДуусах хугацаа: ${newExpiry} хүртэл сунгагдлаа.\n\nҮлдсэн дансны оноо: ${(userBalance - activePrice).toLocaleString()} ₮.`
      );

      setTimeout(() => {
        onSubscribePackage('anime', activePrice, currentPlan.durationMonths, currentPlan.durationDays);
      }, 1200);
    }, 700);
  };

  // Switch to points request tab and auto pre-select the needed amount
  const handleSwitchToPointsRequestWithAmount = (neededAmount: number) => {
    setSelectedTopUpAmount(neededAmount);
    setCustomTopUpInput(String(neededAmount));
    setMainTab('points_request');
  };

  const effectiveTopUp = getEffectiveTopUpAmount();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#141518] border border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-950 via-[#16171b] to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white">
                  {mainTab === 'points_request' ? 'АДМИНААС ОНОО АВАХ' : mainTab === 'get_permission' ? 'АНИМЭ ҮЗЭХ ЭРХ АВАХ' : 'ЭРХИЙН КОД'}
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                  {userBalance.toLocaleString()} ₮ оноо
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {mainTab === 'points_request'
                  ? '1-р хэсэг: Админ Тамираас оноо авах хүсэлт явуулах'
                  : mainTab === 'get_permission'
                  ? '2-р хэсэг: Цуглуулсан оноогоороо анимэ эрх авах / сунгах'
                  : '3-р хэсэг: Админаас авсан эрхийн код идэвхжүүлэх'}
              </p>
            </div>
          </div>

          <button
            id="close-payment-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Хаах"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 MAIN SECTIONS TOP TABS (ТУСДАА 2 ХЭСЭГ) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-zinc-950 p-2 border-b border-zinc-800 shrink-0 text-xs font-black">
          {/* ХЭСЭГ 1: Админаас оноо авах хүсэлт */}
          <button
            type="button"
            id="tab-mode-points-request"
            onClick={() => {
              setMainTab('points_request');
              setTopUpRequestSent(false);
              setIsSuccess(false);
            }}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'points_request'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-black shadow-lg font-black ring-2 ring-amber-400 scale-[1.01]'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80 hover:bg-zinc-850'
            }`}
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span className="truncate">1. Админаас Оноо Авах</span>
          </button>

          {/* ХЭСЭГ 2: Эрх авах (Оноогоор) */}
          <button
            type="button"
            id="tab-mode-get-permission"
            onClick={() => {
              setMainTab('get_permission');
              setTopUpRequestSent(false);
              setIsSuccess(false);
            }}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'get_permission'
                ? 'bg-rose-600 text-white shadow-lg font-black ring-2 ring-rose-400 scale-[1.01]'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80 hover:bg-zinc-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span className="truncate">2. Эрх Авах (Оноогоор)</span>
          </button>

          {/* ХЭСЭГ 3: Эрхийн код */}
          <button
            type="button"
            id="tab-mode-code"
            onClick={() => {
              setMainTab('code');
              setTopUpRequestSent(false);
              setIsSuccess(false);
            }}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              mainTab === 'code'
                ? 'bg-cyan-500 text-black shadow-lg font-black ring-2 ring-cyan-400 scale-[1.01]'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80 hover:bg-zinc-850'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>3. Эрхийн Код</span>
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* ================================================================ */}
          {/* ХЭСЭГ 1: АДМИНААС ОНОО АВАХ ХҮСЭЛТ ЯВУУЛДАГ ХЭСЭГ */}
          {/* ================================================================ */}
          {mainTab === 'points_request' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Informative Header Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 rounded-xl border border-amber-500/40 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>ХЭСЭГ 1: АДМИНААС ОНОО АВАХ ХҮСЭЛТ</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    1₮ = 1 Оноо
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Та <strong>Админ Тамир</strong>-ын MonPay дугаарт (эсвэл QPay-ээр) шилжүүлэг хийсний дараа эндээс оноо авах хүсэлтээ илгээнэ үү. Админ таны шилжүүлгийг шалгаж баталгаажуулснаар дансанд тань оноо орно.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Таны одоогийн дансны үлдэгдэл:</span>
                  <span className="font-mono font-black text-amber-300 text-sm">{userBalance.toLocaleString()} ₮ оноо</span>
                </div>
              </div>

              {/* Step 1: Select Amount */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Авах онооны дүнгээ сонгох:</span>
                  <span className="text-[10px] text-amber-400 font-bold">Сонгосон: +{effectiveTopUp.toLocaleString()} ₮</span>
                </label>

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
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400 shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-mono text-sm font-black text-amber-300 block">
                          +{p.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">{p.note}</span>
                      </button>
                    );
                  })}

                  {/* Custom input */}
                  <div className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-col justify-between col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-zinc-400 font-bold block">Эсвэл дурын дүнгээр оноо авах:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        placeholder="Жишээ: 10000"
                        value={customTopUpInput}
                        onChange={(e) => setCustomTopUpInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs font-mono font-black text-amber-300 shrink-0">₮ оноо</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Transfer Channel (MonPay or QPay) */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block">
                  2. Шилжүүлэг хийх хэрэгслээ сонгох:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTransferMethod('monpay')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentTransferMethod === 'monpay'
                        ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400 shadow-md'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>MonPay (МонПэй)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTransferMethod('qpay')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentTransferMethod === 'qpay'
                        ? 'bg-cyan-500 text-black border-cyan-400 ring-2 ring-cyan-400 shadow-md font-black'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QPay / Бүх Банк</span>
                  </button>
                </div>

                {/* MonPay Card */}
                {paymentTransferMethod === 'monpay' && (
                  <div className="p-3.5 bg-gradient-to-b from-rose-950/40 to-zinc-900 rounded-xl border border-rose-500/30 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                          M
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-white">MonPay Данс: Тамир</h4>
                          <p className="text-[10px] text-zinc-400">Шилжүүлэх дүн: {effectiveTopUp.toLocaleString()} ₮</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-black text-amber-400">
                        {effectiveTopUp.toLocaleString()} ₮
                      </span>
                    </div>

                    <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-400 block uppercase font-bold">MonPay Дугаар:</span>
                        <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                          {monpayNumber}
                        </span>
                        <span className="text-zinc-400 text-xs ml-2">(Хүлээн авагч: Тамир)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(monpayNumber)}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow"
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

                    <div className="flex items-center gap-3 bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                      <div className="p-1 bg-white rounded-lg shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=MONPAY_${monpayNumber}_${effectiveTopUp}MNT`}
                          alt="MonPay QR"
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <div className="text-xs text-zinc-300 space-y-0.5">
                        <p className="font-bold text-white text-[11px]">MonPay QR-ээр шууд уншуулах</p>
                        <p className="text-[10px] text-zinc-400">
                          MonPay апп-аараа QR-г уншуулж {effectiveTopUp.toLocaleString()}₮ шилжүүлнэ.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* QPay Card */}
                {paymentTransferMethod === 'qpay' && (
                  <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-cyan-500/30 space-y-2 text-center">
                    <div className="relative inline-block p-2 bg-white rounded-xl shadow-lg border-2 border-cyan-400 mx-auto">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=IOIO_TOPUP_${effectiveTopUp}MNT`}
                        alt="QPay QR"
                        className="w-24 h-24 object-contain"
                      />
                      <div className="absolute -bottom-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow left-1/2 -translate-x-1/2 whitespace-nowrap">
                        {effectiveTopUp.toLocaleString()} ₮
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-medium pt-1">
                      Хаан, Голомт, Хас, Төрийн банк, SocialPay апп-аар QR кодыг уншуулж төлнө үү.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Contact Phone & Note Form */}
              <div className="space-y-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block">
                  3. Таны холбогдох утас & Гүйлгээний мэдээлэл:
                </label>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1">
                      Таны утасны дугаар (Админ гүйлгээ шалгахад ашиглана) *:
                    </span>
                    <input
                      type="tel"
                      placeholder="Жишээ: 99112233"
                      value={userPhoneInput}
                      onChange={(e) => setUserPhoneInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1">
                      Гүйлгээний утга / Нэмэлт тэмдэглэл (заавал биш):
                    </span>
                    <input
                      type="text"
                      placeholder="Жишээ: 91441299 Тамир оноо авах"
                      value={userNoteInput}
                      onChange={(e) => setUserNoteInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons for Section 1 */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  id="submit-points-request-btn"
                  onClick={handleSubmitPointsRequestToAdmin}
                  disabled={isVerifying || effectiveTopUp <= 0}
                  className="w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400 hover:from-amber-300 hover:to-emerald-400 disabled:opacity-50 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Админ руу илгээж байна...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{`📩 АДМИН ТАМИРТ ОНОО АВАХ ХҮСЭЛТ ИЛГЭЭХ (+${effectiveTopUp.toLocaleString()} ₮)`}</span>
                    </>
                  )}
                </button>

                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={handleAdminDirectAddPoints}
                    disabled={isVerifying || effectiveTopUp <= 0}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>[Админ тест] Шууд оноо нэмэх (+{effectiveTopUp.toLocaleString()}₮)</span>
                  </button>
                )}

                {/* Direct switch to Section 2 */}
                <button
                  type="button"
                  onClick={() => setMainTab('get_permission')}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Оноо хангалттай юу? 2-р Хэсэг: "Эрх Авах" руу шилжих</span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>

              {/* Facebook Help */}
              <a
                href="https://www.facebook.com/share/1LdgHqWqvz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-xs text-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">f</span>
                  <span className="text-[11px] font-medium">Асуух юм байвал Админы Facebook хуудаснаас лавлах</span>
                </div>
                <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 shrink-0">
                  Нээх ↗
                </span>
              </a>
            </div>
          )}

          {/* ================================================================ */}
          {/* ХЭСЭГ 2: ЭРХ АВАХ (ОНООГООР) */}
          {/* ================================================================ */}
          {mainTab === 'get_permission' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 0 Points Blocking Banner */}
              {userBalance <= 0 && (
                <div className="p-3.5 bg-rose-950/90 rounded-xl border-2 border-rose-500/70 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0 border border-rose-500/40">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">⛔ ОНООГҮЙ ТУЛ АНИМЭ ЭРХ АВАХ БОЛОМЖГҮЙ!</h4>
                      <p className="text-[11px] text-zinc-300">
                        Таны данс <strong>0 ₮</strong> байна. Анимэ эрх авахын тулд хамгийн багадаа 2,500₮ оноотой байх шаардлагатай.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMainTab('points_request')}
                    className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-black px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>👉 1. Оноо авах</span>
                  </button>
                </div>
              )}

              {/* Informative Header Banner */}
              <div className="p-3.5 bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-900 rounded-xl border border-rose-500/40 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-rose-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>ХЭСЭГ 2: АНИМЭ ҮЗЭХ ЭРХ АВАХ (ОНООГООР)</span>
                  </span>
                  {animeExpiryInfo.hasAccess ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-black flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Идэвхтэй ({animeExpiryInfo.countdownText})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded font-bold">
                      {animeExpiryInfo.isExpired && animeExpiryInfo.expiryDateStr !== '-'
                        ? `Дууссан (${animeExpiryInfo.expiryDateStr})`
                        : 'Эрх аваагүй'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Та дансан дахь оноогоо ашиглан хүссэн хугацааныхаа эрхийг нээж эсвэл сунгана уу. 15 хоног, 1 сар, 2 сар, 3 сар, 6 сар, 1 жилийн эрхүүдээс сонгох боломжтой.
                </p>

                {/* Expiry Date & User Points Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/60 p-2.5 rounded-lg border border-white/[0.08] text-xs">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-zinc-300">Одоогийн эрх:</span>
                    </div>
                    <div className="font-mono font-bold text-right sm:text-left">
                      {animeExpiryInfo.hasAccess ? (
                        <span className="text-amber-300 font-black">
                          {animeExpiryInfo.expiryDateStr}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">
                          Идэвхгүй / Дууссан
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-2 sm:border-l sm:border-white/10 sm:pl-3">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-zinc-300">Таны оноо:</span>
                    </div>
                    <div className="font-mono font-black text-amber-300 text-right sm:text-left">
                      {userBalance.toLocaleString()} ₮ оноо
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Selection (PLANS) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block">
                    Авах хугацаагаа сонгох:
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">15 хоног • 1 сар • 2 сар • 3 сар • 6 сар • 1 жил</span>
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
                            ? 'bg-zinc-800 border-rose-500 text-white ring-2 ring-rose-500 shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
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

              {/* Selected Plan Details & Balance Evaluation */}
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                      🎌
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">
                        {currentPlan.label} ({currentPlan.durationDays} хоног эрх)
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-mono">
                        Дуусах шинэ хугацаа: {projectedExpiryDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-amber-400">
                      {activePrice.toLocaleString()} ₮
                    </span>
                    <span className="text-[9px] text-zinc-400 block">оноо хасагдана</span>
                  </div>
                </div>

                {/* Point balance check indicator */}
                {userBalance >= activePrice && (currentUser?.walletBalance ?? 0) >= activePrice ? (
                  <div className="p-2.5 bg-emerald-950/70 border border-emerald-700/80 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Оноо хангалттай байна (Үлдэх: {(userBalance - activePrice).toLocaleString()} ₮)</span>
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-950/80 border border-rose-600/80 rounded-xl text-rose-300 text-xs space-y-2">
                    <div className="font-black text-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>ОНОО ХҮРЭЛЦЭХГҮЙ - ОНООГҮЙ БОЛ АНИМЭ ЭРХ АВАХ БОЛОМЖГҮЙ!</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Танд <strong>{userBalance.toLocaleString()} ₮</strong> оноо байна. Энэ багцыг авахад <strong>{activePrice.toLocaleString()} ₮</strong> оноо шаардлагатай (Дутуу: <strong>{(activePrice - userBalance).toLocaleString()} ₮</strong>).
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSwitchToPointsRequestWithAmount(activePrice - userBalance)}
                      className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5 fill-current" />
                      <span>⚡ 1-р ХЭСЭГ: Админаас дутуу {(activePrice - userBalance).toLocaleString()}₮ оноо авах хүсэлт илгээх (Энд дар) ➔</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons for Section 2 */}
              <div className="space-y-2 pt-1">
                {userBalance >= activePrice && (currentUser?.walletBalance ?? 0) >= activePrice && activePrice > 0 ? (
                  <button
                    id="confirm-purchase-permission-btn"
                    type="button"
                    onClick={handlePurchasePermissionWithPoints}
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 hover:from-rose-500 hover:to-amber-400 disabled:opacity-50 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Эрх нээж байна...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{`🎌 ОНООГООР ЭРХ АВАХ (${currentPlan.label} - ${activePrice.toLocaleString()}₮ ОНОО ХАСАГДАНА)`}</span>
                      </>
                    )}
                  </button>
                ) : userBalance <= 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      alert('⛔ ОНООГҮЙ ХЭРЭГЛЭГЧ АНИМЭ ЭРХ АВАХ БОЛОМЖГҮЙ!\n\nТаны данс 0 ₮ байна. Эхлээд "1. Админаас оноо авах хүсэлт" хэсэг рүү орж оноогоо цэнэглүүлнэ үү.');
                      setMainTab('points_request');
                    }}
                    className="w-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-[1.01]"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>⛔ ОНООГҮЙ ТУЛ ЭРХ АВАХ БОЛОМЖГҮЙ (0 ₮) ➔ ОНОО АВАХ</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      alert(`⛔ ТАНЫ ОНОО ХҮРЭЛЦЭХГҮЙ БАЙНА!\n\nТанд ${userBalance.toLocaleString()}₮ байна, ${activePrice.toLocaleString()}₮ оноо шаардлагатай. Эхлээд оноо авна уу.`);
                      handleSwitchToPointsRequestWithAmount(activePrice - userBalance);
                    }}
                    className="w-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-[1.01]"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{`⛔ ОНОО ХҮРЭЛЦЭХГҮЙ (${userBalance.toLocaleString()}₮ / ${activePrice.toLocaleString()}₮) ➔ ОНОО АВАХ`}</span>
                  </button>
                )}

                {/* Promo Code Link */}
                <button
                  type="button"
                  onClick={() => setMainTab('code')}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Танд админаас өгсөн эрхийн код байгаа бол энд дарж идэвхжүүлэх</span>
                </button>
              </div>

              {/* Facebook Help */}
              <a
                href="https://www.facebook.com/share/1LdgHqWqvz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-xs text-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">f</span>
                  <span className="text-[11px] font-medium">Асуух юм байвал Админы Facebook хуудаснаас лавлах</span>
                </div>
                <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 shrink-0">
                  Нээх ↗
                </span>
              </a>
            </div>
          )}

          {/* ================================================================ */}
          {/* ХЭСЭГ 3: ЭРХИЙН КОД / ВАУЧЕР */}
          {/* ================================================================ */}
          {mainTab === 'code' && (
            <div className="space-y-4 bg-gradient-to-b from-cyan-950/30 via-zinc-900 to-zinc-900 p-4 rounded-xl border border-cyan-500/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center font-black text-sm">
                    🎟️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">ХЭСЭГ 3: ИДЭВХЖҮҮЛЭХ КОД / ВАУЧЕР</h4>
                    <p className="text-[10px] text-zinc-400">Админаас өгсөн эрхийн кодыг шууд идэвхжүүлэх</p>
                  </div>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] font-black px-2 py-0.5 rounded-lg">
                  Шууд Идэвхжинэ
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  Админаас авсан кодоо оруулна уу:
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
                    className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-white font-mono text-sm font-bold px-3 py-2.5 rounded-xl focus:outline-none uppercase tracking-wider placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRedeemActivationCode()}
                    disabled={isVerifying || !inputActivationCode.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-50 text-black font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Идэвхжүүлэх</span>
                  </button>
                </div>

                {codeError && (
                  <p className="text-xs text-rose-400 font-semibold bg-rose-950/60 p-2.5 rounded-lg border border-rose-800">
                    {codeError}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMainTab('get_permission')}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  ← Эрх авах хэсэг рүү буцах
                </button>
                <button
                  type="button"
                  onClick={() => setMainTab('points_request')}
                  className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Админаас оноо авах хэсэг рүү очих →
                </button>
              </div>
            </div>
          )}

          {/* Result / Success Modals */}
          {isSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold p-4 rounded-xl flex flex-col items-center justify-center gap-2 animate-in zoom-in-95 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p className="whitespace-pre-line leading-relaxed font-black text-sm text-white">
                {successMsgText}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg"
              >
                Баярлалаа, Хаах
              </button>
            </div>
          )}

          {topUpRequestSent && !isSuccess && (
            <div className="bg-gradient-to-b from-amber-950/70 to-zinc-900 border border-amber-500/60 text-amber-200 text-xs p-4 rounded-xl space-y-3 animate-in zoom-in-95 shadow-xl">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white font-black text-sm flex items-center gap-1.5">
                    <span>📩 Хүсэлт Админ Тамирт илгээгдлээ</span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Шалгагдаж байна
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line">
                    {topUpSuccessNotice}
                  </p>
                </div>
              </div>

              {/* Facebook support link */}
              <a
                href="https://www.facebook.com/share/1LdgHqWqvz/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">f</span>
                  <span>Асуух юм байвал энэ page-ээс мэдээлэл авна уу</span>
                </div>
                <span className="text-blue-300 group-hover:text-white text-[11px]">Нээх ↗</span>
              </a>

              <button
                onClick={onClose}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 rounded-xl border border-zinc-700 cursor-pointer transition-colors"
              >
                Ойлголоо, Цонхыг хаах
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

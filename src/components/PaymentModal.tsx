import React, { useState } from 'react';
import { X, CheckCircle, QrCode, Wallet, CreditCard, ShieldCheck, RefreshCw, Sparkles, Copy, Check, Ticket, Gift, KeyRound } from 'lucide-react';
import { Movie } from '../types';
import { redeemCode } from '../lib/codeService';

interface PaymentModalProps {
  movie: Movie | null;
  userBalance: number;
  isMonthlyVip?: boolean;
  isAnimePackage: boolean;
  isMoviePackage?: boolean;
  onClose: () => void;
  onPaymentSuccess: (movieId: string, deductedAmount?: number) => void;
  onSubscribePackage: (packageType: 'anime' | 'movie' | 'full_vip', deductedAmount: number, durationMonths?: number) => void;
  onTopUpBalance: (amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  movie,
  userBalance,
  isMonthlyVip,
  isAnimePackage,
  isMoviePackage,
  onClose,
  onPaymentSuccess,
  onSubscribePackage,
  onTopUpBalance,
}) => {
  // Only Anime subscription package
  const [durationMonths, setDurationMonths] = useState<1 | 2 | 3>(1);

  // Pricing: 1 month = 4,000₮, 2 months = 7,000₮ (7k), 3 months = 10,000₮ (10k)
  const getPlanPrice = (months: 1 | 2 | 3) => {
    if (months === 1) return 4000;
    if (months === 2) return 7000;
    return 10000;
  };

  const activePrice = getPlanPrice(durationMonths);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'monpay' | 'qpay' | 'code'>('code');
  const [selectedBank, setSelectedBank] = useState<string>('monpay');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsgText, setSuccessMsgText] = useState<string>('');
  const [topUpRequestSent, setTopUpRequestSent] = useState(false);
  const [copiedMonpay, setCopiedMonpay] = useState(false);

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
          onSubscribePackage('anime', 0, res.durationDays ? Math.round(res.durationDays / 30) : 1);
          if (res.type === 'points' && res.pointsAdded) {
            onTopUpBalance(res.pointsAdded);
          }
        }, 1200);
      } else {
        setCodeError(res.message);
      }
    }, 600);
  };

  const banks = [
    { id: 'monpay', name: 'MonPay (МонПэй)', color: 'bg-rose-500', code: 'MONPAY' },
    { id: 'khan', name: 'Хан Банк', color: 'bg-emerald-600', code: 'KHAN' },
    { id: 'golomt', name: 'Голомт Банк', color: 'bg-cyan-600', colorText: 'text-cyan-400', code: 'GOLOMT' },
    { id: 'tdb', name: 'ХХБ (TDB)', color: 'bg-blue-600', code: 'TDB' },
    { id: 'xac', name: 'Хас Банк', color: 'bg-amber-600', code: 'XAC' },
    { id: 'state', name: 'Төрийн Банк', color: 'bg-red-600', code: 'STATE' },
    { id: 'socialpay', name: 'SocialPay', color: 'bg-purple-600', code: 'SOCIAL' },
  ];

  const handleConfirmPayment = () => {
    setIsVerifying(true);

    if (paymentMethod === 'code') {
      handleRedeemActivationCode();
      return;
    }

    if (paymentMethod === 'wallet') {
      if (userBalance < activePrice) {
        setIsVerifying(false);
        alert(`⚠️ Оноо хүрэлцэхгүй байна! Танд ${userBalance.toLocaleString()} оноо байна. Энэ багцыг авахад ${activePrice.toLocaleString()} оноо шаардлагатай. Админаас оноогоо цэнэглүүлнэ үү.`);
        return;
      }

      setTimeout(() => {
        setIsVerifying(false);
        setIsSuccess(true);
        setSuccessMsgText(
          `Анимэ Багц (${durationMonths} сар - ${activePrice.toLocaleString()}₮) оноогоор амжилттай идэвхжлээ! Бүх анимэ нээгдлээ...`
        );

        setTimeout(() => {
          onSubscribePackage('anime', activePrice, durationMonths);
        }, 1200);
      }, 1000);
    } else {
      // MonPay / QPay method: Send topup request to admin instead of instant free activation
      setTimeout(() => {
        setIsVerifying(false);
        setTopUpRequestSent(true);
      }, 1200);
    }
  };

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
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                АНИМЭ БАГЦ ИДЭВХЖҮҮЛЭХ
              </h2>
              <p className="text-[11px] text-zinc-400">
                1 сар (4,000₮) • 2 сар (7,000₮) • 3 сар (10,000₮) хэмнэлттэй багцууд
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

        {/* Content with smooth independent scrolling */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Active Package Banner */}
          <div className="p-3 bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-900 rounded-xl border border-rose-500/40 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-xl shadow shrink-0">
                🎌
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Анимэ Багц</span>
                  {isAnimePackage && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                      Идэвхтэй байна
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Бүх анимэ цуврал, шинэ ангиуд хязгааргүй үзэх эрх
                </p>
              </div>
            </div>
          </div>

          {/* Duration Selection: 1 Sar (4k), 2 Sar (7k), 3 Sar (10k) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Хугацаа сонгох (Хэмнэлттэй):
              </label>
              <span className="text-[10px] text-amber-400 font-bold">2+ сараар авбал хямдралтай</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 1 Month */}
              <button
                id="select-duration-1m"
                type="button"
                onClick={() => setDurationMonths(1)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  durationMonths === 1
                    ? 'bg-zinc-800 border-rose-500 text-white ring-1 ring-rose-500 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">1 САР</span>
                  <span className="text-xs font-bold text-zinc-200">30 Хоног</span>
                </div>
                <div className="mt-1.5 font-black text-xs font-mono text-white">
                  {getPlanPrice(1).toLocaleString()} ₮
                </div>
              </button>

              {/* 2 Months - 7,000₮ (7k) */}
              <button
                id="select-duration-2m"
                type="button"
                onClick={() => setDurationMonths(2)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  durationMonths === 2
                    ? 'bg-gradient-to-b from-rose-950/70 to-zinc-800 border-rose-500 text-white ring-1 ring-rose-500 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black px-1 py-0.5 rounded shadow">
                  7k Хямдрал
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-400 block uppercase">2 САР</span>
                  <span className="text-xs font-bold text-zinc-200">60 Хоног</span>
                </div>
                <div className="mt-1.5 font-black text-xs font-mono text-amber-300">
                  {getPlanPrice(2).toLocaleString()} ₮
                </div>
              </button>

              {/* 3 Months - 10,000₮ (10k) */}
              <button
                id="select-duration-3m"
                type="button"
                onClick={() => setDurationMonths(3)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  durationMonths === 3
                    ? 'bg-gradient-to-b from-amber-950/70 to-zinc-800 border-amber-400 text-white ring-1 ring-amber-400 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="absolute top-1 right-1 bg-amber-500 text-black text-[8px] font-black px-1 py-0.5 rounded shadow">
                  10k Супер
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">3 САР</span>
                  <span className="text-xs font-bold text-zinc-200">90 Хоног</span>
                </div>
                <div className="mt-1.5 font-black text-xs font-mono text-amber-300">
                  {getPlanPrice(3).toLocaleString()} ₮
                </div>
              </button>
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
                  {durationMonths} Сар ({durationMonths * 30} хоног)
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                Бүх анимэ цуврал, шинэ ангиуд хязгааргүй үзэх эрх.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-amber-400 text-base font-black block">
                {activePrice.toLocaleString()} ₮
              </span>
              {durationMonths > 1 && (
                <span className="text-[9px] text-emerald-400 font-bold">Хэмнэлттэй</span>
              )}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              id="pay-tab-code"
              onClick={() => setPaymentMethod('code')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'code'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>🎟️ Код оруулах</span>
            </button>

            <button
              id="pay-tab-monpay"
              onClick={() => setPaymentMethod('monpay')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'monpay'
                  ? 'bg-rose-600 text-white shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>MonPay</span>
            </button>

            <button
              id="pay-tab-qpay"
              onClick={() => setPaymentMethod('qpay')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'qpay'
                  ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QPay QR</span>
            </button>

            <button
              id="pay-tab-wallet"
              onClick={() => setPaymentMethod('wallet')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'wallet'
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Оноо ({userBalance.toLocaleString()})</span>
            </button>
          </div>

          {/* Option 1: Activation / Promo Code Option */}
          {paymentMethod === 'code' && (
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
                  Админаас авсан 6-12 оронтой эрхийн код:
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

              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                <span>ℹ️ Эрхийн код аваагүй бол MonPay / Дансаар төлбөрөө шилжүүлэн админаас авна уу.</span>
              </div>
            </div>
          )}

          {/* Option A: MonPay Option */}
          {paymentMethod === 'monpay' && (
            <div className="space-y-3 bg-gradient-to-b from-rose-950/30 to-zinc-900 p-3.5 rounded-xl border border-rose-900/40">
              <div className="flex items-center justify-between border-b border-rose-900/50 pb-2.5">
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
                  {activePrice.toLocaleString()} ₮
                </span>
              </div>

              {/* MonPay Account Number Display */}
              <div className="bg-zinc-900/90 p-3 rounded-xl border border-rose-500/30 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  MonPay Шилжүүлэх Дугаар / Данс:
                </span>
                <div className="flex items-center justify-between bg-black/60 p-2 rounded-lg border border-zinc-700/80">
                  <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                    {monpayNumber}
                  </span>
                  <button
                    id="copy-monpay-btn"
                    onClick={() => copyToClipboard(monpayNumber)}
                    className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer shadow"
                  >
                    {copiedMonpay ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Копидлоо!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Копидох</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 italic">
                  * Гүйлгээний утга: <span className="text-rose-300 font-mono font-bold">{`IOIO-ANIME-${durationMonths}M`}</span>
                </p>
              </div>

              {/* QR Code for MonPay */}
              <div className="flex items-center gap-3 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=MONPAY_${monpayNumber}_${activePrice}MNT`}
                    alt="MonPay QR"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="text-xs space-y-0.5 text-zinc-300">
                  <p className="font-bold text-white text-[11px]">MonPay Апп ашиглаж байна уу?</p>
                  <p className="text-[10px] text-zinc-400">
                    MonPay аппаараа <span className="text-amber-400 font-bold">{monpayNumber}</span> дугаар руу <span className="text-amber-400 font-bold">{activePrice.toLocaleString()}₮</span> шилжүүлнэ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Option B: QPay QR Option */}
          {paymentMethod === 'qpay' && (
            <div className="space-y-3">
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative p-2.5 bg-white rounded-xl shadow-lg border-2 border-rose-400">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IOIO_ANIME_${activePrice}MNT`}
                    alt="QPay QR Code"
                    className="w-28 h-28 object-contain"
                  />
                  <div className="absolute -bottom-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow left-1/2 -translate-x-1/2">
                    {activePrice.toLocaleString()} ₮
                  </div>
                </div>

                <p className="text-[11px] text-zinc-300 font-medium">
                  Банкны апп-аараа QR кодыг уншуулж төлбөрөө хийнэ үү
                </p>
              </div>

              {/* Bank Apps Row */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  Банк сонгох:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      id={`bank-btn-${bank.id}`}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        selectedBank === bank.id
                          ? 'bg-zinc-800 border-rose-400 text-rose-300 shadow'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${bank.color}`} />
                      <span className="truncate">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Option C: Wallet Option */}
          {paymentMethod === 'wallet' && (
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
                    Төлбөр төлөхөд дансны үлдэгдэл хангалттай байна. Данснаас {activePrice.toLocaleString()} ₮ хасагдана.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
                    Үлдэгдэл хүрэлцэхгүй байна ({activePrice.toLocaleString()} ₮ шаардлагатай). MonPay / Банкаар шилжүүлэн админаас оноогоо цэнэглүүлнэ үү!
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('monpay')}
                    className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💳 MonPay-ээр Данс Цэнэглэх заавар харах</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          {isSuccess ? (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {successMsgText ||
                  `Анимэ Багц (${durationMonths} сар - ${activePrice.toLocaleString()}₮) оноогоор амжилттай идэвхжлээ! Бүх анимэ нээгдлээ...`}
              </span>
            </div>
          ) : topUpRequestSent ? (
            <div className="bg-rose-500/20 border border-rose-500 text-rose-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between gap-2 animate-in zoom-in-95">
              <div className="space-y-0.5">
                <p className="text-white font-extrabold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>📩 Оноо цэнэглүүлэх хүсэлт Админд хүрэглээ!</span>
                </p>
                <p className="text-[11px] text-zinc-300">
                  Банкаар / MonPay-ээр шилжүүлсэн тул Админ таны акаунтыг шалгаад оноо оруулна. Оноо ормогц эндээс оноогоороо багцаа идэвхжүүлнэ үү.
                </p>
              </div>
            </div>
          ) : (
            <button
              id="confirm-payment-action"
              onClick={handleConfirmPayment}
              disabled={isVerifying || (paymentMethod === 'wallet' && userBalance < activePrice)}
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 text-black font-black text-sm py-3 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Төлбөр баталгаажуулж байна...</span>
                </>
              ) : paymentMethod === 'wallet' ? (
                <span>
                  {`ОНООГООР АНИМЭ БАГЦ (${durationMonths} САР - ${activePrice.toLocaleString()}₮) ИДЭВХЖҮҮЛЭХ`}
                </span>
              ) : (
                <span>
                  📩 АДМИНААС {activePrice.toLocaleString()}₮ ОНОО ЦЭНЭГЛҮҮЛЭХ ХҮСЭЛТ ИЛГЭЭХ
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


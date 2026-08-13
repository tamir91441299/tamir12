import React, { useState } from 'react';
import { X, CheckCircle, QrCode, Wallet, CreditCard, ShieldCheck, RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { Movie } from '../types';

interface PaymentModalProps {
  movie: Movie | null;
  userBalance: number;
  isMonthlyVip: boolean;
  isAnimePackage: boolean;
  isMoviePackage: boolean;
  onClose: () => void;
  onPaymentSuccess: (movieId: string, deductedAmount?: number) => void;
  onSubscribePackage: (packageType: 'anime' | 'movie' | 'full_vip', deductedAmount: number) => void;
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
  // Plan type defaults: 'anime' (4000), 'movie' (4000), or 'full_vip' (7000)
  const initialPlan = movie
    ? movie.type === 'anime'
      ? 'anime'
      : 'movie'
    : 'full_vip';

  const [planType, setPlanType] = useState<'anime' | 'movie' | 'full_vip'>(initialPlan);

  const getPlanPrice = (plan: 'anime' | 'movie' | 'full_vip') => {
    switch (plan) {
      case 'anime':
        return 4000;
      case 'movie':
        return 4000;
      case 'full_vip':
        return 7000;
      default:
        return 4000;
    }
  };

  const activePrice = getPlanPrice(planType);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'monpay' | 'qpay'>('wallet');
  const [selectedBank, setSelectedBank] = useState<string>('monpay');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [topUpRequestSent, setTopUpRequestSent] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);
  const [showTopUp, setShowTopUp] = useState(false);
  const [copiedMonpay, setCopiedMonpay] = useState(false);

  const monpayNumber = '99106883518';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMonpay(true);
    setTimeout(() => setCopiedMonpay(false), 2000);
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

    if (paymentMethod === 'wallet') {
      if (userBalance < activePrice) {
        setIsVerifying(false);
        alert(`⚠️ Оноо хүрэлцэхгүй байна! Танд ${userBalance.toLocaleString()} оноо байна. Энэ багцыг авахад ${activePrice.toLocaleString()} оноо шаардлагатай. Админаас оноогоо цэнэглүүлнэ үү.`);
        return;
      }

      setTimeout(() => {
        setIsVerifying(false);
        setIsSuccess(true);

        setTimeout(() => {
          onSubscribePackage(planType, activePrice);
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

  const handleTopUp = () => {
    onTopUpBalance(topUpAmount);
    setShowTopUp(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#17171a] border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-[#121214] to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                БАГЦ ИДЭВХЖҮҮЛЭХ / ЭРХ АВАХ
              </h2>
              <p className="text-[11px] text-zinc-400">
                Анимэ багц (4,000 оноо) эсвэл Кино багцыг (4,000 оноо) сонгон идэвхжүүлнэ үү
              </p>
            </div>
          </div>

          <button
            id="close-payment-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Package Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
              Багц сонгоно уу:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="select-plan-anime"
                type="button"
                onClick={() => setPlanType('anime')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  planType === 'anime'
                    ? 'bg-gradient-to-b from-rose-950/80 to-zinc-900 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                    🎌 Анимэ
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    Анимэ Багц
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                    4,000 ₮
                  </span>
                  {isAnimePackage && <span className="text-[9px] text-emerald-400 font-bold">Идэвхтэй</span>}
                </div>
              </button>

              <button
                id="select-plan-movie"
                type="button"
                onClick={() => setPlanType('movie')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  planType === 'movie'
                    ? 'bg-gradient-to-b from-cyan-950/80 to-zinc-900 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                    🎬 Кино
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    Кино Багц
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="bg-cyan-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                    4,000 ₮
                  </span>
                  {isMoviePackage && <span className="text-[9px] text-emerald-400 font-bold">Идэвхтэй</span>}
                </div>
              </button>

              <button
                id="select-plan-full"
                type="button"
                onClick={() => setPlanType('full_vip')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  planType === 'full_vip'
                    ? 'bg-gradient-to-b from-amber-950/80 to-zinc-900 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block flex items-center gap-1">
                    👑 VIP Бүтэн
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    Анимэ + Кино
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 py-0.5 rounded">
                    7,000 ₮
                  </span>
                  {isMonthlyVip && <span className="text-[9px] text-emerald-400 font-bold">Идэвхтэй</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Selected Package Details */}
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-lg shadow shrink-0 ${
                planType === 'anime'
                  ? 'bg-rose-600 text-white'
                  : planType === 'movie'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-amber-400 text-black'
              }`}
            >
              {planType === 'anime' ? '🎌' : planType === 'movie' ? '🎬' : '👑'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-xs text-white flex items-center gap-1">
                {planType === 'anime'
                  ? 'Анимэ Багц (30 Хоног)'
                  : planType === 'movie'
                  ? 'Кино & Цуврал Багц (30 Хоног)'
                  : 'VIP Бүтэн Багц (30 Хоног)'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {planType === 'anime'
                  ? 'Demon Slayer, Solo Leveling зэрэг анимэ хэсгийн бүх цуврал, киног хязгааргүй үзнэ.'
                  : planType === 'movie'
                  ? 'Платформ дээрх бүх Уран сайхны кино болон Олон ангит цувралуудыг хязгааргүй үзнэ.'
                  : 'Анимэ + Уран сайхны кино + Олон ангит цувралууд БҮГД ХЯЗГААРГҮЙ багтсан хямдралтай багц.'}
              </p>
            </div>
            <span className="font-mono text-amber-400 text-sm font-black shrink-0">
              {activePrice.toLocaleString()} ₮
            </span>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
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
              <span>Үлдэгдэл Оноо ({userBalance.toLocaleString()} оноо)</span>
            </button>
          </div>

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
                  * Гүйлгээний утга: <span className="text-cyan-300 font-mono font-bold">{planType === 'monthly' ? 'IOIO-VIP-1MONTH' : `IOIO-${movie?.id.toUpperCase()}`}</span>
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
                <div className="relative p-2.5 bg-white rounded-xl shadow-lg border-2 border-cyan-400">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IOIO_CINEMA_${planType.toUpperCase()}_${activePrice}MNT`}
                    alt="QPay QR Code"
                    className="w-28 h-28 object-contain"
                  />
                  <div className="absolute -bottom-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow left-1/2 -translate-x-1/2">
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
                          ? 'bg-zinc-800 border-cyan-400 text-cyan-300 shadow'
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
                    Үлдэгдэл хүрэлцэхгүй байна ({activePrice.toLocaleString()} ₮ шаардлагатай). Дансаа цэнэглэнэ үү!
                  </div>

                  {showTopUp ? (
                    <div className="space-y-2 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-300">
                        Цэнэглэх дүн сонгох:
                      </span>
                      <div className="flex items-center gap-2">
                        {[5000, 8000, 10000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setTopUpAmount(amt)}
                            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              topUpAmount === amt
                                ? 'bg-amber-500 text-black border-amber-400'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            +{amt.toLocaleString()} ₮
                          </button>
                        ))}
                      </div>

                      <button
                        id="confirm-topup-btn"
                        onClick={handleTopUp}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2 rounded-lg transition-colors cursor-pointer mt-1"
                      >
                        +{topUpAmount.toLocaleString()} ₮-өөр Данс Цэнэглэх
                      </button>
                    </div>
                  ) : (
                    <button
                      id="show-topup-btn"
                      onClick={() => setShowTopUp(true)}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Данс Цэнэглэх (+8,000 ₮)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          {isSuccess ? (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {planType === 'anime'
                  ? 'Анимэ Багц (4,000₮) оноогоор амжилттай идэвхжлээ! Бүх анимэ нээгдлээ...'
                  : planType === 'movie'
                  ? 'Кино Багц (4,000₮) оноогоор амжилттай идэвхжлээ! Бүх кино, цуврал нээгдлээ...'
                  : 'VIP Бүтэн Багц (7,000₮) оноогоор амжилттай идэвхжлээ! Бүх контент нээгдлээ...'}
              </span>
            </div>
          ) : topUpRequestSent ? (
            <div className="bg-cyan-500/20 border border-cyan-500 text-cyan-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between gap-2 animate-in zoom-in-95">
              <div className="space-y-0.5">
                <p className="text-white font-extrabold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
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
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 text-black font-black text-sm py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Төлбөр баталгаажуулж байна...</span>
                </>
              ) : paymentMethod === 'wallet' ? (
                <span>
                  {planType === 'anime'
                    ? `ОНООГООР АНИМЭ БАГЦ ИДЭВХЖҮҮЛЭХ (${activePrice.toLocaleString()} оноо)`
                    : planType === 'movie'
                    ? `ОНООГООР КИНО БАГЦ ИДЭВХЖҮҮЛЭХ (${activePrice.toLocaleString()} оноо)`
                    : `ОНООГООР VIP БҮТЭН БАГЦ АВАХ (${activePrice.toLocaleString()} оноо)`}
                </span>
              ) : (
                <span>
                  📩 АДМИНААС ОНОО ЦЭНЭГЛҮҮЛЭХ ХҮСЭЛТ ИЛГЭЭХ
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

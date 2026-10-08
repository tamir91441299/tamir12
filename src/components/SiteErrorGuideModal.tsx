import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  HelpCircle,
  Activity,
  Trash2,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Sparkles,
  Zap,
  Phone,
  Film
} from 'lucide-react';
import {
  runFullSiteDiagnostics,
  DiagnosticCheckResult,
  submitErrorReport,
  getCapturedRuntimeErrors,
  RuntimeLoggedError,
  SiteErrorReport,
  getStoredErrorReports,
  purgeSiteClientCache,
} from '../lib/errorGuideService';
import { UserAccount } from './AuthModal';

interface SiteErrorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenDisplaySettings?: () => void;
}

export const SiteErrorGuideModal: React.FC<SiteErrorGuideModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  onOpenInstallModal,
  onOpenDisplaySettings,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'report' | 'guide' | 'logs'>('diagnostics');
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheckResult[]>([]);
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  // Report form state
  const [reportCategory, setReportCategory] = useState<'video' | 'auth' | 'payment' | 'media' | 'display' | 'other'>('video');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportContact, setReportContact] = useState(currentUser?.phone || currentUser?.email || '');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);
  const [myReports, setMyReports] = useState<SiteErrorReport[]>(() => getStoredErrorReports());

  // Runtime error logs
  const [runtimeLogs, setRuntimeLogs] = useState<RuntimeLoggedError[]>(() => getCapturedRuntimeErrors());

  // Guide accordion expanded states
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Auto-run diagnostics on open if not run yet
  useEffect(() => {
    if (isOpen && diagnostics.length === 0) {
      handleRunDiagnostics();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNewLog = () => {
      setRuntimeLogs(getCapturedRuntimeErrors());
    };
    window.addEventListener('ioio_runtime_error_logged', handleNewLog);
    return () => window.removeEventListener('ioio_runtime_error_logged', handleNewLog);
  }, []);

  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    try {
      const res = await runFullSiteDiagnostics();
      setDiagnostics(res);
      setLastCheckTime(new Date().toLocaleTimeString('mn-MN'));
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRunningDiag(false), 400);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim()) return;

    setIsSubmittingReport(true);
    try {
      const res = await submitErrorReport({
        category: reportCategory,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        userContact: reportContact.trim(),
        userId: currentUser?.customId || currentUser?.id,
        userName: currentUser?.name,
      });

      setReportSuccessMessage(`✓ ${res.message}`);
      setReportTitle('');
      setReportDescription('');
      setMyReports(getStoredErrorReports());
      setTimeout(() => setReportSuccessMessage(null), 6000);
    } catch {
      alert('Алдааны тайлан илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleClearCacheAndReload = () => {
    if (confirm('Браузерын кэш, түүхийг цэвэрлэж хуудсыг дахин шинэчлэх үү?\n\n(Таны нэвтэрсэн бүртгэл болон онооны үлдэгдэл хадгалагдана.)')) {
      purgeSiteClientCache();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  const passedCount = diagnostics.filter((d) => d.status === 'passed').length;
  const warningCount = diagnostics.filter((d) => d.status === 'warning').length;
  const failedCount = diagnostics.filter((d) => d.status === 'failed').length;

  const faqs = [
    {
      q: '🎬 Видео тоглуулагч гацах, хар дэлгэц гарах үед яах вэ?',
      a: '1. Тоглуулагч дээрх "Горим солих" (YouTube / Шууд сервер) сонголтыг дарна уу.\n2. Интернэт хурдаа шалгаж, гар утасныхаа дата эсвэл Wi-Fi-г дахин холбоно уу.\n3. Доор байрлах "Кэш цэвэрлэж хуудсыг шинэчлэх" товчийг дарж хөтчийн санах ойг сэргээнэ үү.',
    },
    {
      q: '🔑 5 оронтой Хэрэглэгчийн ID-гаа мартсан бол яаж нэвтрэх вэ?',
      a: 'Та заавал 5 оронтой ID-гаа санах шаардлагагүй. Бүртгүүлэхдээ оруулсан Гар утасны дугаар (Жишээ: 88112233) эсвэл Gmail хаягаа бичээд нууц үгээ оруулан шууд нэвтэрч болно. Мөн манай албан ёсны Facebook хуудсаар холбогдож ID-гаа лавлах боломжтой.',
    },
    {
      q: '🌟 Шинэ хэрэглэгч бүртгүүлэхэд яагаад 5 оронтой ID өгдөг вэ?',
      a: 'FlickNime нь хэрэглэгч бүртээ давхардалгүй өвөрмөц 5 оронтой ID (Жишээ: 77889, AZ109) олгодог. Та бүртгүүлэхдээ өөрийн дуртай 5 оронтой тоо/үсгээ чөлөөтэй зохиож болно. Энэ ID-аараа хялбар нэвтрэх, админаас оноо авах, урамшуулал ашиглахад ашиглагдана.',
    },
    {
      q: '💳 Данс цэнэглэсэн оноо хэзээ орох вэ?',
      a: 'Та "Оноо авах хүсэлт" илгээх үед гүйлгээний утга дээр өөрийн бүртгэлтэй утасны дугаараа бичсэн тохиолдолд админ 1-5 минутын дотор шалгаж баталгаажуулдаг. Хэрэв удвал Facebook хуудсаар баримтаа явуулж шууд баталгаажуулна.',
    },
    {
      q: '📱 Утас болон PC дэлгэцийн харагдац алдаатай байвал яах вэ?',
      a: 'Сайтын баруун доод буланд байрлах "Дэлгэц" товчлуур дээр даран Утас / Таблет / PC горимоос сонгох эсвэл масштабыг 90% - 110% болгон өөрийн дэлгэцэнд тааруулж тохируулж болно.',
    },
    {
      q: '📲 Аппликейшнийг утасны дэлгэц дээрээ бүтэн суулгах (PWA)',
      a: 'Манай сайт PWA дэмждэг тул Chrome/Safari хөтчөөсөө "Дэлгэцэнд нэмэх" (Add to Home Screen) эсвэл дээд цэсний "Апп татах" товчийг дарж утсандаа апп хэлбэрээр суулган бүтэн дэлгэцээр үзэх боломжтой.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0e121a] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-4 sm:p-7 text-zinc-100 shadow-2xl relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <ShieldAlert className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Сайтын Хөтөч & Алдаа Оношилгоо
                </h2>
                <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  LIVE ASSISTANT
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Видео тоглуулагч, серверийн холболт, бүртгэл болон түгээмэл алдааг оношлох ухаалаг хөтөч
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCacheAndReload}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
              title="Кэш цэвэрлэж хуудсыг дахин шинэчлэх"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Кэш цэвэрлэх</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-3 border-b border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Шууд Оношилгоо</span>
            {diagnostics.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  failedCount > 0 ? 'bg-rose-500 text-white' : 'bg-black/40 text-black'
                }`}
              >
                {failedCount > 0 ? `${failedCount} алдаа` : 'Хэвийн'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'report'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Алдаа Мэдэгдэх</span>
            {myReports.length > 0 && (
              <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {myReports.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Хөтөчийн Зөвлөгөө & Заавар</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'logs'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Алдааны Бүртгэл ({runtimeLogs.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1 space-y-4 no-scrollbar">
          {/* TAB 1: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      failedCount > 0
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : warningCount > 0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {failedCount > 0 ? '⚠️' : warningCount > 0 ? '⚡' : '✓'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {failedCount > 0
                        ? `Оношилгоогоор ${failedCount} алдаа илэрлээ`
                        : warningCount > 0
                        ? 'Систем хэвийн, санамжуудыг шалгана уу'
                        : 'Системийн бүх үзүүлэлт 100% хэвийн байна'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Сүүлд шалгасан: {lastCheckTime || 'Дөнгөж сая'} | Амжилттай: {passedCount} / {diagnostics.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRunDiagnostics}
                    disabled={isRunningDiag}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiag ? 'animate-spin' : ''}`} />
                    <span>{isRunningDiag ? 'Оношилж байна...' : 'Дахин шалгах'}</span>
                  </button>
                </div>
              </div>

              {/* Diagnostic items grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diagnostics.map((d) => {
                  const isPassed = d.status === 'passed';
                  const isWarn = d.status === 'warning';
                  const isFail = d.status === 'failed';

                  return (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isFail
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : isWarn
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-zinc-200">{d.title}</span>
                          {d.latencyMs !== undefined && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded">
                              {d.latencyMs}мс
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            isFail
                              ? 'bg-rose-500 text-white'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isFail ? 'Алдаатай' : isWarn ? 'Анхааруулга' : 'Хэвийн'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{d.message}</p>

                      {d.actionHint && (
                        <p className="text-[11px] text-zinc-400 italic bg-black/30 p-2 rounded-lg border border-white/[0.04]">
                          💡 {d.actionHint}
                        </p>
                      )}

                      {d.actionButton && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (d.actionButton?.actionType === 'clear_cache') {
                                handleClearCacheAndReload();
                              } else {
                                handleRunDiagnostics();
                              }
                            }}
                            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                          >
                            {d.actionButton.label} →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Troubleshooting quick actions */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-3">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Шуурхай шийдэл & Систем засах товчнууд
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleClearCacheAndReload}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-left text-xs font-bold text-zinc-200 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div>Кэш бүрэн цэвэрлэх</div>
                      <div className="text-[10px] text-zinc-400 font-normal">Хөтчийн түр санах ойг арилгах</div>
                    </div>
                  </button>

                  {onOpenDisplaySettings && (
                    <button
                      type="button"
                      onClick={onOpenDisplaySettings}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-left text-xs font-bold text-zinc-200 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div>Дэлгэц тохируулах</div>
                        <div className="text-[10px] text-zinc-400 font-normal">Утас / PC хэмжээ тааруулах</div>
                      </div>
                    </button>
                  )}

                  <a
                    href="https://www.facebook.com/share/1LdgHqWqvz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 text-left text-xs font-bold text-blue-200 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">f</span>
                    <div>
                      <div>Шууд тусламж авах</div>
                      <div className="text-[10px] text-blue-300/80 font-normal">Facebook чатаар холбогдох</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORT AN ERROR */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 border border-white/[0.08] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-cyan-400 font-black text-sm mb-1">
                  <Send className="w-4 h-4" />
                  <span>Алдааны талаар админ багт мэдэгдэх</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Хэрэв кино гацах, нэвтрэх үед алдаа гарах, эсвэл оноо цэнэглэлтийн асуудал гарвал энд бичиж илгээнэ үү. Манай систем админд шууд мэдэгдэх болно.
                </p>
              </div>

              {reportSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{reportSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="space-y-3.5 bg-black/40 border border-white/[0.06] p-4 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Алдааны ангилал:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'video', label: '🎬 Видео тоглуулагч гацсан' },
                      { id: 'auth', label: '🔑 5 оронтой ID / Нэвтрэлт' },
                      { id: 'payment', label: '💳 Данс цэнэглэлт / Багц' },
                      { id: 'display', label: '📱 Дэлгэц, харагдацын алдаа' },
                      { id: 'media', label: '🖼️ Зураг, мэдээлэл дутуу' },
                      { id: 'other', label: '💬 Бусад санал гомдол' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setReportCategory(c.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                          reportCategory === c.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Товч гарчиг: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Жишээ: 1-р анги гацахгүй тоглуулахгүй байна"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Дэлгэрэнгүй тайлбар (Юу болохгүй байгаа вэ?): <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Алдааны талаар тодорхой бичнэ үү (Жишээ нь: Киноны эхлэл дээр хар дэлгэц гарч гацаж байна)..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Холбоо барих Утас эсвэл Gmail (Хариу өгөхөд хэрэгтэй):
                  </label>
                  <input
                    type="text"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    placeholder="88112233 эсвэл bat@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-zinc-500">
                    Бүртгүүлсэн ID: <span className="text-amber-400 font-mono">#{currentUser?.customId || currentUser?.id || 'Зочин'}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReport ? 'Илгээж байна...' : 'Алдааг Илгээх'}</span>
                  </button>
                </div>
              </form>

              {/* My submitted reports history */}
              {myReports.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Таны илгээсэн алдааны тайлангууд ({myReports.length}):
                  </h4>
                  <div className="space-y-2">
                    {myReports.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="bg-zinc-950 border border-white/[0.06] p-3 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-[11px]">
                              #{r.ticketNumber}
                            </span>
                            <span className="font-extrabold text-white">{r.title}</span>
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-1 line-clamp-2">
                            {r.description}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Илгээсэн: {r.createdAt}
                          </span>
                        </div>

                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                          {r.status === 'resolved' ? 'Зассан' : 'Шалгаж байна'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUIDE & TROUBLESHOOTING FAQs */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black p-4 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Түгээмэл тохиолддог алдаа ба тэдгээрийн хурдан шийдэл</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Хэрэв танд ямар нэг хүндрэл гарвал доорх заавруудаас уншиж 1 минутын дотор шийдэх боломжтой.
                </p>
              </div>

              <div className="space-y-2.5">
                {faqs.map((f, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-white/[0.08] rounded-2xl bg-zinc-950/70 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="font-bold text-xs sm:text-sm text-zinc-200">{f.q}</span>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-3.5 pt-0 border-t border-white/[0.04] text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-black/40">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Shortcuts for User Actions */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-xs text-cyan-300">
                    💡 Нэвтрэх, бүртгүүлэхэд тусламж хэрэгтэй юу?
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    5 оронтой шинэ ID-аа үүсгэх эсвэл утасны дугаараараа нэвтрээрэй.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-all cursor-pointer"
                    >
                      Нэвтрэх цонх нээх
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RUNTIME ERROR LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-zinc-200 uppercase tracking-wide">
                    Бодит цагийн алдааны лог (Console & Network Errors)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Хөтөч дээр бүртгэгдсэн сүүлийн үеийн анхааруулга ба алдааны жагсаалт
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearCacheAndReload}
                  className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-xl border border-zinc-700 font-bold transition-all cursor-pointer"
                >
                  Шинэчлэх
                </button>
              </div>

              {runtimeLogs.length === 0 ? (
                <div className="p-8 text-center bg-black/40 border border-white/[0.06] rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">Ямар нэг систем алдаа бүртгэгдээгүй байна!</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Сайтын код болон видео холболт хэвийн ажиллаж байна.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {runtimeLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-black/50 border border-rose-500/30 p-3 rounded-xl font-mono text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="text-rose-400 font-bold">⚠️ RUNTIME ERROR</span>
                        <span>{log.timeString}</span>
                      </div>
                      <p className="text-rose-300 font-medium break-all">{log.message}</p>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        💡 <span className="text-amber-400">Зөвлөгөө:</span> {log.suggestedSolution}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-500 shrink-0 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FlickNime Health System v2.6</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/share/1LdgHqWqvz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>Facebook хуудсаар асуух</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

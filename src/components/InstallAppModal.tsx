import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Apple, 
  Globe, 
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pc'>('android');

  const [appUrl, setAppUrl] = useState('https://ais-pre-6j76b42ip5fkf32k4rqyau-634365350981.asia-northeast1.run.app');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      if (!origin.includes('localhost:3000')) {
        setAppUrl(window.location.href.split('#')[0]);
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#13151b] border border-zinc-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-purple-900/40 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
              🎬
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
                FlickNime Апп татах & Суулгах
                <span className="text-[10px] bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  PWA Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Гар утас, таблет болон компьютерт шууд суулгах</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Direct Link Card */}
          <div className="bg-zinc-900/90 border border-cyan-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Аппликейшны шууд ажиллах холбоос:</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Live Shared URL
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-lg border border-zinc-800">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="bg-transparent text-xs text-cyan-300 font-mono w-full focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Хууллаа!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Хуулах
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {deferredPrompt ? 'Төхөөрөмж дээрээ шууд суулгах (1-Click Install)' : 'Линк хуулж хөтөч дээрээ суулгах'}
            </button>
          </div>

          {/* Platform Tab Switcher */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Төхөөрөмжөөр суулгах заавар
            </h3>

            <div className="grid grid-cols-3 gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActivePlatform('android')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'android'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Android
              </button>
              <button
                onClick={() => setActivePlatform('ios')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" /> iPhone / iPad
              </button>
              <button
                onClick={() => setActivePlatform('pc')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'pc'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Компьютер / PC
              </button>
            </div>

            {/* Android Instructions */}
            {activePlatform === 'android' && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    <strong className="text-white">Google Chrome</strong> эсвэл өөрийн утасны хөтөч дээр дээрх холбоосоор орно.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Баруун дээд буланд байрлах <strong className="text-white">3 цэг (⋮)</strong> цэсийг товшино.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    <strong className="text-cyan-300">"Апп суулгах" (Install App)</strong> эсвэл <strong className="text-cyan-300">"Нүүр дэлгэцэнд нэмэх" (Add to Home Screen)</strong> дээр дарна.
                  </p>
                </div>
                <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> Таны утасны дэлгэц дээр FlickNime лого бүхий бие даасан Апп болон суух болно!
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {activePlatform === 'ios' && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    iPhone / iPad дээрх <strong className="text-white">Safari</strong> хөтөч дээр дээрх холбоосыг нээнэ.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Доод талд байрлах <strong className="text-white">Share (Хуваалцах 􀈂)</strong> товчийг дарна.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Цэснээс <strong className="text-cyan-300">"Add to Home Screen" (Нүүр дэлгэцэнд нэмэх ➕)</strong> сонголтыг сонгоод "Add" дарна.
                  </p>
                </div>
                <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> Таны iPhone-ийн үндсэн дэлгэц дээр бүтэн дэлгэцээр ажиллах Апп үүснэ!
                </div>
              </div>
            )}

            {/* PC Instructions */}
            {activePlatform === 'pc' && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Chrome, Edge эсвэл Brave хөтөч дээр уг холбоосыг нээнэ.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Хаягийн мөрний (URL bar) баруун захад байрлах <strong className="text-cyan-300">"Суулгах" (Install icon ⊕)</strong> товчийг дарна.
                  </p>
                </div>
                <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> Компьютерийн үндсэн Desktop аппликейшн болж суух болно!
                </div>
              </div>
            )}
          </div>

          {/* Developer / APK & Source Code Note */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-zinc-200">Google Play Store APK & Source Code</h4>
              <p className="text-zinc-400 leading-relaxed">
                Хэрэв та өөрөө <span className="text-amber-300 font-bold">.APK файл</span> гаргах эсвэл кодтойгоо татахыг хүсвэл AI Studio цэсний <strong className="text-white">Settings → Export to ZIP</strong> дарж кодыг татан аваад Capacitor эсвэл <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-medium">PWABuilder.com</a>-оор 1 минутад APK үүсгэж болно.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
          >
            Холбоосоор шууд нээх <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
};

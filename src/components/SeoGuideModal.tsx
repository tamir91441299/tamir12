import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Globe, ExternalLink, Copy, Check, Save, Zap, AlertCircle, HelpCircle } from 'lucide-react';

interface SeoGuideModalProps {
  onClose: () => void;
}

export const SeoGuideModal: React.FC<SeoGuideModalProps> = ({ onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const siteUrl = window.location.origin;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('google_search_console_token');
      if (saved) {
        setVerificationCode(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveVerification = () => {
    let cleanCode = verificationCode.trim();
    // If user pasted the whole meta tag: <meta name="google-site-verification" content="XYZ" />
    if (cleanCode.includes('content=')) {
      const match = cleanCode.match(/content=["']([^"']+)["']/);
      if (match && match[1]) {
        cleanCode = match[1];
      }
    }

    try {
      localStorage.setItem('google_search_console_token', cleanCode);
      const meta = document.getElementById('google-site-verification-meta');
      if (meta) {
        meta.setAttribute('content', cleanCode);
      }
      setVerificationCode(cleanCode);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12161f] border border-cyan-500/30 rounded-2xl max-w-3xl w-full p-6 text-zinc-100 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Сайтыг Google Хайлтаар Гарч Ирдэг Болгох (Google SEO & Indexing)
            </h2>
            <p className="text-xs text-zinc-400">
              Google хайлтын систем (Googlebot)-д сайтаа бүртгүүлж, 24-48 цагийн дотор илэрцэд гаргах алхамчилсан заавар
            </p>
          </div>
        </div>

        {/* Active Built-in SEO Features Checklist */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Таны Сайтад Автоматаар Суусан Google SEO
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50 flex items-start justify-between">
              <div>
                <span className="font-semibold text-white block">1. Dynamic XML Sitemap</span>
                <span className="text-zinc-400 text-[11px]">Бүх анимэ, ангиудын бүтэн индекс</span>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 shrink-0 bg-cyan-950/60 px-2 py-1 rounded"
              >
                /sitemap.xml <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50 flex items-start justify-between">
              <div>
                <span className="font-semibold text-white block">2. Robots.txt</span>
                <span className="text-zinc-400 text-[11px]">Googlebot-д сайтыг унших зөвшөөрөл олгосон</span>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 shrink-0 bg-cyan-950/60 px-2 py-1 rounded"
              >
                /robots.txt <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50">
              <span className="font-semibold text-white block">3. Schema.org Rich Snippets</span>
              <span className="text-zinc-400 text-[11px]">Google Search дээр Киноны нэр, дүн, зураг, төрөл харагдана</span>
            </div>

            <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50">
              <span className="font-semibold text-white block">4. Монгол Түлхүүр Үгс (Keywords)</span>
              <span className="text-zinc-400 text-[11px]">Монгол анимэ үзэх, хадмал, дуу оруулгатай бүх хайлтууд суугдсан</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Google Setup Instructions */}
        <div className="space-y-4 text-xs text-zinc-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" /> Google Хайлтад Сайтаа Оруулах 4 Алхам
          </h3>

          {/* Step 1: Google Search Console */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                Google Search Console-д Сайтаа Бүртгүүлэх
              </span>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors"
              >
                Google Search Console нээх <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Google Search Console руу нэвтрэн орж <strong>"URL prefix"</strong> хэсэгт өөрийн сайтын дараах хаягийг хуулж тавина:
            </p>
            <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-lg border border-zinc-800 font-mono text-xs text-emerald-400">
              <span>{siteUrl}</span>
              <button
                onClick={() => copyToClipboard(siteUrl, 'siteUrl')}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedCode === 'siteUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Хуулах
              </button>
            </div>
          </div>

          {/* Step 2: Verification Meta Code Tool */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                Google Баталгаажуулах Код (HTML Tag) Оруулах
              </span>
              <span className="text-[11px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                Шууд холбогдоно
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Google Search Console дээр баталгаажуулах аргаасаа <strong>"HTML tag"</strong> гэснийг сонгоод өгөгдсөн кодоо доор шууд хуулан <strong>"Хадгалах"</strong> товч дарна уу:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Жишээ: google-site-verification=abcdef12345 эсвэл код"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="flex-1 bg-black/80 border border-zinc-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
              <button
                onClick={handleSaveVerification}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-black" /> Холбогдлоо!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Сайтад Холбох
                  </>
                )}
              </button>
            </div>
            {isSaved && (
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Google баталгаажуулах код амжилттай суулаа. Одоо Google Search Console дээр "VERIFY" товч дарна уу!
              </p>
            )}
          </div>

          {/* Step 3: Submit Sitemap.xml */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
              Sitemap.xml Илгээх (Google-д бүх киногоо мэдээлэх)
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Google Search Console-ийн зүүн цэсэнд байрлах <strong>"Sitemaps"</strong> хэсэгт орж, дараах линкийг оруулаад <strong>"Submit"</strong> дарна:
            </p>
            <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-lg border border-zinc-800 font-mono text-xs text-cyan-300">
              <span>{siteUrl}/sitemap.xml</span>
              <button
                onClick={() => copyToClipboard(`${siteUrl}/sitemap.xml`, 'sitemap')}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedCode === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Хуулах
              </button>
            </div>
          </div>

          {/* Step 4: Request Indexing */}
          <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">4</span>
              Шууд Индексжүүлэх (Request Indexing)
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Search Console-ийн хамгийн дээд талын <strong>"Inspect any URL"</strong> хайлтын талбарт өөрийн сайтын хаягийг (<code>{siteUrl}</code>) бичээд Enter дарж, гарч ирэх хуудаснаас <strong>"REQUEST INDEXING"</strong> товч дээр дарна. Ингэснээр Google-ийн робот 24 цагийн дотор таны сайтыг шалгаж хайлтын үр дүнд оруулна!
            </p>
          </div>

          {/* Verification check tip */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-300 space-y-1">
              <span className="font-bold text-white block">Google дээр гарч байгаа эсэхийг хэрхэн шалгах вэ?</span>
              <p>
                Google хайлт дээр <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">site:{siteUrl.replace(/^https?:\/\//, '')}</code> гэж бичээд хайвал Google-д орсон бүх хуудсууд тань гарч ирэх болно.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Ойлголоо / Хаах
          </button>
        </div>
      </div>
    </div>
  );
};

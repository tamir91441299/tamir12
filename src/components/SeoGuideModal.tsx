import React, { useState } from 'react';
import { X, Search, CheckCircle, Globe, FileCode, BarChart3, ExternalLink, Copy, Check } from 'lucide-react';

interface SeoGuideModalProps {
  onClose: () => void;
}

export const SeoGuideModal: React.FC<SeoGuideModalProps> = ({ onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const siteUrl = window.location.origin;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const googleVerificationTag = `<meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE_HERE" />`;
  const googleAnalyticsTag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-cyan-500/30 rounded-2xl max-w-3xl w-full p-6 text-zinc-100 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full transition-colors"
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
              Google SEO Хэрхэн Идэвхжүүлэх Вэ? (Google Search Console & Meta Guide)
            </h2>
            <p className="text-xs text-zinc-400">
              IOIO TV платформд суурилагдсан Google SEO болон хайлтын системийн тохиргоонууд
            </p>
          </div>
        </div>

        {/* Active Built-in SEO Features Checklist */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Вэбд Идэвхжсэн SEO Бүрэлдэхүүн Хэсгүүд
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex items-start justify-between">
              <div>
                <span className="font-semibold text-white block">1. Dynamic XML Sitemap</span>
                <span className="text-zinc-400 text-[11px]">Бүх кино, анги, хуудсыг Googlebot-д мэдээлнэ</span>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 shrink-0"
              >
                /sitemap.xml <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex items-start justify-between">
              <div>
                <span className="font-semibold text-white block">2. Robots.txt File</span>
                <span className="text-zinc-400 text-[11px]">Хайлтын роботын заавар, sitemap заалт</span>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 shrink-0"
              >
                /robots.txt <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              <span className="font-semibold text-white block">3. OpenGraph & Meta Tags</span>
              <span className="text-zinc-400 text-[11px]">Facebook, Twitter, Viber дээр хуваалцахад зурагтай харагдана</span>
            </div>

            <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              <span className="font-semibold text-white block">4. Schema.org (JSON-LD)</span>
              <span className="text-zinc-400 text-[11px]">Google Search дээр Кино, Дүн (Rating), Үзэлтийн мэдээлэл</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Google Setup Instructions */}
        <div className="space-y-4 text-xs text-zinc-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" /> Google Дээр Сайт Холбох 3 Алхам
          </h3>

          {/* Step 1 */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">Алхам 1: Google Search Console-д бүртгүүлэх</span>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Google Search Console нээх <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Google Search Console руу орж өөрийн домэйн хаягийг (<code>{siteUrl}</code>) оруулна. Google-ээс олгосон Баталгаажуулах HTML meta tag-ийг <code>index.html</code> файлын <code>&lt;head&gt;</code> дотор нэмнэ:
            </p>
            <div className="relative bg-black/80 p-2.5 rounded border border-zinc-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              {googleVerificationTag}
              <button
                onClick={() => copyToClipboard(googleVerificationTag, 'tag')}
                className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                title="Код хуулах"
              >
                {copiedCode === 'tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <span className="font-bold text-cyan-300">Алхам 2: Sitemap.xml илгээх</span>
            <p className="text-zinc-400 text-[11px]">
              Google Search Console-ийн <strong>"Sitemaps"</strong> цэс рүү орж дараах линкийг оруулаад Submit дарна:
            </p>
            <div className="bg-black/80 p-2.5 rounded border border-zinc-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
              <span>{siteUrl}/sitemap.xml</span>
              <button
                onClick={() => copyToClipboard(`${siteUrl}/sitemap.xml`, 'sitemap')}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1 text-[10px]"
              >
                {copiedCode === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Хуулах
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">Алхам 3: Google Analytics (GA4) суулгах (Сонголттой)</span>
              <span className="text-zinc-500 text-[11px]">Үзэгчдийн статистик харах</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Google Analytics-ээс олгох GA4 Tracking ID-г <code>index.html</code> дээр дараах байдлаар тавина:
            </p>
            <div className="relative bg-black/80 p-2.5 rounded border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre">
              {googleAnalyticsTag}
              <button
                onClick={() => copyToClipboard(googleAnalyticsTag, 'ga')}
                className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
              >
                {copiedCode === 'ga' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
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

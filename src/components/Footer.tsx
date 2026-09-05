import React from 'react';
import { ShieldAlert, Heart, Search, Globe, Smartphone, Sparkles, ExternalLink, Sliders } from 'lucide-react';

interface FooterProps {
  onOpenSeoModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenDisplaySettings?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSeoModal, onOpenInstallModal, onOpenDisplaySettings, isAdmin }) => {
  return (
    <footer className="bg-[#050608] border-t border-white/[0.06] text-zinc-400 py-12 px-4 sm:px-6 mt-20 text-xs">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl brand-insignia text-black font-black flex items-center justify-center text-base shadow-lg font-display">
                🎬
              </div>
              <div className="flex flex-col text-left">
                <div className="brand-glow-container">
                  <span className="font-extrabold text-xl tracking-wider brand-text-luxury font-display leading-none">
                    FlickNime
                  </span>
                </div>
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                  Cinema & Anime
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              FlickNime нь кино, анимэ сонирхогчдод зориулсан Монгол хадмал болон дуу оруулгатай уран сайхны кино, олон ангит цуврал, шилдэг анимэ бүтээлүүдийн дээд зэрэглэлийн сан юм.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {onOpenDisplaySettings && (
                <button
                  onClick={onOpenDisplaySettings}
                  className="inline-flex items-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  title="Утас, PC, Таблет дэлгэцийн харагдах хэмжээг тохируулах"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Дэлгэцийн хэмжээний тохиргоо (Утас / PC / Таблет)</span>
                </button>
              )}

              {onOpenInstallModal && (
                <button
                  id="footer-install-app-btn"
                  onClick={onOpenInstallModal}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-300 border border-amber-500/40 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📲 Апп татах / Утсандаа суулгах</span>
                </button>
              )}

              {onOpenSeoModal && (
                <button
                  onClick={onOpenSeoModal}
                  className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-semibold px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>SEO Баталгаажуулалт</span>
                </button>
              )}
            </div>
          </div>

          {/* Studio sections */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Хэсгүүд & Тоглоом
            </h4>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <a href="https://vibe-fighter-two.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold text-amber-400/90">
                  <span>🥊 Vibe Fighter Arena</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" /> 
                  <span>Dynamic Sitemap.xml</span>
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-sky-400" /> 
                  <span>Robots.txt Metadata</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Сошиал суваг & Холбоос
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Албан ёсны сошиал хуудсуудыг дагаж шинэ нээлт, трэйлер болон тусгай хөнгөлөлтийн мэдээллийг цаг алдалгүй хүлээн аваарай.
            </p>
            <a
              href="https://www.facebook.com/share/r/17wruEiwvA/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md mt-1"
            >
              <span>Facebook хуудас үзэх 🔗</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-xs text-zinc-500">
          <p>© 2026 FlickNime Cinema. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Монгол кино сонирхогчдод зориулан бүтээв</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

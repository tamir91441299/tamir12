import React, { useState, useRef } from 'react';
import {
  Gamepad2,
  Swords,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Flame,
  Zap,
  Info,
  Shield,
  Trophy,
  Volume2
} from 'lucide-react';

interface VibeFighterGameProps {
  onSwitchToGuessingGame?: () => void;
}

export const VibeFighterGame: React.FC<VibeFighterGameProps> = ({
  onSwitchToGuessingGame,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const GAME_URL = 'https://vibe-fighter-two.vercel.app/';

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error('Error enabling fullscreen:', err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error('Error exiting fullscreen:', err));
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Game Header */}
      <div className="bg-gradient-to-r from-rose-950/80 via-zinc-900 to-purple-950/80 border border-rose-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/30 shrink-0">
              <Swords className="w-8 h-8 animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-3 py-0.5 rounded-full text-xs font-black border border-rose-500/40">
                  <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>VIBE FIGHTER • ОНЛАЙН ТУЛААНТ ТОГЛООМ</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ⚡ 2026 ШИНЭ ТОГЛООМ
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Vibe Fighter Arena</span>
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl">
                Өөрийн тулаанчийг удирдан дайснаа ялж, комбо цохилтууд хийгээрэй! Доорх дэлгэцээс шууд тоглох боломжтой.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end flex-wrap">
            <button
              id="vibe-fighter-guide-btn"
              onClick={() => setShowControlsGuide((prev) => !prev)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>{showControlsGuide ? 'Заавар хаах' : 'Удирдлага & Заавар'}</span>
            </button>

            <a
              id="vibe-fighter-new-tab-btn"
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Шинэ цонхонд нээх</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Collapsible Controls Guide */}
        {showControlsGuide && (
          <div className="mt-5 pt-4 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>ХӨДӨЛГӨӨН (Move)</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono text-[10px] mr-1">A</kbd> / 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono text-[10px] mx-1">D</kbd> эсвэл 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono text-[10px] ml-1">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono text-[10px] ml-1">→</kbd>
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>ҮСРЭХ & СУУХ (Jump/Crouch)</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-amber-300 font-mono text-[10px] mr-1">W</kbd> Үсрэх, 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-amber-300 font-mono text-[10px] mx-1">S</kbd> Хаалт / Суух
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                <Swords className="w-3.5 h-3.5" />
                <span>ЦОХИХ & ДОВТЛОХ (Attack)</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-rose-300 font-mono text-[10px] mr-1">J</kbd> / 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-rose-300 font-mono text-[10px] mx-1">K</kbd> / 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-rose-300 font-mono text-[10px] ml-1">Space</kbd>
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>ТУСГАЙ КОМБО (Skill)</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-300 font-mono text-[10px] mr-1">L</kbd> / 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-300 font-mono text-[10px] mx-1">U</kbd> / 
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-300 font-mono text-[10px] ml-1">I</kbd>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Screen Stage */}
      <div
        ref={containerRef}
        className="bg-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col group"
      >
        {/* Game Stage Toolbar Header */}
        <div className="bg-[#121216] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-rose-400" />
              <span>Vibe Fighter Arena (vibe-fighter-two.vercel.app)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reload-vibe-fighter-btn"
              onClick={handleReload}
              title="Тоглоомыг дахин эхлүүлэх"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Дахин эхлүүлэх</span>
            </button>

            <button
              id="fullscreen-vibe-fighter-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэцээр тоглох'}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] hidden sm:inline">Буцах</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] hidden sm:inline">Бүтэн дэлгэц</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 top-10 bg-zinc-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-zinc-300 animate-pulse">
              🎮 Vibe Fighter тоглоомыг ачаалж байна...
            </p>
          </div>
        )}

        {/* Embedded Game Iframe */}
        <div className="relative w-full aspect-video min-h-[300px] sm:min-h-[480px] md:min-h-[580px] bg-black">
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={GAME_URL}
            title="Vibe Fighter Game"
            className="w-full h-full border-0 absolute inset-0"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation; screen-wake-lock"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Game Stage Footer Info */}
        <div className="bg-[#101014] border-t border-zinc-800/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">💡 Зөвлөгөө:</span>
            <span>Тоглоом дээр хулганаар дарж удирдлагыг идэвхжүүлнэ үү. Дуу болон тоглолтыг хүссэнээрээ тохируулаарай.</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onSwitchToGuessingGame && (
              <button
                onClick={onSwitchToGuessingGame}
                className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
              >
                🎭 Анимэ таавар тоглоом руу шилжих →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

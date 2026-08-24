import React, { useState } from 'react';
import { Gamepad2, Swords, Trophy, ExternalLink, Maximize2, Minimize2, RotateCcw, Sparkles, HelpCircle, Shield, Play } from 'lucide-react';
import { AnimeGuesser } from './AnimeGuesser';

interface GameHubViewProps {
  initialGame?: 'vibe_fighter' | 'anime_guesser';
}

export const GameHubView: React.FC<GameHubViewProps> = ({
  initialGame = 'vibe_fighter',
}) => {
  const [selectedGame, setSelectedGame] = useState<'vibe_fighter' | 'anime_guesser'>(initialGame);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);

  const VIBE_FIGHTER_URL = 'https://vibe-fighter-two.vercel.app/';

  const handleRefreshGame = () => {
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner & Game Switcher */}
      <div className="bg-gradient-to-r from-purple-950/80 via-zinc-900 to-rose-950/80 border border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-amber-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/30 shrink-0 animate-pulse">
              <Swords className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-black border border-purple-500/30 mb-1">
                <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                <span>FLICKNIME ТОГЛООМЫН ТӨВ</span>
                <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">ШИНЭ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                🎮 Онлайн Тоглоомууд
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                Vibe Fighter тулаант тоглоомыг сайт дотроо шууд тоглох, эсвэл Анимэ таавар тааж дээд оноогоо хадгалаарай!
              </p>
            </div>
          </div>

          {/* Navigation Pill Selectors */}
          <div className="flex items-center bg-zinc-950/90 p-1.5 rounded-2xl border border-zinc-800 shrink-0 w-full md:w-auto">
            <button
              id="btn-tab-vibe-fighter"
              type="button"
              onClick={() => setSelectedGame('vibe_fighter')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedGame === 'vibe_fighter'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span>🥊 Vibe Fighter</span>
              <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">HOT</span>
            </button>

            <button
              id="btn-tab-anime-guesser"
              type="button"
              onClick={() => setSelectedGame('anime_guesser')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedGame === 'anime_guesser'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-pink-300" />
              <span>🧩 Анимэ Таавар</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      {selectedGame === 'vibe_fighter' ? (
        <div
          id="vibe-fighter-container"
          className={`bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'min-h-[620px] sm:min-h-[720px]'
          }`}
        >
          {/* Top Control Header */}
          <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <Swords className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>VIBE FIGHTER</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Шууд холбогдсон ✓
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Тоглоомын шууд холбоос: <span className="text-zinc-300 font-mono">vibe-fighter-two.vercel.app</span>
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              <button
                id="btn-refresh-vibe-fighter"
                type="button"
                onClick={handleRefreshGame}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                title="Тоглоомыг дахин ачааллах"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Шинэчлэх</span>
              </button>

              <a
                id="btn-external-vibe-fighter"
                href={VIBE_FIGHTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                title="Шинэ таб дээр бүтнээр нээх"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Шинэ таб дээр нээх</span>
              </a>

              <button
                id="btn-fullscreen-vibe-fighter"
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-3 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title={isFullscreen ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэцээр тоглох'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Дэлгэц хураах</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Бүтэн дэлгэц</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Iframe Game Container */}
          <div className="relative flex-1 w-full min-h-[560px] sm:min-h-[660px] bg-black">
            {isLoadingIframe && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/90 text-white space-y-4 p-4 text-center">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">Vibe Fighter тоглоомыг ачааллаж байна...</h4>
                  <p className="text-xs text-zinc-400">Түр хүлээнэ үү, тоглоомын өгөгдөл холбогдож байна</p>
                </div>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={VIBE_FIGHTER_URL}
              title="Vibe Fighter"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad; keyboard"
              allowFullScreen
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full h-full min-h-[560px] sm:min-h-[660px] border-0"
              style={{ minHeight: isFullscreen ? 'calc(100vh - 60px)' : '660px' }}
            />
          </div>

          {/* Bottom Game Tips */}
          <div className="bg-zinc-900/90 border-t border-zinc-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-rose-500/20 text-rose-400 font-bold">🎮 Зөвлөмж:</span>
              <span>Тоглоомыг илүү тав тухтай тоглохын тулд "Бүтэн дэлгэц" товчийг дарж тоглоорой.</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <span>Host: vibe-fighter-two.vercel.app</span>
            </div>
          </div>
        </div>
      ) : (
        <AnimeGuesser defaultMode="character" />
      )}
    </div>
  );
};

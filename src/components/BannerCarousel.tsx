import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Bookmark, Sparkles, Flame, Tv, Film, Clapperboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';

interface BannerCarouselProps {
  featuredMovies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  deviceMode?: 'auto' | 'phone' | 'tablet' | 'pc';
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  featuredMovies,
  onPlayMovie,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
  deviceMode = 'auto',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex];
  const audioLabel = 'MN SUB / DUB';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden cinema-glass-elevated mb-8 group/banner film-frame-decor">
      {/* Background image & Theatrical Lighting */}
      <div className={`relative w-full overflow-hidden bg-gradient-to-r from-[#07080b] via-[#10121a] to-[#07080b] ${
        deviceMode === 'phone'
          ? 'min-h-[290px] h-[330px]'
          : deviceMode === 'tablet'
          ? 'min-h-[380px] h-[430px]'
          : deviceMode === 'pc'
          ? 'min-h-[460px] h-[520px]'
          : 'min-h-[360px] sm:min-h-[440px] md:min-h-[500px] h-[380px] sm:h-[480px] md:h-[540px]'
      }`}>
        {(currentMovie.backdrop || currentMovie.poster) ? (
          <img
            src={currentMovie.backdrop || currentMovie.poster}
            alt={currentMovie.titleMongolian}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
            className="w-full h-full object-cover object-center transform scale-102 group-hover/banner:scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#121520] via-[#0b0d14] to-[#07080b] flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-amber-400/40" />
            </div>
          </div>
        )}

        {/* Ambient Master Vignette & Shadow Falloff */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/80 md:via-[#07080b]/50 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07080b]/30 to-[#07080b]/90 pointer-events-none" />

        {/* Top Floating Studio Header Badges */}
        <div className="absolute top-3 left-3 sm:top-6 sm:left-7 flex flex-wrap items-center gap-1.5 sm:gap-2 z-10 max-w-[calc(100%-1.5rem)]">
          <span className="studio-badge-gold text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>PREMIERE</span>
          </span>

          <span className="studio-badge-dark text-[10px] sm:text-xs font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl">
            4K UHD
          </span>

          <span className="studio-badge-dark text-[10px] sm:text-xs font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-amber-300">
            {audioLabel}
          </span>

          <span className="studio-badge-dark text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl flex items-center gap-1">
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-amber-300">{currentMovie.rating}</span>
          </span>
        </div>

        {/* Navigation Arrows for Banner */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md opacity-0 group-hover/banner:opacity-100 transition-all z-20 cursor-pointer hidden sm:flex items-center justify-center"
          title="Өмнөх"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md opacity-0 group-hover/banner:opacity-100 transition-all z-20 cursor-pointer hidden sm:flex items-center justify-center"
          title="Дараах"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Main Content Area */}
        <div className="absolute bottom-4 sm:bottom-7 left-3 sm:left-7 right-3 sm:right-7 z-10 max-w-3xl">
          {/* Genre Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium mb-2 sm:mb-3">
            {currentMovie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="bg-black/60 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-white/[0.08] text-zinc-300 font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          <h1 className={`font-black text-white tracking-tight leading-tight drop-shadow-2xl font-display line-clamp-2 ${
            deviceMode === 'phone'
              ? 'text-lg sm:text-xl'
              : deviceMode === 'tablet'
              ? 'text-2xl sm:text-4xl'
              : deviceMode === 'pc'
              ? 'text-3xl sm:text-5xl lg:text-6xl'
              : 'text-xl sm:text-3xl md:text-5xl lg:text-6xl'
          }`}>
            {currentMovie.titleMongolian}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-medium mt-1 sm:mt-2 mb-1.5 sm:mb-2 line-clamp-1">
            {currentMovie.title} • <span className="font-mono text-amber-400">{currentMovie.year}</span>
          </p>

          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-300 line-clamp-2 mb-3 sm:mb-5 max-w-2xl leading-relaxed font-normal opacity-90 hidden xs:block sm:block">
            {currentMovie.description}
          </p>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id={`play-banner-${currentMovie.id}`}
              onClick={() => onPlayMovie(currentMovie)}
              className="gold-glow-btn font-black text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 sm:w-5 h-3.5 sm:h-5 fill-current" />
              <span>ШУУД ҮЗЭХ</span>
            </button>

            <button
              id={`detail-banner-${currentMovie.id}`}
              onClick={() => onOpenDetails(currentMovie)}
              className="bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2 border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Info className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-300" />
              <span>Дэлгэрэнгүй</span>
            </button>

            <button
              id={`favorite-banner-${currentMovie.id}`}
              onClick={() => onToggleFavorite(currentMovie.id)}
              className={`p-2.5 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                isFavorite(currentMovie.id)
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-white/[0.05] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.1]'
              }`}
              title="Хадгалах"
            >
              <Bookmark className="w-3.5 sm:w-5 h-3.5 sm:h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Cinema Reel Ticker */}
      <div className="bg-[#08090d] py-3 px-6 flex items-center justify-between border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-amber-400 font-bold">0{currentIndex + 1}</span>
          <span className="text-zinc-600">/</span>
          <span>0{featuredMovies.length}</span>
        </div>

        <div className="flex items-center gap-2">
          {featuredMovies.map((m, idx) => (
            <button
              key={m.id}
              id={`banner-dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-10 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'w-2.5 bg-zinc-800 hover:bg-zinc-600'
              }`}
              title={m.titleMongolian}
            />
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Шилдэг бүтээлүүд</span>
        </div>
      </div>
    </div>
  );
};

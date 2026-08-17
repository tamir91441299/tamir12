import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Bookmark, Sparkles, ShieldCheck, Flame, Tv, Film } from 'lucide-react';
import { Movie } from '../types';

interface BannerCarouselProps {
  featuredMovies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  featuredMovies,
  onPlayMovie,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800/80 mb-8 group/banner">
      {/* Background image & Ambient Overlays */}
      <div className="relative h-[360px] sm:h-[440px] md:h-[500px] w-full overflow-hidden">
        <img
          src={currentMovie.backdrop || currentMovie.poster}
          alt={currentMovie.titleMongolian}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Cinema Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0d] via-[#0a0a0d]/75 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0a0a0d]/40 to-[#0a0a0d]/90 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2 z-10">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xs px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
            {currentMovie.type === 'series' ? (
              <>
                <Tv className="w-3.5 h-3.5" />
                <span>ОЛОН АНГИТ</span>
              </>
            ) : currentMovie.type === 'anime' ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>АНИМЭ</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" />
                <span>КИНО</span>
              </>
            )}
          </span>

          <span className="bg-emerald-500/90 backdrop-blur-md text-black font-black text-xs px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ШУУД ҮЗЭХ ✓</span>
          </span>

          <span className="bg-zinc-900/90 text-zinc-200 font-bold text-xs px-2.5 py-1 rounded-lg border border-zinc-700/80 backdrop-blur-sm">
            {currentMovie.year}
          </span>

          <span className="bg-amber-500/20 text-amber-300 font-black text-xs px-3 py-1 rounded-lg border border-amber-500/40 backdrop-blur-sm flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{currentMovie.rating}</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 bg-rose-500/20 text-rose-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-rose-500/40 backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>ОНЦЛОХ</span>
          </span>
        </div>

        {/* Main Content Area */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-10 max-w-3xl">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-cyan-300 mb-2.5">
            {currentMovie.genres.map((g) => (
              <span
                key={g}
                className="bg-cyan-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-800/60 shadow-sm"
              >
                {g}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
            {currentMovie.titleMongolian}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-semibold mt-1.5 mb-3 line-clamp-1 italic text-shadow">
            {currentMovie.title} ({currentMovie.year})
          </p>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-6 max-w-2xl leading-relaxed font-normal">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id={`play-banner-${currentMovie.id}`}
              onClick={() => onPlayMovie(currentMovie)}
              className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-black text-sm px-7 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>ШУУД ҮЗЭХ</span>
            </button>

            <button
              id={`detail-banner-${currentMovie.id}`}
              onClick={() => onOpenDetails(currentMovie)}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2 border border-zinc-700/80 backdrop-blur-md transition-all cursor-pointer hover:border-zinc-500"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Дэлгэрэнгүй</span>
            </button>

            <a
              href="https://www.facebook.com/share/r/17wruEiwvA/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-sm px-4 py-3.5 rounded-2xl flex items-center gap-2 border border-blue-400/60 transition-all shadow-lg hover:scale-105"
            >
              <span>FB Бичлэг 🎬</span>
            </a>

            <button
              id={`favorite-banner-${currentMovie.id}`}
              onClick={() => onToggleFavorite(currentMovie.id)}
              className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer ${
                isFavorite(currentMovie.id)
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
              title="Хадгалах"
            >
              <Bookmark className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="bg-[#0a0a0d] py-3 px-6 flex items-center justify-center gap-2 border-t border-zinc-800/80">
        {featuredMovies.map((m, idx) => (
          <button
            key={m.id}
            id={`banner-dot-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentIndex
                ? 'w-9 bg-cyan-400 shadow-lg shadow-cyan-400/50'
                : 'w-2 bg-zinc-700 hover:bg-zinc-500'
            }`}
            title={m.titleMongolian}
          />
        ))}
      </div>
    </div>
  );
};

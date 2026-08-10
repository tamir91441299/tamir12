import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Bookmark, Volume2, VolumeX, Sparkles } from 'lucide-react';
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
    <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800/80 mb-8">
      {/* Background image & Gradient Overlays */}
      <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full overflow-hidden">
        <img
          src={currentMovie.backdrop || currentMovie.poster}
          alt={currentMovie.titleMongolian}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out"
        />

        {/* Gradient Mask for visual contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121214] via-[#121214]/70 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
          <span className="bg-cyan-500 text-black font-black text-xs px-2.5 py-1 rounded shadow-md tracking-wider">
            {currentMovie.type === 'series' ? 'TV' : 'MOVIE'}
          </span>
          {currentMovie.type === 'anime' ? (
            <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-md">
              АНИМЭ БАГЦ (4,000 ₮)
            </span>
          ) : (
            <span className="bg-cyan-500 text-black font-black text-xs px-2.5 py-1 rounded shadow-md">
              КИНО БАГЦ (4,000 ₮)
            </span>
          )}
          <span className="bg-zinc-900/90 text-zinc-300 font-bold text-xs px-2.5 py-1 rounded border border-zinc-700/80">
            {currentMovie.year}
          </span>
          <span className="bg-amber-500/20 text-amber-300 font-bold text-xs px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {currentMovie.rating}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-10 max-w-2xl">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-cyan-400 mb-2">
            {currentMovie.genres.map((g) => (
              <span key={g} className="bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/50">
                {g}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {currentMovie.titleMongolian}
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-medium mt-1 mb-3 line-clamp-1 italic">
            {currentMovie.title} ({currentMovie.year})
          </p>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-6 max-w-xl leading-relaxed">
            {currentMovie.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id={`play-banner-${currentMovie.id}`}
              onClick={() => onPlayMovie(currentMovie)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              ШУУД ҮЗЭХ
            </button>

            <button
              id={`detail-banner-${currentMovie.id}`}
              onClick={() => onOpenDetails(currentMovie)}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              Дэлгэрэнгүй
            </button>

            <a
              href="https://www.facebook.com/share/r/17wruEiwvA/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-3 rounded-xl flex items-center gap-2 border border-blue-500 transition-all shadow-md hover:scale-105"
            >
              <span>FB Бичлэг 🎬</span>
            </a>

            <button
              id={`favorite-banner-${currentMovie.id}`}
              onClick={() => onToggleFavorite(currentMovie.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isFavorite(currentMovie.id)
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="Хадгалах"
            >
              <Bookmark className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Pagination Dots */}
      <div className="bg-[#121214] py-3 px-6 flex items-center justify-center gap-2 border-t border-zinc-800/60">
        {featuredMovies.map((m, idx) => (
          <button
            key={m.id}
            id={`banner-dot-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex
                ? 'w-8 bg-cyan-400'
                : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
            }`}
            title={m.titleMongolian}
          />
        ))}
      </div>
    </div>
  );
};

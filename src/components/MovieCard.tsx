import React from 'react';
import { Play, Star, Bookmark, Sparkles, Tv, Film, Clapperboard } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: boolean;
  isPurchased?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
}) => {
  const typeBadgeLabel = movie.type === 'anime' ? 'ANIME' : movie.type === 'series' ? 'SERIES' : 'CINEMA';
  const audioLabel = movie.country === 'Монгол' ? 'MN ORIGINAL' : movie.type === 'anime' ? 'MN SUB / DUB' : 'MN DUB';

  return (
    <div className="group relative cinema-glass-card rounded-2xl overflow-hidden flex flex-col h-full select-none cursor-pointer">
      {/* Poster Image Container */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-b from-[#181b24] via-[#101218] to-[#0a0b0f] flex items-center justify-center"
        onClick={() => onOpenDetails(movie)}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.titleMongolian}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out select-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#181c26] via-[#12141c] to-[#08090d]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-amber-400/40 transition-all">
              {movie.type === 'anime' ? (
                <Sparkles className="w-6 h-6 text-rose-400" />
              ) : movie.type === 'series' ? (
                <Tv className="w-6 h-6 text-indigo-400" />
              ) : (
                <Film className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <p className="text-xs font-bold text-zinc-200 line-clamp-2 px-1">
              {movie.titleMongolian || movie.title}
            </p>
            <span className="text-[10px] text-zinc-500 font-medium mt-1">
              {movie.year} • {movie.genres?.[0] || 'Кино'}
            </span>
          </div>
        )}

        {/* Ambient Theatrical Vignette & Bottom Film Shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Floating Studio Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none gap-1 z-10">
          <span
            className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border ${
              movie.type === 'anime'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : movie.type === 'series'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {typeBadgeLabel}
          </span>

          {/* Rating Pill */}
          <span className="bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating}</span>
          </span>
        </div>

        {/* Bottom Format / Audio Tag (Sleek Studio Film Spec) */}
        <div className="absolute bottom-2.5 left-2.5 pointer-events-none z-10">
          <span className="bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded">
            {audioLabel}
          </span>
        </div>

        {/* Bookmark Quick Button */}
        <button
          id={`card-fav-${movie.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer z-10 ${
            isFavorite
              ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/40 scale-105'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-black/90 hover:scale-105'
          }`}
          title="Хадгалах"
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Cinematic Play Orb Hover Overlay (Desktop Mouse Hover Only to prevent mobile touch blackout) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center backdrop-blur-[2px] pointer-events-none sm:group-hover:pointer-events-auto">
          <button
            id={`card-play-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-13 h-13 rounded-full gold-glow-btn text-black flex items-center justify-center hover:scale-115 active:scale-95 transition-all duration-300 cursor-pointer"
            title="Тоглуулах"
          >
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div 
        className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0e1017] to-[#0a0b10] border-t border-white/[0.05]"
        onClick={() => onOpenDetails(movie)}
      >
        <div>
          <h3
            className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1"
            title={movie.titleMongolian}
          >
            {movie.titleMongolian}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
            {movie.title}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-white/[0.04]">
          <span className="font-mono text-zinc-400">{movie.year}</span>
          <span className="text-zinc-500 font-medium truncate max-w-[90px]">
            {movie.genres?.[0] || 'Кино'}
          </span>
        </div>
      </div>
    </div>
  );
};

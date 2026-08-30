import React from 'react';
import { Play, Trash2, Clock, CheckCircle2, Film, Sparkles } from 'lucide-react';
import { Movie } from '../types';

export interface WatchHistoryItem {
  movieId: string;
  episodeNumber: number;
  progressPercent: number;
  currentTime?: number;
  duration?: number;
  updatedAt: number;
}

interface ContinueWatchingProps {
  history: WatchHistoryItem[];
  movies: Movie[];
  onPlay: (movie: Movie, episodeNumber: number) => void;
  onOpenDetails: (movie: Movie) => void;
  onRemove: (movieId: string) => void;
  onClearAll?: () => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({
  history,
  movies,
  onPlay,
  onOpenDetails,
  onRemove,
  onClearAll,
}) => {
  const itemsWithMovies = history
    .map((hist) => {
      const movie = movies.find((m) => m.id === hist.movieId);
      return { hist, movie };
    })
    .filter((item): item is { hist: WatchHistoryItem; movie: Movie } => Boolean(item.movie));

  if (itemsWithMovies.length === 0) return null;

  return (
    <section className="space-y-4 mb-9">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase text-white tracking-wide font-display flex items-center gap-2">
            <span>Үргэлжлүүлж Үзэх</span>
          </h2>
          <span className="bg-white/[0.05] border border-white/[0.08] text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
            {itemsWithMovies.length}
          </span>
        </div>

        {itemsWithMovies.length > 1 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Түүх цэвэрлэх</span>
          </button>
        )}
      </div>

      {/* Reel grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {itemsWithMovies.map(({ hist, movie }) => {
          const currentEp = movie.episodes?.find((e) => e.episodeNumber === hist.episodeNumber);
          const epTitle = currentEp ? `${hist.episodeNumber}-р анги` : movie.type === 'anime' || movie.type === 'series' ? `${hist.episodeNumber}-р анги` : 'Бүрэн кино';
          const progress = Math.min(100, Math.max(15, hist.progressPercent || 35));
          const hasImage = Boolean(movie.backdrop || movie.poster);
          const imgSrc = movie.backdrop || movie.poster;

          return (
            <div
              key={`${hist.movieId}_${hist.episodeNumber}`}
              className="group relative rounded-2xl cinema-glass-card overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-[#08090d] overflow-hidden">
                {hasImage ? (
                  <img
                    src={imgSrc}
                    alt={movie.titleMongolian || movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121520] via-[#0b0d14] to-[#07080b] text-zinc-600">
                    <Film className="w-8 h-8 text-amber-500/40 mb-1" />
                    <span className="text-xs font-bold text-zinc-400 text-center px-4 line-clamp-1">
                      {movie.titleMongolian || movie.title}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-black/40 to-transparent" />

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(hist.movieId);
                  }}
                  title="Түүхээс хасах"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-zinc-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Episode Badge */}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-amber-500/90 text-black font-extrabold text-[10px] shadow-md font-mono">
                  {epTitle}
                </div>

                {/* Center Play Button */}
                <button
                  onClick={() => onPlay(movie, hist.episodeNumber)}
                  className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                  aria-label="Үргэлжлүүлэн үзэх"
                >
                  <div className="w-11 h-11 rounded-full gold-glow-btn text-black flex items-center justify-center shadow-2xl group-hover/btn:scale-110 transition-all duration-300">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </button>

                {/* Golden Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Card Meta / Info */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-gradient-to-b from-[#0e1017] to-[#0a0b10]">
                <div>
                  <h3
                    onClick={() => onOpenDetails(movie)}
                    className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {movie.titleMongolian || movie.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                    <span className="font-semibold text-amber-400 font-mono">{epTitle}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono">{movie.year}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500 truncate">
                      {movie.totalEpisodes ? `${movie.totalEpisodes} ангитай` : movie.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => onPlay(movie, hist.episodeNumber)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Үргэлжлүүлэх</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(movie)}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Дэлгэрэнгүй
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

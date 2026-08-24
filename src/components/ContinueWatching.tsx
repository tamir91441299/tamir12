import React from 'react';
import { Play, Trash2, Clock, CheckCircle2, Film } from 'lucide-react';
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
  // Map history to movie items
  const itemsWithMovies = history
    .map((hist) => {
      const movie = movies.find((m) => m.id === hist.movieId);
      return { hist, movie };
    })
    .filter((item): item is { hist: WatchHistoryItem; movie: Movie } => Boolean(item.movie));

  if (itemsWithMovies.length === 0) return null;

  return (
    <section className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-wide">
                Үргэлжлүүлж Үзэх
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                {itemsWithMovies.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Хамгийн сүүлд үзэж байсан анги болон киногоо үргэлжлүүлэн үзээрэй
            </p>
          </div>
        </div>

        {itemsWithMovies.length > 1 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Түүх цэвэрлэх</span>
          </button>
        )}
      </div>

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
              className="group relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/60 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
            >
              {/* Image / Thumbnail */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                {hasImage ? (
                  <img
                    src={imgSrc}
                    alt={movie.titleMongolian || movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/30 text-zinc-600">
                    <Film className="w-10 h-10 text-amber-500/40 mb-2" />
                    <span className="text-xs font-bold text-zinc-400 text-center px-4 line-clamp-1">
                      {movie.titleMongolian || movie.title}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

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
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-md text-black font-black text-xs shadow-md">
                  {epTitle}
                </div>

                {/* Center Play Button */}
                <button
                  onClick={() => onPlay(movie, hist.episodeNumber)}
                  className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                  aria-label="Үргэлжлүүлэн үзэх"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl group-hover/btn:scale-110 group-hover/btn:bg-amber-400 transition-all duration-300">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </button>

                {/* Progress Bar Container */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Card Meta / Info */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-1">
                  <h3
                    onClick={() => onOpenDetails(movie)}
                    className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {movie.titleMongolian || movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="font-semibold text-amber-400">{epTitle}</span>
                    <span>•</span>
                    <span>{movie.year} он</span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      {movie.totalEpisodes ? `Нийт ${movie.totalEpisodes} анги` : movie.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <button
                    onClick={() => onPlay(movie, hist.episodeNumber)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Үргэлжлүүлэх</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(movie)}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Мэдээлэл
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

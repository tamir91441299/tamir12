import React from 'react';
import { Play, Star, Bookmark, Eye } from 'lucide-react';
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
  isPurchased = false,
}) => {
  const price = movie.price || 1000;

  return (
    <div className="group relative bg-[#17171a] rounded-xl overflow-hidden border border-zinc-800/80 hover:border-cyan-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 cursor-pointer" onClick={() => onOpenDetails(movie)}>
        <img
          src={movie.poster}
          alt={movie.titleMongolian}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded shadow ${
                movie.type === 'anime'
                  ? 'bg-rose-600 text-white'
                  : movie.type === 'series'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {movie.type === 'anime' ? 'ANIME' : movie.type === 'series' ? 'TV' : 'MOVIE'}
            </span>
            {(movie.id === 'm15' || movie.episodes) && (
              <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow border border-emerald-300">
                1-р анги ҮНЭГҮЙ
              </span>
            )}
          </div>

          {isPurchased ? (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              ИДЭВХТЭЙ ✓
            </span>
          ) : movie.type === 'anime' ? (
            <span className="bg-rose-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow backdrop-blur-sm">
              АНИМЭ 4,000₮
            </span>
          ) : (
            <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow backdrop-blur-sm">
              КИНО 4,000₮
            </span>
          )}
        </div>

        {/* Bookmark quick button */}
        <button
          id={`card-fav-${movie.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className={`absolute bottom-2 right-2 p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/80 border-rose-400 text-white'
              : 'bg-zinc-900/60 border-zinc-700/80 text-zinc-300 hover:text-white'
          }`}
          title="Хадгалах"
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Hover Overlay Play button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            id={`card-play-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-[#17171a]">
        <div>
          <h3
            onClick={() => onOpenDetails(movie)}
            className="font-bold text-sm text-zinc-100 hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.titleMongolian}
          >
            {movie.titleMongolian}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-medium">
            {movie.title}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-zinc-800/60">
          <span className="font-mono text-zinc-300">{movie.year}</span>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

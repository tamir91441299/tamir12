import React from 'react';
import { Play, Star, Bookmark, ShieldCheck, Sparkles, Tv, Film } from 'lucide-react';
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
  return (
    <div className="group relative bg-[#131317] rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-cyan-500/60 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5">
      {/* Poster Image Container */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 cursor-pointer"
        onClick={() => onOpenDetails(movie)}
      >
        <img
          src={movie.poster}
          alt={movie.titleMongolian}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Bottom Gradient on Poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131317] via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none gap-1 z-10">
          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-0.5 ${
                movie.type === 'anime'
                  ? 'bg-rose-600 text-white'
                  : movie.type === 'series'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {movie.type === 'anime' ? 'ANIME' : movie.type === 'series' ? 'TV' : 'MOVIE'}
            </span>
          </div>

          <span className="bg-emerald-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-md backdrop-blur-md flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>ШУУД ✓</span>
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
              ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/40 scale-105'
              : 'bg-black/60 border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-black/80 hover:scale-105'
          }`}
          title="Хадгалах"
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Hover Overlay Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            id={`card-play-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              console.log(`🎬 [MovieCard] Play button clicked for "${movie.titleMongolian}" (ID: ${movie.id}), videoUrl: ${movie.videoUrl}`);
              onPlay(movie);
            }}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center shadow-2xl shadow-cyan-500/50 hover:scale-115 active:scale-95 transition-all cursor-pointer"
            title="Тоглуулах"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-[#131317]">
        <div>
          <h3
            onClick={() => onOpenDetails(movie)}
            className="font-extrabold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.titleMongolian}
          >
            {movie.titleMongolian}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-medium">
            {movie.title}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/80">
          <span className="font-mono text-zinc-300 font-semibold">{movie.year}</span>
          <div className="flex items-center gap-1 text-amber-400 font-black">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

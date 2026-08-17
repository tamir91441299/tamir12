import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  title: string;
  totalCount?: number;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  isPurchased?: (movieId: string) => boolean;
  onSeeAll?: () => void;
  onResetFilters?: () => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  title,
  totalCount,
  movies,
  onPlayMovie,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
  isPurchased,
  onSeeAll,
  onResetFilters,
}) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="bg-[#17171a] rounded-2xl p-8 text-center text-zinc-400 border border-zinc-800 my-4 space-y-3">
        <p className="text-base font-semibold text-zinc-300">Илэрц олдсонгүй.</p>
        <p className="text-xs text-zinc-500">Шүүлтүүр эсвэл хайлтын үгээ өөрчилж үзнэ үү.</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Бүх шүүлтүүрийг арилгах</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4 mb-8">
      {/* Section Header matching 1010 style */}
      <div className="flex items-center justify-between border-l-4 border-cyan-500 pl-3 py-0.5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {totalCount !== undefined && (
            <span className="text-zinc-400 font-mono hidden sm:inline-block">
              {totalCount}
            </span>
          )}
          {onSeeAll && (
            <button
              id={`see-all-${title}`}
              onClick={onSeeAll}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold px-3 py-1 rounded text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              SEE ALL
            </button>
          )}
          <div className="flex items-center gap-1 text-zinc-500">
            <button className="p-1 hover:text-zinc-200 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-zinc-200 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPlay={onPlayMovie}
            onOpenDetails={onOpenDetails}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite(movie.id)}
            isPurchased={isPurchased ? isPurchased(movie.id) : false}
          />
        ))}
      </div>
    </section>
  );
};

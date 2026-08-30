import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
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
      <div className="cinema-glass-card rounded-3xl p-10 text-center text-zinc-400 my-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 mx-auto flex items-center justify-center text-amber-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <p className="text-base font-bold text-zinc-200">Илэрц олдсонгүй</p>
          <p className="text-xs text-zinc-500 mt-1">Шүүлтүүр эсвэл хайлтын үгээ өөрчилж үзнэ үү.</p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] text-amber-300 border border-amber-500/30 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Бүх шүүлтүүрийг арилгах</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4 mb-10">
      {/* Editorial Studio Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase text-white tracking-wide font-display">
            {title}
          </h2>
          {totalCount !== undefined && (
            <span className="bg-white/[0.05] border border-white/[0.08] text-amber-300/90 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md hidden sm:inline-block">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {onSeeAll && (
            <button
              id={`see-all-${title}`}
              onClick={onSeeAll}
              className="bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/10 hover:border-amber-400/40 font-bold px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
            >
              <span>БҮГД</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          <div className="flex items-center gap-1 text-zinc-500">
            <button className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.05] cursor-pointer transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.05] cursor-pointer transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Architectural Poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
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

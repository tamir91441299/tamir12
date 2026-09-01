import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Filter, Sparkles } from 'lucide-react';
import { GENRE_COUNTS, RELEASE_YEARS } from '../data/movies';

interface SidebarFilterProps {
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  selectedGenre: string | null;
  setSelectedGenre: (genre: string | null) => void;
  selectedType: 'movie' | 'series' | 'anime' | 'all';
  setSelectedType: (type: 'movie' | 'series' | 'anime' | 'all') => void;
  onResetFilters: () => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  selectedYear,
  setSelectedYear,
  selectedGenre,
  setSelectedGenre,
  selectedType,
  setSelectedType,
  onResetFilters,
}) => {
  const [isYearOpen, setIsYearOpen] = useState(true);
  const [isGenreOpen, setIsGenreOpen] = useState(true);

  const hasActiveFilters = selectedYear !== null || selectedGenre !== null || selectedType !== 'all';

  return (
    <aside className="w-full lg:w-72 cinema-glass rounded-3xl p-4 sm:p-5 text-zinc-200 shadow-2xl space-y-5 h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-100">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="font-display tracking-wide uppercase text-xs">Шүүлтүүр</span>
        </div>
        {hasActiveFilters && (
          <button
            id="reset-filter-button"
            onClick={onResetFilters}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Арилгах</span>
          </button>
        )}
      </div>

      {/* Type Toggle: Бүх анимэ / Олон ангит / Кино */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
          Анимэ төрөл
        </label>
        <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-2xl border border-white/[0.06] text-[11px] font-semibold">
          <button
            id="type-all-button"
            onClick={() => setSelectedType('all')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'gold-glow-btn text-black font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            БҮГД
          </button>
          <button
            id="type-series-button"
            onClick={() => setSelectedType('series')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedType === 'series'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ЦУВРАЛ
          </button>
          <button
            id="type-anime-button"
            onClick={() => setSelectedType('anime')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedType === 'anime'
                ? 'bg-rose-600 text-white font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            АНИМЭ
          </button>
        </div>
      </div>

      {/* Release Year Matrix Section */}
      <div className="border-t border-white/[0.06] pt-3.5">
        <button
          id="toggle-year-accordion"
          onClick={() => setIsYearOpen(!isYearOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white py-1 cursor-pointer"
        >
          <span className="font-mono text-[11px]">Нээлтийн он</span>
          {isYearOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </button>

        {isYearOpen && (
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            {RELEASE_YEARS.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  id={`year-filter-${year}`}
                  onClick={() => setSelectedYear(isSelected ? null : year)}
                  className={`py-1.5 px-2 text-xs font-mono rounded-xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'gold-glow-btn text-black font-black border-amber-400'
                      : 'bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Genres Section */}
      <div className="border-t border-white/[0.06] pt-3.5">
        <button
          id="toggle-genre-accordion"
          onClick={() => setIsGenreOpen(!isGenreOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white py-1 cursor-pointer"
        >
          <span className="font-mono text-[11px]">Жанр & Ангилал</span>
          {isGenreOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </button>

        {isGenreOpen && (
          <div className="space-y-1 mt-2.5 max-h-72 overflow-y-auto pr-1 text-xs no-scrollbar">
            {GENRE_COUNTS.map((g) => {
              const isSelected = selectedGenre === g.name;
              return (
                <button
                  key={g.name}
                  id={`genre-filter-${g.name}`}
                  onClick={() => setSelectedGenre(isSelected ? null : g.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30'
                      : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-zinc-600'
                      }`}
                    />
                    <span>{g.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {g.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

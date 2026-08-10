import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Filter, Check } from 'lucide-react';
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
    <aside className="w-full lg:w-72 bg-[#17171a] border border-zinc-800 rounded-2xl p-4 text-zinc-200 shadow-xl space-y-5 h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-100">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Шүүлтүүр</span>
        </div>
        {hasActiveFilters && (
          <button
            id="reset-filter-button"
            onClick={onResetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Арилгах
          </button>
        )}
      </div>

      {/* Type Toggle: Кино / Цуврал / Бүгд */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
          Төрөл
        </label>
        <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-medium">
          <button
            id="type-all-button"
            onClick={() => setSelectedType('all')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-cyan-500 text-black font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            БҮГД
          </button>
          <button
            id="type-movie-button"
            onClick={() => setSelectedType('movie')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedType === 'movie'
                ? 'bg-cyan-500 text-black font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            КИНО
          </button>
          <button
            id="type-series-button"
            onClick={() => setSelectedType('series')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedType === 'series'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ЦУВРАЛ
          </button>
          <button
            id="type-anime-button"
            onClick={() => setSelectedType('anime')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedType === 'anime'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            АНИМЭ
          </button>
        </div>
      </div>

      {/* Release Year Accordion Section */}
      <div className="border-t border-zinc-800/80 pt-3">
        <button
          id="toggle-year-accordion"
          onClick={() => setIsYearOpen(!isYearOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white py-1 cursor-pointer"
        >
          <span>Release year</span>
          {isYearOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
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
                  className={`py-1.5 px-2 text-xs font-mono rounded-lg transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
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
      <div className="border-t border-zinc-800/80 pt-3">
        <button
          id="toggle-genre-accordion"
          onClick={() => setIsGenreOpen(!isGenreOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white py-1 cursor-pointer"
        >
          <span>Genres</span>
          {isGenreOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {isGenreOpen && (
          <div className="space-y-1 mt-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
            {GENRE_COUNTS.map((g) => {
              const isSelected = selectedGenre === g.name;
              return (
                <button
                  key={g.name}
                  id={`genre-filter-${g.name}`}
                  onClick={() => setSelectedGenre(isSelected ? null : g.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-cyan-400' : 'bg-zinc-600'
                      }`}
                    />
                    <span>{g.name}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
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

import React from 'react';
import { Home, Clapperboard, Heart, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount = 0,
}) => {
  const isProfileActive = activeTab === 'profile';
  const isHomeActive = activeTab === 'home';
  const isAnimeActive = activeTab === 'anime' || activeTab === 'series';
  const isLibraryActive = activeTab === 'favorites' || activeTab === 'purchased';

  return (
    <nav
      id="mobile-bottom-navigation-dock"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d10]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. НҮҮР (Home) */}
        <button
          id="bottom-nav-home"
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
            isHomeActive
              ? 'bg-zinc-800 text-white font-bold shadow-md scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wider mt-0.5 uppercase font-extrabold">
            НҮҮР
          </span>
        </button>

        {/* 2. АНИМЭ (Anime) */}
        <button
          id="bottom-nav-anime"
          type="button"
          onClick={() => setActiveTab('anime')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
            isAnimeActive
              ? 'bg-zinc-800 text-white font-bold shadow-md scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] tracking-wider mt-0.5 uppercase font-extrabold">
            АНИМЭ
          </span>
        </button>

        {/* 3. САН (Library / Favorites) */}
        <button
          id="bottom-nav-library"
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer relative ${
            isLibraryActive
              ? 'bg-zinc-800 text-white font-bold shadow-md scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] tracking-wider mt-0.5 uppercase font-extrabold">
            САН
          </span>
          {favoritesCount > 0 && !isLibraryActive && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* 4. ПРОФАЙЛ (Profile - matches screenshot) */}
        <button
          id="bottom-nav-profile"
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
            isProfileActive
              ? 'bg-zinc-800 text-white font-bold shadow-md scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-wider mt-0.5 uppercase font-extrabold">
            ПРОФАЙЛ
          </span>
        </button>
      </div>
    </nav>
  );
};

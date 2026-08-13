import React, { useState } from 'react';
import { Search, Film, Tv, Sparkles, Heart, Wallet, X, Clapperboard, CheckCircle2, User, UserCheck, Gamepad2, Users, ShieldCheck, Crown } from 'lucide-react';
import { Movie } from '../types';
import { UserAccount } from './AuthModal';

interface NavbarProps {
  activeTab: 'home' | 'movies' | 'series' | 'anime' | 'chinese' | 'ai' | 'favorites' | 'purchased' | 'games';
  setActiveTab: (tab: 'home' | 'movies' | 'series' | 'anime' | 'chinese' | 'ai' | 'favorites' | 'purchased' | 'games') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  favoritesCount: number;
  purchasedCount: number;
  userBalance: number;
  isMonthlyVip: boolean;
  isAnimePackage?: boolean;
  isMoviePackage?: boolean;
  onOpenWallet: () => void;
  onOpenVipModal: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenUserManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  movies,
  onSelectMovie,
  favoritesCount,
  purchasedCount,
  userBalance,
  isMonthlyVip,
  isAnimePackage = false,
  isMoviePackage = false,
  onOpenWallet,
  onOpenVipModal,
  currentUser,
  onOpenAuthModal,
  onOpenUserManagement,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  const searchResults = searchQuery.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.titleMongolian.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-zinc-800/80 text-white">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-red-600/20 to-purple-600/20 border-b border-zinc-800 text-xs py-1 px-4 text-center text-zinc-300 flex justify-between items-center">
        <span className="hidden sm:inline-block text-zinc-400">
          🎬 IOIO TV — Монгол хадмал болон дуу оруулгатай кино сан
        </span>
        <div className="flex items-center gap-3 mx-auto sm:mx-0 text-[#f39c12] font-medium">
          <span className="flex items-center gap-1 hidden md:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            AI Кино Санал Болгогч шинэчлэгдлээ
          </span>
          <a
            href="https://www.facebook.com/share/r/17wruEiwvA/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-0.5 rounded text-[11px] transition-all shadow-sm hover:scale-105"
            title="Facebook дээр үзэх"
          >
            <span>Facebook Reels Үзэх 🎬</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="logo-button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="bg-gradient-to-br from-[#00d2ff] via-[#00a8ff] to-[#3a7bd5] text-white font-black text-2xl tracking-wider px-3.5 py-1 rounded shadow-lg group-hover:scale-105 transition-transform">
              IOIO
            </div>
            <span className="font-extrabold text-xl text-cyan-400 tracking-tight hidden md:inline-block">
              TV
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold tracking-wide">
            {onOpenUserManagement && (
              <button
                id="nav-admin-control"
                onClick={onOpenUserManagement}
                className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-400/60 text-amber-300 font-extrabold text-xs shadow-md hover:scale-105 cursor-pointer mr-1 animate-pulse"
                title="Админ удирдлагын хэсэг - Хэрэглэгчдийн мэдээлэл харах"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>УДИРДАХ ХЭСЭГ</span>
              </button>
            )}
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              ЭХЛЭЛ
            </button>
            <button
              id="nav-movies"
              onClick={() => setActiveTab('movies')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'movies'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Film className="w-4 h-4 text-cyan-400" />
              КИНО
            </button>
            <button
              id="nav-series"
              onClick={() => setActiveTab('series')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'series'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-400" />
              ОЛОН АНГИТ
            </button>
            <button
              id="nav-anime"
              onClick={() => setActiveTab('anime')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'anime'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-rose-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              АНИМЭ
            </button>
            <button
              id="nav-chinese"
              onClick={() => setActiveTab('chinese')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'chinese'
                  ? 'bg-zinc-800 text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Clapperboard className="w-4 h-4 text-amber-400" />
              ХЯТАД КИНО
            </button>
            <button
              id="nav-purchased"
              onClick={() => setActiveTab('purchased')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'purchased'
                  ? 'bg-[#17171a] text-emerald-400 font-bold border-b-2 border-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              АВСАН ({purchasedCount})
            </button>
            <button
              id="nav-ai"
              onClick={() => setActiveTab('ai')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ai' || activeTab === 'games'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border-b-2 border-cyan-400'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI САНАЛ БОЛГОГЧ
            </button>
          </nav>
        </div>

        {/* Right: Wallet + Package Pass + Search + Favorites */}
        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
          {/* Subscription Package Button */}
          {isMonthlyVip ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-black px-2.5 py-1.5 rounded-lg text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>VIP БҮТЭН ИДЭВХТЭЙ</span>
            </button>
          ) : isAnimePackage && isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>АНИМЭ + КИНО ИДЭВХТЭЙ</span>
            </button>
          ) : isAnimePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow cursor-pointer"
            >
              <span>🎌 АНИМЭ БАГЦ ИДЭВХТЭЙ</span>
            </button>
          ) : isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1.5 rounded-lg text-xs font-black shadow cursor-pointer"
            >
              <span>🎬 КИНО БАГЦ ИДЭВХТЭЙ</span>
            </button>
          ) : (
            <button
              id="vip-monthly-pass-btn"
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-400/60 text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Анимэ багц (4,000 ₮), Кино багц (4,000 ₮)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>БАГЦ АВАХ (4,000 ₮)</span>
            </button>
          )}

          {/* User Wallet Balance Badge */}
          <button
            id="wallet-balance-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm"
            title="Дансны үлдэгдэл цэнэглэх"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="font-mono">{userBalance.toLocaleString()} ₮</span>
          </button>

          {/* User Registration / Login Button */}
          <button
            id="auth-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow-sm ${
              currentUser
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black'
            }`}
            title={currentUser ? `${currentUser.name} (Бүртгэлтэй)` : 'Бүртгүүлэх / Нэвтрэх'}
          >
            {currentUser ? (
              <>
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 fill-current" />
                <span>БҮРТГҮҮЛЭХ</span>
              </>
            )}
          </button>

          {/* User Management / Admin Button */}
          {onOpenUserManagement && isAdmin && (
            <button
              id="user-management-btn"
              onClick={onOpenUserManagement}
              className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm"
              title="Админ - Хэрэглэгчид ба системийн удирдлага"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Удирдах Хэсэг</span>
            </button>
          )}
          {/* Search Box */}
          <div className="relative w-full max-w-xs">
            <div className="relative flex items-center">
              <input
                id="search-input"
                type="text"
                placeholder="Кино эсвэл цуврал хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-sm rounded-lg pl-9 pr-8 py-2 border border-zinc-700/80 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-zinc-800 text-xs text-zinc-400 font-semibold flex justify-between">
                  <span>Хайлтын илэрц ({searchResults.length})</span>
                  <span>Үзэх</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        id={`search-item-${m.id}`}
                        onClick={() => {
                          onSelectMovie(m);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-zinc-800 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-zinc-100 truncate">
                            {m.titleMongolian}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {m.title} ({m.year})
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                            <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                              {m.type === 'series' ? 'TV' : 'MOVIE'}
                            </span>
                            <span>★ {m.rating}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-400">
                    "{searchQuery}" хайлтаар кино олдсонгүй.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Favorites Button */}
          <button
            id="favorites-button"
            onClick={() => setActiveTab('favorites')}
            className={`relative p-2 rounded-lg border border-zinc-700/80 transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Таалагдсан кинонууд"
          >
            <Heart className="w-5 h-5 fill-current" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 animate-bounce">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-zinc-950 border-t border-zinc-800 py-2 px-2 text-xs">
        {onOpenUserManagement && (
          <button
            id="mobile-nav-users"
            onClick={onOpenUserManagement}
            className="flex flex-col items-center gap-1 text-amber-300 font-extrabold"
            title="Удирдах хэсэг"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
            Удирдах
          </button>
        )}
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'home' ? 'text-cyan-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          Эхлэл
        </button>
        <button
          id="mobile-nav-movies"
          onClick={() => setActiveTab('movies')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'movies' ? 'text-cyan-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Film className="w-4 h-4" />
          Кино
        </button>
        <button
          id="mobile-nav-series"
          onClick={() => setActiveTab('series')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'series' ? 'text-cyan-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Tv className="w-4 h-4" />
          Цуврал
        </button>
        <button
          id="mobile-nav-anime"
          onClick={() => setActiveTab('anime')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'anime' ? 'text-rose-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-400" />
          Анимэ
        </button>
        <button
          id="mobile-nav-chinese"
          onClick={() => setActiveTab('chinese')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'chinese' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Clapperboard className="w-4 h-4 text-amber-400" />
          Хятад
        </button>
        <button
          id="mobile-nav-ai"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'ai' || activeTab === 'games' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          AI Санал & Тоглоом
        </button>
        <button
          id="mobile-nav-auth"
          onClick={onOpenAuthModal}
          className={`flex flex-col items-center gap-1 ${
            currentUser ? 'text-cyan-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <User className="w-4 h-4" />
          {currentUser ? 'Бүртгэл' : 'Нэвтрэх'}
        </button>
      </div>
    </header>
  );
};

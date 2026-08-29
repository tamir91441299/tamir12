import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Film, 
  Tv, 
  Sparkles, 
  Heart, 
  Wallet, 
  X, 
  Clapperboard, 
  CheckCircle2, 
  User, 
  UserCheck, 
  Gamepad2, 
  Swords,
  ShieldCheck, 
  Crown,
  ChevronDown,
  Flame,
  Globe,
  Zap,
  Star,
  Skull,
  Smile,
  Cpu,
  Layers,
  Smartphone,
  Download
} from 'lucide-react';
import { Movie, TabType, MovieSubcategory } from '../types';
import { UserAccount } from './AuthModal';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedMovieCategory?: MovieSubcategory;
  onSelectMovieCategory?: (category: MovieSubcategory) => void;
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
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMovieCategory = 'all',
  onSelectMovieCategory,
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
  onOpenInstallModal,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  const [isMobileMovieMenuOpen, setIsMobileMovieMenuOpen] = useState(false);
  const movieDropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  const movieCategories: {
    id: MovieSubcategory;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge?: string;
  }[] = [
    {
      id: 'all',
      label: 'Бүх Кинонууд',
      description: 'Бүх төрлийн кинонуудыг үзэх',
      icon: Film,
      accentColor: 'text-cyan-400',
    },
    {
      id: 'mongolian',
      label: 'Монгол Кино',
      description: 'Монголын шилдэг уран бүтээлүүд',
      icon: Flame,
      accentColor: 'text-rose-400',
      badge: 'ОНЦЛОХ',
    },
    {
      id: 'hollywood',
      label: 'Холливуд / Гадаад Кино',
      description: 'Олон улсын блокбастер бүтээлүүд',
      icon: Globe,
      accentColor: 'text-blue-400',
    },
    {
      id: 'korean',
      label: 'Солонгос Кино & Дорама',
      description: 'К-Кино, сэтгэл хөдөлгөм драма',
      icon: Sparkles,
      accentColor: 'text-pink-400',
      badge: 'TOP',
    },
    {
      id: 'chinese',
      label: 'Хятад Кино & Тулаант',
      description: 'Уся, эртний хаант улс, тулааны урлаг',
      icon: Clapperboard,
      accentColor: 'text-amber-400',
    },
    {
      id: 'new',
      label: '2026/2025 Шинэ Кино',
      description: 'Хамгийн сүүлийн үеийн нээлтүүд',
      icon: Zap,
      accentColor: 'text-emerald-400',
      badge: 'ШИНЭ',
    },
    {
      id: 'top_rated',
      label: 'Шилдэг Үнэлгээтэй (9.0+)',
      description: 'IMDb өндөр үнэлгээтэй кинонууд',
      icon: Star,
      accentColor: 'text-amber-300',
    },
    {
      id: 'action',
      label: 'Тулаант & Адал Явдал',
      description: 'Ширүүн тулаан, адал явдал',
      icon: Flame,
      accentColor: 'text-red-400',
    },
    {
      id: 'horror',
      label: 'Аймшиг & Триллер',
      description: 'Сүнстэй, нууцлаг триллер бүтээлүүд',
      icon: Skull,
      accentColor: 'text-purple-400',
    },
    {
      id: 'comedy',
      label: 'Инээдэм & Комеди',
      description: 'Хөгжилтэй, гэр бүлийн кино',
      icon: Smile,
      accentColor: 'text-yellow-400',
    },
    {
      id: 'scifi',
      label: 'Sci-Fi & Хиймэл Оюун (AI)',
      description: 'Шинжлэх ухааны уран зөгнөлт & AI',
      icon: Cpu,
      accentColor: 'text-cyan-300',
    },
    {
      id: 'vip',
      label: 'VIP & Багцын Кино',
      description: 'Түрээс ба VIP эрхтэй үзэх кино',
      icon: Crown,
      accentColor: 'text-amber-400',
      badge: 'VIP',
    },
  ];

  const handleMouseEnterMovieDropdown = () => {
    if (movieDropdownTimerRef.current) {
      clearTimeout(movieDropdownTimerRef.current);
    }
    setIsMovieDropdownOpen(true);
  };

  const handleMouseLeaveMovieDropdown = () => {
    movieDropdownTimerRef.current = setTimeout(() => {
      setIsMovieDropdownOpen(false);
    }, 250);
  };

  const handleSelectCategory = (catId: MovieSubcategory) => {
    setIsMovieDropdownOpen(false);
    setIsMobileMovieMenuOpen(false);
    if (onSelectMovieCategory) {
      onSelectMovieCategory(catId);
    }
    setActiveTab('movies');
  };

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
      <div className="bg-gradient-to-r from-amber-600/20 via-cyan-600/20 to-purple-600/20 border-b border-zinc-800 text-[11px] sm:text-xs py-1 px-2 sm:px-4 text-center text-zinc-300 flex justify-between items-center">
        <span className="hidden sm:inline-block text-zinc-400">
          🎬 FlickNime — Монгол хадмал болон дуу оруулгатай анимэ & кино сан
        </span>
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0 text-cyan-300 font-medium">
          {onOpenInstallModal && isAdmin && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition-all shadow-sm hover:scale-105 cursor-pointer"
              title="Апп татах & Утсандаа суулгах холбоос"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📲 Апп татах</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-1 hover:text-cyan-200 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] sm:text-xs">🤖 AI Кино зөвлөх</span>
          </button>
          <a
            href="https://www.facebook.com/share/r/17wruEiwvA/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition-all shadow-sm hover:scale-105"
            title="Facebook дээр үзэх"
          >
            <span>FB Reels 🎬</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <button
            id="logo-button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="rainbow-glow-box text-white font-black text-xl sm:text-2xl tracking-wider px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-lg group-hover:scale-105 transition-transform">
              Flick
            </div>
            <span className="font-extrabold text-xl sm:text-2xl rainbow-glow-text tracking-tight hidden sm:inline-block">
              Nime
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold tracking-wide">
            {onOpenUserManagement && isAdmin && (
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

            {/* ЭХЛЭЛ */}
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              ЭХЛЭЛ
            </button>

            {/* КИНО (Interactive Dropdown Menu with Multiple Options) */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterMovieDropdown}
              onMouseLeave={handleMouseLeaveMovieDropdown}
            >
              <button
                id="nav-movies-dropdown-btn"
                onClick={() => {
                  if (activeTab !== 'movies') {
                    setActiveTab('movies');
                  }
                  setIsMovieDropdownOpen((prev) => !prev);
                }}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'movies'
                    ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                aria-expanded={isMovieDropdownOpen}
              >
                <Film className="w-4 h-4 text-cyan-400" />
                <span>КИНО</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    isMovieDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu for КИНО */}
              {isMovieDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-96 bg-[#16161a] border border-zinc-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                  onMouseEnter={handleMouseEnterMovieDropdown}
                  onMouseLeave={handleMouseLeaveMovieDropdown}
                >
                  <div className="px-2 py-1.5 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Film className="w-3.5 h-3.5" />
                      Киноны Ангилал & Сонголтууд
                    </span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Бүгдийг үзэх →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                    {movieCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = activeTab === 'movies' && selectedMovieCategory === cat.id;

                      return (
                        <button
                          key={cat.id}
                          id={`nav-movie-cat-${cat.id}`}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                              : 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg bg-zinc-950/80 shrink-0 ${cat.accentColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate">{cat.label}</span>
                              {cat.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600/80 text-white shrink-0">
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs px-2 text-zinc-400">
                    <span className="text-[11px]">Нэг дор бүх кинонуудыг шүүх</span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      Бүх Кино
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ОЛОН АНГИТ */}
            <button
              id="nav-series"
              onClick={() => setActiveTab('series')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'series'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-cyan-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-400" />
              ОЛОН АНГИТ
            </button>

            {/* АНИМЭ */}
            <button
              id="nav-anime"
              onClick={() => setActiveTab('anime')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'anime'
                  ? 'bg-zinc-800 text-white font-bold border-b-2 border-rose-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              АНИМЭ
            </button>

            {/* ТОГЛООМ / VIBE FIGHTER */}
            <button
              id="nav-games"
              onClick={() => setActiveTab('games')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-rose-600/30 to-amber-600/30 text-rose-300 font-extrabold border-b-2 border-rose-500 shadow-sm'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-zinc-800/50'
              }`}
              title="Vibe Fighter онлайн тулаант тоглоом болон Анимэ таавар"
            >
              <Swords className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>ТОГЛООМ 🎮</span>
            </button>

            {/* AI САНАЛ БОЛГОГЧ */}
            <button
              id="nav-ai"
              onClick={() => setActiveTab('ai')}
              className={`px-2.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'ai'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border-b-2 border-amber-400'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800/50'
              }`}
              title="AI Кино Санал Болгогч"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI ЗӨВЛӨХ</span>
            </button>

            {/* АВСАН */}
            <button
              id="nav-purchased"
              onClick={() => setActiveTab('purchased')}
              className={`px-2.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'purchased'
                  ? 'bg-[#17171a] text-emerald-400 font-bold border-b-2 border-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>АВСАН ({purchasedCount})</span>
            </button>
          </nav>
        </div>

        {/* Right: Wallet + Package Pass + Search + Favorites */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 md:flex-none justify-end min-w-0">
          {/* Subscription Package Button */}
          {isMonthlyVip ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-black px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="hidden sm:inline">VIP БҮТЭН ИДЭВХТЭЙ</span>
              <span className="sm:hidden">VIP</span>
            </button>
          ) : isAnimePackage && isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black shadow-lg cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">АНИМЭ + КИНО</span>
              <span className="sm:hidden">БАГЦ</span>
            </button>
          ) : isAnimePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black shadow cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">🎌 АНИМЭ БАГЦ</span>
              <span className="sm:hidden">🎌 АНИМЭ</span>
            </button>
          ) : isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-black px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black shadow cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">🎬 КИНО БАГЦ</span>
              <span className="sm:hidden">🎬 КИНО</span>
            </button>
          ) : (
            <button
              id="vip-monthly-pass-btn"
              onClick={onOpenVipModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-400/60 text-amber-300 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
              title="Анимэ багц (4,000 ₮), Кино багц (4,000 ₮)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">БАГЦ (4,000 ₮)</span>
              <span className="sm:hidden">БАГЦ</span>
            </button>
          )}

          {/* User Wallet Balance Badge */}
          <button
            id="wallet-balance-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-1 sm:gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-sm shrink-0"
            title="Дансны үлдэгдэл цэнэглэх"
          >
            <Wallet className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400 shrink-0" />
            <span className="font-mono">{userBalance.toLocaleString()} ₮</span>
          </button>

          {/* User Registration / Login Button */}
          <button
            id="auth-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer shadow-sm shrink-0 ${
              currentUser
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black'
            }`}
            title={currentUser ? `${currentUser.name} (Бүртгэлтэй)` : 'Бүртгүүлэх / Нэвтрэх'}
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 shrink-0" />
                <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current shrink-0" />
                <span className="hidden md:inline">БҮРТГҮҮЛЭХ</span>
              </>
            )}
          </button>

          {/* Desktop Search Box */}
          <div className="relative hidden md:block w-40 lg:w-56 xl:w-64">
            <div className="relative flex items-center">
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Кино хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm rounded-xl pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 border border-zinc-700/80 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-zinc-400 absolute left-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  id="clear-search-button-desktop"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown for Desktop */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 max-w-[calc(100vw-2rem)] bg-[#16161a] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-2.5 border-b border-zinc-800 text-xs text-zinc-400 font-semibold flex justify-between items-center bg-zinc-900/80">
                  <span className="text-cyan-400 font-bold">Хайлтын илэрц ({searchResults.length})</span>
                  <span className="text-[11px] text-zinc-500">Үзэх</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 no-scrollbar">
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        id={`search-item-desktop-${m.id}`}
                        onClick={() => {
                          onSelectMovie(m);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-zinc-800/80 flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shadow shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-cyan-400 transition-colors">
                            {m.titleMongolian}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {m.title} ({m.year})
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                            <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {m.type === 'series' ? 'TV' : 'MOVIE'}
                            </span>
                            <span className="text-amber-400 font-bold">★ {m.rating}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-zinc-400">
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
            className={`relative p-2 rounded-lg border border-zinc-700/80 transition-all cursor-pointer shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Таалагдсан кинонууд"
          >
            <Heart className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 animate-bounce">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dedicated Full-Width Search Input Bar */}
      <div className="md:hidden px-3 py-1.5 bg-[#141418] border-t border-zinc-800/80 relative">
        <div className="relative flex items-center w-full">
          <input
            id="search-input-mobile"
            type="text"
            placeholder="Кино, анимэ, цуврал хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-xs rounded-xl pl-8 pr-7 py-2 border border-zinc-700/80 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              id="clear-search-button-mobile"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Results Dropdown for Mobile */}
        {isSearchFocused && searchQuery.trim() !== '' && (
          <div className="absolute left-2 right-2 top-full mt-1 bg-[#16161a] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
            <div className="p-2.5 border-b border-zinc-800 text-xs text-zinc-400 font-semibold flex justify-between items-center bg-zinc-900">
              <span className="text-cyan-400 font-bold">Хайлтын илэрц ({searchResults.length})</span>
              <span className="text-[10px] text-zinc-500">Үзэх</span>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 no-scrollbar">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    id={`search-item-mobile-${m.id}`}
                    onClick={() => {
                      onSelectMovie(m);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-9 h-12 object-cover rounded-lg shadow shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-zinc-100 truncate">
                        {m.titleMongolian}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {m.title} ({m.year})
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-500">
                        <span className="bg-cyan-950 text-cyan-400 px-1 py-0.2 rounded font-mono font-bold">
                          {m.type === 'series' ? 'TV' : 'MOVIE'}
                        </span>
                        <span className="text-amber-400 font-bold">★ {m.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400">
                "{searchQuery}" хайлтаар кино олдсонгүй.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile navigation bar - Compact, responsive with touch scroll indicator */}
      <div className="md:hidden bg-[#0d0d10] border-t border-zinc-800/90 py-2 px-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 w-max">
          {onOpenUserManagement && isAdmin && (
            <button
              id="mobile-nav-users"
              onClick={onOpenUserManagement}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-black shadow-md cursor-pointer whitespace-nowrap active:scale-95 transition-transform shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Удирдах</span>
            </button>
          )}

          <button
            id="mobile-nav-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'home'
                ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/20'
                : 'text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Эхлэл</span>
          </button>

          {/* Mobile Кино Button with Submenu Trigger */}
          <div className="relative shrink-0">
            <button
              id="mobile-nav-movies"
              onClick={() => {
                if (activeTab === 'movies') {
                  setIsMobileMovieMenuOpen((prev) => !prev);
                } else {
                  setActiveTab('movies');
                  setIsMobileMovieMenuOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'movies'
                  ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/20'
                  : 'text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800/80'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Кино</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {/* Mobile Submenu Bottom Sheet / Popup */}
            {isMobileMovieMenuOpen && (
              <div className="fixed inset-x-3 top-24 bg-[#16161a] border border-cyan-500/40 rounded-2xl p-3 shadow-2xl z-50 max-h-[75vh] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5">
                  <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> КИНОНЫ АНГИЛАЛУУД
                  </span>
                  <button
                    onClick={() => setIsMobileMovieMenuOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {movieCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                          selectedMovieCategory === cat.id
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 active:bg-zinc-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${cat.accentColor}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            id="mobile-nav-series"
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'series'
                ? 'bg-purple-600 text-white font-extrabold shadow-md shadow-purple-600/30'
                : 'text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span>Цуврал</span>
          </button>

          <button
            id="mobile-nav-anime"
            onClick={() => setActiveTab('anime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'anime'
                ? 'bg-rose-600 text-white font-extrabold shadow-md shadow-rose-600/30'
                : 'text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Анимэ</span>
          </button>

          <button
            id="mobile-nav-games"
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'games'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/30'
                : 'text-amber-300 hover:text-amber-200 bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>Тоглоом 🎮</span>
          </button>

          <button
            id="mobile-nav-purchased"
            onClick={() => setActiveTab('purchased')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'purchased'
                ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/30'
                : 'text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Авсан ({purchasedCount})</span>
          </button>

          <button
            id="mobile-nav-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'ai'
                ? 'bg-cyan-400 text-black font-black shadow-md shadow-cyan-400/30'
                : 'text-cyan-300 hover:text-cyan-200 bg-zinc-900/90 border border-zinc-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Зөвлөх</span>
          </button>
        </div>
      </div>
    </header>
  );
};

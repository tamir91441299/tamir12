import React, { useState, useRef } from 'react';
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
  Smartphone
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
      description: 'Бүх төрлийн шилдэг кинонуудыг үзэх',
      icon: Film,
      accentColor: 'text-amber-400',
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
      accentColor: 'text-sky-400',
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
      label: '2026/2025 Шинэ Нээлт',
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
      accentColor: 'text-sky-300',
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
    <header className="sticky top-0 z-40 bg-[#07080b]/90 backdrop-blur-xl border-b border-white/[0.06] text-white">
      {/* Top micro atelier bar */}
      <div className="bg-[#050608] border-b border-white/[0.04] text-[11px] py-1.5 px-3 sm:px-6 text-zinc-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="hidden sm:inline font-mono tracking-wide text-zinc-400">
            FlickNime — Монгол хадмал & дуу оруулгатай кино, анимэ сан
          </span>
          <span className="sm:hidden font-mono text-zinc-400">FlickNime Cinema</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-zinc-300">
          {onOpenInstallModal && isAdmin && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer"
            >
              <Smartphone className="w-3 h-3" />
              <span>Апп суулгах</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-1 text-amber-300/90 hover:text-amber-200 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[11px]">AI Зөвлөх</span>
          </button>

          <a
            href="https://www.facebook.com/share/r/17wruEiwvA/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <span>FB Reels</span>
          </a>
        </div>
      </div>

      {/* Main Floating Cinema Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Monogram & Crest */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            id="logo-button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl brand-insignia text-black font-black flex items-center justify-center text-base shadow-lg group-hover:scale-105 transition-transform font-display">
              🎬
            </div>
            <div className="flex flex-col text-left">
              <div className="brand-glow-container">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider brand-text-luxury font-display leading-none">
                  FlickNime
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                Cinema & Anime
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold tracking-wide">
            {onOpenUserManagement && isAdmin && (
              <button
                id="nav-admin-control"
                onClick={onOpenUserManagement}
                className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/25 cursor-pointer mr-1"
                title="Админ удирдлагын хэсэг"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>УДИРДАХ</span>
              </button>
            )}

            {/* ЭХЛЭЛ */}
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white/[0.08] text-white font-bold border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              ЭХЛЭЛ
            </button>

            {/* КИНО Dropdown */}
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
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'movies'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                aria-expanded={isMovieDropdownOpen}
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>КИНО</span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
                    isMovieDropdownOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu for КИНО */}
              {isMovieDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-96 cinema-glass-elevated rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseEnter={handleMouseEnterMovieDropdown}
                  onMouseLeave={handleMouseLeaveMovieDropdown}
                >
                  <div className="px-2 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Film className="w-3.5 h-3.5" />
                      Киноны Ангилал & Төрлүүд
                    </span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="text-[11px] text-zinc-400 hover:text-amber-300 cursor-pointer"
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
                              ? 'bg-amber-500/15 border-amber-500/40 text-white'
                              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.05] text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg bg-black/50 shrink-0 ${cat.accentColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate">{cat.label}</span>
                              {cat.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                              {cat.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs px-2 text-zinc-400">
                    <span className="text-[11px]">Бүх уран сайхны кино сан</span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="gold-glow-btn text-black font-black text-[11px] px-3 py-1 rounded-lg cursor-pointer"
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
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'series'
                  ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>ОЛОН АНГИТ</span>
            </button>

            {/* АНИМЭ */}
            <button
              id="nav-anime"
              onClick={() => setActiveTab('anime')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'anime'
                  ? 'bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>АНИМЭ</span>
            </button>

            {/* ТОГЛООМ */}
            <button
              id="nav-games"
              onClick={() => setActiveTab('games')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'games'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.04]'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>ТОГЛООМ 🎮</span>
            </button>

            {/* AI ЗӨВЛӨХ */}
            <button
              id="nav-ai"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'ai'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm'
                  : 'text-sky-400 hover:text-sky-300 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI ЗӨВЛӨХ</span>
            </button>

            {/* АВСАН */}
            <button
              id="nav-purchased"
              onClick={() => setActiveTab('purchased')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'purchased'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>АВСАН ({purchasedCount})</span>
            </button>
          </nav>
        </div>

        {/* Right: Wallet + Pass + Search + Favorites */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 lg:flex-none justify-end min-w-0">
          {/* Subscription Package Button */}
          {isMonthlyVip ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2.5 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="hidden sm:inline">VIP БҮТЭН</span>
              <span className="sm:hidden">VIP</span>
            </button>
          ) : isAnimePackage && isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">АНИМЭ + КИНО</span>
              <span className="sm:hidden">БАГЦ</span>
            </button>
          ) : isAnimePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-rose-600/90 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">🎌 АНИМЭ БАГЦ</span>
              <span className="sm:hidden">🎌 БАГЦ</span>
            </button>
          ) : isMoviePackage ? (
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-amber-500/90 text-black px-2.5 py-1.5 rounded-xl text-xs font-black shadow cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">🎬 КИНО БАГЦ</span>
              <span className="sm:hidden">🎬 БАГЦ</span>
            </button>
          ) : (
            <button
              id="vip-monthly-pass-btn"
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Багц идэвхжүүлэх"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">БАГЦ (4,000 ₮)</span>
              <span className="sm:hidden">БАГЦ</span>
            </button>
          )}

          {/* User Wallet Balance Badge */}
          <button
            id="wallet-balance-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/90 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
            title="Дансны үлдэгдэл цэнэглэх"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono">{userBalance.toLocaleString()} ₮</span>
          </button>

          {/* User Registration / Login Button */}
          <button
            id="auth-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              currentUser
                ? 'bg-white/[0.08] hover:bg-white/[0.12] text-zinc-100 border border-white/10'
                : 'gold-glow-btn text-black font-black'
            }`}
            title={currentUser ? `${currentUser.name} (Бүртгэлтэй)` : 'Бүртгүүлэх / Нэвтрэх'}
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline max-w-[85px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="hidden md:inline">НЭВТРЭХ</span>
              </>
            )}
          </button>

          {/* Desktop Search Box with ⌘K Badge */}
          <div className="relative hidden md:block w-40 lg:w-56 xl:w-64">
            <div className="relative flex items-center">
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Кино, анимэ хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-black/50 text-zinc-100 placeholder-zinc-500 text-xs rounded-xl pl-8 pr-7 py-2 border border-white/[0.08] focus:border-amber-400/60 focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
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

            {/* Instant Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 max-w-[calc(100vw-2rem)] cinema-glass-elevated rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-2.5 border-b border-white/[0.06] text-xs text-zinc-400 font-semibold flex justify-between items-center bg-black/40">
                  <span className="text-amber-400 font-bold">Хайлтын илэрц ({searchResults.length})</span>
                  <span className="text-[11px] text-zinc-500">Үзэх</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04] no-scrollbar">
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        id={`search-item-desktop-${m.id}`}
                        onClick={() => {
                          onSelectMovie(m);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-white/[0.06] flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shadow shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                            {m.titleMongolian}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate font-normal">
                            {m.title} ({m.year})
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                            <span className="bg-black/80 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-white/10">
                              {m.type === 'series' ? 'SERIES' : 'CINEMA'}
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
            className={`relative p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'bg-black/50 border-white/[0.08] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
            }`}
            title="Таалагдсан кинонууд"
          >
            <Heart className="w-4 h-4 fill-current" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dedicated Search Bar */}
      <div className="md:hidden px-3 py-1.5 bg-[#050608] border-t border-white/[0.04] relative">
        <div className="relative flex items-center w-full">
          <input
            id="search-input-mobile"
            type="text"
            placeholder="Кино, анимэ, цуврал хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-black/60 text-zinc-100 placeholder-zinc-500 text-xs rounded-xl pl-8 pr-7 py-2 border border-white/[0.08] focus:border-amber-400 focus:outline-none transition-all shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
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
          <div className="absolute left-2 right-2 top-full mt-1 cinema-glass-elevated rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
            <div className="p-2.5 border-b border-white/[0.06] text-xs text-zinc-400 font-semibold flex justify-between items-center bg-black/40">
              <span className="text-amber-400 font-bold">Хайлтын илэрц ({searchResults.length})</span>
              <span className="text-[10px] text-zinc-500">Үзэх</span>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] no-scrollbar">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    id={`search-item-mobile-${m.id}`}
                    onClick={() => {
                      onSelectMovie(m);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors cursor-pointer"
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
                        <span className="bg-black/80 text-amber-300 px-1 py-0.2 rounded font-mono font-bold">
                          {m.type === 'series' ? 'SERIES' : 'CINEMA'}
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

      {/* Mobile Floating Category Pill Row */}
      <div className="lg:hidden bg-[#060709] border-t border-white/[0.04] py-2 px-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 w-max">
          {onOpenUserManagement && isAdmin && (
            <button
              id="mobile-nav-users"
              onClick={onOpenUserManagement}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-md cursor-pointer whitespace-nowrap active:scale-95 transition-transform shrink-0"
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
                ? 'gold-glow-btn text-black font-black'
                : 'text-zinc-300 hover:text-white bg-white/[0.03] border border-white/[0.06]'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Эхлэл</span>
          </button>

          {/* Mobile Кино Submenu */}
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
                  ? 'gold-glow-btn text-black font-black'
                  : 'text-zinc-300 hover:text-white bg-white/[0.03] border border-white/[0.06]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Кино</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isMobileMovieMenuOpen && (
              <div className="fixed inset-x-3 top-24 cinema-glass-elevated rounded-2xl p-3 z-50 max-h-[75vh] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2.5">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> КИНОНЫ ТӨРЛҮҮД
                  </span>
                  <button
                    onClick={() => setIsMobileMovieMenuOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg bg-black/60"
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
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/[0.03] border-white/[0.05] text-zinc-300 active:bg-white/[0.08]'
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
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-zinc-300 hover:text-white bg-white/[0.03] border border-white/[0.06]'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Цуврал</span>
          </button>

          <button
            id="mobile-nav-anime"
            onClick={() => setActiveTab('anime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              activeTab === 'anime'
                ? 'bg-rose-600 text-white font-bold shadow-md'
                : 'text-zinc-300 hover:text-white bg-white/[0.03] border border-white/[0.06]'
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
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                : 'text-amber-300 hover:text-amber-200 bg-white/[0.03] border border-white/[0.06]'
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
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold'
                : 'text-zinc-300 hover:text-white bg-white/[0.03] border border-white/[0.06]'
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
                ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50 font-bold'
                : 'text-sky-300 hover:text-sky-200 bg-white/[0.03] border border-white/[0.06]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Зөвлөх</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BannerCarousel } from './components/BannerCarousel';
import { SidebarFilter } from './components/SidebarFilter';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailModal } from './components/MovieDetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AiRecommendationModal } from './components/AiRecommendationModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SecurityShieldModal } from './components/SecurityShieldModal';
import { AnimeGuesser } from './components/AnimeGuesser';
import { AiAssistantView } from './components/AiAssistantView';
import { AiMoviesView } from './components/AiMoviesView';
import { InstallAppModal } from './components/InstallAppModal';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { SeoGuideModal } from './components/SeoGuideModal';
import { ContinueWatching, WatchHistoryItem } from './components/ContinueWatching';
import { SAMPLE_MOVIES } from './data/movies';
import { Movie, TabType, MovieSubcategory } from './types';
import { getDirectPlaybackStream } from './lib/videoUtils';
import {
  saveUserToFirestore,
  subscribeNotificationsFromFirestore,
  AppNotification
} from './lib/userService';
import { Sparkles, Heart, CheckCircle2, Wallet, UserCheck, Gamepad2, Bell, X, UserPlus, Film, Flame, Globe, Zap, Star, Skull, Smile, Cpu, Crown, Swords } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMovieCategory, setSelectedMovieCategory] = useState<MovieSubcategory>('all');
  const [selectedGameMode, setSelectedGameMode] = useState<'vibe_fighter' | 'character' | 'title'>('vibe_fighter');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'movie' | 'series' | 'anime' | 'all'>('all');

  // Movies list state: Fresh code definition from SAMPLE_MOVIES
  const [moviesList, setMoviesList] = useState<Movie[]>(() => {
    try {
      // Clear legacy stale cache keys from previous sessions to prevent outdated URLs
      localStorage.removeItem('movie_episodes_map');
      localStorage.removeItem('ioio_custom_episodes');
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_MOVIES;
  });

  const handleUpdateMovieEpisodes = (movieId: string, episodes: Movie['episodes']) => {
    setMoviesList((prev) => {
      const updated = prev.map((m) => {
        if (m.id === movieId) {
          return { ...m, episodes };
        }
        return m;
      });
      try {
        const map: Record<string, Movie['episodes']> = {};
        updated.forEach((m) => {
          if (m.episodes) map[m.id] = m.episodes;
        });
        localStorage.setItem('ioio_custom_episodes', JSON.stringify(map));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // User Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ioio_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSeoModal, setShowSeoModal] = useState<boolean>(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  // F12 & DevTools key interceptor: only shows the warning when F12 is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        setShowSecurityModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ioio_favorites');
      return saved ? JSON.parse(saved) : ['m_91_days'];
    } catch {
      return ['m_91_days'];
    }
  });

  // Purchased Movies state (1,000₮ per movie model)
  const [purchasedMovies, setPurchasedMovies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ioio_purchased');
      return saved ? JSON.parse(saved) : ['m_91_days'];
    } catch {
      return ['m_91_days'];
    }
  });

  // Package states: Anime (4,000₮), Movie (4,000₮), Full VIP (7,000₮)
  const [isAnimePackage, setIsAnimePackage] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ioio_anime_package') === 'true';
    } catch {
      return false;
    }
  });

  const [isMoviePackage, setIsMoviePackage] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ioio_movie_package') === 'true';
    } catch {
      return false;
    }
  });

  // VIP Full Pass state (7,000₮)
  const [isMonthlyVip, setIsMonthlyVip] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ioio_monthly_vip');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // User Wallet Balance (MNT / Points)
  const [userBalance, setUserBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ioio_balance');
      if (!saved || saved === '5000') {
        localStorage.setItem('ioio_balance', '0');
        return 0;
      }
      return parseInt(saved, 10) || 0;
    } catch {
      return 0;
    }
  });

  // Watch History & Continue Watching state
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ioio_watch_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        movieId: 'm_mha_s1',
        episodeNumber: 1,
        progressPercent: 35,
        currentTime: 520,
        duration: 1440,
        updatedAt: Date.now() - 1000 * 60 * 30,
      },
      {
        movieId: 'm_91_days',
        episodeNumber: 1,
        progressPercent: 65,
        currentTime: 920,
        duration: 1440,
        updatedAt: Date.now() - 1000 * 60 * 120,
      }
    ];
  });

  const handleUpdateWatchProgress = useCallback((
    movieId: string,
    episodeNumber: number,
    currentTime: number = 0,
    duration: number = 0
  ) => {
    setWatchHistory((prev) => {
      const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 35;
      const filtered = prev.filter((item) => item.movieId !== movieId);
      const updated: WatchHistoryItem[] = [
        {
          movieId,
          episodeNumber: episodeNumber || 1,
          progressPercent: Math.max(progressPercent, 10),
          currentTime,
          duration,
          updatedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, 12);
      try {
        localStorage.setItem('ioio_watch_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const handleRemoveFromHistory = useCallback((movieId: string) => {
    setWatchHistory((prev) => {
      const updated = prev.filter((item) => item.movieId !== movieId);
      try {
        localStorage.setItem('ioio_watch_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setWatchHistory([]);
    try {
      localStorage.removeItem('ioio_watch_history');
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_purchased', JSON.stringify(purchasedMovies));
    } catch (e) {
      console.error(e);
    }
  }, [purchasedMovies]);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_anime_package', isAnimePackage ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAnimePackage]);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_movie_package', isMoviePackage ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isMoviePackage]);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_monthly_vip', isMonthlyVip ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isMonthlyVip]);

  useEffect(() => {
    try {
      localStorage.setItem('ioio_balance', userBalance.toString());
    } catch (e) {
      console.error(e);
    }
  }, [userBalance]);

  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);
  const [showNotifToast, setShowNotifToast] = useState(false);

  // Real-time listener for notifications (New user registration alerts)
  useEffect(() => {
    const unsubscribe = subscribeNotificationsFromFirestore((notifs) => {
      if (notifs.length > 0) {
        const topNotif = notifs[0];
        setLatestNotification(topNotif);
        setShowNotifToast(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Track visitor / user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ioio_user', JSON.stringify(currentUser));
        saveUserToFirestore(currentUser);
      } else {
        localStorage.removeItem('ioio_user');
        // If guest visitor on site, ensure they are registered into Firestore so Admin sees all visitors in real-time
        const savedGuest = localStorage.getItem('ioio_guest_session');
        if (!savedGuest) {
          const guestId = 'visitor_' + Date.now();
          const guestUser: UserAccount = {
            id: guestId,
            name: 'Шинэ Зочин ' + Math.floor(1000 + Math.random() * 9000),
            email: `visitor_${guestId}@ioio.mn`,
            phone: '99' + Math.floor(100000 + Math.random() * 900000),
            registeredAt: new Date().toLocaleDateString('mn-MN'),
          };
          localStorage.setItem('ioio_guest_session', JSON.stringify(guestUser));
          saveUserToFirestore(guestUser, {
            role: 'user',
            status: 'active',
            packageType: 'free',
            walletBalance: 0,
            lastLogin: 'Шинээр зочилж байна',
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const toggleFavorite = (movieId: string) => {
    setFavorites((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  const isFavorite = (movieId: string) => favorites.includes(movieId);

  const isPurchased = (_movieId: string) => {
    return true;
  };

  // Modals state
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [selectedMovieForPlayer, setSelectedMovieForPlayer] = useState<Movie | null>(null);
  const [playerInitialEpisode, setPlayerInitialEpisode] = useState<number>(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [paymentMovie, setPaymentMovie] = useState<Movie | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Sync tab clicks & reset conflicting filters when tab changes
  useEffect(() => {
    if (activeTab === 'ai') {
      setShowAiModal(true);
    }
    // Auto reset sidebar type filter when switching major tabs so anime or other views don't get blocked
    setSelectedType('all');
    setSelectedGenre(null);
    setSelectedYear(null);
  }, [activeTab]);

  // Filter logic
  const filteredMovies = useMemo(() => {
    return moviesList.filter((movie) => {
      // Tab filter
      if (activeTab === 'movies') {
        if (movie.type !== 'movie') return false;

        // Subcategory filtering for movies
        if (selectedMovieCategory === 'mongolian') {
          if (movie.country !== 'Монгол' && !movie.genres.includes('Монгол') && !movie.genres.includes('Монгол кино')) return false;
        } else if (selectedMovieCategory === 'hollywood') {
          if (['Монгол', 'Хятад', 'Өмнөд Солонгос', 'Япон'].includes(movie.country) && !movie.genres.includes('Холливуд')) return false;
        } else if (selectedMovieCategory === 'korean') {
          if (movie.country !== 'Өмнөд Солонгос' && !movie.genres.includes('Солонгос') && !movie.genres.includes('Солонгос кино')) return false;
        } else if (selectedMovieCategory === 'chinese') {
          if (movie.country !== 'Хятад' && !movie.genres.includes('Хятад') && !movie.genres.includes('Хятад кино')) return false;
        } else if (selectedMovieCategory === 'new') {
          if (movie.year < 2025) return false;
        } else if (selectedMovieCategory === 'top_rated') {
          if (movie.rating < 8.8) return false;
        } else if (selectedMovieCategory === 'action') {
          if (!movie.genres.includes('Action') && !movie.genres.includes('Action & Adventure') && !movie.genres.includes('Тулаант')) return false;
        } else if (selectedMovieCategory === 'horror') {
          if (!movie.genres.includes('Horror') && !movie.genres.includes('Thriller') && !movie.genres.includes('Аймшиг')) return false;
        } else if (selectedMovieCategory === 'comedy') {
          if (!movie.genres.includes('Comedy') && !movie.genres.includes('Инээдэм') && !movie.genres.includes('Комеди')) return false;
        } else if (selectedMovieCategory === 'scifi') {
          const isAiSciFi = movie.genres.includes('Sci-Fi') || movie.genres.includes('AI Кино') || movie.description.toLowerCase().includes('хиймэл') || movie.description.toLowerCase().includes('робот') || movie.title.toLowerCase().includes('creator') || movie.title.toLowerCase().includes('matrix');
          if (!isAiSciFi) return false;
        } else if (selectedMovieCategory === 'vip') {
          if (!movie.price || movie.price <= 0) return false;
        }
      }

      if (activeTab === 'series' && movie.type !== 'series') return false;
      if (activeTab === 'anime' && movie.type !== 'anime' && !movie.genres.includes('Animation') && !movie.genres.includes('Анимэ')) return false;
      if (activeTab === 'chinese' && movie.country !== 'Хятад' && !movie.genres.includes('Хятад') && !movie.genres.includes('Хятад кино')) return false;
      if (activeTab === 'favorites' && !favorites.includes(movie.id)) return false;
      if (activeTab === 'purchased' && !purchasedMovies.includes(movie.id)) return false;

      // Sidebar type filter (apply only when not on specialized tab, or if compatible)
      if (selectedType !== 'all') {
        if (activeTab === 'home' || activeTab === 'favorites' || activeTab === 'purchased') {
          if (selectedType === 'movie' && movie.type !== 'movie') return false;
          if (selectedType === 'series' && movie.type !== 'series') return false;
          if (selectedType === 'anime' && movie.type !== 'anime' && !movie.genres.includes('Animation') && !movie.genres.includes('Анимэ')) return false;
        } else if (activeTab === 'anime') {
          // Inside anime tab, allowing filtering movies vs series
          if (selectedType === 'movie' && movie.type !== 'movie' && !movie.genres.includes('Animation')) return false;
          if (selectedType === 'series' && movie.type !== 'series') return false;
        } else if (activeTab === 'chinese') {
          if (selectedType === 'movie' && movie.type !== 'movie') return false;
          if (selectedType === 'series' && movie.type !== 'series') return false;
        }
      }

      // Year filter
      if (selectedYear !== null && movie.year !== selectedYear) return false;

      // Genre filter
      if (selectedGenre !== null && !movie.genres.includes(selectedGenre)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = movie.title.toLowerCase().includes(query);
        const matchMongolian = movie.titleMongolian.toLowerCase().includes(query);
        const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(query));
        if (!matchTitle && !matchMongolian && !matchGenre) return false;
      }

      return true;
    });
  }, [moviesList, activeTab, selectedType, selectedYear, selectedGenre, searchQuery, favorites, purchasedMovies]);

  // Featured Movies for Hero Carousel
  const featuredMovies = useMemo(() => {
    return moviesList.filter((m) => m.featured);
  }, [moviesList]);

  // Section categories
  const newEpisodesMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.isNewEpisode);
  }, [filteredMovies]);

  const animeMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.type === 'anime' || m.genres.includes('Animation') || m.genres.includes('Анимэ'));
  }, [filteredMovies]);

  const featureMoviesOnly = useMemo(() => {
    return filteredMovies.filter((m) => m.type === 'movie');
  }, [filteredMovies]);

  const seriesOnly = useMemo(() => {
    return filteredMovies.filter((m) => m.type === 'series');
  }, [filteredMovies]);

  const mongolianMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.country === 'Монгол');
  }, [filteredMovies]);

  const chineseMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.country === 'Хятад' || m.genres.includes('Хятад') || m.genres.includes('Хятад кино'));
  }, [filteredMovies]);

  const popularMovies = useMemo(() => {
    return [...filteredMovies].sort((a, b) => b.views - a.views);
  }, [filteredMovies]);

  const resetFilters = () => {
    setSelectedYear(null);
    setSelectedGenre(null);
    setSelectedType('all');
    setSearchQuery('');
  };

  const handlePlayMovie = (movie: Movie, episodeNumber: number = 1) => {
    console.log(`🎬 [App] handlePlayMovie clicked: "${movie.titleMongolian}" (ID: ${movie.id}), Episode: ${episodeNumber}, videoUrl: ${movie.videoUrl}`);
    setSelectedMovieForPlayer(movie);
    setPlayerInitialEpisode(episodeNumber);
    handleUpdateWatchProgress(movie.id, episodeNumber, 0, 0);
  };

  const handlePaymentSuccess = (movieId: string, deductedAmount: number = 0) => {
    if (!purchasedMovies.includes(movieId)) {
      setPurchasedMovies((prev) => [...prev, movieId]);
    }

    if (deductedAmount > 0) {
      setUserBalance((prev) => Math.max(0, prev - deductedAmount));
    }

    if (paymentMovie) {
      const movieToPlay = paymentMovie;
      setPaymentMovie(null);
      setShowPaymentModal(false);
      setSelectedMovieForPlayer(movieToPlay);
    } else {
      setShowPaymentModal(false);
    }
  };

  const handleSubscribePackage = (packageType: 'anime' | 'movie' | 'full_vip', deductedAmount: number = 0) => {
    if (deductedAmount > 0) {
      setUserBalance((prev) => Math.max(0, prev - deductedAmount));
    }

    if (packageType === 'anime') {
      setIsAnimePackage(true);
    } else if (packageType === 'movie') {
      setIsMoviePackage(true);
    } else if (packageType === 'full_vip') {
      setIsMonthlyVip(true);
      setIsAnimePackage(true);
      setIsMoviePackage(true);
    }

    setShowPaymentModal(false);
    if (paymentMovie) {
      const movieToPlay = paymentMovie;
      setPaymentMovie(null);
      setSelectedMovieForPlayer(movieToPlay);
    }
  };

  const handleTopUpBalance = (amount: number) => {
    setUserBalance((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen cinema-noir-bg text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Dynamic SEO Head Manager */}
      <SeoHead
        activeTab={activeTab}
        selectedMovie={selectedMovieForDetails}
        searchQuery={searchQuery}
      />

      {/* Top Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMovieCategory={selectedMovieCategory}
        onSelectMovieCategory={setSelectedMovieCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        movies={SAMPLE_MOVIES}
        onSelectMovie={(m) => setSelectedMovieForDetails(m)}
        favoritesCount={favorites.length}
        purchasedCount={purchasedMovies.length}
        userBalance={userBalance}
        isMonthlyVip={isMonthlyVip}
        isAnimePackage={isAnimePackage}
        isMoviePackage={isMoviePackage}
        currentUser={currentUser}
        onOpenWallet={() => {
          setShowPaymentModal(true);
        }}
        onOpenVipModal={() => {
          setShowPaymentModal(true);
        }}
        onOpenAuthModal={() => {
          setShowAuthModal(true);
        }}
        onOpenUserManagement={() => {
          setShowUserManagementModal(true);
        }}
        onOpenInstallModal={() => {
          setShowInstallModal(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Hero Carousel (On Home / All view) */}
        {activeTab === 'home' && !selectedYear && !selectedGenre && !searchQuery && (
          <BannerCarousel
            featuredMovies={featuredMovies}
            onPlayMovie={(m) => handlePlayMovie(m)}
            onOpenDetails={(m) => setSelectedMovieForDetails(m)}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {/* AI Banner Callout (Shown on Home view) */}
        {activeTab === 'home' && (
          <div className="mb-5 cinema-glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/15 text-amber-300 rounded-xl border border-amber-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2 font-display">
                  FlickNime AI Зөвлөх & Санал Болгогч Сан
                </h3>
                <p className="text-xs text-zinc-400">
                  Хиймэл оюун ухаант кино зөвлөгч, сонирхолтой анимэ таавар тоглоомуудтай танилцаарай.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="open-ai-movies-callout"
                onClick={() => {
                  setSelectedMovieCategory('scifi');
                  setActiveTab('movies');
                }}
                className="gold-glow-btn text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Sci-Fi & AI Кино</span>
              </button>

              <button
                id="open-ai-callout"
                onClick={() => setActiveTab('ai')}
                className="bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap border border-white/10"
              >
                AI Зөвлөх
              </button>
            </div>
          </div>
        )}

        {/* Game Center Callout Banner (Shown on Home view) */}
        {activeTab === 'home' && (
          <div className="mb-7 cinema-glass-elevated rounded-3xl p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl border border-amber-500/30">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-gradient-to-br from-amber-500 to-rose-600 text-black rounded-2xl shadow-lg shadow-amber-500/20 shrink-0">
                <Swords className="w-6 h-6 animate-pulse text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="studio-badge-gold font-bold text-[10px] px-2 py-0.5 rounded-md">
                    🥊 ОНЛАЙН АРЕНА
                  </span>
                  <span className="text-amber-300 text-[10px] font-mono font-bold">
                    ⚡ Vibe Fighter & Анимэ Таавар
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2 font-display">
                  <span>Vibe Fighter Arena болон Анимэ таавар сорилт</span>
                </h3>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Өрсөлдөгчтэйгөө шууд тулалдах Vibe Fighter тоглоом болон 3 амьтай анимэ дүр/нэр таах сорилтыг тоглоорой!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end flex-wrap">
              <button
                id="open-vibe-fighter-home-btn"
                onClick={() => {
                  setSelectedGameMode('vibe_fighter');
                  setActiveTab('games');
                }}
                className="gold-glow-btn text-black font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Swords className="w-4 h-4 text-black" />
                <span>🥊 VIBE FIGHTER ТОГЛОХ</span>
              </button>

              <button
                id="open-anime-character-game-btn"
                onClick={() => {
                  setSelectedGameMode('character');
                  setActiveTab('games');
                }}
                className="bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-white/10"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                <span>🎭 ДҮР ТААХ</span>
              </button>

              <button
                id="open-anime-title-game-btn"
                onClick={() => {
                  setSelectedGameMode('title');
                  setActiveTab('games');
                }}
                className="bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-white/[0.06]"
              >
                <span>🎬 НЭР ТААХ</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content: AI Movies / AI Assistant & Games View / Catalog */}
        {activeTab === 'ai_movies' ? (
          <AiMoviesView
            movies={SAMPLE_MOVIES}
            onSelectMovie={(m) => setSelectedMovieForDetails(m)}
            onPlayMovie={(m) => handlePlayMovie(m)}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        ) : activeTab === 'ai' ? (
          <AiAssistantView
            movies={SAMPLE_MOVIES}
            onSelectMovie={(m) => setSelectedMovieForDetails(m)}
            onPlayMovie={(m) => handlePlayMovie(m)}
            initialSubTab="ai"
          />
        ) : activeTab === 'games' ? (
          <AiAssistantView
            movies={SAMPLE_MOVIES}
            onSelectMovie={(m) => setSelectedMovieForDetails(m)}
            onPlayMovie={(m) => handlePlayMovie(m)}
            initialSubTab={selectedGameMode === 'vibe_fighter' ? 'vibe_fighter' : 'game'}
            initialGameMode={selectedGameMode === 'title' ? 'title' : 'character'}
          />
        ) : (
          /* Main Content + Sidebar Layout */
          <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Catalog View */}
          <div className="flex-1 space-y-8 min-w-0">
            {/* Quick Movie Subcategories Bar when viewing Movies tab */}
            {activeTab === 'movies' && (
              <div className="cinema-glass rounded-2xl p-3 shadow-lg border border-white/[0.06]">
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Film className="w-3.5 h-3.5" />
                    Киноны Ангилал & Сонголтууд ({filteredMovies.length} кино):
                  </span>
                  {selectedMovieCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedMovieCategory('all')}
                      className="text-xs text-zinc-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Бүгдийг үзэх
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'all' as MovieSubcategory, label: '🎬 Бүх Кино' },
                    { id: 'mongolian' as MovieSubcategory, label: '🇲🇳 Монгол' },
                    { id: 'hollywood' as MovieSubcategory, label: '🇺🇸 Холливуд' },
                    { id: 'korean' as MovieSubcategory, label: '🇰🇷 Солонгос' },
                    { id: 'chinese' as MovieSubcategory, label: '🇨🇳 Хятад' },
                    { id: 'new' as MovieSubcategory, label: '⚡ 2026/2025 Шинэ' },
                    { id: 'top_rated' as MovieSubcategory, label: '⭐ Шилдэг 9.0+' },
                    { id: 'action' as MovieSubcategory, label: '💥 Тулаант' },
                    { id: 'horror' as MovieSubcategory, label: '👻 Аймшиг' },
                    { id: 'comedy' as MovieSubcategory, label: '😂 Инээдэм' },
                    { id: 'scifi' as MovieSubcategory, label: '🤖 Sci-Fi & AI' },
                    { id: 'vip' as MovieSubcategory, label: '💎 VIP / Багц' },
                  ].map((subCat) => (
                    <button
                      key={subCat.id}
                      onClick={() => setSelectedMovieCategory(subCat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        selectedMovieCategory === subCat.id
                          ? 'gold-glow-btn text-black font-black border-amber-400'
                          : 'bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      {subCat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="flex items-center gap-2.5 pb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <h2 className="text-lg sm:text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  Таалагдсан Кинонууд ({filteredMovies.length})
                </h2>
              </div>
            )}

            {activeTab === 'purchased' && (
              <div className="flex items-center gap-2.5 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <h2 className="text-lg sm:text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Миний Худалдаж Авсан Кинонууд ({filteredMovies.length})
                </h2>
              </div>
            )}

            {/* If actively filtering or searching */}
            {selectedYear || selectedGenre || searchQuery || selectedType !== 'all' || activeTab !== 'home' ? (
              <MovieGrid
                title={
                  activeTab === 'movies'
                    ? selectedMovieCategory === 'mongolian'
                      ? '🇲🇳 МОНГОЛ УРАН САЙХНЫ КИНОНУУД'
                      : selectedMovieCategory === 'hollywood'
                      ? '🇺🇸 ХОЛЛИВУД & ОЛОН УЛСЫН КИНОНУУД'
                      : selectedMovieCategory === 'korean'
                      ? '🇰🇷 СОЛОНГОС КИНОНУУД'
                      : selectedMovieCategory === 'chinese'
                      ? '🇨🇳 ХЯТАД КИНО & ТУЛААНТ БҮТЭЭЛҮҮД'
                      : selectedMovieCategory === 'new'
                      ? '⚡ 2026/2025 ОНЫ ШИНЭ НЭЭЛТ КИНОНУУД'
                      : selectedMovieCategory === 'top_rated'
                      ? '⭐ ШИЛДЭГ ҮНЭЛГЭЭТЭЙ (IMDB 9.0+) КИНОНУУД'
                      : selectedMovieCategory === 'action'
                      ? '💥 ТУЛААНТ & АДАЛ ЯВДАЛТ КИНОНУУД'
                      : selectedMovieCategory === 'horror'
                      ? '👻 АЙМШИГ & ТРИЛЛЕР КИНОНУУД'
                      : selectedMovieCategory === 'comedy'
                      ? '😂 ИНЭЭДЭМ & ХӨГЖИЛТЭЙ КИНОНУУД'
                      : selectedMovieCategory === 'scifi'
                      ? '🤖 SCI-FI & ХИЙМЭЛ ОЮУН УХААНТ КИНОНУУД'
                      : selectedMovieCategory === 'vip'
                      ? '💎 VIP & БАГЦЫН КИНОНУУД'
                      : '🎬 БҮХ УРАН САЙХНЫ КИНОНУУД'
                    : activeTab === 'series'
                    ? 'ОЛОН АНГИТ ЦУВРАЛУУД'
                    : activeTab === 'anime'
                    ? 'АНИМЭ КИНО & ЦУВРАЛУУД'
                    : activeTab === 'chinese'
                    ? 'ХЯТАД КИНО & ЦУВРАЛУУД'
                    : activeTab === 'favorites'
                    ? 'ХАДГАЛСАН КИНОНУУД'
                    : activeTab === 'purchased'
                    ? 'АВСАН КИНОНУУД (ХЯЗГААРГҮЙ ҮЗЭХ)'
                    : 'ХАЙЛТЫН ИЛЭРЦ'
                }
                totalCount={filteredMovies.length}
                movies={filteredMovies}
                onPlayMovie={(m) => handlePlayMovie(m)}
                onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                isPurchased={isPurchased}
                onResetFilters={resetFilters}
              />
            ) : (
              /* Default Home Sections */
              <>
                {/* Continue Watching Section (Үргэлжлүүлж үзэх) */}
                {watchHistory.length > 0 && activeTab === 'home' && (
                  <ContinueWatching
                    history={watchHistory}
                    movies={moviesList}
                    onPlay={(m, ep) => handlePlayMovie(m, ep)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onRemove={handleRemoveFromHistory}
                    onClearAll={handleClearHistory}
                  />
                )}

                {/* 1. New Episodes section (ШИНЭ АНГИ) */}
                {newEpisodesMovies.length > 0 && (
                  <MovieGrid
                    title="ШИНЭ АНГИ"
                    totalCount={534}
                    movies={newEpisodesMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('series')}
                  />
                )}

                {/* 2. Chinese Movies Section (ХЯТАД КИНО & ЦУВРАЛ) */}
                {chineseMovies.length > 0 && (
                  <MovieGrid
                    title="ХЯТАД КИНО & ЦУВРАЛ"
                    movies={chineseMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('chinese')}
                  />
                )}

                {/* 2. Anime Section (АНИМЭ КИНО & ЦУВРАЛ) */}
                {animeMovies.length > 0 && (
                  <MovieGrid
                    title="ЭРЭЛТТЭЙ АНИМЭ КИНО & ЦУВРАЛ"
                    movies={animeMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('anime')}
                  />
                )}

                {/* 3. Feature Movies Section (УРАН САЙХНЫ КИНО) */}
                {featureMoviesOnly.length > 0 && (
                  <MovieGrid
                    title="УРАН САЙХНЫ КИНОНУУД"
                    movies={featureMoviesOnly}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('movies')}
                  />
                )}

                {/* 4. Mongolian Movies Section */}
                {mongolianMovies.length > 0 && (
                  <MovieGrid
                    title="МОНГОЛ КИНОНУУД"
                    movies={mongolianMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                  />
                )}

                {/* 5. TV Series Section (ОЛОН АНГИТ ЦУВРАЛ) */}
                {seriesOnly.length > 0 && (
                  <MovieGrid
                    title="ОЛОН АНГИТ ЦУВРАЛУУД"
                    movies={seriesOnly}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('series')}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Filter */}
          <div className="shrink-0">
            <SidebarFilter
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              onResetFilters={resetFilters}
            />
          </div>
        </div>
        )}
      </main>

      {/* Modals */}
      {selectedMovieForDetails && (
        <MovieDetailModal
          movie={selectedMovieForDetails}
          currentUser={currentUser}
          onClose={() => setSelectedMovieForDetails(null)}
          onPlay={(m, ep) => {
            setSelectedMovieForDetails(null);
            handlePlayMovie(m, ep);
          }}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(selectedMovieForDetails.id)}
          isPurchased={isPurchased(selectedMovieForDetails.id)}
          onUpdateEpisodes={handleUpdateMovieEpisodes}
          isMonthlyVip={isMonthlyVip}
          isAnimePackage={isAnimePackage}
          isMoviePackage={isMoviePackage}
          onRequestPurchase={(m) => {
            setSelectedMovieForDetails(null);
            setPaymentMovie(m);
            setShowPaymentModal(true);
          }}
        />
      )}

      {selectedMovieForPlayer && (
        <VideoPlayerModal
          movie={selectedMovieForPlayer}
          initialEpisodeNumber={playerInitialEpisode}
          isPurchased={isPurchased(selectedMovieForPlayer.id)}
          currentUser={currentUser}
          isMonthlyVip={isMonthlyVip}
          isAnimePackage={isAnimePackage}
          isMoviePackage={isMoviePackage}
          onUpdateWatchProgress={handleUpdateWatchProgress}
          onClose={() => setSelectedMovieForPlayer(null)}
          onRequestPurchase={(m) => {
            setSelectedMovieForPlayer(null);
            setPaymentMovie(m);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* Payment Modal (Anime Package 4,000₮, Movie Package 4,000₮, VIP 7,000₮) */}
      {(paymentMovie || showPaymentModal) && (
        <PaymentModal
          movie={paymentMovie}
          userBalance={userBalance}
          isMonthlyVip={isMonthlyVip}
          isAnimePackage={isAnimePackage}
          isMoviePackage={isMoviePackage}
          onClose={() => {
            setPaymentMovie(null);
            setShowPaymentModal(false);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onSubscribePackage={handleSubscribePackage}
          onTopUpBalance={handleTopUpBalance}
        />
      )}

      {showAiModal && (
        <AiRecommendationModal
          movies={moviesList}
          onClose={() => {
            setShowAiModal(false);
            if (activeTab === 'ai') setActiveTab('home');
          }}
          onSelectMovie={(m) => setSelectedMovieForDetails(m)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          onLogout={() => {
            setCurrentUser(null);
          }}
          onOpenUserManagement={() => {
            setShowAuthModal(false);
            setShowUserManagementModal(true);
          }}
        />
      )}

      {showSeoModal && (
        <SeoGuideModal onClose={() => setShowSeoModal(false)} />
      )}

      {showUserManagementModal && (
        <UserManagementModal
          currentUser={currentUser}
          onClose={() => setShowUserManagementModal(false)}
          userBalance={userBalance}
          onUpdateBalance={(newBal) => setUserBalance(newBal)}
          movies={moviesList}
          onUpdateMovieEpisodes={handleUpdateMovieEpisodes}
        />
      )}

      {showSecurityModal && (
        <SecurityShieldModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setShowSecurityModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Real-time Notification Toast Alert */}
      {showNotifToast && latestNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-zinc-900 border-2 border-amber-500/80 text-white p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 duration-300 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-amber-400">
                {latestNotification.title}
              </h4>
              <button
                onClick={() => setShowNotifToast(false)}
                className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              {latestNotification.message}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setShowNotifToast(false);
                  setShowUserManagementModal(true);
                }}
                className="text-[11px] bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3 py-1 rounded-lg transition-all cursor-pointer shadow-md"
              >
                Удирдах & Хэрэглэгч Харах
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstallModal && (
        <InstallAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Footer */}
      <Footer 
        onOpenSeoModal={() => setShowSeoModal(true)} 
        onOpenInstallModal={() => setShowInstallModal(true)}
        isAdmin={isAdmin}
      />
    </div>
  );
}

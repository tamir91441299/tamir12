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
import { DisplaySettingsModal, DeviceMode, CardDensity } from './components/DisplaySettingsModal';
import { PasscodePromptModal } from './components/PasscodePromptModal';
import { isPasscodeVerifiedInSession } from './lib/passcodeService';
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
  getPersistedActiveSession,
  persistActiveSession,
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
    // Only tamir91441299@gmail.com is allowed to update or add video episodes
    if (currentUser?.email !== 'tamir91441299@gmail.com') {
      alert('⚠️ Зөвхөн админ (tamir91441299@gmail.com) видео болон ангиудын линк оруулах, засах эрхтэй!');
      return;
    }
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

  // User Account state - Multi-layer permanent persistent login
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getPersistedActiveSession();
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register' | 'phone' | 'pc'>('login');
  const [showSeoModal, setShowSeoModal] = useState<boolean>(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showDisplaySettingsModal, setShowDisplaySettingsModal] = useState<boolean>(false);

  // Device & Screen Layout Responsive Customization (Phone, Tablet, PC)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    try {
      const saved = localStorage.getItem('flicknime_device_mode');
      return (saved as DeviceMode) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [uiScale, setUiScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flicknime_ui_scale');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  const [cardDensity, setCardDensity] = useState<CardDensity>(() => {
    try {
      const saved = localStorage.getItem('flicknime_card_density');
      return (saved as CardDensity) || 'normal';
    } catch {
      return 'normal';
    }
  });

  const handleDeviceModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    try {
      localStorage.setItem('flicknime_device_mode', mode);
    } catch {
      // Ignore
    }
  };

  const handleUiScaleChange = (scale: number) => {
    setUiScale(scale);
    try {
      localStorage.setItem('flicknime_ui_scale', String(scale));
    } catch {
      // Ignore
    }
  };

  const handleCardDensityChange = (density: CardDensity) => {
    setCardDensity(density);
    try {
      localStorage.setItem('flicknime_card_density', density);
    } catch {
      // Ignore
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' | 'phone' | 'pc' = 'login') => {
    setAuthModalInitialMode(mode);
    setShowAuthModal(true);
  };

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com';

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

  // Pending movie & episode for direct URL launch if passcode is required
  const [pendingDirectMovie, setPendingDirectMovie] = useState<Movie | null>(null);
  const [pendingDirectEp, setPendingDirectEp] = useState<number>(1);
  const [showDirectPasscodeModal, setShowDirectPasscodeModal] = useState<boolean>(false);

  // Handle direct launch when opened in a new protected window (e.g. ?play=m_91_days&ep=1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const playId = params.get('play');
      const epParam = params.get('ep');
      if (playId) {
        const decodedPlayId = decodeURIComponent(playId).toLowerCase().trim();
        const found = moviesList.find((m) => {
          const mId = m.id.toLowerCase();
          const cleanMId = mId.replace(/^m_/, '');
          const cleanPlayId = decodedPlayId.replace(/^m_/, '');
          return (
            mId === decodedPlayId ||
            cleanMId === cleanPlayId ||
            m.title.toLowerCase().includes(decodedPlayId) ||
            m.titleMongolian.toLowerCase().includes(decodedPlayId)
          );
        });

        if (found) {
          const parsedEp = epParam ? parseInt(epParam, 10) : 1;
          const validEp = !isNaN(parsedEp) && parsedEp > 0 ? parsedEp : 1;

          if (isPasscodeVerifiedInSession()) {
            setSelectedMovieForPlayer(found);
            setPlayerInitialEpisode(validEp);
          } else {
            setPendingDirectMovie(found);
            setPendingDirectEp(validEp);
            setShowDirectPasscodeModal(true);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing player URL search params:', e);
    }
  }, [moviesList]);

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

  // Real-time listener for notifications - ONLY FOR ADMIN (Tamir)
  useEffect(() => {
    if (!isAdmin) {
      setLatestNotification(null);
      setShowNotifToast(false);
      return;
    }

    const unsubscribe = subscribeNotificationsFromFirestore((notifs) => {
      if (notifs.length > 0) {
        const topNotif = notifs[0];
        setLatestNotification(topNotif);
        setShowNotifToast(true);
      }
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Track authenticated user session securely & permanently
  useEffect(() => {
    try {
      if (currentUser) {
        persistActiveSession(currentUser, true);
        saveUserToFirestore(currentUser);
      } else {
        persistActiveSession(null);
      }
    } catch (e) {
      console.error('Session persistence error:', e);
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
      if (activeTab === 'anime') {
        // Subcategory filtering for anime
        if (selectedMovieCategory === 'shounen') {
          if (!movie.genres.some(g => ['Shounen', 'Action', 'Шонэн', 'Тулаант'].includes(g))) return false;
        } else if (selectedMovieCategory === 'action') {
          if (!movie.genres.some(g => ['Action', 'Тулаант', 'Action & Adventure'].includes(g))) return false;
        } else if (selectedMovieCategory === 'sports') {
          if (!movie.genres.some(g => ['Sports', 'Спорт', 'Бокс'].includes(g))) return false;
        } else if (selectedMovieCategory === 'mystery') {
          if (!movie.genres.some(g => ['Mystery', 'Crime', 'Drama', 'Триллер', 'Өшөө авалт'].includes(g))) return false;
        } else if (selectedMovieCategory === 'fantasy') {
          if (!movie.genres.some(g => ['Fantasy', 'Magic', 'Уран зөгнөлт', 'Ид шид', 'Isekai'].includes(g))) return false;
        } else if (selectedMovieCategory === 'scifi') {
          if (!movie.genres.some(g => ['Sci-Fi', 'Mecha', 'Меха'].includes(g))) return false;
        } else if (selectedMovieCategory === 'top_rated') {
          if (movie.rating < 8.8) return false;
        } else if (selectedMovieCategory === 'new') {
          if (movie.year < 2024 && !movie.isNewEpisode) return false;
        } else if (selectedMovieCategory === 'vip') {
          if (!movie.price || movie.price <= 0) return false;
        }
      }

      if (activeTab === 'series' && movie.type !== 'series') return false;
      if (activeTab === 'favorites' && !favorites.includes(movie.id)) return false;
      if (activeTab === 'purchased' && !purchasedMovies.includes(movie.id)) return false;

      // Sidebar type filter
      if (selectedType !== 'all') {
        if (selectedType === 'movie' && movie.type !== 'movie') return false;
        if (selectedType === 'series' && movie.type !== 'series') return false;
        if (selectedType === 'anime' && movie.type !== 'anime') return false;
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
  }, [moviesList, activeTab, selectedMovieCategory, selectedType, selectedYear, selectedGenre, searchQuery, favorites, purchasedMovies]);

  // Featured Movies for Hero Carousel
  const featuredMovies = useMemo(() => {
    return moviesList.filter((m) => m.featured);
  }, [moviesList]);

  // Section categories for Anime
  const newEpisodesMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.isNewEpisode || m.episodes?.some(e => e.isNew));
  }, [filteredMovies]);

  const seriesOnly = useMemo(() => {
    return filteredMovies.filter((m) => m.type === 'series' || (m.episodes && m.episodes.length > 1));
  }, [filteredMovies]);

  const topRatedAnime = useMemo(() => {
    return filteredMovies.filter((m) => m.rating >= 8.8);
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
    // Бүртгэлгүй хүмүүс энэ сайтын анимэ үзэх боломжгүй
    if (!currentUser && movie.type === 'anime') {
      handleOpenAuthModal('phone');
      return;
    }
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

  const handleSubscribePackage = (
    packageType: 'anime' | 'movie' | 'full_vip',
    deductedAmount: number = 0,
    durationMonths: number = 1
  ) => {
    if (deductedAmount > 0) {
      setUserBalance((prev) => Math.max(0, prev - deductedAmount));
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationMonths * 30);
    const expiryStr = expiryDate.toLocaleDateString('mn-MN');

    if (packageType === 'anime') {
      setIsAnimePackage(true);
      try {
        localStorage.setItem('ioio_anime_package', 'true');
        localStorage.setItem('ioio_anime_expiry', expiryStr);
      } catch (e) {
        console.error('Error saving anime package status:', e);
      }
    } else if (packageType === 'movie') {
      setIsMoviePackage(true);
      try {
        localStorage.setItem('ioio_movie_package', 'true');
        localStorage.setItem('ioio_movie_expiry', expiryStr);
      } catch (e) {
        console.error('Error saving movie package status:', e);
      }
    } else if (packageType === 'full_vip') {
      setIsMonthlyVip(true);
      setIsAnimePackage(true);
      setIsMoviePackage(true);
      try {
        localStorage.setItem('ioio_monthly_vip', 'true');
        localStorage.setItem('ioio_anime_package', 'true');
        localStorage.setItem('ioio_movie_package', 'true');
        localStorage.setItem('ioio_vip_expiry', expiryStr);
      } catch (e) {
        console.error('Error saving VIP status:', e);
      }
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
        onOpenAuthModal={(mode) => {
          handleOpenAuthModal(mode || 'login');
        }}
        onOpenUserManagement={() => {
          setShowUserManagementModal(true);
        }}
        onOpenInstallModal={() => {
          setShowInstallModal(true);
        }}
        onOpenDisplaySettings={() => {
          setShowDisplaySettingsModal(true);
        }}
      />

      {/* Main Container */}
      <main 
        className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 transition-all duration-200"
        style={uiScale !== 100 ? { zoom: `${uiScale}%` } : undefined}
      >
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
                  setSelectedMovieCategory('shounen');
                  setActiveTab('anime');
                }}
                className="gold-glow-btn text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Шонэн & Тулаант Анимэ</span>
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
            {/* Quick Anime Subcategories Bar when viewing Anime tab */}
            {activeTab === 'anime' && (
              <div className="cinema-glass rounded-2xl p-3 shadow-lg border border-white/[0.06]">
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    Анимэ Жанр & Ангилал ({filteredMovies.length} анимэ):
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
                    { id: 'all' as MovieSubcategory, label: '✨ Бүх Анимэ' },
                    { id: 'shounen' as MovieSubcategory, label: '🔥 Шонэн' },
                    { id: 'action' as MovieSubcategory, label: '⚔️ Тулаант' },
                    { id: 'sports' as MovieSubcategory, label: '🥊 Спорт / Бокс' },
                    { id: 'mystery' as MovieSubcategory, label: '💀 Өшөө авалт / Триллер' },
                    { id: 'fantasy' as MovieSubcategory, label: '🔮 Уран зөгнөлт' },
                    { id: 'scifi' as MovieSubcategory, label: '🤖 Sci-Fi & Меха' },
                    { id: 'top_rated' as MovieSubcategory, label: '⭐ Шилдэг 9.0+' },
                    { id: 'new' as MovieSubcategory, label: '⚡ Шинэ Ангиуд' },
                    { id: 'vip' as MovieSubcategory, label: '👑 VIP Анимэ' },
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
                  Таалагдсан Анимэ ({filteredMovies.length})
                </h2>
              </div>
            )}

            {activeTab === 'purchased' && (
              <div className="flex items-center gap-2.5 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <h2 className="text-lg sm:text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Миний Үзэх Эрхтэй Анимэ ({filteredMovies.length})
                </h2>
              </div>
            )}

            {/* If actively filtering or searching */}
            {selectedYear || selectedGenre || searchQuery || selectedType !== 'all' || activeTab !== 'home' ? (
              <MovieGrid
                title={
                  activeTab === 'anime'
                    ? selectedMovieCategory === 'shounen'
                      ? '🔥 ШОНЭН & ТУЛААНТ АНИМЭ ЦУВРАЛУУД'
                      : selectedMovieCategory === 'action'
                      ? '⚔️ ТУЛААНТ & АДАЛ ЯВДАЛТ АНИМЭ'
                      : selectedMovieCategory === 'sports'
                      ? '🥊 СПОРТ & БОКС АНИМЭ (МЕГАЛО БОКС)'
                      : selectedMovieCategory === 'mystery'
                      ? '💀 ӨШӨӨ АВАЛТ, ТРИЛЛЕР & ДРАМ АНИМЭ'
                      : selectedMovieCategory === 'fantasy'
                      ? '🔮 УРАН ЗӨГНӨЛТ & ИД ШИД АНИМЭ'
                      : selectedMovieCategory === 'scifi'
                      ? '🤖 SCI-FI & МЕХА АНИМЭ'
                      : selectedMovieCategory === 'top_rated'
                      ? '⭐ ШИЛДЭГ ҮНЭЛГЭЭТЭЙ (9.0+) АНИМЭ'
                      : selectedMovieCategory === 'new'
                      ? '⚡ ШИНЭЭР ОРСОН АНИМЭ АНГИУД'
                      : selectedMovieCategory === 'vip'
                      ? '👑 VIP ОНЦГОЙ АНИМЭ'
                      : '✨ БҮХ АНИМЭ САН'
                    : activeTab === 'series'
                    ? '📺 ОЛОН АНГИТ АНИМЭ ЦУВРАЛУУД'
                    : activeTab === 'favorites'
                    ? '❤️ ХАДГАЛСАН АНИМЭ'
                    : activeTab === 'purchased'
                    ? '🎟️ АВСАН АНИМЭ (ХЯЗГААРГҮЙ ҮЗЭХ)'
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
                cardDensity={cardDensity}
                deviceMode={deviceMode}
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

                {/* 1. New Episodes Section (ШИНЭ АНГИУД) */}
                {newEpisodesMovies.length > 0 && (
                  <MovieGrid
                    title="ШИНЭ АНГИУД & ТАСРАЛТГҮЙ ОРЖ БАЙГАА"
                    totalCount={534}
                    movies={newEpisodesMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('series')}
                    cardDensity={cardDensity}
                    deviceMode={deviceMode}
                  />
                )}

                {/* 2. Top Anime Series (ОЛОН АНГИТ ШИЛДЭГ АНИМЭ) */}
                {seriesOnly.length > 0 && (
                  <MovieGrid
                    title="ОЛОН АНГИТ ШИЛДЭГ АНИМЭ ЦУВРАЛУУД"
                    movies={seriesOnly}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('anime')}
                    cardDensity={cardDensity}
                    deviceMode={deviceMode}
                  />
                )}

                {/* 3. Top Rated Anime (ШИЛДЭГ ҮНЭЛГЭЭТЭЙ АНИМЭ) */}
                {topRatedAnime.length > 0 && (
                  <MovieGrid
                    title="ШИЛДЭГ ҮНЭЛГЭЭТЭЙ АНИМЭ (9.0+)"
                    movies={topRatedAnime}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    cardDensity={cardDensity}
                    deviceMode={deviceMode}
                  />
                )}

                {/* 4. All anime collection */}
                {filteredMovies.length > 0 && (
                  <MovieGrid
                    title="СҮҮЛД НЭМЭГДСЭН АНИМЭ САН"
                    movies={filteredMovies}
                    onPlayMovie={(m) => handlePlayMovie(m)}
                    onOpenDetails={(m) => setSelectedMovieForDetails(m)}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    isPurchased={isPurchased}
                    onSeeAll={() => setActiveTab('anime')}
                    cardDensity={cardDensity}
                    deviceMode={deviceMode}
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
          onOpenAuthModal={handleOpenAuthModal}
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
          onOpenAuthModal={handleOpenAuthModal}
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
          initialMode={authModalInitialMode}
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

      {/* Screen & Device Responsive Customization Modal */}
      {showDisplaySettingsModal && (
        <DisplaySettingsModal
          isOpen={showDisplaySettingsModal}
          onClose={() => setShowDisplaySettingsModal(false)}
          deviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          uiScale={uiScale}
          onUiScaleChange={handleUiScaleChange}
          cardDensity={cardDensity}
          onCardDensityChange={handleCardDensityChange}
        />
      )}

      {/* Secret Passcode Prompt when opening direct link or new protected window */}
      <PasscodePromptModal
        isOpen={showDirectPasscodeModal}
        onClose={() => {
          setShowDirectPasscodeModal(false);
          setPendingDirectMovie(null);
        }}
        onSuccess={() => {
          setShowDirectPasscodeModal(false);
          if (pendingDirectMovie) {
            setSelectedMovieForPlayer(pendingDirectMovie);
            setPlayerInitialEpisode(pendingDirectEp || 1);
            setPendingDirectMovie(null);
          }
        }}
        isAdmin={isAdmin}
      />

      {/* Footer */}
      <Footer 
        onOpenSeoModal={() => setShowSeoModal(true)} 
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenDisplaySettings={() => setShowDisplaySettingsModal(true)}
        isAdmin={isAdmin}
      />
    </div>
  );
}

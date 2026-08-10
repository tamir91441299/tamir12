import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BannerCarousel } from './components/BannerCarousel';
import { SidebarFilter } from './components/SidebarFilter';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailModal } from './components/MovieDetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AiRecommendationModal } from './components/AiRecommendationModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { AnimeGuesser } from './components/AnimeGuesser';
import { Footer } from './components/Footer';
import { SAMPLE_MOVIES } from './data/movies';
import { Movie } from './types';
import { Sparkles, Heart, CheckCircle2, Wallet, UserCheck, Gamepad2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'series' | 'anime' | 'ai' | 'favorites' | 'purchased' | 'games'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'movie' | 'series' | 'anime' | 'all'>('all');

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

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ioio_favorites');
      return saved ? JSON.parse(saved) : ['m1', 'm7'];
    } catch {
      return ['m1', 'm7'];
    }
  });

  // Purchased Movies state (1,000₮ per movie model)
  const [purchasedMovies, setPurchasedMovies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ioio_purchased');
      return saved ? JSON.parse(saved) : ['m1']; // 'm1' pre-purchased for demo
    } catch {
      return ['m1'];
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

  // User Wallet Balance (MNT)
  const [userBalance, setUserBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ioio_balance');
      return saved ? parseInt(saved, 10) : 5000; // 5,000₮ initial balance
    } catch {
      return 5000;
    }
  });

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

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ioio_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ioio_user');
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

  const isPurchased = (movieId: string) => {
    if (isMonthlyVip) return true;
    const movie = SAMPLE_MOVIES.find((m) => m.id === movieId);
    if (!movie) return true;
    if (movie.type === 'anime' && isAnimePackage) return true;
    if ((movie.type === 'movie' || movie.type === 'series') && isMoviePackage) return true;
    return purchasedMovies.includes(movieId);
  };

  // Modals state
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [selectedMovieForPlayer, setSelectedMovieForPlayer] = useState<Movie | null>(null);
  const [playerInitialEpisode, setPlayerInitialEpisode] = useState<number>(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [paymentMovie, setPaymentMovie] = useState<Movie | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Sync tab clicks
  useEffect(() => {
    if (activeTab === 'ai') {
      setShowAiModal(true);
    }
  }, [activeTab]);

  // Filter logic
  const filteredMovies = useMemo(() => {
    return SAMPLE_MOVIES.filter((movie) => {
      // Tab filter
      if (activeTab === 'movies' && movie.type !== 'movie') return false;
      if (activeTab === 'series' && movie.type !== 'series') return false;
      if (activeTab === 'anime' && movie.type !== 'anime') return false;
      if (activeTab === 'favorites' && !favorites.includes(movie.id)) return false;
      if (activeTab === 'purchased' && !purchasedMovies.includes(movie.id)) return false;

      // Sidebar type filter
      if (selectedType === 'movie' && movie.type !== 'movie') return false;
      if (selectedType === 'series' && movie.type !== 'series') return false;
      if (selectedType === 'anime' && movie.type !== 'anime') return false;

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
  }, [activeTab, selectedType, selectedYear, selectedGenre, searchQuery, favorites, purchasedMovies]);

  // Featured Movies for Hero Carousel
  const featuredMovies = useMemo(() => {
    return SAMPLE_MOVIES.filter((m) => m.featured);
  }, []);

  // Section categories
  const newEpisodesMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.isNewEpisode);
  }, [filteredMovies]);

  const animeMovies = useMemo(() => {
    return filteredMovies.filter((m) => m.type === 'anime');
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
    if (isPurchased(movie.id)) {
      setSelectedMovieForPlayer(movie);
      setPlayerInitialEpisode(episodeNumber);
    } else {
      setPaymentMovie(movie);
      setPlayerInitialEpisode(episodeNumber);
      setShowPaymentModal(true);
    }
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
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          handleTopUpBalance(5000);
        }}
        onOpenVipModal={() => {
          setShowPaymentModal(true);
        }}
        onOpenAuthModal={() => {
          setShowAuthModal(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* AI Banner Callout */}
        <div className="mb-6 bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-purple-950/80 border border-cyan-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                IOIO AI Кино Санал Болгогч (Анимэ багц 4,000 ₮ • Кино багц 4,000 ₮)
              </h3>
              <p className="text-xs text-zinc-400">
                Та юу үзмээр байгаагаа монголоор бичээд AI туслахаас шууд зөвлөгөө аваарай.
              </p>
            </div>
          </div>

          <button
            id="open-ai-callout"
            onClick={() => setShowAiModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            AI Санал Авах
          </button>
        </div>

        {/* Main Content / Games View */}
        {activeTab === 'games' ? (
          <AnimeGuesser />
        ) : (
          /* Main Content + Sidebar Layout */
          <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Catalog View */}
          <div className="flex-1 space-y-8 min-w-0">
            {activeTab === 'favorites' && (
              <div className="border-l-4 border-rose-500 pl-3">
                <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  Таалагдсан Кинонууд ({filteredMovies.length})
                </h2>
              </div>
            )}

            {activeTab === 'purchased' && (
              <div className="border-l-4 border-emerald-500 pl-3">
                <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
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
                    ? 'БҮХ КИНОНУУД'
                    : activeTab === 'series'
                    ? 'ОЛОН АНГИТ ЦУВРАЛУУД'
                    : activeTab === 'anime'
                    ? 'АНИМЭ КИНО & ЦУВРАЛУУД'
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
              />
            ) : (
              /* Default Home Sections */
              <>
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
      <MovieDetailModal
        movie={selectedMovieForDetails}
        onClose={() => setSelectedMovieForDetails(null)}
        onPlay={(m, ep) => {
          setSelectedMovieForDetails(null);
          handlePlayMovie(m, ep);
        }}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedMovieForDetails ? isFavorite(selectedMovieForDetails.id) : false}
        isPurchased={selectedMovieForDetails ? isPurchased(selectedMovieForDetails.id) : false}
      />

      {selectedMovieForPlayer && (
        <VideoPlayerModal
          movie={selectedMovieForPlayer}
          initialEpisodeNumber={playerInitialEpisode}
          onClose={() => setSelectedMovieForPlayer(null)}
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
          movies={SAMPLE_MOVIES}
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
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

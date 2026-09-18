import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Star,
  Bookmark,
  Share2,
  Clock,
  Calendar,
  Film,
  User,
  MessageSquare,
  Send,
  Sparkles,
  Check,
  Plus,
  PlusCircle,
  Video,
  Edit2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Copy,
  KeyRound,
  Ticket,
  Link as LinkIcon,
  Layers,
  Zap,
  CheckCircle2,
  Eye,
  Users
} from 'lucide-react';
import { Movie, Comment, Episode } from '../types';
import { SAMPLE_COMMENTS } from '../data/movies';
import { getEmbedUrl } from '../lib/videoUtils';
import { redeemCode } from '../lib/codeService';
import { isPasscodeVerifiedInSession } from '../lib/passcodeService';
import { PasscodePromptModal } from './PasscodePromptModal';
import { UserAccount } from './AuthModal';
import { AnimeWatcher, subscribeAnimeWatchers } from '../lib/animeViewService';
import { checkUserContentAccess } from '../lib/permissionService';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie, episodeNumber?: number) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: boolean;
  isPurchased?: boolean;
  onUpdateEpisodes?: (movieId: string, episodes: any[]) => void;
  currentUser?: UserAccount | null;
  isMonthlyVip?: boolean;
  isAnimePackage?: boolean;
  isMoviePackage?: boolean;
  onRequestPurchase?: (movie: Movie) => void;
  onOpenAuthModal?: (mode?: 'phone' | 'pc' | 'login' | 'register') => void;
  onSelectMovie?: (movie: Movie) => void;
  allMovies?: Movie[];
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onPlay,
  onToggleFavorite,
  isFavorite,
  isPurchased = false,
  onUpdateEpisodes,
  currentUser,
  isMonthlyVip = false,
  isAnimePackage = false,
  isMoviePackage = false,
  onRequestPurchase,
  onOpenAuthModal,
  onSelectMovie,
  allMovies,
}) => {
  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser?.phone === '91441299' && (currentUser?.name?.includes('Тамир') || currentUser?.email?.includes('tamir')));

  const [comments, setComments] = useState<Comment[]>(() => 
    SAMPLE_COMMENTS.filter((c) => (movie && c.movieId === movie.id) || c.movieId === 'm1')
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const [backdropSrc, setBackdropSrc] = useState<string | undefined>(movie?.backdrop || movie?.poster);
  const [backdropError, setBackdropError] = useState(false);
  const [posterSrc, setPosterSrc] = useState<string | undefined>(movie?.poster || movie?.backdrop);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    setBackdropSrc(movie?.backdrop || movie?.poster);
    setBackdropError(false);
    setPosterSrc(movie?.poster || movie?.backdrop);
    setPosterError(false);
  }, [movie?.id, movie?.backdrop, movie?.poster]);

  // Episode state management
  const [episodesList, setEpisodesList] = useState<Movie['episodes']>(movie?.episodes || []);
  const [showAddEpForm, setShowAddEpForm] = useState(false);
  const [showBatchLinkForm, setShowBatchLinkForm] = useState(false);
  const [batchLinksInput, setBatchLinksInput] = useState('');
  const [batchTotalEpCount, setBatchTotalEpCount] = useState<number>(13);
  const [newEpNum, setNewEpNum] = useState<number>((movie?.episodes?.length || 0) + 1);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpUrl, setNewEpUrl] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('24 мин');
  const [epSearch, setEpSearch] = useState('');
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [pendingWindowEp, setPendingWindowEp] = useState<number>(1);

  // Real-time Watchers & View Tracking state
  const [watchersList, setWatchersList] = useState<AnimeWatcher[]>([]);
  const [totalWatchViews, setTotalWatchViews] = useState<number>(movie?.views || 1000);
  const [activeDetailTab, setActiveDetailTab] = useState<'episodes' | 'watchers' | 'comments'>('episodes');
  const [watcherSearch, setWatcherSearch] = useState('');

  // Subscribe to real-time viewers for this anime
  useEffect(() => {
    if (movie?.id) {
      const unsubscribe = subscribeAnimeWatchers(movie.id, movie.views || 1000, (watchers, totalViews) => {
        setWatchersList(watchers);
        setTotalWatchViews(totalViews);
      });
      return () => unsubscribe();
    }
  }, [movie?.id, movie?.views]);

  const openWindowDirect = (epNum: number = 1) => {
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const targetUrl = `${baseUrl}?play=${encodeURIComponent(movie.id)}&ep=${epNum}&protected=1`;
    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(targetUrl, '_blank');
    }
  };

  const handleOpenProtectedWindow = (epNum: number = 1) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal('phone');
      else alert('⚠️ Анимэ үзэхийн тулд эхлээд системд бүртгүүлж эсвэл нэвтэрнэ үү!');
      return;
    }

    if (!userHasAccessToEpisode(epNum)) {
      if (onRequestPurchase) {
        onRequestPurchase(movie);
      } else {
        alert(`🔒 ${epNum}-р анги түгжээтэй байна! Эрх аваагүй хэрэглэгч анимэ үзэх боломжгүй тул эрхээ идэвхжүүлнэ үү.`);
      }
      return;
    }

    if (isPasscodeVerifiedInSession()) {
      openWindowDirect(epNum);
    } else {
      setPendingWindowEp(epNum);
      setShowPasscodeModal(true);
    }
  };

  useEffect(() => {
    if (movie) {
      setEpisodesList(movie.episodes || []);
      setBatchTotalEpCount(movie.episodes?.length || 13);
      setNewEpNum((movie.episodes?.length || 0) + 1);
      setComments(SAMPLE_COMMENTS.filter((c) => c.movieId === movie.id || c.movieId === 'm1'));
      setEpSearch('');
      setSelectedRange('all');
    }
  }, [movie]);

  if (!movie) return null;

  const isMegaloBox = movie.id === 'm_megalo_box' || movie.title.toLowerCase().includes('megalo');
  const is91Days = movie.id === 'm_91_days' || movie.title.toLowerCase().includes('91 day') || movie.titleMongolian.includes('91 Өдөр');
  const isKorraS2 = movie.id === 'm_legend_of_korra_s2' || (movie.title.toLowerCase().includes('korra') && (movie.title.includes('2') || movie.titleMongolian.includes('2')));
  const isKorra = (movie.id === 'm_legend_of_korra' || movie.title.toLowerCase().includes('korra') || movie.titleMongolian.includes('Корра')) && !isKorraS2;

  // Access rule:
  // 1. Бүртгэлгүй хэрэглэгчид энэ сайтын анимэ болон кино үзэх боломжгүй (Заавал системд нэвтрэх шаардлагатай)
  // 2. Анимэ үзэх эрх аваагүй хүмүүс анимэ болон ямар ч контент үзэх боломжгүй (Бүх анги ТҮГЖЭЭТЭЙ)
  // 3. Зөвхөн Анимэ багцын эрх, VIP эсвэл тухайн контентын эрхийг худалдан авсан хэрэглэгчид үзнэ
  const userHasAccessToEpisode = (_epNumber: number = 1): boolean => {
    const res = checkUserContentAccess(currentUser, movie, isPurchased);
    return res.hasAccess;
  };

  const handleEpisodeSelect = (epNumber: number) => {
    // Бүртгэлгүй бол шууд нэвтрэх / бүртгүүлэх цонх нээх
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal('phone');
      } else {
        alert('⚠️ Анимэ үзэхийн тулд эхлээд системд бүртгүүлж эсвэл нэвтэрнэ үү!');
      }
      return;
    }

    const hasAccess = userHasAccessToEpisode(epNumber);
    if (hasAccess) {
      onPlay(movie, epNumber);
    } else {
      // Анимэ эрхээ аваагүй тул уг анги түгжээтэй, төлбөр төлөх эсвэл багц авах цонх нээнэ
      if (onRequestPurchase) {
        onRequestPurchase(movie);
      } else {
        alert('🔒 Анимэ эрхээ аваагүй хэрэглэгчид анимэ үзэх боломжгүй! Та Анимэ багцын эрхээ авна уу.');
      }
    }
  };

  const handleSaveNewEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('⚠️ Хориглогдсон: Видео болон ангийн линк оруулах эрх зөвхөн сайтын эзэмшигч Тамир админд бий!');
      return;
    }
    if (!newEpUrl.trim()) return;

    const title = newEpTitle.trim() || `${newEpNum}-р анги`;
    const newEp: Episode = {
      episodeNumber: Number(newEpNum),
      title,
      duration: newEpDuration.trim() || '24 мин',
      videoUrl: newEpUrl.trim()
    };

    const updated = [...(episodesList || []).filter(ep => ep.episodeNumber !== Number(newEpNum)), newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
    setEpisodesList(updated);
    if (onUpdateEpisodes) {
      onUpdateEpisodes(movie.id, updated);
    }

    setShowAddEpForm(false);
    setNewEpTitle('');
    setNewEpUrl('');
    setNewEpNum(updated.length + 1);
  };

  // Batch Episode Link Connector for episodes 1 to 13
  const handleBatchLinkConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('⚠️ Хориглогдсон: Видео болон ангийн линк холбох эрх зөвхөн сайтын эзэмшигч Тамир админд бий!');
      return;
    }

    const raw = batchLinksInput.trim();
    if (!raw) return;

    // Parse lines or split by whitespace/commas
    const lines = raw.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
    const targetCount = Math.max(1, Math.min(100, Number(batchTotalEpCount) || 13));

    const defaultMegaloTitles: Record<number, string> = {
      1: '1-р анги - Хувь тавилан хуурамч биш (BUY OR DIE?)',
      2: '2-р анги - Үхлийн өмнөх тулаан (THE MAN ONLY DIES ONCE)',
      3: '3-р анги - Араатан ба төмөр (GEAR IS DEAD)',
      4: '4-р анги - Жинхэнэ нэр: Junk Dog (LET\'S DANCE WITH DEATH)',
      5: '5-р анги - Дээд түвшний өрсөлдөөн (THE MAN FROM UNDERWORLD)',
      6: '6-р анги - Өнгөрсөн үеийн сүүдэр (UNTIL THE LAST SPARK)',
      7: '7-р анги - Замналын эхлэл (THE ROAD TO DEATH)',
      8: '8-р анги - Тэсвэр тэвчээр (DEADLINE)',
      9: '9-р анги - Сүүлчийн найдварын оч (A DEAD FLOWER NEVER BLOOMS)',
      10: '10-р анги - Их рингэнд гарах зам (THE DIE IS CAST)',
      11: '11-р анги - Өшөө авалт ба нөхөрлөл (A DEAD MARCH)',
      12: '12-р анги - Аваргын эсрэг тулаан (BITE THE DUST)',
      13: '13-р анги - Төгсгөлийн тулаан (BORN TO DIE - ТӨГСГӨЛ)'
    };

    const default91DaysTitles: Record<number, string> = {
      1: '1-р анги - Үдэшлэгийн шөнө (Night of the Murder)',
      2: '2-р анги - Хуурмаг дүр төрх (Phantom of Falsehood)',
      3: '3-р анги - Хаашаа чиглэсэн буун дуу (Where the Footsteps Lead)',
      4: '4-р анги - Ялагдал ба Холбоотон (Lose to Win, and What Comes After)',
      5: '5-р анги - Цусны үнэр (Blood Will Have Blood)',
      6: '6-р анги - Хүн алахын тулд (To Slaughter a Pig)',
      7: '7-р анги - Муу ёрын өдөр (A Poor Player)',
      8: '8-р анги - Далд хөшиг (Behind the Curtain)',
      9: '9-р анги - Хар харгис сэтгэл (Black and Deep Desires)',
      10: '10-р анги - Баталгаагүй замнал (Proof of Good Faith)',
      11: '11-р анги - Бүх зүйл хоосон (All for Nothing)',
      12: '12-р анги - Салхи өнгөрөх мөч (Treading on Dirty Ground - Төгсгөл)',
      13: '13-р анги - Гунигт бөгөөд богинохон (Shoe Sole Bottle - OVA)'
    };

    const defaultKorraTitles: Record<number, string> = {
      1: '1-р анги - Бүгд Найрамдах Хотод Тавтай Морил (Welcome to Republic City)',
      2: '2-р анги - Салхин дахь навч (A Leaf in the Wind)',
      3: '3-р анги - Илчлэлт (The Revelation)',
      4: '4-р анги - Шөнийн дуу хоолой (The Voice in the Night)',
      5: '5-р анги - Өрсөлдөөний сүнс (The Spirit of Competition)',
      6: '6-р анги - Ялагч нь... (And the Winner Is...)',
      7: '7-р анги - Үр дагавар (The Aftermath)',
      8: '8-р анги - Хязгаарууд уулзах үед (When Extremes Meet)',
      9: '9-р анги - Өнгөрснөөс эргэн ирсэн нь (Out of the Past)',
      10: '10-р анги - Эргэлтийн цэг (Turning the Tides)',
      11: '11-р анги - Нуугдмал үнэн (Skeletons in the Closet)',
      12: '12-р анги - Төгсгөлийн тулаан (Endgame - Төгсгөл)'
    };

    const defaultKorraS2Titles: Record<number, string> = {
      1: '1-р анги (13) - Босогч сүнс (Rebel Spirit)',
      2: '2-р анги (14) - Өмнөдийн туйлын туяа (The Southern Lights)',
      3: '3-р анги (15) - Иргэний дайн: 1-р хэсэг (Civil Wars: Part 1)',
      4: '4-р анги (16) - Иргэний дайн: 2-р хэсэг (Civil Wars: Part 2)',
      5: '5-р анги (17) - Энхийг сахиулагчид (Peacekeepers)',
      6: '6-р анги (18) - Мэхлэлт (The Sting)',
      7: '7-р анги (19) - Эхлэл: 1-р хэсэг - Анхны Аватар Ван (Beginnings: Part 1)',
      8: '8-р анги (20) - Эхлэл: 2-р хэсэг - Раава ба Ваату (Beginnings: Part 2)',
      9: '9-р анги (21) - Хөтөч (The Guide)',
      10: '10-р анги (22) - Шинэ сүнслэг эрин (A New Spiritual Age)',
      11: '11-р анги (23) - Мянган оддын шөнө (Night of a Thousand Stars)',
      12: '12-р анги (24) - Эв зохицлын нийлэмж (Harmonic Convergence)',
      13: '13-р анги (25) - Харанхуй нөмрөх үед (Darkness Falls)',
      14: '14-р анги (26) - Харанхуй дахь гэрэл (Light in the Dark - Төгсгөл)'
    };

    const newEpList: Episode[] = [];

    for (let i = 1; i <= targetCount; i++) {
      // Find URL: either corresponding line, or first link
      const lineUrl = lines[i - 1] || lines[0] || movie.videoUrl || 'https://drive.google.com/file/d/1Q6W8jgTtnYJo7E_LQNOJkCUiAtI39Nku/view?usp=drivesdk';
      const existing = episodesList?.find(ep => ep.episodeNumber === i);
      const title = existing?.title || (
        isKorraS2 ? defaultKorraS2Titles[i] || `${i}-р анги` :
        isKorra ? defaultKorraTitles[i] || `${i}-р анги` :
        is91Days ? default91DaysTitles[i] || `${i}-р анги` :
        isMegaloBox ? defaultMegaloTitles[i] || `${i}-р анги` :
        `${i}-р анги`
      );
      const duration = existing?.duration || '22 мин';

      newEpList.push({
        episodeNumber: i,
        title,
        duration,
        videoUrl: lineUrl
      });
    }

    setEpisodesList(newEpList);
    if (onUpdateEpisodes) {
      onUpdateEpisodes(movie.id, newEpList);
    }

    setShowBatchLinkForm(false);
    setBatchLinksInput('');
    alert(`🎉 Амжилттай: ${movie.titleMongolian} 1-ээс ${targetCount} хүртэлх бүх ангийн линк амжилттай холбогдлоо!`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // Check if non-admin tries to post a URL/link or video file in comments
    const containsUrl = /(https?:\/\/|www\.|youtu\.be|youtube\.com|drive\.google\.com|facebook\.com|fb\.watch|vimeo\.com|bilibili|dailymotion|\.mp4|\.m3u8|\.webm|\.avi|\.mov|<iframe|<video)/i.test(newCommentText);
    if (containsUrl && !isAdmin) {
      alert('⚠️ Хориглогдсон: Энэ сайт дээр админаас (tamir91441299@gmail.com) өөр хүн видео болон холбоос оруулах боломжгүй! Видео болон ангийн линк оруулах эрх зөвхөн админд бий.');
      return;
    }

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      movieId: movie.id,
      userName: currentUser ? currentUser.name : 'Хэрэглэгч',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text: newCommentText.trim(),
      rating: userRating || 10,
      date: 'Яг одоо',
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl cinema-glass-elevated border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl text-zinc-100 max-h-[92vh] flex flex-col my-auto film-frame-decor">
        {/* Close Button */}
        <button
          id="close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/10 backdrop-blur transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 divide-y divide-white/[0.06] no-scrollbar">
          {/* Top Hero Banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[#07080b]">
            {showTrailer ? (
              <iframe
                src={getEmbedUrl(movie.trailerUrl)}
                title="Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                {backdropSrc && !backdropError ? (
                  <img
                    src={backdropSrc}
                    alt={movie.titleMongolian}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (backdropSrc === movie.backdrop && movie.poster && movie.poster !== movie.backdrop) {
                        setBackdropSrc(movie.poster);
                      } else {
                        setBackdropError(true);
                      }
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#07080b] via-[#14141a] to-[#07080b] flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-amber-400/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/60 to-transparent" />

                {/* Big Direct Play Button on Backdrop */}
                <button
                  id="preview-play-backdrop-button"
                  onClick={() => {
                    if (!currentUser) {
                      if (onOpenAuthModal) onOpenAuthModal('phone');
                      else alert('⚠️ Анимэ үзэхийн тулд эхлээд системд бүртгүүлж эсвэл нэвтэрнэ үү!');
                      return;
                    }
                    if (!userHasAccessToEpisode(1)) {
                      if (onRequestPurchase) {
                        onRequestPurchase(movie);
                      } else {
                        alert('🔒 Анимэ эрхээ аваагүй хэрэглэгчид анимэ үзэх боломжгүй! Та Анимэ багцын эрхээ авна уу.');
                      }
                      return;
                    }
                    onPlay(movie, 1);
                  }}
                  className={`absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-115 active:scale-95 transition-all cursor-pointer group z-10 ${
                    userHasAccessToEpisode(1)
                      ? 'gold-glow-btn text-black'
                      : 'bg-amber-500 text-black border-2 border-amber-300 shadow-amber-500/50'
                  }`}
                  title={userHasAccessToEpisode(1) ? "Шууд үзэх" : "Эрх шаардлагатай (Түгжээтэй)"}
                >
                  {userHasAccessToEpisode(1) ? (
                    <Play className="w-8 h-8 fill-black ml-1 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Lock className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {movie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setShowTrailer(true)}
                    className="absolute bottom-4 right-4 z-10 bg-black/70 hover:bg-black text-zinc-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Трейлер үзэх</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Core Info Section */}
          <div className="p-4 sm:p-6 space-y-6 -mt-12 relative z-10 bg-[#0b0d13]/80 backdrop-blur-md border-t border-white/[0.04]">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Poster Image */}
              {posterSrc && !posterError ? (
                <img
                  src={posterSrc}
                  alt={movie.titleMongolian}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (posterSrc === movie.poster && movie.backdrop && movie.backdrop !== movie.poster) {
                      setPosterSrc(movie.backdrop);
                    } else {
                      setPosterError(true);
                    }
                  }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-36 sm:w-48 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-white/10 shrink-0 mx-auto sm:mx-0 select-none"
                />
              ) : (
                <div className="w-36 sm:w-48 aspect-[2/3] rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-b from-[#181c26] to-[#0b0d13] flex flex-col items-center justify-center shrink-0 mx-auto sm:mx-0 p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300 line-clamp-2">
                    {movie.titleMongolian || movie.title}
                  </span>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="studio-badge-gold text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md">
                    {movie.type === 'anime' ? 'ANIME' : movie.type === 'series' ? 'TV SERIES' : 'CINEMA'}
                  </span>
                  <span className="bg-white/[0.06] text-amber-300 font-extrabold px-2.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    4K ULTRA HD
                  </span>
                  <span className="bg-white/[0.04] text-zinc-300 font-mono font-bold px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                    {movie.year}
                  </span>
                  <span className="bg-rose-950/60 text-rose-300 font-bold px-2.5 py-0.5 rounded-md border border-rose-500/30">
                    {movie.ageRating}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {movie.rating} / 10
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    {totalWatchViews.toLocaleString()} үзэлт
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('watchers')}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2.5 py-0.5 rounded-md border border-purple-500/30 flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                    title="Энэ анимэг үзсэн хэрэглэгчдийг харах"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>{watchersList.length} хүн үзсэн</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  {movie.titleMongolian}
                </h1>

                <p className="text-sm text-zinc-400 font-medium italic">
                  {movie.title}
                </p>

                {/* Genre Badges & Watchers Preview */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="bg-white/[0.04] text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-white/[0.06]"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Watchers Stack Preview */}
                {watchersList.length > 0 && (
                  <div
                    onClick={() => setActiveDetailTab('watchers')}
                    className="flex items-center justify-center sm:justify-start gap-2 pt-1 cursor-pointer group select-none"
                    title="Энэ анимэг үзсэн бүх хэрэглэгчдийг харах"
                  >
                    <div className="flex -space-x-2 overflow-hidden">
                      {watchersList.slice(0, 4).map((w, idx) => (
                        <img
                          key={w.id || idx}
                          src={w.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={w.userName}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-cyan-300 transition-colors">
                      <b className="text-zinc-200">{watchersList[0]?.userName}</b> болон{' '}
                      <b className="text-cyan-400 font-bold">{watchersList.length}</b> хэрэглэгч үзсэн
                      <span className="text-[11px] text-amber-400 ml-1.5 font-bold hover:underline">Бүгдийг харах →</span>
                    </span>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                  <button
                    id="modal-play-now"
                    onClick={() => {
                      if (!currentUser) {
                        if (onOpenAuthModal) onOpenAuthModal('phone');
                        else alert('⚠️ Анимэ үзэхийн тулд эхлээд системд бүртгүүлж эсвэл нэвтэрнэ үү!');
                        return;
                      }
                      if (!userHasAccessToEpisode(1)) {
                        if (onRequestPurchase) {
                          onRequestPurchase(movie);
                        } else {
                          alert('🔒 Анимэ эрхээ аваагүй хэрэглэгчид анимэ үзэх боломжгүй! Та Анимэ багцын эрхээ авна уу.');
                        }
                        return;
                      }
                      console.log('🎬 [MovieDetailModal] onPlay clicked for:', movie.titleMongolian, 'videoUrl:', movie.videoUrl);
                      onPlay(movie, 1);
                    }}
                    className={
                      userHasAccessToEpisode(1)
                        ? "gold-glow-btn text-black font-extrabold text-sm px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer border border-amber-400/50"
                    }
                  >
                    {userHasAccessToEpisode(1) ? (
                      <>
                        <Play className="w-5 h-5 fill-black" />
                        ШУУД ҮЗЭХ
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-black" />
                        ЭРХ АВЧ ҮЗЭХ (ТҮГЖЭЭТЭЙ)
                      </>
                    )}
                  </button>

                  {/* Open in New Protected Window with Passcode Verification */}
                  <button
                    id="modal-open-new-window"
                    onClick={() => {
                      if (!currentUser) {
                        if (onOpenAuthModal) onOpenAuthModal('phone');
                        else alert('⚠️ Анимэ үзэхийн тулд эхлээд системд бүртгүүлж эсвэл нэвтэрнэ үү!');
                        return;
                      }
                      if (!userHasAccessToEpisode(1)) {
                        if (onRequestPurchase) {
                          onRequestPurchase(movie);
                        } else {
                          alert('🔒 Анимэ эрхээ аваагүй хэрэглэгчид үзэх боломжгүй! Та Анимэ багцын эрхээ авна уу.');
                        }
                        return;
                      }
                      handleOpenProtectedWindow(1);
                    }}
                    className="px-4 py-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105"
                    title="Шинэ цонхоор нууц кодоор файл хамгаалалттай үзэх"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Шинэ цонхоор үзэх</span>
                  </button>

                  <button
                    id="modal-fav-toggle"
                    onClick={() => onToggleFavorite(movie.id)}
                    className={`px-4 py-3.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isFavorite
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                    {isFavorite ? 'Хадгалсан' : 'Хадгалах'}
                  </button>

                  <a
                    href="https://www.facebook.com/share/r/17wruEiwvA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>FB Бичлэг 🎬</span>
                  </a>

                  <button
                    id="modal-share"
                    onClick={handleShare}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                    title="Линк хуулах"
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Description & Details */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Киноны агуулга
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {movie.description}
              </p>

              {/* Cast and Director info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">
                    Найруулагч:
                  </span>
                  <span className="text-zinc-200 font-medium">
                    {movie.director}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">
                    Үндсэн жүжигчид:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {movie.cast.map((actor) => (
                      <span
                        key={actor}
                        className="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/60"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Season Switcher for Multi-Season Anime (Legend of Korra) */}
            {(isKorra || isKorraS2) && (
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Бүлгүүд (Seasons):
                  </span>
                  <span className="text-[11px] text-zinc-400">Нийт 2 бүлэг, 26 анги</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isKorraS2 && onSelectMovie && allMovies) {
                        const s1 = allMovies.find((m) => m.id === 'm_legend_of_korra');
                        if (s1) onSelectMovie(s1);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isKorra
                        ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                        : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🌪️</span>
                      <span>1-р Бүлэг: Салхи</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isKorra ? 'bg-black/20 text-black font-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      12 анги
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isKorraS2 && onSelectMovie && allMovies) {
                        const s2 = allMovies.find((m) => m.id === 'm_legend_of_korra_s2');
                        if (s2) onSelectMovie(s2);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isKorraS2
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                        : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>✨</span>
                      <span>2-р Бүлэг: Сүнснүүд</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isKorraS2 ? 'bg-black/20 text-black font-black' : 'bg-zinc-800 text-cyan-400'
                    }`}>
                      14 анги
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Tabs Navigation: Episodes, Watchers, Comments */}
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveDetailTab('episodes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeDetailTab === 'episodes'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black shadow-lg shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Ангиуд ({episodesList?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('watchers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeDetailTab === 'watchers'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Үзсэн хэрэглэгчид ({watchersList.length})</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Шинэ
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('comments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeDetailTab === 'comments'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black shadow-lg shadow-rose-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Сэтгэгдэл ({comments.length})</span>
              </button>
            </div>

            {/* TAB 1: Episode List (For Series / Anime) */}
            {activeDetailTab === 'episodes' && episodesList && episodesList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Ангиудын жагсаалт ({episodesList.length} анги)
                  </h3>
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowBatchLinkForm(!showBatchLinkForm);
                          setShowAddEpForm(false);
                        }}
                        className="flex items-center gap-1 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        title="1-13 ангийн бүх линкийг нэг дор холбох"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        {showBatchLinkForm ? 'Хаах' : '1-13 Линк Бөөнөөр холбох'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddEpForm(!showAddEpForm);
                          setShowBatchLinkForm(false);
                        }}
                        className="flex items-center gap-1 text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                        {showAddEpForm ? 'Хаах' : 'Нэг анги нэмэх'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg select-none">
                      <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Видео холбоос оруулах эрх хамгаалагдсан</span>
                    </div>
                  )}
                </div>

                {/* Access Rule Notification Box */}
                {!currentUser ? (
                  <div className="text-xs bg-rose-950/60 border border-rose-500/40 text-rose-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 font-extrabold text-[10px] border border-rose-500/40 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Бүртгэл шаардлагатай
                      </span>
                      <span className="text-zinc-200 text-[11px]">
                        Бүртгэлгүй болон эрх аваагүй хүмүүс анимэ үзэх боломжгүй. Та нэвтэрч, багцын эрхээ авна уу.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenAuthModal && onOpenAuthModal('phone')}
                        className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[11px] rounded-lg transition-all cursor-pointer shadow"
                      >
                        Утсаар нэвтрэх
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAuthModal && onOpenAuthModal('pc')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg transition-all cursor-pointer shadow"
                      >
                        PC нэвтрэх
                      </button>
                    </div>
                  </div>
                ) : !userHasAccessToEpisode(1) ? (
                  <div className="text-xs bg-zinc-950/90 border border-amber-500/40 text-amber-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/30 shrink-0 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        Эрх шаардлагатай
                      </span>
                      <span className="text-zinc-300 text-[11px] leading-relaxed">
                        Эрх аваагүй хүмүүс анимэ үзэх боломжгүй тул та <b>Анимэ багц</b> эсвэл <b>VIP эрхээ</b> авч үзнэ үү.
                      </span>
                    </div>
                    {onRequestPurchase && (
                      <button
                        type="button"
                        onClick={() => onRequestPurchase(movie)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow flex items-center gap-1.5 shrink-0 hover:scale-105"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>Анимэ багцын эрх авах</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs bg-zinc-950/90 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 shrink-0">
                        Эрхтэй
                      </span>
                      <span className="text-zinc-300 text-[11px] leading-relaxed">
                        Таны анимэ эрх идэвхтэй байна. Бүх ангийг Full HD чанараар үзэх боломжтой.
                      </span>
                    </div>
                  </div>
                )}

                {/* Batch Link Connector Form (1 to 13 Episodes) */}
                {isAdmin && showBatchLinkForm && (
                  <form onSubmit={handleBatchLinkConnect} className="bg-zinc-900 border border-amber-500/50 p-4 rounded-xl space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4 text-amber-400" />
                        1-ээс {batchTotalEpCount} хүртэлх ангиудын линк холбох:
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {movie.titleMongolian} ({movie.title})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Нийт ангийн тоо:</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={batchTotalEpCount}
                          onChange={(e) => setBatchTotalEpCount(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-zinc-400 block mb-1 font-bold">
                          Ангиудын линкүүд (Мөр бүрт 1 линк оруулах эсвэл 1 линк оруулаад бүгдэд оноох):
                        </label>
                        <textarea
                          required
                          rows={5}
                          placeholder={`https://drive.google.com/file/d/1Q6W8jgTtnYJo7E_LQNOJkCUiAtI39Nku/view (1-р анги)\nhttps://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view (2-р анги)\nhttps://drive.google.com/file/d/... (3-р анги)\n...\n(1-13 ангийн линкүүдийг эгнүүлэн наана уу)`}
                          value={batchLinksInput}
                          onChange={(e) => setBatchLinksInput(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-cyan-300 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>1-ээс 13 хүртэлх ангиуд Монгол нэршил, хугацаа болон видео линкээрээ шууд холбогдоно.</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBatchLinksInput(
                              `https://drive.google.com/file/d/1Q6W8jgTtnYJo7E_LQNOJkCUiAtI39Nku/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view\n` +
                              `https://drive.google.com/file/d/1tMnAv3CjTTxjhxEPioE3T2bQjD0pGfkw/view`
                            );
                          }}
                          className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-amber-300 px-2 py-1 rounded cursor-pointer"
                        >
                          Жишээ 13 линк автоматаар бөглөх
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowBatchLinkForm(false)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg cursor-pointer"
                      >
                        Цуцлах
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        1-13 Ангийн Линк Холбож Хадгалах
                      </button>
                    </div>
                  </form>
                )}

                {/* Quick Episode Adder Form */}
                {isAdmin && showAddEpForm && (
                  <form onSubmit={handleSaveNewEpisode} className="bg-zinc-900 border border-cyan-500/50 p-3 rounded-xl space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        Шинэ анги оруулах эсвэл засах:
                      </span>
                      <span className="text-[10px] text-cyan-300 font-semibold">Google Drive / YouTube / FB / MP4</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Ангийн №:</label>
                        <input
                          type="number"
                          value={newEpNum}
                          onChange={(e) => setNewEpNum(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Ангийн нэр:</label>
                        <input
                          type="text"
                          placeholder={`${newEpNum}-р анги`}
                          value={newEpTitle}
                          onChange={(e) => setNewEpTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Бичлэгийн линк (Google Drive / URL):</label>
                        <input
                          type="url"
                          required
                          placeholder="https://drive.google.com/file/d/.../view эсвэл https://youtu.be/..."
                          value={newEpUrl}
                          onChange={(e) => setNewEpUrl(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-cyan-300 p-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Хугацаа:</label>
                        <input
                          type="text"
                          value={newEpDuration}
                          onChange={(e) => setNewEpDuration(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">💡 Зөвлөмж:</span>
                      <span>Google Drive линк оруулахдаа Drive дээр Share -&gt; General access -&gt; <b>"Anyone with the link (Линк авсан хүн бүр)"</b> болгосон байна.</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddEpForm(false)}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg cursor-pointer"
                      >
                        Цуцлах
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-lg cursor-pointer flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Хадгалах & Нэмэх
                      </button>
                    </div>
                  </form>
                )}

                {/* Episode Range / Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedRange('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedRange === 'all'
                          ? 'bg-cyan-500 text-black shadow'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      Бүгд ({episodesList.length})
                    </button>
                    {episodesList.length > 25 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedRange('1-25')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRange === '1-25'
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          1-25
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRange('26-50')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRange === '26-50'
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          26-50
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRange('51-75')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRange === '51-75'
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          51-75
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRange('76-100')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRange === '76-100'
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          76-100
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRange('101-148')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedRange === '101-148'
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          101-148
                        </button>
                      </>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Ангийн № эсвэл нэр хайх..."
                    value={epSearch}
                    onChange={(e) => setEpSearch(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs text-white px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 w-44"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {episodesList
                    .filter((ep) => {
                      if (epSearch.trim()) {
                        const q = epSearch.toLowerCase();
                        return (
                          ep.episodeNumber.toString().includes(q) ||
                          ep.title.toLowerCase().includes(q)
                        );
                      }
                      if (selectedRange === '1-25') return ep.episodeNumber >= 1 && ep.episodeNumber <= 25;
                      if (selectedRange === '26-50') return ep.episodeNumber >= 26 && ep.episodeNumber <= 50;
                      if (selectedRange === '51-75') return ep.episodeNumber >= 51 && ep.episodeNumber <= 75;
                      if (selectedRange === '76-100') return ep.episodeNumber >= 76 && ep.episodeNumber <= 100;
                      if (selectedRange === '101-148') return ep.episodeNumber >= 101 && ep.episodeNumber <= 148;
                      return true;
                    })
                    .map((ep) => {
                      const hasEpAccess = userHasAccessToEpisode(ep.episodeNumber);

                      return (
                        <div
                          key={ep.episodeNumber}
                          className={`relative rounded-xl border transition-all text-left flex flex-col justify-between group overflow-hidden ${
                            hasEpAccess
                              ? 'bg-zinc-900 border-zinc-800 hover:border-cyan-500 hover:bg-zinc-850'
                              : 'bg-gradient-to-br from-zinc-950 to-zinc-900/90 border-amber-500/30 hover:border-amber-500/60 shadow-inner'
                          }`}
                        >
                          <button
                            id={`ep-grid-btn-${ep.episodeNumber}`}
                            onClick={() => handleEpisodeSelect(ep.episodeNumber)}
                            className="p-2.5 w-full text-left cursor-pointer flex-1 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between font-bold text-xs text-zinc-200">
                              <span className={hasEpAccess ? 'group-hover:text-cyan-300' : 'text-zinc-300 group-hover:text-amber-300'}>
                                {ep.episodeNumber}-р анги
                              </span>
                              {hasEpAccess ? (
                                <Play className="w-3.5 h-3.5 fill-current opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>ТҮГЖЭЭТЭЙ</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 truncate mt-1 block">
                              {ep.title}
                            </span>
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-800/60">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {ep.duration}
                              </span>
                              {!currentUser ? (
                                <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> НЭВТРЭХ
                                </span>
                              ) : hasEpAccess ? (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                                  НЭЭЛТТЭЙ
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5 text-amber-400" /> ЭРХЭЭР
                                </span>
                              )}
                            </div>
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewEpNum(ep.episodeNumber);
                                setNewEpTitle(ep.title);
                                setNewEpUrl(ep.videoUrl);
                                setNewEpDuration(ep.duration);
                                setShowAddEpForm(true);
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-cyan-500 hover:text-black text-zinc-400 text-[10px] transition-all cursor-pointer"
                              title="Линк засах"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 2: Watchers & View Analytics */}
            {activeDetailTab === 'watchers' && (
              <div className="space-y-4 pt-2">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Нийт үзэлтийн тоо</span>
                      <span className="text-lg font-black text-white font-mono">
                        {totalWatchViews.toLocaleString()} удаа
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Үзсэн нийт хэрэглэгч</span>
                      <span className="text-lg font-black text-cyan-300 font-mono">
                        {watchersList.length} хүн
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-zinc-400 block font-medium">Сүүлд үзсэн</span>
                      <span className="text-xs font-bold text-emerald-400 truncate block">
                        {watchersList[0]?.userName || 'Хэрэглэгч'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {watchersList[0]?.formattedTime || 'Сүүлд'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and search */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-white/[0.06]">
                  <input
                    type="text"
                    placeholder="Хэрэглэгчийн нэр, утсаар хайх..."
                    value={watcherSearch}
                    onChange={(e) => setWatcherSearch(e.target.value)}
                    className="w-full bg-zinc-900 text-xs text-white placeholder-zinc-500 rounded-lg px-3 py-2 border border-zinc-800 focus:outline-none focus:border-amber-400"
                  />
                  {watcherSearch && (
                    <button
                      onClick={() => setWatcherSearch('')}
                      className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-lg cursor-pointer shrink-0"
                    >
                      Цэвэрлэх
                    </button>
                  )}
                </div>

                {/* List of watchers */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {watchersList
                    .filter((w) => {
                      if (!watcherSearch.trim()) return true;
                      const q = watcherSearch.toLowerCase();
                      return (
                        w.userName.toLowerCase().includes(q) ||
                        (w.userPhone && w.userPhone.toLowerCase().includes(q))
                      );
                    })
                    .map((watcher, idx) => (
                      <div
                        key={watcher.id || idx}
                        className="p-3 bg-zinc-900/80 hover:bg-zinc-850 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={watcher.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                            alt={watcher.userName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-zinc-200 truncate">
                                {watcher.userName}
                              </span>
                              {watcher.userRole === 'admin' ? (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-black shrink-0">
                                  АДМИН
                                </span>
                              ) : watcher.packageType === 'full_vip' ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                                  VIP ЭРХТЭЙ
                                </span>
                              ) : watcher.packageType === 'anime' ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                                  АНИМЭ БАГЦТАЙ
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                                  Энгийн хэрэглэгч
                                </span>
                              )}
                            </div>
                            {watcher.userPhone && (
                              <span className="text-[10px] text-zinc-500 font-mono block">
                                Утас: {watcher.userPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-0.5">
                            {watcher.episodeNumber}-р анги үзсэн
                          </span>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{watcher.formattedTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 3: User Rating & Comments Section */}
            {activeDetailTab === 'comments' && (
              <div className="space-y-4 pt-2">
                {/* User Rating Section */}
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <div className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Энэ кинонд үнэлгээ өгөх:</span>
                    {userRating && (
                      <span className="text-amber-400 font-mono font-bold">
                        Таны үнэлгээ: {userRating}/10
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                      <button
                        key={score}
                        id={`rate-star-${score}`}
                        onClick={() => setUserRating(score)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          userRating && userRating >= score
                            ? 'bg-amber-500 text-black border-amber-400'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Сэтгэгдэл ({comments.length})
                  </h3>

                  {/* Add comment box */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      id="new-comment-input"
                      type="text"
                      placeholder="Сэтгэгдэл бичих..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 border border-zinc-700/80 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      id="submit-comment"
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Илгээх
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex gap-3 text-xs"
                      >
                        <img
                          src={comment.avatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200">
                              {comment.userName}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {comment.date}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Passcode Security Verification Prompt for Protected Window */}
      <PasscodePromptModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSuccess={() => {
          setShowPasscodeModal(false);
          openWindowDirect(pendingWindowEp);
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

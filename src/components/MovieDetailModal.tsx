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
  ShieldAlert
} from 'lucide-react';
import { Movie, Comment } from '../types';
import { SAMPLE_COMMENTS } from '../data/movies';
import { getEmbedUrl } from '../lib/videoUtils';
import { UserAccount } from './AuthModal';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie, episodeNumber?: number) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: boolean;
  isPurchased?: boolean;
  onUpdateEpisodes?: (movieId: string, episodes: any[]) => void;
  currentUser?: UserAccount | null;
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
}) => {
  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  const [comments, setComments] = useState<Comment[]>(() => 
    SAMPLE_COMMENTS.filter((c) => (movie && c.movieId === movie.id) || c.movieId === 'm1')
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Episode state management
  const [episodesList, setEpisodesList] = useState<Movie['episodes']>(movie?.episodes || []);
  const [showAddEpForm, setShowAddEpForm] = useState(false);
  const [newEpNum, setNewEpNum] = useState<number>((movie?.episodes?.length || 0) + 1);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpUrl, setNewEpUrl] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('24 мин');
  const [epSearch, setEpSearch] = useState('');
  const [selectedRange, setSelectedRange] = useState<string>('all');

  useEffect(() => {
    if (movie) {
      setEpisodesList(movie.episodes || []);
      setNewEpNum((movie.episodes?.length || 0) + 1);
      setComments(SAMPLE_COMMENTS.filter((c) => c.movieId === movie.id || c.movieId === 'm1'));
      setEpSearch('');
      setSelectedRange('all');
    }
  }, [movie]);

  if (!movie) return null;

  const handleSaveNewEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('⚠️ Хориглогдсон: Видео болон ангийн линк оруулах эрх зөвхөн сайтын эзэмшигч Тамир админд бий!');
      return;
    }
    if (!newEpUrl.trim()) return;

    const title = newEpTitle.trim() || `${newEpNum}-р анги`;
    const newEp = {
      episodeNumber: Number(newEpNum),
      title,
      duration: newEpDuration.trim() || '24 мин',
      videoUrl: newEpUrl.trim()
    };

    const updated = [...episodesList.filter(ep => ep.episodeNumber !== Number(newEpNum)), newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
    setEpisodesList(updated);
    if (onUpdateEpisodes) {
      onUpdateEpisodes(movie.id, updated);
    }

    setShowAddEpForm(false);
    setNewEpTitle('');
    setNewEpUrl('');
    setNewEpNum(updated.length + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // Check if non-admin tries to post a URL/link in comments
    const containsUrl = /(https?:\/\/|www\.|youtu\.be|drive\.google\.com|\.mp4|\.m3u8)/i.test(newCommentText);
    if (containsUrl && !isAdmin) {
      alert('⚠️ Хориглогдсон: Сэтгэгдэл дээр видео болон вэб холбоос оруулахыг хориглосон! Видео болон ангийн линк оруулах эрх зөвхөн сайтын эзэмшигч Тамир админд бий.');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#17171a] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 max-h-[92vh] flex flex-col my-auto">
        {/* Close Button */}
        <button
          id="close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-zinc-700 backdrop-blur transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/80">
          {/* Top Hero Banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-zinc-950">
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
                <img
                  src={movie.backdrop || movie.poster}
                  alt={movie.titleMongolian}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17171a] via-[#17171a]/50 to-transparent" />

                {/* Big Direct Play Button on Backdrop */}
                <button
                  id="preview-play-backdrop-button"
                  onClick={() => onPlay(movie, 1)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center shadow-2xl hover:scale-115 active:scale-95 transition-all cursor-pointer group z-10"
                  title="Шууд үзэх"
                >
                  <Play className="w-8 h-8 fill-black ml-1 group-hover:scale-110 transition-transform" />
                </button>

                {movie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setShowTrailer(true)}
                    className="absolute bottom-4 right-4 z-10 bg-black/70 hover:bg-black text-zinc-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Трейлер үзэх</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Core Info Section */}
          <div className="p-4 sm:p-6 space-y-6 -mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Poster Image */}
              <img
                src={movie.poster}
                alt={movie.titleMongolian}
                className="w-36 sm:w-48 aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-zinc-700/80 shrink-0 mx-auto sm:mx-0"
              />

              {/* Title & Metadata */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="bg-cyan-500 text-black font-extrabold px-2.5 py-0.5 rounded">
                    {movie.type === 'anime' ? 'ANIME' : movie.type === 'series' ? 'TV SERIES' : 'MOVIE'}
                  </span>
                  <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded shadow flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    ШУУД ҮЗЭХ
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 font-bold px-2.5 py-0.5 rounded border border-zinc-700">
                    {movie.year}
                  </span>
                  <span className="bg-rose-950 text-rose-300 font-bold px-2.5 py-0.5 rounded border border-rose-800">
                    {movie.ageRating}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {movie.rating} / 10
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {movie.titleMongolian}
                </h1>

                <p className="text-sm text-zinc-400 font-medium italic">
                  {movie.title}
                </p>

                {/* Genre Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="bg-zinc-800 text-cyan-300 text-xs px-2.5 py-1 rounded-lg border border-zinc-700/80"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                  <button
                    id="modal-play-now"
                    onClick={() => {
                      console.log('🎬 [MovieDetailModal] onPlay clicked for:', movie.titleMongolian, 'videoUrl:', movie.videoUrl);
                      onPlay(movie);
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    ШУУД ҮЗЭХ
                  </button>

                  <button
                    id="modal-fav-toggle"
                    onClick={() => onToggleFavorite(movie.id)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isFavorite
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                    {isFavorite ? 'Хадгалсан' : 'Хадгалах'}
                  </button>

                  <a
                    href="https://www.facebook.com/share/r/17wruEiwvA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>FB Бичлэг 🎬</span>
                  </a>

                  <button
                    id="modal-share"
                    onClick={handleShare}
                    className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
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

            {/* Episode List (For Series / Anime) */}
            {episodesList && episodesList.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Ангиудын жагсаалт ({episodesList.length})
                  </h3>
                  {isAdmin ? (
                    <button
                      onClick={() => setShowAddEpForm(!showAddEpForm)}
                      className="flex items-center gap-1 text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                      {showAddEpForm ? 'Хаах' : 'Анги оруулах'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg select-none">
                      <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Видео холбоос оруулах эрх хамгаалагдсан</span>
                    </div>
                  )}
                </div>

                {/* Quick Episode Adder Form */}
                {showAddEpForm && (
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
                    .map((ep) => (
                      <div
                        key={ep.episodeNumber}
                        className="relative rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:bg-zinc-850 transition-all text-left flex flex-col justify-between group overflow-hidden"
                      >
                        <button
                          id={`ep-grid-btn-${ep.episodeNumber}`}
                          onClick={() => {
                            console.log(`🎬 [MovieDetailModal] Episode clicked: ${ep.episodeNumber}-р анги ("${ep.title}") for "${movie.titleMongolian}", URL: ${ep.videoUrl || movie.videoUrl}`);
                            onPlay(movie, ep.episodeNumber);
                          }}
                          className="p-2.5 w-full text-left cursor-pointer flex-1 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between font-bold text-xs text-zinc-200 group-hover:text-cyan-300">
                            <span>{ep.episodeNumber}-р анги</span>
                            <Play className="w-3.5 h-3.5 fill-current opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                          </div>
                          <span className="text-[10px] text-zinc-400 truncate mt-1 block">
                            {ep.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            {ep.duration}
                          </span>
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
                    ))}
                </div>
              </div>
            )}

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
        </div>
      </div>
    </div>
  );
};

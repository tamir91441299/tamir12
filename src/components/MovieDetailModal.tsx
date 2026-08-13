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
  if (!movie) return null;

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  const [comments, setComments] = useState<Comment[]>(
    SAMPLE_COMMENTS.filter((c) => c.movieId === movie.id || c.movieId === 'm1')
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Episode state management
  const [episodesList, setEpisodesList] = useState(movie.episodes || []);
  const [showAddEpForm, setShowAddEpForm] = useState(false);
  const [newEpNum, setNewEpNum] = useState<number>(episodesList.length + 1);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpUrl, setNewEpUrl] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('24 мин');

  useEffect(() => {
    if (movie) {
      setEpisodesList(movie.episodes || []);
      setNewEpNum((movie.episodes?.length || 0) + 1);
    }
  }, [movie]);

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

                {/* Big Trailer Button on Backdrop */}
                <button
                  id="preview-trailer-button"
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                  title="Трейлер үзэх"
                >
                  <Play className="w-8 h-8 fill-black ml-1" />
                </button>
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
                    {movie.type === 'series' ? 'TV SERIES' : 'MOVIE'}
                  </span>
                  {isPurchased ? (
                    <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded shadow">
                      ИДЭВХТЭЙ ✓
                    </span>
                  ) : movie.type === 'anime' ? (
                    <span className="bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded shadow">
                      АНИМЭ БАГЦ (4,000 ₮)
                    </span>
                  ) : (
                    <span className="bg-cyan-500 text-black font-extrabold px-2.5 py-0.5 rounded shadow">
                      КИНО БАГЦ (4,000 ₮)
                    </span>
                  )}
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
                    onClick={() => onPlay(movie)}
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
                      <span className="text-[10px] text-zinc-400">YouTube / FB / Embed link</span>
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
                          placeholder={`${newEpNum}-р анги - Тоглолт`}
                          value={newEpTitle}
                          onChange={(e) => setNewEpTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Бичлэгийн линк (URL):</label>
                        <input
                          type="url"
                          required
                          placeholder="https://youtu.be/... эсвэл https://www.facebook.com/..."
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {episodesList.map((ep) => (
                    <button
                      key={ep.episodeNumber}
                      id={`ep-grid-btn-${ep.episodeNumber}`}
                      onClick={() => onPlay(movie, ep.episodeNumber)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:bg-zinc-800 transition-all text-left flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-zinc-200 group-hover:text-cyan-300">
                        <span>{ep.episodeNumber}-р анги</span>
                        <Play className="w-3.5 h-3.5 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate mt-1">
                        {ep.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {ep.duration}
                      </span>
                    </button>
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

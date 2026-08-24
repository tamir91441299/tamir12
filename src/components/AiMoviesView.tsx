import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Bot, 
  Cpu, 
  Film, 
  Send, 
  RefreshCw, 
  Play, 
  Heart, 
  Gamepad2, 
  Flame, 
  Lightbulb, 
  Layers, 
  Zap,
  Compass,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { Movie } from '../types';
import { AnimeGuesser } from './AnimeGuesser';

interface AiMoviesViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleFavorite?: (movieId: string) => void;
  isFavorite?: (movieId: string) => boolean;
}

export const AiMoviesView: React.FC<AiMoviesViewProps> = ({
  movies,
  onSelectMovie,
  onPlayMovie,
  onToggleFavorite,
  isFavorite,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'assistant' | 'generator' | 'game'>('catalog');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  // AI Assistant Chat state
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    'Сайн байна уу! Би FlickNime AI Кино хөтөч байна. Танд хиймэл оюун ухаан (AI), сайберпанк, шинжлэх ухааны уран зөгнөлт (Sci-Fi) болон бүх төрлийн шилдэг кинонуудыг санал болгож тусалъя. Та ямар сэдэвтэй кино үзмээр байна вэ?'
  );

  // AI Movie Generator state
  const [genGenre, setGenGenre] = useState('Sci-Fi AI');
  const [genTheme, setGenTheme] = useState('Ирээдүйн дэлхий ба Роботууд');
  const [genPlot, setGenPlot] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  // Filter movies related to AI / Sci-Fi / Cyberpunk / Future
  const aiMovies = useMemo(() => {
    return movies.filter((m) => {
      const isAiRelated =
        m.genres.includes('AI Кино') ||
        m.genres.includes('Sci-Fi') ||
        m.genres.some((g) => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('ai')) ||
        m.description.toLowerCase().includes('хиймэл оюун') ||
        m.description.toLowerCase().includes('робот') ||
        m.description.toLowerCase().includes('сайбер') ||
        m.description.toLowerCase().includes('ирээдүй') ||
        m.title.toLowerCase().includes('creator') ||
        m.title.toLowerCase().includes('matrix') ||
        m.title.toLowerCase().includes('cyberpunk') ||
        m.title.toLowerCase().includes('megalo') ||
        m.title.toLowerCase().includes('machina') ||
        m.title.toLowerCase().includes('dune');

      if (!isAiRelated) return false;

      if (selectedTag === 'all') return true;
      if (selectedTag === 'cyberpunk') {
        return m.title.toLowerCase().includes('cyberpunk') || m.description.toLowerCase().includes('сайбер');
      }
      if (selectedTag === 'robot') {
        return m.description.toLowerCase().includes('хиймэл оюун') || m.description.toLowerCase().includes('робот') || m.title.toLowerCase().includes('machina') || m.title.toLowerCase().includes('creator');
      }
      if (selectedTag === 'scifi') {
        return m.genres.includes('Sci-Fi') || m.title.toLowerCase().includes('dune') || m.title.toLowerCase().includes('matrix');
      }
      if (selectedTag === 'anime') {
        return m.type === 'anime' || m.genres.includes('Animation');
      }

      return true;
    });
  }, [movies, selectedTag]);

  const presetPrompts = [
    '🤖 Хиймэл оюун ухаан ба роботын тухай шилдэг кинонуудыг санал болгооч',
    '⚡ Найт Сити шиг сайберпанк, ирээдүйн ертөнцтэй анимэ',
    '🌌 Матрикс болон Дюн шиг гүн гүнзгий философитой Sci-Fi бүтээл',
    '🎬 2025/2026 онд гарсан өндөр үнэлгээтэй шинжлэх ухааны уран зөгнөлт кинонууд',
    '🧠 Хүний ухамсар ба технологийн мөргөлдөөнийг харуулсан сэтгэл зүйн кино',
  ];

  const handleSendAiRequest = async (userPrompt: string) => {
    if (!userPrompt.trim() || loading) return;
    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          currentMovies: movies,
        }),
      });

      const data = await res.json();
      if (data.recommendation) {
        setAiResponse(data.recommendation);
      } else {
        setAiResponse('AI туслахаас хариу ирсэнгүй. Та дахин оролдоно уу.');
      }
    } catch (err) {
      console.error(err);
      setAiResponse('Уучлаарай, сүлжээний холболтонд саатал гарлаа. Та дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMoviePlot = async () => {
    setGenLoading(true);
    setGenPlot(null);

    try {
      const prompt = `Чи бол дэлхийн шилдэг кино зохиолч юм. "${genGenre}" төрлийн, "${genTheme}" сэдэвтэй монгол хэл дээр цоо шинэ, сэтгэл сэрдхийлгэм, гэнэтийн эргэлттэй киноны төсөл/зохиолын санааг дараах бүтцээр зохиож өгнө үү:
1. 🎬 Киноны сонирхолтой нэр (Монгол ба Англи)
2. 📖 Үйл явдлын товч утга (Logline & Synopsis)
3. 👤 Гол дүрүүд (AI туслах, эсрэг дүр, гол баатар)
4. 💥 Оргил хэсэг ба гэнэтийн эргэлт (Plot twist)
5. ⭐ Киноны гол сургамж, философи`;

      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentMovies: [],
        }),
      });

      const data = await res.json();
      if (data.recommendation) {
        setGenPlot(data.recommendation);
      } else {
        setGenPlot('Зохиол үүсгэхэд алдаа гарлаа. Та дахин оролдоно уу.');
      }
    } catch (e) {
      console.error(e);
      setGenPlot('Уучлаарай, холболтын алдаа гарлаа.');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* AI Cinema Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#121214] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Cpu className="w-9 h-9 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-black border border-cyan-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>FLICKNIME AI CINEMA HUB</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                AI КИНО & УРАН ЗӨГНӨЛТ САН
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
                Хиймэл оюун ухаан, сайберпанк, ирээдүйн ертөнц, роботууд болон шинжлэх ухааны уран зөгнөлт шилдэг бүтээлүүд, AI кино зөвлөх туслах ба зохиол бүтээгч.
              </p>
            </div>
          </div>

          {/* Sub Navigation Modes */}
          <div className="flex flex-wrap items-center bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 shrink-0 w-full lg:w-auto shadow-inner">
            <button
              id="ai-tab-catalog-btn"
              onClick={() => setActiveSubTab('catalog')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeSubTab === 'catalog'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>AI Кинонууд ({aiMovies.length})</span>
            </button>

            <button
              id="ai-tab-assistant-btn"
              onClick={() => setActiveSubTab('assistant')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeSubTab === 'assistant'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Зөвлөх</span>
            </button>

            <button
              id="ai-tab-generator-btn"
              onClick={() => setActiveSubTab('generator')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeSubTab === 'generator'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Зохиол Үүсгэгч</span>
            </button>

            <button
              id="ai-tab-game-btn"
              onClick={() => setActiveSubTab('game')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeSubTab === 'game'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>AI Тоглоом</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. CATALOG SUB-TAB: Browse AI & Sci-Fi Movies */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'Бүх AI & Уран Зөгнөлт' },
              { id: 'robot', label: '🤖 Робот & Хиймэл Оюун (AI)' },
              { id: 'cyberpunk', label: '⚡ Сайберпанк & Ирээдүй' },
              { id: 'scifi', label: '🌌 Сансар & Sci-Fi' },
              { id: 'anime', label: '🎌 AI Анимэ' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedTag === tag.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* AI Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {aiMovies.map((movie) => (
              <div
                key={movie.id}
                className="group relative bg-[#17171a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-cyan-500/60 transition-all duration-300 flex flex-col shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
              >
                {/* Poster & Badges */}
                <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
                  <img
                    src={movie.poster}
                    alt={movie.titleMongolian}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* AI Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI КИНО
                    </span>
                    {movie.isNewEpisode && (
                      <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        ШИНЭ
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-amber-400 text-xs font-black px-2 py-0.5 rounded-lg border border-amber-400/30 flex items-center gap-1">
                    ★ {movie.rating}
                  </div>

                  {/* Quick Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => onPlayMovie(movie)}
                      className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
                      title="Шууд үзэх"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => onSelectMovie(movie)}
                      className="font-bold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
                      title={movie.titleMongolian}
                    >
                      {movie.titleMongolian}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {movie.title} ({movie.year})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                    <span className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-mono border border-zinc-800">
                      {movie.duration}
                    </span>
                    <button
                      onClick={() => onSelectMovie(movie)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                    >
                      Дэлгэрэнгүй
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {aiMovies.length === 0 && (
            <div className="text-center py-16 bg-[#17171a] rounded-2xl border border-zinc-800">
              <Cpu className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">Сонгосон төрөлд тохирох AI кино олдсонгүй.</p>
              <button
                onClick={() => setSelectedTag('all')}
                className="mt-3 text-xs bg-cyan-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-cyan-400 transition-all cursor-pointer"
              >
                Бүх AI кинонуудыг харах
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. ASSISTANT SUB-TAB: AI Movie Advisor Chat */}
      {activeSubTab === 'assistant' && (
        <div className="bg-[#17171a] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <Bot className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">AI Кино Зөвлөх Туслах</h2>
              <p className="text-xs text-zinc-400">Сэтгэл санаа, жанр эсвэл сонирхлоо бичээд тохирох киноны зөвлөгөө аваарай.</p>
            </div>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptText(p);
                  handleSendAiRequest(p);
                }}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-800 transition-all cursor-pointer text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Response Area */}
          <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 min-h-[140px] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="font-bold text-xs text-cyan-400 uppercase tracking-wider">
                FlickNime AI Туслах:
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>AI танд зориулсан шилдэг кинонуудыг хайж боловсруулж байна...</span>
                </div>
              ) : (
                <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-2xl border border-zinc-700 focus-within:border-cyan-500 transition-all">
            <input
              type="text"
              placeholder="Жишээ: 2025 оны шилдэг Sci-Fi тулаант кино санал болгооч..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendAiRequest(promptText);
                }
              }}
              className="flex-1 bg-transparent px-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendAiRequest(promptText)}
              disabled={loading || !promptText.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Асуух</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. GENERATOR SUB-TAB: AI Movie Idea Studio */}
      {activeSubTab === 'generator' && (
        <div className="bg-[#17171a] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">AI Кино Зохиол & Төсөл Үүсгэгч</h2>
              <p className="text-xs text-zinc-400">Gemini AI ашиглан өөрийн хүссэн төрлийн шинэ киноны зохиолын санаа, дүрүүд болон эргэлтийг бүтээгээрэй.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Киноны Жанр</label>
              <select
                value={genGenre}
                onChange={(e) => setGenGenre(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Sci-Fi AI">🤖 Sci-Fi & Хиймэл Оюун Ухаан</option>
                <option value="Cyberpunk Action">⚡ Сайберпанк Тулаант</option>
                <option value="Space Exploration Thriller">🌌 Сансрын Аялал & Триллер</option>
                <option value="Futuristic Mystery">🔍 Ирээдүйн Нууцлаг Мөрдлөг</option>
                <option value="Time Travel Fantasy">⏳ Цаг Хугацааны Аялал</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Гол сэдэв & Дүрүүдийн онцлог</label>
              <input
                type="text"
                value={genTheme}
                onChange={(e) => setGenTheme(e.target.value)}
                placeholder="Жишээ: Монгол эрдэмтэн AI туслахын хамт дэлхийг аврах..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateMoviePlot}
            disabled={genLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black py-3 rounded-2xl shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
          >
            {genLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI шинэ киноны зохиолыг боловсруулж байна...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>КИНО ЗОХИОЛ ҮҮСГЭХ (GENERATE MOVIE)</span>
              </>
            )}
          </button>

          {genPlot && (
            <div className="bg-zinc-900/90 border border-purple-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Үүсгэсэн Кино Төсөл:</span>
              </div>
              <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                {genPlot}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. GAME SUB-TAB: Anime & Movie Quiz */}
      {activeSubTab === 'game' && (
        <div className="bg-[#17171a] border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <AnimeGuesser defaultMode="character" />
        </div>
      )}
    </div>
  );
};

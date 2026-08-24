import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, RefreshCw, Play, Film, MessageSquare, Flame, Lightbulb, Compass, Gamepad2, Swords, Trophy } from 'lucide-react';
import { Movie } from '../types';
import { AnimeGuesser } from './AnimeGuesser';
import { VibeFighterGame } from './VibeFighterGame';

interface AiAssistantViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  initialSubTab?: 'ai' | 'game' | 'vibe_fighter';
  initialGameMode?: 'character' | 'title';
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  movies,
  onSelectMovie,
  onPlayMovie,
  initialSubTab = 'ai',
  initialGameMode = 'character',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'game' | 'vibe_fighter'>(initialSubTab);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    'Сайн байна уу! Би FlickNime-ийн AI Кино ба Анимэ туслах байна. Та өнөөдөр ямар төрлийн кино эсвэл анимэ үзмээр байна вэ? Би таны сэтгэл санаа, сонирхолд тохируулан хамгийн шилдэг бүтээлийг санал болгож чадна.'
  );

  const presetPrompts = [
    '🔥 Хамгийн их үзэлттэй, сонирхолтой анимэ санал болгооч',
    '🎬 Гэр бүлээрээ үзэхэд тохиромжтой хөгжилтэй кино',
    '🧠 Гэнэтийн эргэлттэй, нууцлаг триллер эсвэл аймшгийн кино',
    '🇲🇳 Монгол дуу оруулгатай уран сайхны шилдэг кинонууд',
    '⚽ Блу Лок (Blue Lock) шиг спортын тулаант анимэ',
    '🍿 Ажлын дараа сэтгэл сэргээх хөнгөн комеди кино',
  ];

  const handleSendAiRequest = async (userPrompt: string) => {
    if (!userPrompt.trim() || loading) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          currentMovies: movies,
        }),
      });

      const data = await res.json();
      if (data.recommendation) {
        setAiResponse(data.recommendation);
      } else {
        setAiResponse('AI системээс хариу ирсэнгүй. Та асуултаа ахин тодруулж асууна уу.');
      }
    } catch (err) {
      console.error(err);
      setAiResponse(
        'Уучлаарай, сүлжээний холболтонд саатал гарлаа. Та дахин оролдож эсвэл манай кино сангаас шүүлтүүр ашиглан сонгоно уу.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Title with Sub-tab Navigation */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-purple-950/80 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-cyan-400 to-purple-600 text-black flex items-center justify-center font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="w-8 h-8 text-black animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-black border border-cyan-500/30 mb-1">
                <Bot className="w-3.5 h-3.5" />
                <span>FLICKNIME AI САНАЛ БОЛГОГЧ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI Кино Туслах & Тоглоом
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                Юу үзэхээ AI-аас асууж зөвлөгөө аваарай. Мөн анимэ дүр болон эможиноос кино таах тоглоом тоглоод дээд оноогоо Firestore-д хадгалаарай!
              </p>
            </div>
          </div>

          {/* Sub-tab buttons */}
          <div className="flex items-center bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 shrink-0 w-full md:w-auto gap-1">
            <button
              id="ai-subtab-vibe-fighter"
              onClick={() => setActiveSubTab('vibe_fighter')}
              className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'vibe_fighter'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Swords className="w-4 h-4 text-rose-300" />
              <span>🥊 VIBE FIGHTER</span>
            </button>
            <button
              id="ai-subtab-game"
              onClick={() => setActiveSubTab('game')}
              className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'game'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-purple-300" />
              <span>🎭 Анимэ Таавар</span>
            </button>
            <button
              id="ai-subtab-recommender"
              onClick={() => setActiveSubTab('ai')}
              className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'ai'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>🤖 AI Зөвлөх</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View based on Active Sub-Tab */}
      {activeSubTab === 'vibe_fighter' ? (
        <VibeFighterGame
          onSwitchToGuessingGame={() => setActiveSubTab('game')}
        />
      ) : activeSubTab === 'game' ? (
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold text-xs">🎮 Бусад тоглоомууд:</span>
              <button
                onClick={() => setActiveSubTab('vibe_fighter')}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-black px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>🥊 Vibe Fighter тоглох</span>
              </button>
            </div>
          </div>
          <AnimeGuesser defaultMode={initialGameMode === 'title' ? 'title' : 'character'} />
        </div>
      ) : (
        /* AI Assistant View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Chat & Presets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preset Prompts Box */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Бэлэн асуултууд / Санал болгох сэдвүүд:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetPrompts.map((preset, i) => (
                  <button
                    key={i}
                    id={`ai-page-preset-${i}`}
                    onClick={() => {
                      setPromptText(preset);
                      handleSendAiRequest(preset);
                    }}
                    disabled={loading}
                    className="text-left bg-zinc-950/80 hover:bg-cyan-950/50 border border-zinc-800 hover:border-cyan-500/50 p-3 rounded-xl text-xs font-semibold text-zinc-200 hover:text-cyan-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between group"
                  >
                    <span className="line-clamp-2">{preset}</span>
                    <Send className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Box */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[260px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>AI ТУСЛАХЫН ХАРИУ</span>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI бодож байна...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 py-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                    <p className="text-xs text-zinc-400 font-medium">Кино санг шүүж, санал болгох киног бэлдэж байна...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-2xl text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                    {aiResponse}
                  </div>
                ) : null}
              </div>

              {/* Prompt Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiRequest(promptText);
                }}
                className="flex items-center gap-2 pt-2 border-t border-zinc-800"
              >
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Жишээ нь: Төгсгөлд нь гэнэтийн бэлэгтэй, хурц тулаант анимэ санал болгооч..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !promptText.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black px-5 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  <span>Илгээх</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Col: Popular Showcase Items */}
          <div className="space-y-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Сүүлийн үеийн эрэлттэй бүтээлүүд</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {movies.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="bg-zinc-950/80 border border-zinc-800 hover:border-cyan-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all group"
                  >
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-14 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-cyan-300">
                        {m.titleMongolian}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">{m.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-amber-400 font-semibold mt-1">
                        <span>★ {m.rating}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">{m.year}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onPlayMovie(m)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Үзэх</span>
                        </button>
                        <button
                          onClick={() => onSelectMovie(m)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] px-2.5 py-1 rounded-lg transition-all"
                        >
                          Дэлгэрэнгүй
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


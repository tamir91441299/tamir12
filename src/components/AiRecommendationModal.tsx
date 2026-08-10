import React, { useState } from 'react';
import { Sparkles, Send, Bot, RefreshCw, X, Play, Film } from 'lucide-react';
import { Movie } from '../types';

interface AiRecommendationModalProps {
  movies: Movie[];
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export const AiRecommendationModal: React.FC<AiRecommendationModalProps> = ({
  movies,
  onClose,
  onSelectMovie,
}) => {
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const presetPrompts = [
    'Найзуудаараа үзэх хөгжилтэй, сонирхолтой кино санал болгооч',
    'Demon Slayer, Solo Leveling зэрэг эрэлттэй анимэ кино санал болгооч',
    'Сэтгэл сэрдхийлгэм, нууцлаг триллер эсвэл аймшгийн кино',
    'Эх орны сэдэвтэй, зориг чангийг харуулсан монгол кино',
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
        setAiResponse('AI системээс хариу ирсэнгүй. Та дахин оролдоно уу.');
      }
    } catch (err) {
      console.error(err);
      setAiResponse(
        'Уучлаарай, сүлжээний холболтонд саатал гарлаа. Манай кино сангаас шүүлтүүр ашиглан сонгоно уу.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#17171a] border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl text-zinc-100 flex flex-col space-y-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-cyan-500 text-black flex items-center justify-center font-bold shadow-lg">
              <Sparkles className="w-6 h-6 text-black animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                IOIO AI Кино Санал Болгогч
              </h2>
              <p className="text-xs text-zinc-400">
                Ямар кино үзмээр байгаагаа өөрийн үгээр бичнэ үү (Gemini AI)
              </p>
            </div>
          </div>

          <button
            id="close-ai-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
            Түгээмэл асуултууд:
          </label>
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((preset, i) => (
              <button
                key={i}
                id={`preset-prompt-${i}`}
                onClick={() => {
                  setPromptText(preset);
                  handleSendAiRequest(preset);
                }}
                className="text-xs bg-zinc-900/90 hover:bg-cyan-950/80 text-zinc-300 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-cyan-800 transition-all text-left cursor-pointer"
              >
                ✨ {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative flex items-center">
          <textarea
            id="ai-prompt-textarea"
            rows={2}
            placeholder="Жишээ нь: Надад сэтгэл санаа сэргээх, 2025 оны романтик солонгос цуврал санал болгооч..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl p-3 pr-12 border border-zinc-700/80 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
          />
          <button
            id="send-ai-prompt"
            onClick={() => handleSendAiRequest(promptText)}
            disabled={loading || !promptText.trim()}
            className="absolute right-3 p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold transition-all cursor-pointer shadow-md"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* AI Output Result Box */}
        <div className="flex-1 overflow-y-auto bg-zinc-900/90 p-4 rounded-xl border border-zinc-800/80 min-h-[160px] text-sm text-zinc-200 leading-relaxed space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-cyan-400">
              <Bot className="w-10 h-10 animate-bounce" />
              <p className="text-xs font-bold animate-pulse">
                IOIO AI кино санг шүүж, тан дээр зөвлөгөө бэлдэж байна...
              </p>
            </div>
          ) : aiResponse ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase border-b border-zinc-800 pb-2">
                <Sparkles className="w-4 h-4" />
                AI Туслахын санал болгож буй зөвлөмж:
              </div>
              <p className="whitespace-pre-line text-zinc-300 font-medium text-sm">
                {aiResponse}
              </p>

              {/* Quick Suggestion Movie Cards */}
              <div className="pt-3 border-t border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase block mb-2">
                  Таны хайлтанд тохирох кинонууд:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {movies.slice(0, 3).map((m) => (
                    <button
                      key={m.id}
                      id={`ai-suggest-movie-${m.id}`}
                      onClick={() => {
                        onSelectMovie(m);
                        onClose();
                      }}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl flex items-center gap-2 text-left border border-zinc-700/60 transition-all cursor-pointer group"
                    >
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-10 h-14 object-cover rounded shadow"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-zinc-100 group-hover:text-cyan-300 truncate">
                          {m.titleMongolian}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          ★ {m.rating} • {m.year}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-8 space-y-2">
              <Bot className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-xs font-semibold">
                Дээрх товчнуудаас сонгох эсвэл өөрийн сонирхож буй киноны төрөл,
                сэтгэл санааны байдлаа бичээрэй!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

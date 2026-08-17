import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal, Sparkles, RefreshCw, User, Calendar, CheckCircle2, XCircle, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchTopScores, ScoreRecord } from '../lib/scoreService';

interface LeaderboardModalProps {
  onClose: () => void;
  currentGameMode?: 'character' | 'title';
}

export function LeaderboardModal({ onClose, currentGameMode }: LeaderboardModalProps) {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'character' | 'title'>(currentGameMode || 'all');
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await fetchTopScores(50);
    setScores(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const filteredScores = scores.filter((s) => {
    if (filterMode === 'all') return true;
    return s.gameMode === filterMode;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-sm border border-amber-500/40 shadow-lg shadow-amber-500/20">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 text-slate-300 font-black text-sm border border-slate-400/40">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-black text-sm border border-amber-700/40">
          🥉 3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-bold text-xs">
        #{rank}
      </span>
    );
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Онооны Жагсаалт</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                  Firestore
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Тоглогчдын шилдэг амжилтууд болон хариултууд</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLeaderboard}
              disabled={loading}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Шинэчлэх"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-zinc-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Бүх горим ({scores.length})
            </button>
            <button
              onClick={() => setFilterMode('character')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === 'character'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎭 Дүр Таах
            </button>
            <button
              onClick={() => setFilterMode('title')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === 'title'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎬 Нэр Таах
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-medium hidden sm:block">
            Нийт {filteredScores.length} амжилт
          </div>
        </div>

        {/* Score List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">Firestore-оос оноонуудыг ачаалж байна...</p>
            </div>
          ) : filteredScores.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-zinc-950/40 rounded-2xl border border-zinc-800/80">
              <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Одоогоор оноо бүртгэгдээгүй байна</p>
              <p className="text-xs text-zinc-500">Тоглоомоо дуусгаад эхний оноогоо Firestore-д хадгалаарай!</p>
            </div>
          ) : (
            filteredScores.map((item, index) => {
              const rank = index + 1;
              const isExpanded = expandedScoreId === item.id;

              return (
                <div
                  key={`score_${item.id || 'rec'}_${index}`}
                  className="bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedScoreId(isExpanded ? null : item.id || null)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/50 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getRankBadge(rank)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white truncate max-w-[160px] sm:max-w-[220px]">
                            {item.playerName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.gameMode === 'character'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                                : 'bg-pink-950/80 text-pink-300 border-pink-500/30'
                            }`}
                          >
                            {item.gameMode === 'character' ? '🎭 Дүр' : '🎬 Нэр'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {item.correctCount} зөв
                          </span>
                          {item.createdAt && (
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-zinc-400 font-semibold">Оноо</div>
                        <div className="text-xl font-black text-amber-400">{item.score}</div>
                      </div>

                      {item.answers && item.answers.length > 0 && (
                        <div className="text-zinc-500 hover:text-zinc-300">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Answer History */}
                  {isExpanded && item.answers && item.answers.length > 0 && (
                    <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/80 space-y-2 text-xs">
                      <div className="font-bold text-zinc-400 text-[11px] uppercase tracking-wider mb-2">
                        Тоглогчийн хариултуудын түүх:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {item.answers.map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                              ans.isCorrect
                                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                                : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {ans.isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              )}
                              <span className="font-semibold text-white truncate">
                                Асуулт #{ans.questionId}: {ans.questionAnswer}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold shrink-0 ml-2">
                              {ans.selectedOption ? `Сонгосон: ${ans.selectedOption}` : 'Хугацаа дууссан'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Хамгийн их оноотой тоглогчид эхэнд харагдана</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}

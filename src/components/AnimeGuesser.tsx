import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Heart, Clock, Trophy, RotateCcw, Sparkles, CheckCircle2, XCircle, UserCheck, Film, Save, User, Check, ListOrdered } from 'lucide-react';
import localGameData from '../data/data.json';
import localCharacterData from '../data/character_data.json';
import { saveScoreToFirestore, AnswerHistory } from '../lib/scoreService';
import { LeaderboardModal } from './LeaderboardModal';

interface QuestionItem {
  id: number;
  emojies?: string;
  emoji?: string;
  answer: string;
  options: string | string[];
  image?: string;
  meta?: {
    mode?: string;
    point?: number;
  };
}

export function AnimeGuesser({ defaultMode = 'character' }: { defaultMode?: 'character' | 'title' }) {
  const [activeGameMode, setActiveGameMode] = useState<'character' | 'title'>(defaultMode);

  useEffect(() => {
    setActiveGameMode(defaultMode);
  }, [defaultMode]);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameState, setGameState] = useState<'playing' | 'answered' | 'gameover'>('playing');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Firestore score saving states
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('ioio_anime_guesser_player_name') || '';
    } catch {
      return '';
    }
  });
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);
  const [savingScore, setSavingScore] = useState<boolean>(false);
  const [scoreSaved, setScoreSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('ioio_anime_guesser_highscore') || '0');
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);


  // Load question data based on mode
  useEffect(() => {
    const loadQuestions = async () => {
      const endpoint = activeGameMode === 'character' ? '/character_data.json' : '/data.json';
      const fallback = activeGameMode === 'character' ? localCharacterData : localGameData;

      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(shuffleArray(data));
            return;
          }
        }
      } catch (e) {
        console.warn(`Fetching ${endpoint} failed, using fallback data:`, e);
      }
      setQuestions(shuffleArray(fallback as QuestionItem[]));
    };

    loadQuestions();
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(15);
    setGameState('playing');
    setSelectedOption(null);
    setIsCorrect(null);
    setImgError(false);
    setAnswerHistory([]);
    setScoreSaved(false);
    setSaveError(null);
  }, [activeGameMode]);

  function shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const currentQ = questions[currentIndex];

  // Helper to record answer history
  const recordAnswerHistory = (selectedOpt: string | null, correct: boolean) => {
    if (!currentQ) return;
    setAnswerHistory((prev) => [
      ...prev,
      {
        questionId: currentQ.id || currentIndex + 1,
        questionAnswer: currentQ.answer,
        selectedOption: selectedOpt || 'Хугацаа дууссан',
        isCorrect: correct,
      },
    ]);
  };

  // Helper to parse options into array of 4 distinct strings
  const parsedOptions = React.useMemo(() => {
    if (!currentQ) return [];
    let opts: string[] = [];

    if (Array.isArray(currentQ.options)) {
      opts = currentQ.options.map((o) => o.trim());
    } else if (typeof currentQ.options === 'string') {
      const raw = currentQ.options.trim();
      if (raw.includes('|')) {
        opts = raw.split('|').map((s) => s.trim());
      } else if (raw.startsWith('[') && raw.endsWith(']')) {
        const clean = raw.slice(1, -1).trim();
        // Try splitting by common separators or spaces if multiple titles
        opts = clean.split(/[,|]/).map((s) => s.trim());
        if (opts.length <= 1) {
          opts = clean.split(/\s+/).map((s) => s.trim());
        }
      } else {
        opts = raw.split(',').map((s) => s.trim());
      }
    }

    const cleanAnswer = currentQ.answer.trim();
    // Ensure answer is present in options
    if (!opts.some((o) => o.toLowerCase() === cleanAnswer.toLowerCase())) {
      opts.unshift(cleanAnswer);
    }

    // Filter out empties and duplicates
    const uniqueOpts = Array.from(new Set(opts)).filter(Boolean);

    // If less than 4 options, pad with generic fallbacks
    const fallbackList =
      activeGameMode === 'character'
        ? [
            'Hisoka',
            'Roronoa Zoro',
            'Jotaro Kujo',
            'Sakuragi Hanamichi',
            'Satoru Gojo',
            'Levi Ackerman',
            'Son Goku',
            'Monkey D. Luffy',
            'Naruto Uzumaki',
            'Light Yagami',
          ]
        : [
            'Death Note',
            'Slam Dunk',
            'Hunter x Hunter',
            'Demon Slayer',
            'One Piece',
            'One Punch Man',
            'Naruto',
            'Attack on Titan',
            'Dr. STONE',
            'Dragon Ball Z',
            'Assassination Classroom',
            'Haikyuu!!',
          ];

    for (const item of fallbackList) {
      if (uniqueOpts.length >= 4) break;
      if (!uniqueOpts.some((o) => o.toLowerCase() === item.toLowerCase())) {
        uniqueOpts.push(item);
      }
    }

    return uniqueOpts.slice(0, 4);
  }, [currentQ]);

  // Timer Countdown Effect
  useEffect(() => {
    if (gameState !== 'playing' || !currentQ) return;

    setTimeLeft(15);
    setImgError(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameState, currentQ]);

  // Handle Timeout (time expired)
  const handleTimeout = () => {
    setGameState('answered');
    setSelectedOption(null);
    setIsCorrect(false);
    recordAnswerHistory(null, false);

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setTimeout(() => {
        setGameState('gameover');
      }, 1500);
    }
  };

  // Handle User Answer Click
  const handleSelectOption = (option: string) => {
    if (gameState !== 'playing') return;

    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(option);
    const cleanAnswer = currentQ.answer.trim().toLowerCase();
    const cleanSelected = option.trim().toLowerCase();
    const correct = cleanSelected === cleanAnswer;

    setIsCorrect(correct);
    setGameState('answered');
    recordAnswerHistory(option, correct);

    if (correct) {
      const newScore = score + 15;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('ioio_anime_guesser_highscore', String(newScore));
        } catch {
          // ignore localStorage error
        }
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => {
          setGameState('gameover');
        }, 1500);
      }
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (lives <= 0) {
      setGameState('gameover');
      return;
    }
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setGameState('playing');
      setSelectedOption(null);
      setIsCorrect(null);
      setImgError(false);
    } else {
      // Re-shuffle or show game completed
      setGameState('gameover');
    }
  };

  // Save score to Firestore
  const handleSaveToFirestore = async () => {
    if (!playerName.trim()) {
      setSaveError('Тоглогчийн нэрийг оруулна уу!');
      return;
    }
    setSavingScore(true);
    setSaveError(null);
    try {
      try {
        localStorage.setItem('ioio_anime_guesser_player_name', playerName.trim());
      } catch {
        // ignore
      }

      await saveScoreToFirestore({
        playerName: playerName.trim(),
        score,
        gameMode: activeGameMode,
        totalQuestions: questions.length,
        correctCount: answerHistory.filter((a) => a.isCorrect).length,
        answers: answerHistory,
      });

      setScoreSaved(true);
    } catch (e) {
      console.error(e);
      setSaveError('Оноо хадгалахад алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setSavingScore(false);
    }
  };

  // Restart game
  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuestions(shuffleArray(questions.length ? questions : localGameData));
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(15);
    setGameState('playing');
    setSelectedOption(null);
    setIsCorrect(null);
    setImgError(false);
    setAnswerHistory([]);
    setScoreSaved(false);
    setSaveError(null);
  };

  const getEmojiDisplay = () => {
    if (!currentQ) return '';
    return currentQ.emojies || currentQ.emoji || '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white">
            <Gamepad2 className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🎮 Анимэ Эможи Таавар</span>
            </h1>
            <p className="text-xs text-rose-400 font-semibold tracking-wide uppercase mt-0.5">
              {activeGameMode === 'character' ? '🎭 Анимэ Дүрүүд (10 Асуулт)' : '🎬 Анимэ Нэрс (13 Асуулт)'} — 3 Амь, 15s Таймер
            </p>
          </div>
        </div>

        {/* Highscore & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Mode Switcher Buttons */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveGameMode('character')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeGameMode === 'character'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Дүр Таах (10)</span>
            </button>

            <button
              onClick={() => setActiveGameMode('title')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeGameMode === 'title'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Анимэ Нэр (13)</span>
            </button>
          </div>

          {/* Leaderboard Button */}
          <button
            id="open-leaderboard-btn"
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
            title="Онооны жагсаалт харах"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Онооны Жагсаалт</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Дээд амжилт</div>
              <div className="text-lg font-black text-amber-400 leading-tight">{highScore} оноо</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveGameMode('character')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
            activeGameMode === 'character'
              ? 'bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-zinc-900 border-purple-500 shadow-lg shadow-purple-950/50 ring-2 ring-purple-500/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎭</span>
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                1. Анимэ Дүр Таах
              </h3>
              {activeGameMode === 'character' && (
                <span className="bg-purple-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  ТОГЛОЖ БУЙ
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200/80">
              Хисока, Зоро, Жотаро, Гожо, Леви, Гоку, Луффи, Наруто гэх мэт 10 анимений дүрийг эможиноос таана
            </p>
          </div>
          <UserCheck className={`w-6 h-6 shrink-0 ${activeGameMode === 'character' ? 'text-purple-400' : 'text-zinc-600'}`} />
        </button>

        <button
          onClick={() => setActiveGameMode('title')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
            activeGameMode === 'title'
              ? 'bg-gradient-to-r from-pink-900/80 via-purple-900/60 to-zinc-900 border-pink-500 shadow-lg shadow-pink-950/50 ring-2 ring-pink-500/50'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                2. Анимэ Нэр Таах
              </h3>
              {activeGameMode === 'title' && (
                <span className="bg-pink-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  ТОГЛОЖ БУЙ
                </span>
              )}
            </div>
            <p className="text-xs text-pink-200/80">
              Slam Dunk, Death Note, Hunter x Hunter, One Piece зэрэг 13+ цувралын нэрийг эможиноос таана
            </p>
          </div>
          <Film className={`w-6 h-6 shrink-0 ${activeGameMode === 'title' ? 'text-pink-400' : 'text-zinc-600'}`} />
        </button>
      </div>

      {/* GAME OVER VIEW */}
      {gameState === 'gameover' ? (
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-500/5 blur-3xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-rose-500 to-amber-500 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-rose-500/30">
            {score >= 60 ? '🏆' : score >= 30 ? '🎯' : '💀'}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">ТОГЛООМ ДУУСЛАА!</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              {score >= 60
                ? 'Гайхалтай! Та анимегийн жинхөнэ мастер байна!'
                : score >= 30
                ? 'Сайн тоглолоо! Анимегийн мэдлэг тань арвин байна.'
                : 'Дахин оролдож дээд амжилтаа ахиулаарай!'}
            </p>
          </div>

          {/* Score details */}
          <div className="inline-flex items-center gap-6 bg-zinc-800/80 border border-zinc-700/80 px-8 py-4 rounded-2xl shadow-inner">
            <div>
              <div className="text-xs text-zinc-400 font-bold uppercase">Цуглуулсан оноо</div>
              <div className="text-3xl font-black text-cyan-400">{score} ₮ / оноо</div>
            </div>
            <div className="h-8 w-px bg-zinc-700" />
            <div>
              <div className="text-xs text-zinc-400 font-bold uppercase">Дээд оноо</div>
              <div className="text-3xl font-black text-amber-400">{highScore}</div>
            </div>
          </div>

          {/* Firestore Score Submission Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 max-w-md mx-auto space-y-4 text-left shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Save className="w-4 h-4" />
              <span>Firestore мэдээллийн санд оноо хадгалах</span>
            </div>

            {scoreSaved ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                  <Check className="w-5 h-5 bg-emerald-500 text-black rounded-full p-0.5" />
                  <span>Оноо Firestore-д амжилттай хадгалагдлаа!</span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  Тоглогч <b>{playerName}</b> — {score} оноо, {answerHistory.filter((a) => a.isCorrect).length} зөв хариулттай
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Тоглогчийн нэр:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Та нэрээ оруулна уу..."
                      maxLength={24}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {saveError && <p className="text-xs text-rose-400 font-bold">{saveError}</p>}

                <button
                  id="save-score-to-firestore-btn"
                  onClick={handleSaveToFirestore}
                  disabled={savingScore}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black py-2.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingScore ? (
                    <span>Хадгалж байна...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Оноо хадгалах</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              id="open-leaderboard-modal-btn"
              onClick={() => setShowLeaderboard(true)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>Бүх Тоглогчдын Онооны Жагсаалт Харах</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="game-restart-btn"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Дахин тоглох</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 pt-2">Зургийн эх сурвалж: Wikipedia</p>
        </div>
      ) : (
        /* ACTIVE GAME PLAY VIEW */
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          {/* ALWAYS VISIBLE HUD (Оноо, Амь, Хугацаа) */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl text-center">
            {/* HUD: Score */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Оноо
              </span>
              <span className="text-2xl font-black text-white">{score}</span>
            </div>

            {/* HUD: Lives (3 lives) */}
            <div className="flex flex-col items-center justify-center border-x border-zinc-800 px-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500" /> Амь
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-5 h-5 transition-all ${
                      heartIndex <= lives
                        ? 'text-rose-500 fill-rose-500 scale-110'
                        : 'text-zinc-700 fill-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HUD: Timer (15s) */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Хугацаа
              </span>
              <span
                className={`text-2xl font-black ${
                  timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Animated Progress Timer Bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>

          {/* QUESTION EMOJI CARD (Цэвэрхэн Асуултын карт) */}
          <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-inner">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Асуулт {currentIndex + 1} / {questions.length}
            </div>

            {/* Big Emoji Display */}
            <div className="text-5xl sm:text-7xl py-3 font-normal tracking-widest selection:bg-purple-500/30 drop-shadow-md">
              {getEmojiDisplay()}
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              {activeGameMode === 'character'
                ? 'Дээрх эможи ямар анимегийн дүрийг илэрхийлж байна вэ?'
                : 'Дээрх эможи ямар анимег илэрхийлж байна вэ?'}
            </p>
          </div>

          {/* 4 MULTIPLE CHOICE OPTIONS (ДЭЭР ба ДООР 2 эгнээгээр хуваасан хариултын сонголтууд) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-bold px-1">
              <span className="flex items-center gap-1.5 text-purple-300">
                <span>🎯</span> Сонголтууд (Дээр / Доор):
              </span>
              <span className="text-[11px] text-zinc-500">
                {gameState === 'playing' ? 'Нэг хариулт сонгоно уу' : 'Хариулсан'}
              </span>
            </div>

            {/* ДЭЭД ЭГНЭЭ (Дээр: А ба Б сонголт) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Дээд эгнээ (А, Б):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedOptions.slice(0, 2).map((option, idx) => {
                  const letter = idx === 0 ? 'А' : 'Б';
                  const cleanAnswer = currentQ?.answer.trim().toLowerCase();
                  const cleanOpt = option.trim().toLowerCase();
                  const isThisAnswer = cleanOpt === cleanAnswer;
                  const isSelected = selectedOption?.trim().toLowerCase() === cleanOpt;

                  let btnStyle =
                    'bg-zinc-800/90 hover:bg-zinc-700/90 border-zinc-700/80 text-zinc-100 hover:border-purple-500/60 shadow-md';
                  let badgeStyle = 'bg-zinc-950 border-zinc-700 text-purple-300';

                  if (gameState === 'answered') {
                    if (isThisAnswer) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-600/30 scale-[1.02]';
                      badgeStyle = 'bg-emerald-800 border-emerald-300 text-white';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-600 border-rose-400 text-white font-bold opacity-90';
                      badgeStyle = 'bg-rose-800 border-rose-300 text-white';
                    } else {
                      btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-40 cursor-not-allowed';
                      badgeStyle = 'bg-zinc-950 border-zinc-800 text-zinc-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`option-btn-${idx}`}
                      disabled={gameState !== 'playing'}
                      onClick={() => handleSelectOption(option)}
                      className={`p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className="font-bold text-sm tracking-wide text-left truncate">{option}</span>
                      </div>

                      {gameState === 'answered' && isThisAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
                      )}
                      {gameState === 'answered' && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-white flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ДООД ЭГНЭЭ (Доор: В ба Г сонголт) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                Доод эгнээ (В, Г):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedOptions.slice(2, 4).map((option, subIdx) => {
                  const idx = subIdx + 2;
                  const letter = idx === 2 ? 'В' : 'Г';
                  const cleanAnswer = currentQ?.answer.trim().toLowerCase();
                  const cleanOpt = option.trim().toLowerCase();
                  const isThisAnswer = cleanOpt === cleanAnswer;
                  const isSelected = selectedOption?.trim().toLowerCase() === cleanOpt;

                  let btnStyle =
                    'bg-zinc-800/90 hover:bg-zinc-700/90 border-zinc-700/80 text-zinc-100 hover:border-pink-500/60 shadow-md';
                  let badgeStyle = 'bg-zinc-950 border-zinc-700 text-pink-300';

                  if (gameState === 'answered') {
                    if (isThisAnswer) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-600/30 scale-[1.02]';
                      badgeStyle = 'bg-emerald-800 border-emerald-300 text-white';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-600 border-rose-400 text-white font-bold opacity-90';
                      badgeStyle = 'bg-rose-800 border-rose-300 text-white';
                    } else {
                      btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-40 cursor-not-allowed';
                      badgeStyle = 'bg-zinc-950 border-zinc-800 text-zinc-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`option-btn-${idx}`}
                      disabled={gameState !== 'playing'}
                      onClick={() => handleSelectOption(option)}
                      className={`p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className="font-bold text-sm tracking-wide text-left truncate">{option}</span>
                      </div>

                      {gameState === 'answered' && isThisAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
                      )}
                      {gameState === 'answered' && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-white flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM ANSWER REVEAL & RESULT CARD (Доор гарах хариулт, зураг ба үр дүн) */}
          {gameState === 'answered' && (
            <div className="mt-6 bg-gradient-to-br from-purple-950/90 via-zinc-900 to-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span className="text-xs sm:text-sm font-black text-purple-300 uppercase tracking-wider">
                    Хариултын Үр Дүн & Мэдээлэл (Доор)
                  </span>
                </div>
                <span
                  className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-md flex items-center gap-1.5 ${
                    isCorrect
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                      : 'bg-rose-950 text-rose-300 border-rose-500/60'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Зөв хариуллаа (+15 оноо)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Буруу хариуллаа</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {currentQ?.image && !imgError ? (
                    <img
                      src={currentQ.image}
                      alt={currentQ.answer}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl border-2 border-purple-400/80 shadow-xl shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-purple-900/70 border border-purple-500/60 flex flex-col items-center justify-center text-center shrink-0 shadow-lg">
                      <span className="text-3xl">🎭</span>
                      <span className="text-[10px] text-purple-300 font-bold mt-1">{getEmojiDisplay()}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[11px] text-purple-300 font-bold uppercase tracking-wider">
                      ЗӨВ ХАРИУЛТ:
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {currentQ?.answer}
                    </div>
                    <p className="text-xs text-zinc-300">
                      Эможи илэрхийлэл: <span className="text-white font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{getEmojiDisplay()}</span>
                    </p>
                  </div>
                </div>

                {lives > 0 && (
                  <button
                    id="next-question-bottom-btn"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span>Дараагийн Асуулт</span>
                    <span>➔</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer note as explicitly requested */}
          <div className="text-center pt-4 border-t border-zinc-800/60">
            <p className="text-[11px] text-zinc-500">Зургийн эх сурвалж: Wikipedia</p>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <LeaderboardModal
          currentGameMode={activeGameMode}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

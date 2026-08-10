import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Heart, Clock, Trophy, RotateCcw, Sparkles, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import localGameData from '../data/data.json';

interface QuestionItem {
  id: number;
  emojies?: string;
  emoji?: string;
  answer: string;
  options: string | string[];
  image?: string;
}

export function AnimeGuesser() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameState, setGameState] = useState<'playing' | 'answered' | 'gameover'>('playing');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('ioio_anime_guesser_highscore') || '0');
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load question data
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch('/data.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(shuffleArray(data));
            return;
          }
        }
      } catch (e) {
        console.warn('Fetching /data.json failed, using fallback data:', e);
      }
      setQuestions(shuffleArray(localGameData));
    };
    loadQuestions();
  }, []);

  function shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const currentQ = questions[currentIndex];

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

    // If less than 4 options, pad with generic fallback titles
    const fallbackTitles = [
      "Death Note", "Slam Dunk", "Hunter x Hunter", "Demon Slayer",
      "One Piece", "One Punch Man", "Naruto", "Attack on Titan",
      "Dr. STONE", "Dragon Ball Z", "Assassination Classroom", "Haikyuu!!"
    ];

    for (const title of fallbackTitles) {
      if (uniqueOpts.length >= 4) break;
      if (!uniqueOpts.some((o) => o.toLowerCase() === title.toLowerCase())) {
        uniqueOpts.push(title);
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
      setQuestions(shuffleArray(questions));
      setCurrentIndex(0);
      setGameState('playing');
      setSelectedOption(null);
      setIsCorrect(null);
      setImgError(false);
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
  };

  const getEmojiDisplay = () => {
    if (!currentQ) return '';
    return currentQ.emojies || currentQ.emoji || '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white">
            <Gamepad2 className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🎮 Миний тоглоомууд</span>
            </h1>
            <p className="text-xs text-rose-400 font-semibold tracking-wide uppercase mt-0.5">
              Anime Guesser — Emoji таавар тоглоом
            </p>
          </div>
        </div>

        {/* Highscore Badge */}
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Дээд амжилт</div>
            <div className="text-lg font-black text-amber-400 leading-tight">{highScore} оноо</div>
          </div>
        </div>
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

          <div>
            <button
              id="game-restart-btn"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Дахин тоглох</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 pt-4">Зургийн эх сурвалж: Wikipedia</p>
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

          {/* QUESTION EMOJI CARD */}
          <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-purple-500/30 rounded-2xl p-8 text-center relative overflow-hidden shadow-inner">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Асуулт {currentIndex + 1} / {questions.length}
            </div>

            {/* Big Emoji Display */}
            <div className="text-4xl sm:text-6xl py-4 font-normal tracking-widest selection:bg-purple-500/30 drop-shadow-md">
              {getEmojiDisplay()}
            </div>

            <p className="text-xs text-zinc-400 font-medium">
              Дээрх эможи ямар анимег илэрхийлж байна вэ?
            </p>

            {/* IMAGE REVEAL (Rendered when question is answered - both correct or incorrect) */}
            {currentQ?.image && !imgError && gameState === 'answered' && (
              <div className="mt-4 transition-all duration-500 animate-fadeIn flex flex-col items-center">
                <img
                  src={currentQ.image}
                  alt={currentQ.answer}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="max-h-[220px] w-auto mx-auto object-contain rounded-xl border-2 border-purple-500/60 shadow-xl shadow-purple-950/50"
                />
                <span className="text-xs text-purple-300 font-bold mt-2 bg-purple-950/80 border border-purple-800/80 px-3 py-1 rounded-full shadow-sm">
                  🎬 {currentQ.answer}
                </span>
              </div>
            )}
          </div>

          {/* FEEDBACK STATUS BANNER */}
          {gameState === 'answered' && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-4 border ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {isCorrect ? 'Зөв таалаа! (+15 оноо)' : 'Буруу хариуллаа!'}
                  </div>
                  <div className="text-xs opacity-80">
                    Зөв хариулт: <span className="font-black underline">{currentQ?.answer}</span>
                  </div>
                </div>
              </div>

              {lives > 0 && (
                <button
                  id="next-question-btn"
                  onClick={handleNextQuestion}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow border border-zinc-700 cursor-pointer"
                >
                  Дараагийнх ➔
                </button>
              )}
            </div>
          )}

          {/* 4 MULTIPLE CHOICE OPTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {parsedOptions.map((option, idx) => {
              const cleanAnswer = currentQ?.answer.trim().toLowerCase();
              const cleanOpt = option.trim().toLowerCase();
              const isThisAnswer = cleanOpt === cleanAnswer;
              const isSelected = selectedOption?.trim().toLowerCase() === cleanOpt;

              let btnStyle =
                'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:border-purple-500/50';

              if (gameState === 'answered') {
                if (isThisAnswer) {
                  btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-600/30';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-600 border-rose-400 text-white font-bold opacity-80';
                } else {
                  btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={idx}
                  id={`option-btn-${idx}`}
                  disabled={gameState !== 'playing'}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 rounded-2xl border text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span className="truncate pr-2">{option}</span>
                  {gameState === 'answered' && isThisAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                  {gameState === 'answered' && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note as explicitly requested */}
          <div className="text-center pt-4 border-t border-zinc-800/60">
            <p className="text-[11px] text-zinc-500">Зургийн эх сурвалж: Wikipedia</p>
          </div>
        </div>
      )}
    </div>
  );
}

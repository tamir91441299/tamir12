import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  Settings,
  Languages,
  Subtitles,
  ListVideo,
  Check,
  Sparkles,
  Radio,
  Wifi,
  Activity,
  Gauge,
  Tv,
  Layers,
  RotateCcw,
  Zap,
  ExternalLink,
  HelpCircle,
  FolderLock,
  Bug,
  Terminal,
  Copy,
  RotateCw,
  Lock
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { UserAccount } from './AuthModal';
import {
  getEmbedUrl,
  extractGoogleDriveId,
  getDirectPlaybackStream,
  isDirectPlayableMedia,
  extractYouTubeId,
  isExternalEmbedMedia
} from '../lib/videoUtils';
import { getMovieSeasons, getEpisodeSeason, SeasonInfo } from '../lib/seasonUtils';

interface VideoPlayerModalProps {
  movie: Movie | null;
  initialEpisodeNumber?: number;
  isPurchased?: boolean;
  onClose: () => void;
  onRequestPurchase?: (movie: Movie) => void;
  currentUser?: UserAccount | null;
  isMonthlyVip?: boolean;
  isAnimePackage?: boolean;
  isMoviePackage?: boolean;
}

type ServerMode = 'server1' | 'server2' | 'server3' | 'server4' | 'embed';

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  initialEpisodeNumber = 1,
  isPurchased = false,
  onClose,
  onRequestPurchase,
  currentUser,
  isMonthlyVip = false,
  isAnimePackage = false,
  isMoviePackage = false,
}) => {
  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(() =>
    movie?.episodes && initialEpisodeNumber && initialEpisodeNumber > 0
      ? Math.max(0, initialEpisodeNumber - 1)
      : 0
  );

  // Access rule: Episode 1 is completely FREE. Episodes 2+ require purchased movie or active package.
  const checkEpisodeAccess = (epIndex: number): boolean => {
    if (epIndex <= 0) return true; // 1-р анги үнэгүй
    if (isAdmin) return true;
    if (isMonthlyVip || (currentUser as any)?.packageType === 'full_vip') return true;
    if (movie?.type === 'anime' && (isAnimePackage || (currentUser as any)?.packageType === 'anime')) {
      return true;
    }
    if (movie?.type !== 'anime' && (isMoviePackage || (currentUser as any)?.packageType === 'movie')) {
      return true;
    }
    if (isPurchased) return true;
    return false;
  };

  const hasAccessToCurrentEpisode = checkEpisodeAccess(currentEpisodeIndex);

  useEffect(() => {
    if (initialEpisodeNumber && initialEpisodeNumber > 0) {
      setCurrentEpisodeIndex(Math.max(0, initialEpisodeNumber - 1));
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [initialEpisodeNumber]);

  const episodes = movie?.episodes || [];
  const currentEpisode: Episode | undefined = episodes[currentEpisodeIndex];

  // Raw source from movie or episode
  const rawVideoSrc =
    currentEpisode?.videoUrl ||
    movie?.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const isYouTube = !!extractYouTubeId(rawVideoSrc);
  const googleDriveId = extractGoogleDriveId(rawVideoSrc);
  const isGoogleDrive = !!googleDriveId;
  const isDirectMedia = isDirectPlayableMedia(rawVideoSrc);
  const isExternalEmbed = isExternalEmbedMedia(rawVideoSrc);

  // Default mode: use embed mode for Google Drive/YouTube so video plays reliably without CORS/proxy blocks
  const [serverMode, setServerMode] = useState<ServerMode>(() => {
    return isExternalEmbedMedia(rawVideoSrc) ? 'embed' : 'server1';
  });

  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [showDriveGuide, setShowDriveGuide] = useState<boolean>(false);
  const [drawerSearch, setDrawerSearch] = useState<string>('');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | 'all'>('all');
  const failoverAttemptsRef = useRef<number>(0);

  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [videoElementState, setVideoElementState] = useState<{
    readyState?: number;
    networkState?: number;
    paused?: boolean;
    error?: string | null;
  }>({});

  const appendDebugLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${msg}`;
    console.log(`🎬 [FlickNime Debug]`, msg);
    setDebugLogs((prev) => [formatted, ...prev.slice(0, 49)]);
  }, []);

  const isEmbed = serverMode === 'embed';
  const iframeUrl = getEmbedUrl(rawVideoSrc, 'standard');
  const epNum = currentEpisode?.episodeNumber || currentEpisodeIndex + 1;
  const videoSrcToPlay =
    serverMode === 'embed'
      ? ''
      : getDirectPlaybackStream(rawVideoSrc, epNum, serverMode);

  // Debug initial loading
  useEffect(() => {
    appendDebugLog(`Ачаалласан кино: "${movie?.titleMongolian}" (${movie?.type})`);
    appendDebugLog(`Сонгосон анги: ${currentEpisode ? currentEpisode.title : 'Кино (1-р анги)'}`);
    appendDebugLog(`Эх холбоос (Raw URL): ${rawVideoSrc}`);
    appendDebugLog(`Google Drive ID: ${googleDriveId || 'Байхгүй'}`);
    appendDebugLog(`YouTube ID: ${extractYouTubeId(rawVideoSrc) || 'Байхгүй'}`);
    appendDebugLog(`Тоглуулах горим (Server Mode): ${serverMode}`);
    if (serverMode === 'embed') {
      appendDebugLog(`Iframe Embed URL: ${iframeUrl}`);
    } else {
      appendDebugLog(`Direct Video Stream URL: ${videoSrcToPlay}`);
    }
  }, [movie, currentEpisodeIndex, serverMode, rawVideoSrc, iframeUrl, videoSrcToPlay, appendDebugLog]);

  // Sync server mode when video source changes
  useEffect(() => {
    failoverAttemptsRef.current = 0;
    if (isExternalEmbed) {
      appendDebugLog(`Автомат Embed горим идэвхжлээ (Google Drive / YouTube илэрсэн).`);
      setServerMode('embed');
    } else if (serverMode === 'embed' && !isExternalEmbed) {
      appendDebugLog(`Автомат Direct горим руу шилжлээ.`);
      setServerMode('server1');
    }
  }, [rawVideoSrc, isExternalEmbed, appendDebugLog]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioBoosted, setIsAudioBoosted] = useState(false);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(movie?.audioTracks?.[0] || 'Монгол дуу оруулга');
  const [selectedSub, setSelectedSub] = useState(movie?.subtitles?.[0] || 'Монгол хадмал');
  const [selectedQuality, setSelectedQuality] = useState('1080p HD');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Play video safely with audio / autoplay / error handling without cascading loops
  const playVideoSafe = useCallback(async () => {
    const video = videoRef.current;
    if (!video || isEmbed) return;

    if (!video.src || video.src === '' || video.src === window.location.href) {
      return;
    }

    video.playbackRate = playbackSpeed;

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsBuffering(false);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      // Autoplay blocked with audio, retry in muted state
      try {
        video.muted = true;
        setIsMuted(true);
        setShowUnmuteBanner(true);
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setIsBuffering(false);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setIsPlaying(false);
        setIsBuffering(false);
      }
    }
  }, [playbackSpeed, isEmbed]);

  // Server switch handler
  const handleServerChange = (mode: ServerMode) => {
    failoverAttemptsRef.current = 0;
    setServerMode(mode);
    setIsPlaying(true);
    setIsBuffering(true);

    if (mode !== 'embed') {
      setTimeout(() => {
        playVideoSafe();
      }, 100);
    }
  };

  // Trigger play on source or episode change
  useEffect(() => {
    if (!isEmbed && videoRef.current) {
      playVideoSafe();
    }
  }, [videoSrcToPlay, currentEpisodeIndex, isEmbed, playVideoSafe]);

  // Playback speed
  const handlePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Play / Pause toggle with immediate user gesture execution
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || !isPlaying) {
      if (showUnmuteBanner) {
        video.muted = false;
        setIsMuted(false);
        setShowUnmuteBanner(false);
      }
      video.playbackRate = playbackSpeed;
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            // Autoplay blocked by browser policy, try muted
            video.muted = true;
            setIsMuted(true);
            setShowUnmuteBanner(true);
            video.play().then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }).catch(() => {
              setIsPlaying(false);
              setIsBuffering(false);
            });
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setShowUnmuteBanner(false);
      if (videoRef.current.paused) {
        playVideoSafe();
      }
    }
  };

  // Time & progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
      setIsBuffering(false);
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = Math.min(1, val);
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
      if (val > 0) setShowUnmuteBanner(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
      if (nextMute) setShowUnmuteBanner(false);
    }
  };

  // Fullscreen listeners & keyboard shortcuts
  useEffect(() => {
    const handleFSChange = () => {
      const doc: any = document;
      const isFS = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (videoRef.current) {
          const nextV = Math.min(1, volume + 0.1);
          setVolume(nextV);
          videoRef.current.volume = nextV;
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (videoRef.current) {
          const nextV = Math.max(0, volume - 0.1);
          setVolume(nextV);
          videoRef.current.volume = nextV;
          if (nextV === 0) {
            videoRef.current.muted = true;
            setIsMuted(true);
          }
        }
      } else if (e.key === 'Escape') {
        const doc: any = document;
        if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
      document.removeEventListener('MSFullscreenChange', handleFSChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, isPlaying, isMuted, volume, togglePlay]);

  // Cross-browser Fullscreen
  const toggleFullscreen = async () => {
    try {
      const doc: any = document;
      const targetElem: any = playerContainerRef.current || videoRef.current;

      const isFS = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isFS) {
        if (targetElem?.requestFullscreen) {
          await targetElem.requestFullscreen();
        } else if (targetElem?.webkitRequestFullscreen) {
          await targetElem.webkitRequestFullscreen();
        } else if (targetElem?.mozRequestFullScreen) {
          await targetElem.mozRequestFullScreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen handler:', err);
      setIsFullscreen(!isFullscreen);
    }
  };

  // Switch Episode
  const selectEpisode = (index: number) => {
    if (index >= 0 && index < episodes.length) {
      setCurrentEpisodeIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  // Format Time Helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="p-3 sm:p-4 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between z-20 text-white gap-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-xs px-2.5 py-1 rounded-md shrink-0 shadow-md">
            {movie.type === 'series' ? 'ЦУВРАЛ' : movie.type === 'anime' ? 'АНИМЭ' : 'КИНО'}
          </span>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm sm:text-base text-white leading-tight truncate flex items-center gap-2">
              <span>{movie.titleMongolian}</span>
              <span className="text-xs text-zinc-400 font-normal hidden md:inline">({movie.year})</span>
            </h2>
            {currentEpisode ? (
              <p className="text-xs text-cyan-400 font-semibold truncate flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 shrink-0" />
                {(() => {
                  const seasonsList = getMovieSeasons(movie, episodes);
                  const epSeason = getEpisodeSeason(movie, currentEpisode.episodeNumber, episodes);
                  return epSeason && seasonsList.length > 1 ? (
                    <span className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                      {epSeason.seasonLabel}
                    </span>
                  ) : null;
                })()}
                <span className="truncate">{currentEpisode.title} • HD Дамжуулалт</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Шууд тоглуулагч • Хязгааргүй Хурд</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Multi-Node High-Concurrency Server Selector */}
          <div className="flex items-center bg-zinc-900/90 border border-cyan-500/40 rounded-xl p-0.5 text-xs shadow-lg backdrop-blur-md">
            {isExternalEmbed && (
              <button
                type="button"
                id="server-embed-btn"
                onClick={() => handleServerChange('embed')}
                className={`px-3 py-1 rounded-lg transition-all font-black cursor-pointer flex items-center gap-1.5 ${
                  serverMode === 'embed'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md font-black'
                    : 'text-amber-300 hover:text-white'
                }`}
                title={isGoogleDrive ? 'Google Drive Тоглуулагч (HD)' : isYouTube ? 'YouTube Бичлэг' : 'Үндсэн тоглуулагч'}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isGoogleDrive ? 'Drive HD' : isYouTube ? 'YouTube' : 'Үндсэн'}</span>
              </button>
            )}

            <button
              type="button"
              id="server1-btn"
              onClick={() => handleServerChange('server1')}
              className={`px-3 py-1 rounded-lg transition-all font-black cursor-pointer flex items-center gap-1.5 ${
                serverMode === 'server1'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md font-black'
                  : 'text-cyan-300 hover:text-white'
              }`}
              title="Шууд Тоглуулагч 1: CDN Шууд дамжуулагч"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Шууд 1</span>
            </button>

            <button
              type="button"
              id="server2-btn"
              onClick={() => handleServerChange('server2')}
              className={`px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer flex items-center gap-1 ${
                serverMode === 'server2'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Сервер 2: Turbo CDN (Seoul Node)"
            >
              <Sparkles className="w-3 h-3" />
              <span>Сервер 2</span>
            </button>

            <button
              type="button"
              id="server3-btn"
              onClick={() => handleServerChange('server3')}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                serverMode === 'server3'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Сервер 3: Global Edge Node (Олон улс & Монгол)"
            >
              <Radio className="w-3 h-3" />
              <span>Сервер 3</span>
            </button>

            <button
              type="button"
              id="server4-btn"
              onClick={() => handleServerChange('server4')}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                serverMode === 'server4'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Сервер 4: Direct HD (Anycast Cloud CDN)"
            >
              <Activity className="w-3 h-3" />
              <span>Сервер 4</span>
            </button>
          </div>

          {/* Concurrency & Ping Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl select-none font-bold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Онлайн • Хязгааргүй Хүчин Чадал</span>
          </div>

          {/* Debug Console & Diagnostic Overlay Toggle Button (Зөвхөн Админд харагдана) */}
          {isAdmin && (
            <button
              type="button"
              id="debug-panel-toggle-btn"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`flex items-center gap-1 font-bold text-xs p-2 sm:px-3 sm:py-2 rounded-xl cursor-pointer transition-all border ${
                showDebugPanel
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 border-zinc-700'
              }`}
              title="Тоглуулагчийн дебаг мэдээлэл болон алдаа оношлох (Админ)"
            >
              <Bug className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Дебаг</span>
            </button>
          )}

          {/* Fullscreen Quick Button */}
          <button
            type="button"
            id="quick-fullscreen-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1 bg-zinc-800/90 hover:bg-zinc-700 text-white font-bold text-xs p-2 sm:px-3 sm:py-2 rounded-xl cursor-pointer transition-all border border-zinc-700"
            title="Бүтэн дэлгэц (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Episodes Drawer Toggle */}
          {episodes.length > 0 && (
            <button
              id="toggle-episodes-drawer"
              onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
              className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border cursor-pointer transition-all ${
                showEpisodesDrawer
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
            >
              <ListVideo className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Ангиуд ({episodes.length})</span>
            </button>
          )}

          {/* Close Button */}
          <button
            id="close-player-button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center border border-zinc-700 cursor-pointer transition-transform hover:scale-105"
            title="Хаах (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Player Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black select-none">
        <div
          ref={playerContainerRef}
          onContextMenu={(e) => e.preventDefault()}
          className="relative w-full h-full flex items-center justify-center group select-none bg-black"
        >
          {/* Episode Access Restricted Overlay */}
          {!hasAccessToCurrentEpisode ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white z-30 space-y-5 animate-in fade-in duration-200 text-center select-none">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
                <Lock className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                  {currentEpisodeIndex + 1}-р анги түгжигдсэн
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  2-р ангиас эхлэн эрх авсан хэрэглэгчид үзнэ
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  1-р ангийг үнэгүй үзэх боломжтой бөгөөд 2-р ангиас эхлэн та өөрийн хүссэн багцын ({movie.type === 'anime' ? 'Анимэ' : 'Кино'} эсвэл Бүтэн VIP) эрхээ идэвхжүүлж үзнэ үү.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onRequestPurchase && (
                  <button
                    type="button"
                    onClick={() => onRequestPurchase(movie)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Багцын эрх авах / Төлбөр төлөх</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => selectEpisode(0)}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-zinc-700"
                >
                  <span>1-р анги үнэгүй үзэх</span>
                </button>
              </div>
            </div>
          ) : isEmbed ? (
            <div className={`w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center relative select-none no-download-shield ${
              isFullscreen || videoFitMode === 'cover' ? 'max-w-none' : 'max-w-7xl'
            }`}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black aspect-video flex items-center justify-center">
                {/* Pop-out & Download Shield Overlay for Google Drive and Embed Players */}
                <div
                  className="absolute top-0 right-0 w-24 h-16 z-20 pointer-events-auto bg-transparent cursor-default select-none"
                  title="Хуулбарлах болон татахыг хориглосон"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-10 z-20 pointer-events-auto bg-transparent cursor-default select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />

                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  onLoad={() => appendDebugLog(`✅ Iframe ачааллаа: ${iframeUrl}`)}
                  onError={() => appendDebugLog(`❌ Iframe ачаалахад алдаа гарлаа: ${iframeUrl}`)}
                  className="w-full h-full rounded-2xl border-0 bg-black aspect-video pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  title={movie.titleMongolian}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              
              {/* Google Drive / Embed Helper Bar */}
              <div className="w-full mt-2 space-y-1.5">
                <div className="text-xs text-zinc-300 bg-zinc-900/95 border border-zinc-800 py-2.5 px-4 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">
                      {isGoogleDrive ? '📁 Google Drive Тоглуулагч' : isYouTube ? '📺 YouTube Тоглуулагч' : '🎬 Эх Холбоос'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium">
                      🔒 Татах боломжгүй хамгаалалттай
                    </span>
                    {isGoogleDrive && (
                      <button
                        type="button"
                        onClick={() => setShowDriveGuide(!showDriveGuide)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer ml-1 font-semibold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Gmail эрх нэхэж байвал яах вэ?</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleServerChange('server1')}
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Шууд Тоглуулагч руу шилжих</span>
                    </button>
                    {isAdmin && (
                      <a
                        href={rawVideoSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs px-3 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 border border-zinc-700"
                        title="Зөвхөн Админд харагдана"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Админ: Линк шалгах</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Interactive Guide for Google Drive Public Sharing */}
                {isGoogleDrive && showDriveGuide && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <FolderLock className="w-4 h-4 text-amber-400" />
                        Google Drive-аас үзэгчдээс Gmail нэвтрэх / хандах хүсэлт нэхэхгүй байлгах заавар:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDriveGuide(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px]">
                      <li>Google Drive руугаа орж тухайн бичлэг эсвэл хавтас дээрээ хулганы баруун товч дарна.</li>
                      <li><strong>"Share (Хуваалцах)"</strong> ➡️ <strong>"Share"</strong> сонголтыг дарна.</li>
                      <li><strong>"General access (Ерөнхий хандалт)"</strong> хэсгийн <em>"Restricted"</em> тохиргоог <strong>"Anyone with the link" (Холбоостой хүн бүр)</strong> болгож <strong>"Viewer"</strong> эрхтэйгээр хадгална.</li>
                      <li>Ингэснээр ямар ч хэрэглэгч Gmail-дээ нэвтрэх шаардлагагүйгээр бичлэгийг шууд үзэх боломжтой болно!</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrcToPlay}
                autoPlay
                playsInline
                preload="auto"
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                onContextMenu={(e) => e.preventDefault()}
                onWaiting={() => {
                  appendDebugLog('⏳ Видео буфер хийж байна (Waiting/Buffering)...');
                  setIsBuffering(true);
                }}
                onPlaying={() => {
                  failoverAttemptsRef.current = 0;
                  setIsBuffering(false);
                  setIsPlaying(true);
                  appendDebugLog('▶️ Видео хэвийн тоглож байна (Playing)');
                  if (videoRef.current) {
                    setVideoElementState({
                      readyState: videoRef.current.readyState,
                      networkState: videoRef.current.networkState,
                      paused: videoRef.current.paused,
                      error: null,
                    });
                  }
                }}
                onLoadedMetadata={() => {
                  failoverAttemptsRef.current = 0;
                  if (videoRef.current) {
                    const dur = videoRef.current.duration || 0;
                    setDuration(dur);
                    appendDebugLog(`ℹ️ Видеоны мэдээлэл (Metadata) ачааллаа. Хугацаа: ${formatTime(dur)}`);
                    setVideoElementState({
                      readyState: videoRef.current.readyState,
                      networkState: videoRef.current.networkState,
                      paused: videoRef.current.paused,
                      error: null,
                    });
                  }
                }}
                onCanPlay={() => {
                  setIsBuffering(false);
                  appendDebugLog('✅ Видео тоглуулахад бэлэн (CanPlay)');
                  if (isPlaying && videoRef.current && videoRef.current.paused) {
                    playVideoSafe();
                  }
                }}
                onError={(e) => {
                  const mediaErr = videoRef.current?.error;
                  const errCode = mediaErr ? mediaErr.code : 'UNKNOWN';
                  const errMsg = mediaErr ? mediaErr.message : 'No message';
                  appendDebugLog(`❌ Видео тоглуулахад алдаа гарлаа: Код=${errCode} Мэдээлэл=${errMsg}`);
                  setVideoElementState((prev) => ({
                    ...prev,
                    error: `Error Code: ${errCode} (${errMsg || 'Media playback error'})`,
                  }));

                  if (failoverAttemptsRef.current < 4) {
                    failoverAttemptsRef.current += 1;
                    const nextMode: ServerMode =
                      serverMode === 'server1' ? 'server2' :
                      serverMode === 'server2' ? 'server3' :
                      serverMode === 'server3' ? 'server4' : 'server1';
                    appendDebugLog(`🔄 Автомат нөөц сервер рүү шилжиж байна: ${nextMode}`);
                    setServerMode(nextMode);
                  } else {
                    setIsBuffering(false);
                    appendDebugLog(`⚠️ Бүх шууд серверүүд алдаа заалаа. Та "Drive HD" / "Embed" сервер сонгох эсвэл "Drive дээр нээх" линкээр орно уу.`);
                  }
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  appendDebugLog('▶️ Видео тоглуулж эхэллээ (Play event)');
                }}
                onPause={() => {
                  setIsPlaying(false);
                  appendDebugLog('⏸️ Видео түр зогслоо (Pause event)');
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                  if (currentEpisodeIndex < episodes.length - 1) {
                    selectEpisode(currentEpisodeIndex + 1);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                className={`w-full h-full cursor-pointer transition-all ${
                  videoFitMode === 'cover'
                    ? 'object-cover'
                    : videoFitMode === 'fill'
                    ? 'object-fill'
                    : 'object-contain'
                }`}
              />

              {/* Unmute Alert if browser auto-muted */}
              {showUnmuteBanner && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/85 border border-cyan-400 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-bounce backdrop-blur-md">
                  <VolumeX className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-200">Дууг хааж эхлүүлсэн байна:</span>
                  <button
                    type="button"
                    onClick={handleUnmute}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-lg"
                  >
                    🔊 Дууг нээх
                  </button>
                </div>
              )}

              {/* Loading / Buffering Spinner */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span className="text-xs font-bold text-cyan-300 bg-black/80 px-3 py-1 rounded-full">
                      CDN Ачааллаж байна...
                    </span>
                  </div>
                </div>
              )}

              {/* Central Play Button Overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 cursor-pointer backdrop-blur-[2px] transition-all"
                >
                  <button
                    type="button"
                    id="central-play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="p-6 sm:p-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-black hover:scale-110 transition-transform shadow-2xl shadow-cyan-500/60 cursor-pointer flex items-center justify-center group"
                    title="Эхлүүлэх (Play)"
                  >
                    <Play className="w-12 h-12 sm:w-14 sm:h-14 fill-black translate-x-1" />
                  </button>
                  <div className="mt-4 flex flex-col items-center gap-1">
                    <p className="text-sm font-black text-cyan-300 drop-shadow uppercase tracking-wider bg-black/80 px-6 py-2 rounded-full border border-cyan-500/40">
                      ▶ ТОГЛУУЛАХ / PLAY ({serverMode.toUpperCase()})
                    </p>
                    <span className="text-[11px] text-zinc-400">
                      Space товч дарж эхлүүлж болно
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Overlay Controls */}
          {!isEmbed && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-4 sm:p-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 space-y-3">
              {/* Timeline Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-300 shrink-0">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-zinc-800 accent-cyan-400 rounded-lg cursor-pointer transition-all hover:h-2.5"
                />
                <span className="text-xs font-mono text-zinc-400 shrink-0">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Controls Row */}
              <div className="flex items-center justify-between text-white flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Play/Pause */}
                  <button
                    id="player-play-toggle"
                    type="button"
                    onClick={togglePlay}
                    className="p-2 hover:bg-zinc-800/80 rounded-full transition-all cursor-pointer text-cyan-400 hover:scale-110"
                    title={isPlaying ? "Түр зогсоох (Space)" : "Тоглуулах (Space)"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </button>

                  {/* 10s Backward */}
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                      }
                    }}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white cursor-pointer text-xs font-bold"
                    title="10 секунд ухраах (Зүүн сум)"
                  >
                    -10s
                  </button>

                  {/* 10s Forward */}
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(
                          videoRef.current.duration || 0,
                          videoRef.current.currentTime + 10
                        );
                      }
                    }}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white cursor-pointer text-xs font-bold"
                    title="10 секунд гүйлгэх (Баруун сум)"
                  >
                    +10s
                  </button>

                  {/* Next Episode Button */}
                  {episodes.length > 0 && currentEpisodeIndex < episodes.length - 1 && (
                    <button
                      id="player-next-ep"
                      type="button"
                      onClick={() => selectEpisode(currentEpisodeIndex + 1)}
                      className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white cursor-pointer"
                      title="Дараагийн анги"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  )}

                  {/* Volume Slider & Booster */}
                  <div className="flex items-center gap-2">
                    <button
                      id="player-mute-toggle"
                      type="button"
                      onClick={toggleMute}
                      className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                      title="Дуу хаах/нээх (M)"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-rose-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-24 h-1.5 bg-zinc-700 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Player Settings & Modifiers */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Current Active Server pill */}
                  <span className="text-[11px] font-black bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 px-2.5 py-1 rounded-lg uppercase shadow-sm">
                    {serverMode === 'server4'
                      ? 'СЕРВЕР 4 (HD)'
                      : serverMode === 'server3'
                      ? 'СЕРВЕР 3 (EDGE)'
                      : serverMode === 'server2'
                      ? 'СЕРВЕР 2 (TURBO)'
                      : 'СЕРВЕР 1 (ULTRA)'}
                  </span>

                  {/* Playback speed indicator */}
                  {playbackSpeed !== 1 && (
                    <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                      {playbackSpeed}x
                    </span>
                  )}

                  {/* Quality Badge */}
                  <span className="text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-lg">
                    {selectedQuality}
                  </span>

                  {/* Settings Menu Toggle */}
                  <div className="relative">
                    <button
                      id="player-settings-toggle"
                      type="button"
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                      title="Тохиргоо"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {showSettingsMenu && (
                      <div className="absolute right-0 bottom-12 w-68 bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl space-y-3 z-50 text-xs text-zinc-200 backdrop-blur-xl">
                        <div>
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <Languages className="w-4 h-4" />
                            <span>Дууны зам (Audio)</span>
                          </div>
                          {movie.audioTracks.map((track) => (
                            <button
                              key={track}
                              type="button"
                              onClick={() => setSelectedAudio(track)}
                              className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-zinc-800 flex justify-between cursor-pointer"
                            >
                              <span>{track}</span>
                              {selectedAudio === track && <Check className="w-4 h-4 text-cyan-400" />}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-zinc-800 pt-2.5">
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <Subtitles className="w-4 h-4" />
                            <span>Хадмал (Subtitles)</span>
                          </div>
                          {movie.subtitles.concat(['Унтраах']).map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setSelectedSub(sub)}
                              className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-zinc-800 flex justify-between cursor-pointer"
                            >
                              <span>{sub}</span>
                              {selectedSub === sub && <Check className="w-4 h-4 text-cyan-400" />}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-zinc-800 pt-2.5">
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <Gauge className="w-4 h-4" />
                            <span>Хурд (Speed)</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 mt-1">
                            {[0.75, 1, 1.25, 1.5].map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => handlePlaybackSpeed(spd)}
                                className={`py-1 rounded-md text-center cursor-pointer font-bold ${
                                  playbackSpeed === spd
                                    ? 'bg-cyan-500 text-black shadow'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-2.5">
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            <span>Чанар (Quality)</span>
                          </div>
                          {['4K Ultra HD', '1080p HD', '720p', '480p'].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setSelectedQuality(q)}
                              className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-zinc-800 flex justify-between cursor-pointer"
                            >
                              <span>{q}</span>
                              {selectedQuality === q && <Check className="w-4 h-4 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    id="player-fullscreen-toggle"
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title={isFullscreen ? "Бүтэн дэлгэцээс гарах (F)" : "Бүтэн дэлгэцээр үзэх (F)"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Episode Selector Drawer */}
        {episodes.length > 0 && showEpisodesDrawer && (() => {
          const seasons = getMovieSeasons(movie, episodes);

          const filteredList = episodes
            .map((ep, idx) => ({ ep, idx }))
            .filter(({ ep }) => {
              // Season filter
              if (selectedSeasonNumber !== 'all') {
                const targetSeason = seasons.find((s) => s.seasonNumber === selectedSeasonNumber);
                if (targetSeason) {
                  if (ep.episodeNumber < targetSeason.startEpisode || ep.episodeNumber > targetSeason.endEpisode) {
                    return false;
                  }
                }
              }
              // Search query filter
              if (!drawerSearch.trim()) return true;
              const q = drawerSearch.toLowerCase();
              return (
                ep.episodeNumber.toString().includes(q) ||
                ep.title.toLowerCase().includes(q)
              );
            });

          const activeSeasonObj = selectedSeasonNumber !== 'all' 
            ? seasons.find((s) => s.seasonNumber === selectedSeasonNumber)
            : null;

          return (
            <aside className="w-72 sm:w-88 bg-zinc-950/95 border-l border-zinc-800/80 h-full flex flex-col z-20 shadow-2xl backdrop-blur-xl">
              <div className="p-3 border-b border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-white font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-cyan-400" />
                    <span>Ангиудын жагсаалт</span>
                  </span>
                  <span className="text-xs bg-zinc-800 text-cyan-300 px-2 py-0.5 rounded-md font-mono font-bold">
                    {filteredList.length} / {episodes.length} анги
                  </span>
                </div>

                {/* S1, S2 Seasons Bar */}
                {seasons.length > 1 && (
                  <div className="space-y-1.5 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Улирал (Seasons):
                      </span>
                      {activeSeasonObj && (
                        <span className="text-amber-300 text-[10px] font-bold truncate max-w-[170px]">
                          {activeSeasonObj.seasonTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedSeasonNumber('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedSeasonNumber === 'all'
                            ? 'bg-cyan-500 text-black shadow font-black'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        Бүгд ({episodes.length})
                      </button>

                      {seasons.map((s) => {
                        const isCurrentSeasonActive = selectedSeasonNumber === s.seasonNumber;
                        return (
                          <button
                            key={s.seasonNumber}
                            type="button"
                            onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                              isCurrentSeasonActive
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow font-black ring-1 ring-cyan-300'
                                : 'bg-zinc-800/90 text-cyan-300 hover:bg-zinc-700 hover:text-white border border-cyan-500/20'
                            }`}
                            title={s.seasonTitle}
                          >
                            <span>{s.seasonLabel}</span>
                            <span className="text-[10px] opacity-75 font-mono">({s.episodesCount})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Анги хайх (жишээ: 1, 50, Шалгалт)..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 placeholder:text-zinc-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-zinc-800/40">
                {filteredList.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs">
                    Анги олдсонгүй
                  </div>
                ) : (
                  filteredList.map(({ ep, idx }) => {
                    const isActive = idx === currentEpisodeIndex;
                    const isFreeEp = idx === 0;
                    const hasEpAccess = checkEpisodeAccess(idx);
                    const epSeason = getEpisodeSeason(movie, ep.episodeNumber, episodes);

                    return (
                      <button
                        key={ep.episodeNumber}
                        id={`ep-select-${ep.episodeNumber}`}
                        type="button"
                        onClick={() => selectEpisode(idx)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/60 font-bold shadow-lg shadow-cyan-500/10'
                            : 'hover:bg-zinc-900 text-zinc-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isActive
                                ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-md'
                                : hasEpAccess
                                ? 'bg-zinc-800 text-zinc-300'
                                : 'bg-zinc-900 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {ep.episodeNumber}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs truncate font-bold flex items-center gap-1.5">
                              {seasons.length > 1 && epSeason && (
                                <span className="text-[10px] bg-zinc-800 text-cyan-400 px-1 py-0.2 rounded font-mono font-semibold">
                                  {epSeason.seasonLabel}
                                </span>
                              )}
                              <span className="truncate">{ep.title}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              {ep.duration}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isActive && (
                            <span className="text-[10px] bg-cyan-400 text-black font-extrabold px-2 py-0.5 rounded-md shadow">
                              ҮЗЭЖ БАЙНА
                            </span>
                          )}
                          {!isActive && isFreeEp && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                              ҮНЭГҮЙ
                            </span>
                          )}
                          {!isActive && !isFreeEp && !hasEpAccess && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> ЭРХЭЭР
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>
          );
        })()}
      </div>

      {/* Interactive Debug Diagnostic Modal (Зөвхөн Админ) */}
      {showDebugPanel && isAdmin && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
              <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                <Bug className="w-5 h-5 text-amber-400" />
                <span>Тоглуулагчийн Дебаг Консоль (Diagnostic Panel)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const info = JSON.stringify(
                      {
                        movie: movie?.titleMongolian,
                        episode: currentEpisode ? currentEpisode.title : 1,
                        rawVideoSrc,
                        googleDriveId,
                        serverMode,
                        isEmbed,
                        iframeUrl: isEmbed ? iframeUrl : null,
                        videoSrcToPlay: !isEmbed ? videoSrcToPlay : null,
                        videoElementState,
                        isPlaying,
                        isBuffering,
                        isMuted,
                        currentTime,
                        duration,
                        debugLogs,
                      },
                      null,
                      2
                    );
                    navigator.clipboard.writeText(info);
                    appendDebugLog('📋 Бүх дебаг мэдээлэл санах ойд хуулагдлаа (Copied to Clipboard).');
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition-all"
                  title="Дебаг мэдээллийг хуулах"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Мэдээлэл хуулах</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDebugPanel(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Кино & Ангийн Мэдээлэл
                  </div>
                  <div className="text-white font-bold truncate">
                    {movie.titleMongolian} ({movie.titleEnglish})
                  </div>
                  <div className="text-cyan-400 font-semibold">
                    Анги: {currentEpisode ? currentEpisode.title : '1-р анги'}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Төрөл: <span className="text-white">{movie.type}</span> | Жил: {movie.year}
                  </div>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Тоглуулагчийн Төлөв
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      serverMode === 'embed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      Горим: {serverMode}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isPlaying ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isPlaying ? '▶️ Тоглож байна' : '⏸️ Зогссон'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isBuffering ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {isBuffering ? '⏳ Буферлэж байна' : 'Хэвийн'}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Хугацаа: <span className="font-mono text-white">{formatTime(currentTime)} / {formatTime(duration)}</span> | Дуу: <span className="text-white">{isMuted ? 'Хаасан' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                </div>
              </div>

              {/* Source URLs */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Холбоос & Сервер Шинжилгээ
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-black/50 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-400 shrink-0 font-sans font-bold">Эх URL (Raw):</span>
                    <span className="text-cyan-300 truncate max-w-md" title={rawVideoSrc}>{rawVideoSrc}</span>
                    <a
                      href={rawVideoSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 font-sans font-semibold text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" /> Шинэ цонхонд нээх
                    </a>
                  </div>

                  {googleDriveId && (
                    <div className="flex items-center justify-between bg-black/50 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-zinc-400 font-sans font-bold">Google Drive File ID:</span>
                      <span className="text-amber-300 font-bold">{googleDriveId}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-black/50 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-400 shrink-0 font-sans font-bold">Идэвхтэй тоглуулах URL:</span>
                    <span className="text-emerald-300 truncate max-w-md" title={isEmbed ? iframeUrl : videoSrcToPlay}>
                      {isEmbed ? iframeUrl : videoSrcToPlay}
                    </span>
                    {!isEmbed && videoSrcToPlay && (
                      <a
                        href={videoSrcToPlay}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 shrink-0 font-sans font-semibold text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Урсгал шалгах
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Server Switcher */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Шуурхай Оношилгоо & Сервер Солих
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleServerChange('embed')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      serverMode === 'embed'
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    ⚡ Drive / YouTube Embed горим
                  </button>

                  <button
                    type="button"
                    onClick={() => handleServerChange('server1')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      serverMode === 'server1'
                        ? 'bg-cyan-400 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    📡 Шууд 1 (Proxy Stream)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleServerChange('server2')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      serverMode === 'server2'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    🌐 Сервер 2 (Seoul Turbo)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleServerChange('server3')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      serverMode === 'server3'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    🌍 Сервер 3 (Global Edge)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.load();
                        playVideoSafe();
                        appendDebugLog('🔄 Видео тоглуулагчийг гараар дахин дуудлаа (Force Reload).');
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Дахин ачааллах</span>
                  </button>
                </div>
              </div>

              {/* Real-time Event Log Console */}
              <div className="bg-black/90 border border-zinc-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] font-bold">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Бодит цагийн Дебаг Лог (Live Debug Logs)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDebugLogs([])}
                    className="text-zinc-500 hover:text-zinc-300 text-[10px] underline cursor-pointer"
                  >
                    Цэвэрлэх
                  </button>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] select-text">
                  {debugLogs.length === 0 ? (
                    <div className="text-zinc-600 italic">Одоогоор лог алга...</div>
                  ) : (
                    debugLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed ${
                          log.includes('❌')
                            ? 'text-rose-400'
                            : log.includes('✅')
                            ? 'text-emerald-400'
                            : log.includes('⚠️')
                            ? 'text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDebugPanel(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-5 py-2 rounded-xl cursor-pointer transition-all shadow-lg"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

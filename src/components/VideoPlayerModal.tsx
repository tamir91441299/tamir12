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
  Lock,
  ShieldCheck,
  Shield,
  Sun,
  Smartphone
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { UserAccount } from './AuthModal';
import { isPasscodeVerifiedInSession } from '../lib/passcodeService';
import { PasscodePromptModal } from './PasscodePromptModal';
import {
  getEmbedUrl,
  extractGoogleDriveId,
  getDirectPlaybackStream,
  isDirectPlayableMedia,
  extractYouTubeId,
  isExternalEmbedMedia,
  VideoQualityKey,
  QUALITY_OPTIONS,
  RELIABLE_CDN_STREAMS,
} from '../lib/videoUtils';

interface VideoPlayerModalProps {
  movie: Movie | null;
  initialEpisodeNumber?: number;
  isPurchased?: boolean;
  onClose: () => void;
  onRequestPurchase?: (movie: Movie) => void;
  onUpdateWatchProgress?: (movieId: string, episodeNumber: number, currentTime: number, duration: number) => void;
  currentUser?: UserAccount | null;
  isMonthlyVip?: boolean;
  isAnimePackage?: boolean;
  isMoviePackage?: boolean;
  onOpenAuthModal?: (mode?: 'phone' | 'pc' | 'login' | 'register') => void;
}

type ServerMode = 'embed' | 'direct';

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  initialEpisodeNumber = 1,
  isPurchased = false,
  onClose,
  onRequestPurchase,
  onUpdateWatchProgress,
  currentUser,
  isMonthlyVip = false,
  isAnimePackage = false,
  isMoviePackage = false,
  onOpenAuthModal,
}) => {
  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com';

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(() =>
    movie?.episodes && initialEpisodeNumber && initialEpisodeNumber > 0
      ? Math.max(0, initialEpisodeNumber - 1)
      : 0
  );

  // Access rule:
  // 1. Бүртгэлгүй хэрэглэгчид энэ сайтын анимэ үзэх боломжгүй (Заавал нэвтрэх шаардлагатай)
  // 2. Эрхээ аваагүй бүртгэлтэй хүмүүс зөвхөн 1-р ангийг (epIndex === 0) үзэж болно
  // 3. Эрх авсан (Анимэ багц, VIP, худалдан авсан) хүмүүс бүх ангийг үзнэ
  const checkEpisodeAccess = (epIndex: number): boolean => {
    // Бүртгэлгүй хүмүүс энэ сайтын анимэ үзэх боломжгүй
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (isMonthlyVip || (currentUser as any)?.packageType === 'full_vip') return true;
    if (movie?.type === 'anime' && (isAnimePackage || (currentUser as any)?.packageType === 'anime')) {
      return true;
    }
    if (movie?.type !== 'anime' && (isMoviePackage || (currentUser as any)?.packageType === 'movie')) {
      return true;
    }
    if (isPurchased) return true;
    // Эрхээ аваагүй бүртгэлтэй хүмүүс зөвхөн 1-р ангийг үзнэ
    if (epIndex <= 0) return true;
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

  const onUpdateWatchProgressRef = useRef(onUpdateWatchProgress);
  useEffect(() => {
    onUpdateWatchProgressRef.current = onUpdateWatchProgress;
  }, [onUpdateWatchProgress]);

  // Notify watch progress on mount & episode change
  useEffect(() => {
    if (movie?.id) {
      const epNum = movie.episodes?.[currentEpisodeIndex]?.episodeNumber || currentEpisodeIndex + 1;
      onUpdateWatchProgressRef.current?.(movie.id, epNum, 0, 0);
    }
  }, [movie?.id, currentEpisodeIndex]);

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

  // Smart default mode: Default to 1080p direct server for ultra-crisp Full HD playback on all anime
  const [serverMode, setServerMode] = useState<ServerMode>('direct');
  const [selectedQualityKey, setSelectedQualityKey] = useState<VideoQualityKey>('1080p');

  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [showDriveGuide, setShowDriveGuide] = useState<boolean>(false);
  const [drawerSearch, setDrawerSearch] = useState<string>('');

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
      : getDirectPlaybackStream(rawVideoSrc, epNum, 'server1', selectedQualityKey);

  const activeQualityOption =
    QUALITY_OPTIONS.find((q) => q.key === selectedQualityKey) || QUALITY_OPTIONS[0];

  // Debug initial loading
  useEffect(() => {
    appendDebugLog(`Ачаалласан кино: "${movie?.titleMongolian}" (${movie?.type})`);
    appendDebugLog(`Сонгосон анги: ${currentEpisode ? currentEpisode.title : 'Кино (1-р анги)'}`);
    appendDebugLog(`Эх холбоос (Raw URL): ${rawVideoSrc}`);
    appendDebugLog(`Google Drive ID: ${googleDriveId || 'Байхгүй'}`);
    appendDebugLog(`YouTube ID: ${extractYouTubeId(rawVideoSrc) || 'Байхгүй'}`);
    appendDebugLog(`Тоглуулах горим (Mode): Драйв нөөц (Embed)`);
    appendDebugLog(`Сонгосон чанар (Quality): ${activeQualityOption.label} (${activeQualityOption.resolution})`);
    if (serverMode === 'embed') {
      appendDebugLog(`Iframe Embed URL: ${iframeUrl}`);
    } else {
      appendDebugLog(`Direct Video Stream URL: ${videoSrcToPlay}`);
    }
  }, [movie, currentEpisodeIndex, serverMode, selectedQualityKey, rawVideoSrc, iframeUrl, videoSrcToPlay, activeQualityOption, appendDebugLog]);

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
  const [qualityNotice, setQualityNotice] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<'left' | 'right' | null>(null);
  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);

  // Mobile Orientation & Landscape Rotation Mode State
  const [isForcedLandscape, setIsForcedLandscape] = useState<boolean>(false);
  const [videoBrightness, setVideoBrightness] = useState<number>(100); // 100%, 115%, 130%, 145%
  const [isDeviceLandscape, setIsDeviceLandscape] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.innerWidth > window.innerHeight ||
        (window.screen?.orientation?.type ? window.screen.orientation.type.includes('landscape') : false) ||
        (typeof window.orientation === 'number' && Math.abs(window.orientation) === 90) ||
        (window.matchMedia ? window.matchMedia('(orientation: landscape)').matches : false)
      );
    }
    return false;
  });

  // Track physical device orientation and viewport changes (physical rotation)
  useEffect(() => {
    const handleOrientationOrResize = () => {
      if (typeof window === 'undefined') return;
      const isPhysicalLandscape =
        window.innerWidth > window.innerHeight ||
        (window.screen?.orientation?.type ? window.screen.orientation.type.includes('landscape') : false) ||
        (typeof window.orientation === 'number' && Math.abs(window.orientation) === 90) ||
        (window.matchMedia ? window.matchMedia('(orientation: landscape)').matches : false);

      setIsDeviceLandscape(isPhysicalLandscape);
    };

    handleOrientationOrResize();

    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('orientationchange', handleOrientationOrResize);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationOrResize);
    }
    const mediaQuery = window.matchMedia ? window.matchMedia('(orientation: landscape)') : null;
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleOrientationOrResize);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationOrResize);
      }
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOrientationOrResize);
      }
    };
  }, []);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset & restart auto-hide controls timer
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Hide controls automatically when playing
  useEffect(() => {
    if (isPlaying) {
      resetControlsTimer();
    } else {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimer]);

  const serverModeRef = useRef<ServerMode>(serverMode);
  serverModeRef.current = serverMode;

  // Launch the window once verified
  const doLaunchProtectedWindow = useCallback(() => {
    const currentEpNum = currentEpisode?.episodeNumber || currentEpisodeIndex + 1;
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const targetUrl = `${baseUrl}?play=${encodeURIComponent(movie.id)}&ep=${currentEpNum}&protected=1&cinema=1`;
    
    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      appendDebugLog('🛡️ Хамгаалалттай шинэ цонхонд тоглуулагч амжилттай нээгдлээ.');
    } catch (e: any) {
      window.open(targetUrl, '_blank');
      appendDebugLog(`🛡️ Хамгаалалттай цонх нээгдлээ: ${e?.message || ''}`);
    }
  }, [currentEpisode, currentEpisodeIndex, movie.id, appendDebugLog]);

  // Open protected cinema stream in a dedicated new window with passcode security
  const handleOpenProtectedNewWindow = useCallback(() => {
    if (isPasscodeVerifiedInSession()) {
      doLaunchProtectedWindow();
    } else {
      setShowPasscodePrompt(true);
    }
  }, [doLaunchProtectedWindow]);

  // Play video safely with audio / autoplay / error handling without cascading loops
  const playVideoSafe = useCallback(async () => {
    const video = videoRef.current;
    if (!video || serverModeRef.current === 'embed') return;

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
  }, [playbackSpeed]);

  // Seamless Quality Switcher: smoothly switches stream and preserves current playback position
  const handleQualitySelect = useCallback((qualityKey: VideoQualityKey) => {
    const opt = QUALITY_OPTIONS.find((q) => q.key === qualityKey) || QUALITY_OPTIONS[0];
    const savedTime = videoRef.current?.currentTime || currentTime || 0;

    setSelectedQualityKey(qualityKey);

    // Automatically transition to direct Full HD player if in embed/backup mode
    if (serverModeRef.current !== 'direct') {
      serverModeRef.current = 'direct';
      setServerMode('direct');
    }

    setQualityNotice(`✨ ${opt.label} (${opt.resolution}) Full HD шууд горимд шилжлээ`);
    setTimeout(() => {
      setQualityNotice(null);
    }, 2400);

    // Reapply time and playback smoothly on stream reload
    setTimeout(() => {
      const vid = videoRef.current;
      if (vid) {
        if (savedTime > 0) {
          try {
            vid.currentTime = savedTime;
          } catch {}
        }
        vid.playbackRate = playbackSpeed;
        vid.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }).catch(() => {
          vid.muted = true;
          setIsMuted(true);
          setShowUnmuteBanner(true);
          vid.play().catch(() => {});
        });
      }
    }, 150);
  }, [currentTime, playbackSpeed]);

  // Server switch handler
  const handleServerChange = (mode: ServerMode) => {
    serverModeRef.current = mode;
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
  const lastProgressSaveRef = useRef<number>(0);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);
      setIsBuffering(false);

      const now = Date.now();
      if (now - lastProgressSaveRef.current > 5000 && movie) {
        lastProgressSaveRef.current = now;
        const epNum = movie.episodes?.[currentEpisodeIndex]?.episodeNumber || currentEpisodeIndex + 1;
        if (onUpdateWatchProgress) {
          onUpdateWatchProgress(movie.id, epNum, cur, dur);
        }
      }
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

  // Quick Relative Seek (-10s / +10s)
  const seekRelative = (seconds: number) => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || duration || 0;
      const target = Math.max(0, Math.min(dur, (videoRef.current.currentTime || currentTime) + seconds));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      if (seconds < 0) {
        setDoubleTapFeedback('left');
        setTimeout(() => setDoubleTapFeedback(null), 700);
      } else {
        setDoubleTapFeedback('right');
        setTimeout(() => setDoubleTapFeedback(null), 700);
      }
    }
    resetControlsTimer();
  };

  // Custom Interactive Scrubber Touch & Drag System
  const scrubTrackRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPercent, setHoverSeekPercent] = useState<number>(0);

  const calculateScrubPosition = useCallback((clientX: number, clientY: number) => {
    if (!scrubTrackRef.current || !duration) return 0;
    const rect = scrubTrackRef.current.getBoundingClientRect();
    let ratio = 0;
    if (isForcedLandscape && !isDeviceLandscape) {
      // Rotated 90deg clockwise: visual horizontal corresponds to DOM top-to-bottom
      ratio = (clientY - rect.top) / rect.height;
    } else {
      ratio = (clientX - rect.left) / rect.width;
    }
    ratio = Math.max(0, Math.min(1, ratio));
    return ratio * duration;
  }, [duration, isForcedLandscape, isDeviceLandscape]);

  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScrubbing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const targetTime = calculateScrubPosition(clientX, clientY);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
    resetControlsTimer();
  };

  const handleScrubMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (isScrubbing) {
      e.preventDefault();
      const targetTime = calculateScrubPosition(clientX, clientY);
      setCurrentTime(targetTime);
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
      }
      resetControlsTimer();
    } else if (scrubTrackRef.current && duration > 0) {
      const rect = scrubTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setHoverSeekPercent(ratio * 100);
      setHoverSeekTime(ratio * duration);
    }
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    resetControlsTimer();
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

  // Dedicated Screen Orientation / Landscape Rotation for Mobile (Handles Portrait Lock & Touch Devices)
  const toggleRotateLandscape = async () => {
    const isCurrentlyWide = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;

    // If not wide and not forced, toggle to landscape
    if (!isForcedLandscape && !isCurrentlyWide) {
      setIsForcedLandscape(true);
      setQualityNotice('🔄 Хөндлөн (Landscape) горим идэвхжлээ');
      // Attempt Screen Orientation API lock or fullscreen if supported
      try {
        const doc: any = document;
        const targetElem: any = playerContainerRef.current || videoRef.current || document.documentElement;
        if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
          if (targetElem?.requestFullscreen) {
            await targetElem.requestFullscreen();
          } else if (targetElem?.webkitRequestFullscreen) {
            await targetElem.webkitRequestFullscreen();
          }
        }
        if ((screen?.orientation as any)?.lock) {
          await (screen.orientation as any).lock('landscape');
        } else if ((screen as any)?.lockOrientation) {
          (screen as any).lockOrientation('landscape');
        }
      } catch {
        // Smoothly handled by forced CSS landscape transform
      }
    } else {
      setIsForcedLandscape(false);
      setQualityNotice('📱 Босоо (Portrait) горимд шилжлээ');
      try {
        if (screen?.orientation?.unlock) {
          screen.orientation.unlock();
        } else if ((screen as any)?.unlockOrientation) {
          (screen as any).unlockOrientation();
        }
      } catch {}
    }

    setTimeout(() => {
      setQualityNotice(null);
    }, 2200);
  };

  // Cross-browser & Mobile-Safe Fullscreen with Orientation Lock Support
  const toggleFullscreen = async () => {
    try {
      const isTouchOrMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
      const doc: any = document;
      const targetElem: any = playerContainerRef.current || videoRef.current;

      const isFS = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        isFullscreen
      );

      if (!isFS) {
        let entered = false;
        // 1. Try standard / Android element requestFullscreen
        if (targetElem?.requestFullscreen) {
          try {
            await targetElem.requestFullscreen();
            entered = true;
          } catch {}
        } else if (targetElem?.webkitRequestFullscreen) {
          try {
            await targetElem.webkitRequestFullscreen();
            entered = true;
          } catch {}
        } else if (doc.documentElement?.requestFullscreen) {
          try {
            await doc.documentElement.requestFullscreen();
            entered = true;
          } catch {}
        }

        // 2. If mobile and couldn't enter element fullscreen, try iOS video.webkitEnterFullscreen
        if (!entered && videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          try {
            (videoRef.current as any).webkitEnterFullscreen();
            entered = true;
          } catch {}
        }

        // 3. Request landscape orientation lock on mobile
        if (isTouchOrMobile) {
          try {
            if ((screen?.orientation as any)?.lock) {
              await (screen.orientation as any).lock('landscape');
            } else if ((screen as any)?.lockOrientation) {
              (screen as any).lockOrientation('landscape');
            }
          } catch {}

          setIsForcedLandscape(true);
        }

        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          try { await doc.exitFullscreen(); } catch {}
        } else if (doc.webkitExitFullscreen) {
          try { await doc.webkitExitFullscreen(); } catch {}
        } else if (doc.mozCancelFullScreen) {
          try { await doc.mozCancelFullScreen(); } catch {}
        } else if (doc.msExitFullscreen) {
          try { await doc.msExitFullscreen(); } catch {}
        }

        try {
          if (screen?.orientation?.unlock) {
            screen.orientation.unlock();
          }
        } catch {}

        setIsFullscreen(false);
        setIsForcedLandscape(false);
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
      setIsBuffering(false);
      setShowEpisodesDrawer(false);

      // Trigger immediate playback on video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }).catch(() => {
            playVideoSafe();
          });
        }
      }, 50);
    }
  };

  // Format Time Helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Safe Exit & Close Handler that always cleans up Fullscreen & Orientation Lock
  const handleCloseSafely = useCallback(() => {
    try {
      const doc: any = document;
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen().catch(() => {});
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen().catch(() => {});
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen().catch(() => {});
      }

      if (screen?.orientation?.unlock) {
        screen.orientation.unlock();
      } else if ((screen as any)?.unlockOrientation) {
        (screen as any).unlockOrientation();
      }
    } catch {}

    setIsForcedLandscape(false);
    setIsFullscreen(false);
    onClose();
  }, [onClose]);

  if (!movie) return null;

  const isViewportLandscape = isDeviceLandscape || (typeof window !== 'undefined' && window.innerWidth > window.innerHeight);
  const shouldApplyCssRotation = isForcedLandscape && !isViewportLandscape;

  return (
    <div
      className={`fixed bg-black flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        shouldApplyCssRotation
          ? 'shadow-2xl'
          : 'inset-0 w-full h-full z-50'
      }`}
      style={
        shouldApplyCssRotation
          ? {
              position: 'fixed',
              top: '50%',
              left: '50%',
              width: '100dvh',
              height: '100dvw',
              maxWidth: '100dvh',
              maxHeight: '100dvw',
              transform: 'translate3d(-50%, -50%, 0) rotate(90deg)',
              transformOrigin: 'center center',
              zIndex: 99999,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }
          : {
              position: 'fixed',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 50,
            }
      }
    >
      {/* PERSISTENT TOP-RIGHT 'X' CLOSE BUTTON (Always accessible, never blocks or overlaps episode buttons) */}
      <div className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center gap-2 ${showEpisodesDrawer ? 'hidden' : ''}`}>
        {/* Universal Top-Right Close Button */}
        <button
          type="button"
          id="top-right-corner-close-btn"
          onClick={handleCloseSafely}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-900/90 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center border border-zinc-700/80 shadow-2xl backdrop-blur-lg cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group ${
            controlsVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-80 scale-95 pointer-events-auto sm:opacity-0 sm:pointer-events-none'
          }`}
          title="Тоглуулагчийг хаах / Гарах (Esc)"
        >
          <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Top Header Bar - Clean transparent header, NO screen darkening */}
      <header className={`p-2 sm:p-3 pr-14 sm:pr-16 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between z-30 text-white gap-2 sm:gap-4 shrink-0 transition-all duration-300 ${
        isFullscreen || isForcedLandscape || isDeviceLandscape || isViewportLandscape
          ? controlsVisible
            ? 'opacity-100 translate-y-0 absolute inset-x-0 top-0 pointer-events-auto'
            : 'opacity-0 -translate-y-full pointer-events-none absolute inset-x-0 top-0'
          : 'opacity-100 relative'
      }`}>
        {/* Title and metadata row */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0 w-full sm:w-auto">
          {/* FlickNime Luxury Multicolor Glow Brand Logo */}
          <div className="hidden xl:flex items-center gap-2 mr-2 shrink-0 border-r border-zinc-800 pr-3">
            <div className="w-7 h-7 rounded-xl brand-insignia text-black font-black flex items-center justify-center text-xs shadow-md">
              🎬
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm tracking-wider brand-text-luxury font-display leading-none">
                FlickNime
              </span>
              <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                HD Cinema
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shrink-0 shadow-md">
              {movie.type === 'series' ? 'ЦУВРАЛ' : movie.type === 'anime' ? 'АНИМЭ' : 'КИНО'}
            </span>
            <div className="min-w-0">
              <h2 className="font-black text-xs sm:text-base text-white leading-tight truncate flex items-center gap-1.5">
                <span className="truncate">{movie.titleMongolian}</span>
                <span className="text-xs text-zinc-400 font-normal hidden md:inline">({movie.year})</span>
              </h2>
              {currentEpisode ? (
                <p className="text-[11px] sm:text-xs text-cyan-400 font-bold truncate flex items-center gap-1">
                  <Tv className="w-3 h-3 shrink-0" />
                  <span className="truncate">{currentEpisode.title} • 1080p Full HD</span>
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs text-emerald-400 font-bold flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Шууд тоглуулагч • 1080p Full HD</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick actions on mobile top right (Only show episodes drawer toggle if series/anime has episodes) */}
          {episodes.length > 0 && (
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="toggle-episodes-mobile-top"
                onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
                className={`px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                  showEpisodesDrawer
                    ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-cyan-500/30'
                    : 'bg-zinc-900/95 hover:bg-zinc-800 text-cyan-300 border-zinc-700/80 active:scale-95'
                }`}
                title="Ангиуд сонгох"
              >
                <ListVideo className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ангиуд</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls and Selectors Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
          {/* HD Quality Guaranteed Indicator (Quality locked to pristine Full HD) */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black bg-cyan-500/15 border border-cyan-400/80 text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>⚡ 1080P Full HD</span>
          </div>

          {/* Video Fit / Zoom Mode Button */}
          <button
            type="button"
            id="video-fit-toggle-btn"
            onClick={() => {
              const modes: Array<'contain' | 'cover' | 'fill'> = ['contain', 'cover', 'fill'];
              const nextMode = modes[(modes.indexOf(videoFitMode) + 1) % modes.length];
              setVideoFitMode(nextMode);
              setQualityNotice(
                nextMode === 'cover'
                  ? '📐 Дэлгэц дүүргэх горим (Crop to Fill)'
                  : nextMode === 'fill'
                  ? '↔️ Дэлгэц сунгах горим (Stretch to Fit)'
                  : '⬛ Стандарт 16:9 горим (Original Ratio)'
              );
              setTimeout(() => setQualityNotice(null), 2000);
            }}
            className="hidden md:flex items-center gap-1 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 cursor-pointer"
            title="Дэлгэцийн харьцаа: Агуулга (16:9), Дүүргэх (Cover), Сунгах (Fill)"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="capitalize text-[11px]">{videoFitMode === 'contain' ? '16:9' : videoFitMode === 'cover' ? 'Дүүргэх' : 'Сунгах'}</span>
          </button>

          {/* Diagnostic / Debug Toggle Button - Only visible to Admin */}
          {isAdmin && (
            <button
              type="button"
              id="debug-panel-toggle-btn"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`flex items-center gap-1 font-bold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl cursor-pointer transition-all border ${
                showDebugPanel
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 border-zinc-700'
              }`}
              title="Тоглуулагчийн дебаг мэдээлэл болон алдаа оношлох"
            >
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Дебаг</span>
            </button>
          )}

          {/* Protected New Window Watch Button */}
          <button
            type="button"
            id="protected-new-window-btn"
            onClick={handleOpenProtectedNewWindow}
            className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 font-bold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl cursor-pointer transition-all border border-emerald-500/50 shadow-sm active:scale-95"
            title="Энэ видеог файл болон холбоосыг нь хамгаалж шинэ цонхоор үзэх"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Шинэ цонх</span>
          </button>

          {/* Fullscreen Quick Button */}
          <button
            type="button"
            id="quick-fullscreen-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1 bg-zinc-800/90 hover:bg-zinc-700 text-white font-bold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl cursor-pointer transition-all border border-zinc-700"
            title="Бүтэн дэлгэц (F)"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Episodes Drawer Toggle on Desktop */}
          {episodes.length > 0 && (
            <button
              id="toggle-episodes-drawer"
              onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
              className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-xl items-center gap-1.5 border cursor-pointer transition-all ${
                showEpisodesDrawer
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
            >
              <ListVideo className="w-4 h-4 text-cyan-400" />
              <span>Ангиуд ({episodes.length})</span>
            </button>
          )}
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
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
                <Lock className="w-10 h-10 animate-pulse" />
              </div>

              {!currentUser ? (
                /* Unregistered User Lock State */
                <>
                  <div className="space-y-2 max-w-md">
                    <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30 inline-block">
                      Бүртгэл шаардлагатай
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                      Бүртгэлгүй хэрэглэгч анимэ үзэх боломжгүй
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Энэхүү сайтын анимэг үзэхийн тулд заавал бүртгүүлэх эсвэл нэвтрэх шаардлагатай. Та гар утасны дугаар эсвэл PC горимоор нэвтрэн 1-р ангийг шууд үнэгүй үзэх боломжтой.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAuthModal) onOpenAuthModal('phone');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Утсаар нэвтрэх</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAuthModal) onOpenAuthModal('pc');
                      }}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow border border-indigo-500/50 hover:scale-105"
                    >
                      <span>PC-ээр нэвтрэх</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAuthModal) onOpenAuthModal('register');
                      }}
                      className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      <span>Шинээр бүртгүүлэх</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Registered but No Package for Ep > 1 */
                <>
                  <div className="space-y-2 max-w-md">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                      {currentEpisodeIndex + 1}-р анги түгжигдсэн
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                      2-р ангиас эхлэн эрх авсан хэрэглэгчид үзнэ
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      1-р ангийг үнэгүй үзэх боломжтой бөгөөд 2-р ангиас эхлэн та өөрийн хүссэн Анимэ багцын эрхээ идэвхжүүлж үзнэ үү.
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
                </>
              )}
            </div>
          ) : isEmbed ? (
            <div className="w-full h-full flex items-center justify-center relative bg-black overflow-hidden">
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  onLoad={() => appendDebugLog(`✅ Iframe ачааллаа: ${iframeUrl}`)}
                  onError={() => appendDebugLog(`❌ Iframe ачаалахад алдаа гарлаа: ${iframeUrl}`)}
                  className="w-full h-full border-0 bg-black pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  title={movie.titleMongolian}
                />
              </div>

              {/* Floating Google Drive HD Quality Helper Hint */}
              {isGoogleDrive && controlsVisible && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-zinc-950/90 border border-cyan-500/50 text-white px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-cyan-400 font-black">⚙️ HD ЧАНАР:</span>
                  <span className="text-zinc-300">Тод үзэхийн тулд видеоны баруун доод буланд байрлах ⚙️ дүрс дээр дарж <b>1080p / 720p</b> сонгоно уу.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrcToPlay}
                autoPlay
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
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
                  appendDebugLog(`⚠️ Шууд тоглуулагч алдаа өглөө (Код=${errCode}): ${errMsg}`);
                  setVideoElementState((prev) => ({
                    ...prev,
                    error: `Error Code: ${errCode}`,
                  }));
                  setIsBuffering(false);

                  // If source is Google Drive or External embed, automatically switch to reliable Embed mode
                  if (isGoogleDrive || isYouTube || isExternalEmbed) {
                    appendDebugLog(`🔄 Google Drive HD тоглуулагч руу автоматаар шилжиж байна...`);
                    setQualityNotice('💡 Google Drive HD тоглуулагч руу автоматаар шилжлээ');
                    setServerMode('embed');
                    serverModeRef.current = 'embed';
                  } else if (videoRef.current && videoRef.current.src && !videoRef.current.src.includes('commondatastorage')) {
                    const fallbackStream = RELIABLE_CDN_STREAMS[0];
                    videoRef.current.src = fallbackStream;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  appendDebugLog('▶️ Видео тоглуулж эхэллээ (Play event)');
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setControlsVisible(true);
                  appendDebugLog('⏸️ Видео түр зогслоо (Pause event)');
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                  if (currentEpisodeIndex < episodes.length - 1) {
                    selectEpisode(currentEpisodeIndex + 1);
                  } else {
                    setIsPlaying(false);
                    setControlsVisible(true);
                  }
                }}
                className={`w-full h-full transition-all ${
                  videoFitMode === 'cover'
                    ? 'object-cover'
                    : videoFitMode === 'fill'
                    ? 'object-fill'
                    : 'object-contain'
                }`}
                style={{
                  filter: videoBrightness !== 100 ? `brightness(${videoBrightness}%) contrast(105%)` : undefined,
                }}
              />

              {/* Smart Non-Dimming Tap & Gesture Surface */}
              <div
                className="absolute inset-0 z-10 cursor-pointer select-none"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', outline: 'none' }}
                onClick={(e) => {
                  const now = Date.now();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const width = rect.width;
                  const ratio = x / width;

                  // Check for double tap (within 300ms)
                  if (now - lastTapTimeRef.current < 300) {
                    if (ratio < 0.35) {
                      // Double tap left: seek backward 10s
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                      }
                      setDoubleTapFeedback('left');
                      setTimeout(() => setDoubleTapFeedback(null), 600);
                    } else if (ratio > 0.65) {
                      // Double tap right: seek forward 10s
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
                      }
                      setDoubleTapFeedback('right');
                      setTimeout(() => setDoubleTapFeedback(null), 600);
                    } else {
                      // Double tap center: toggle fullscreen safely
                      toggleFullscreen();
                    }
                    lastTapTimeRef.current = 0;
                    resetControlsTimer();
                    return;
                  }

                  lastTapTimeRef.current = now;
                  lastTapPositionRef.current = { x: e.clientX, y: e.clientY };

                  // Single click/tap: Toggle controls visibility smoothly without stopping or pausing the video
                  setControlsVisible((prev) => {
                    const next = !prev;
                    if (next) {
                      resetControlsTimer();
                    }
                    return next;
                  });
                }}
                onMouseMove={resetControlsTimer}
              />

              {/* Double Tap Seek Visual Indicators */}
              {doubleTapFeedback === 'left' && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 bg-black/60 border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-2xl flex flex-col items-center gap-1 animate-in zoom-in-90 duration-200 pointer-events-none">
                  <div className="flex items-center gap-1 font-black text-sm">
                    <span>⏪</span> -10 сек
                  </div>
                  <span className="text-[10px] text-zinc-400">Ухраасан</span>
                </div>
              )}
              {doubleTapFeedback === 'right' && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-black/60 border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-2xl flex flex-col items-center gap-1 animate-in zoom-in-90 duration-200 pointer-events-none">
                  <div className="flex items-center gap-1 font-black text-sm">
                    +10 сек <span>⏩</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Гүйлгэсэн</span>
                </div>
              )}

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
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span className="text-xs font-bold text-cyan-300 bg-black/80 px-3 py-1 rounded-full">
                      CDN Ачааллаж байна...
                    </span>
                  </div>
                </div>
              )}

              {/* Non-intrusive Minimalist Play Button (No dimming screen) */}
              {!isPlaying && controlsVisible && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
                >
                  <button
                    type="button"
                    id="central-play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                        setIsMuted(false);
                        setShowUnmuteBanner(false);
                        videoRef.current.play().then(() => {
                          setIsPlaying(true);
                          setIsBuffering(false);
                        }).catch(() => {
                          togglePlay();
                        });
                      } else {
                        togglePlay();
                      }
                      resetControlsTimer();
                    }}
                    className="p-5 sm:p-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-black hover:scale-110 active:scale-95 transition-transform shadow-2xl shadow-cyan-500/50 cursor-pointer pointer-events-auto flex items-center justify-center group"
                    title="Эхлүүлэх (Шууд тоглуулах)"
                  >
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-black translate-x-0.5" />
                  </button>
                  <div className="mt-3 flex flex-col items-center pointer-events-auto">
                    <p className="text-xs font-black text-white drop-shadow bg-black/70 px-4 py-1 rounded-full border border-zinc-700/80">
                      ▶ ТОГЛУУЛАХ ({activeQualityOption.tag})
                    </p>
                  </div>
                </div>
              )}

              {/* Floating Quality Change Toast Notification */}
              {qualityNotice && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/90 border border-cyan-500/60 text-cyan-300 font-extrabold text-xs px-4 py-2 rounded-xl shadow-2xl shadow-cyan-500/20 backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{qualityNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Custom Transparent Overlay Controls (Auto-hides smoothly without darkening video) */}
          {!isEmbed && (
            <div
              className={`absolute inset-x-0 bottom-0 bg-transparent p-3 sm:p-5 transition-all duration-300 z-30 space-y-2.5 ${
                controlsVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
              onMouseMove={resetControlsTimer}
            >
              {/* Responsive Touch-Friendly Custom Timeline Scrubber */}
              <div className="flex items-center gap-2.5 sm:gap-4 select-none">
                <span className="text-xs font-mono font-bold text-cyan-300 shrink-0 w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                
                {/* Scrubber Interactive Track with Generous Hit Area */}
                <div
                  ref={scrubTrackRef}
                  onMouseDown={handleScrubStart}
                  onMouseMove={handleScrubMove}
                  onMouseUp={handleScrubEnd}
                  onMouseLeave={() => {
                    handleScrubEnd();
                    setHoverSeekTime(null);
                  }}
                  onTouchStart={handleScrubStart}
                  onTouchMove={handleScrubMove}
                  onTouchEnd={handleScrubEnd}
                  className="flex-1 h-9 flex items-center relative cursor-pointer group/scrub touch-none select-none"
                  title="Хугацааг урагш, хойш гүйлгэх"
                >
                  {/* Track Background */}
                  <div className="w-full h-2.5 bg-zinc-800/90 rounded-full overflow-hidden relative border border-zinc-700/60 shadow-inner group-hover/scrub:h-3 transition-all">
                    {/* Played Progress Bar */}
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 rounded-full relative shadow-md shadow-cyan-500/50 transition-[width] duration-75"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Scrubber Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-300 rounded-full border-2 border-white shadow-xl shadow-cyan-400/80 group-hover/scrub:scale-125 transition-transform pointer-events-none flex items-center justify-center"
                    style={{
                      left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>

                  {/* Hover / Drag Time Preview Tooltip */}
                  {hoverSeekTime !== null && (
                    <div
                      className="absolute -top-7 -translate-x-1/2 bg-zinc-950 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/40 shadow-xl pointer-events-none whitespace-nowrap"
                      style={{ left: `${hoverSeekPercent}%` }}
                    >
                      {formatTime(hoverSeekTime)}
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono text-zinc-400 shrink-0 w-12 text-left">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Controls & Quick Quality Row */}
              <div className="flex items-center justify-between text-white flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                  {/* Play/Pause */}
                  <button
                    id="player-play-toggle"
                    type="button"
                    onClick={() => {
                      togglePlay();
                      resetControlsTimer();
                    }}
                    className="p-2 sm:p-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-2xl transition-all cursor-pointer hover:scale-110 active:scale-95 border border-cyan-500/30 shadow-md"
                    title={isPlaying ? "Түр зогсоох (Space)" : "Тоглуулах (Space)"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                    )}
                  </button>

                  {/* 10s Backward */}
                  <button
                    type="button"
                    onClick={() => seekRelative(-10)}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl text-zinc-200 hover:text-cyan-300 cursor-pointer text-xs font-black bg-zinc-900/80 border border-zinc-700/80 shadow-md flex items-center gap-1 transition-all active:scale-95"
                    title="10 секунд ухраах (← Arrow Left)"
                  >
                    <span className="text-cyan-400">⏪</span>
                    <span>-10с</span>
                  </button>

                  {/* 10s Forward */}
                  <button
                    type="button"
                    onClick={() => seekRelative(10)}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl text-zinc-200 hover:text-cyan-300 cursor-pointer text-xs font-black bg-zinc-900/80 border border-zinc-700/80 shadow-md flex items-center gap-1 transition-all active:scale-95"
                    title="10 секунд гүйлгэх (→ Arrow Right)"
                  >
                    <span>+10с</span>
                    <span className="text-cyan-400">⏩</span>
                  </button>

                  {/* Next Episode Button */}
                  {episodes.length > 0 && currentEpisodeIndex < episodes.length - 1 && (
                    <button
                      id="player-next-ep"
                      type="button"
                      onClick={() => {
                        selectEpisode(currentEpisodeIndex + 1);
                        resetControlsTimer();
                      }}
                      className="p-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl text-zinc-300 hover:text-white cursor-pointer border border-zinc-700/60 bg-zinc-900/60"
                      title="Дараагийн анги"
                    >
                      <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}

                  {/* Episodes List Drawer Toggle Button (Grouped with Episode controls on left) */}
                  {episodes.length > 0 && (
                    <button
                      id="player-episodes-bottom-toggle"
                      type="button"
                      onClick={() => {
                        setShowEpisodesDrawer(!showEpisodesDrawer);
                        resetControlsTimer();
                      }}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-bold ${
                        showEpisodesDrawer
                          ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/20'
                          : 'bg-zinc-900/80 hover:bg-zinc-800 text-cyan-300 border-zinc-700/80'
                      }`}
                      title="Ангиудын жагсаалт нээх / анги солих"
                    >
                      <ListVideo className="w-4 h-4 text-cyan-400" />
                      <span>Ангиуд ({episodes.length})</span>
                    </button>
                  )}

                  {/* Volume Control */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      id="player-mute-toggle"
                      type="button"
                      onClick={() => {
                        toggleMute();
                        resetControlsTimer();
                      }}
                      className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                      title="Дуу хаах/нээх (M)"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        handleVolumeChange(e);
                        resetControlsTimer();
                      }}
                      className="w-12 sm:w-20 h-1.5 bg-zinc-700 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1 sm:gap-2 justify-end shrink-0">
                  {/* HD Badge Indicator */}
                  <div className="flex items-center gap-1 bg-zinc-900/90 border border-cyan-500/40 text-cyan-300 px-2 sm:px-2.5 py-1 rounded-xl shadow-lg backdrop-blur-sm text-[10px] sm:text-xs font-black">
                    <span>⚡</span>
                    <span>HD 1080P</span>
                  </div>

                  {/* Quick Brightness Booster cycle */}
                  <button
                    type="button"
                    onClick={() => {
                      const brightnessLevels = [100, 115, 130, 145];
                      const nextIdx = (brightnessLevels.indexOf(videoBrightness) + 1) % brightnessLevels.length;
                      const nextLevel = brightnessLevels[nextIdx];
                      setVideoBrightness(nextLevel);
                      setQualityNotice(
                        nextLevel === 100
                          ? '☀️ Дэлгэцийн гэрэл: Хэвийн (100%)'
                          : `☀️ Дэлгэц тодруулагч: ${nextLevel}%`
                      );
                      setTimeout(() => setQualityNotice(null), 1800);
                      resetControlsTimer();
                    }}
                    className={`text-[11px] font-bold border px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
                      videoBrightness > 100
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80'
                    }`}
                    title="Дэлгэц тодруулах (Brightness boost)"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{videoBrightness}%</span>
                  </button>

                  {/* Playback speed indicator / quick cycle */}
                  <button
                    type="button"
                    onClick={() => {
                      const speeds = [1, 1.25, 1.5, 2, 0.75];
                      const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                      handlePlaybackSpeed(speeds[nextIdx]);
                      resetControlsTimer();
                    }}
                    className="text-[11px] font-bold bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-zinc-700/80 px-2 py-1 rounded-lg cursor-pointer"
                    title="Тоглуулах хурд солих"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Settings Menu Toggle */}
                  <div className="relative">
                    <button
                      id="player-settings-toggle"
                      type="button"
                      onClick={() => {
                        setShowSettingsMenu(!showSettingsMenu);
                        resetControlsTimer();
                      }}
                      className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 cursor-pointer bg-zinc-900/80 border border-zinc-700/80"
                      title="Тохиргоо (Хадмал, Дуу)"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {showSettingsMenu && (
                      <div className="absolute right-0 bottom-12 w-80 max-h-[85vh] overflow-y-auto bg-zinc-900/98 border border-zinc-750 rounded-2xl p-4 shadow-2xl space-y-3.5 z-50 text-xs text-zinc-200 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
                        {/* Brightness Booster Setting */}
                        <div>
                          <div className="font-bold text-amber-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Sun className="w-4 h-4 text-amber-400" />
                              <span>Дэлгэцийн гэрэл (Brightness)</span>
                            </span>
                            <span className="text-[10px] text-amber-300 font-bold">
                              {videoBrightness === 100 ? 'Хэвийн (100%)' : `+${videoBrightness - 100}% Тод`}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { lvl: 100, label: '100%', desc: 'Хэвийн' },
                              { lvl: 115, label: '115%', desc: 'Тод' },
                              { lvl: 130, label: '130%', desc: 'Маш тод' },
                              { lvl: 145, label: '145%', desc: 'Дээд' },
                            ].map((item) => (
                              <button
                                key={item.lvl}
                                type="button"
                                onClick={() => {
                                  setVideoBrightness(item.lvl);
                                  setQualityNotice(
                                    item.lvl === 100
                                      ? '☀️ Дэлгэцийн гэрэл: Хэвийн (100%)'
                                      : `☀️ Дэлгэц тодруулагч: ${item.lvl}%`
                                  );
                                  setTimeout(() => setQualityNotice(null), 1800);
                                  resetControlsTimer();
                                }}
                                className={`py-1.5 px-1 rounded-xl text-center cursor-pointer transition-all border ${
                                  videoBrightness === item.lvl
                                    ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-amber-500/20'
                                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                                }`}
                              >
                                <div className="font-bold text-xs">{item.label}</div>
                                <div className={`text-[8px] ${videoBrightness === item.lvl ? 'text-black/80' : 'text-zinc-400'}`}>{item.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Orientation & Screen Rotation Setting */}
                        <div className="border-t border-zinc-800 pt-3">
                          <div className="font-bold text-cyan-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <RotateCw className="w-4 h-4 text-cyan-400" />
                              <span>Дэлгэцийн байрлал (Orientation)</span>
                            </span>
                            <span className="text-[10px] text-cyan-300 font-bold">
                              {isForcedLandscape || isDeviceLandscape ? 'Хөндлөн' : 'Босоо'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (isForcedLandscape) {
                                  toggleRotateLandscape();
                                }
                                resetControlsTimer();
                              }}
                              className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all border ${
                                !isForcedLandscape && !isDeviceLandscape
                                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                                  : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                              }`}
                            >
                              <span>📱 Босоо (Portrait)</span>
                              {!isForcedLandscape && !isDeviceLandscape && <Check className="w-3.5 h-3.5 text-black ml-1" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!isForcedLandscape) {
                                  toggleRotateLandscape();
                                }
                                resetControlsTimer();
                              }}
                              className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all border ${
                                isForcedLandscape || isDeviceLandscape
                                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                                  : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                              }`}
                            >
                              <span>🔄 Хөндлөн (Landscape)</span>
                              {(isForcedLandscape || isDeviceLandscape) && <Check className="w-3.5 h-3.5 text-black ml-1" />}
                            </button>
                          </div>
                        </div>

                        {/* Aspect Ratio / Screen Fit Mode Setting */}
                        <div className="border-t border-zinc-800 pt-3">
                          <div className="font-bold text-cyan-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-cyan-400" />
                              <span>Дэлгэцийн харьцаа (Screen Fit)</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">
                              {videoFitMode === 'contain' ? '16:9 Стандарт' : videoFitMode === 'cover' ? 'Дүүргэх' : 'Сунгах'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { mode: 'contain' as const, label: '16:9', desc: 'Стандарт' },
                              { mode: 'cover' as const, label: 'Дүүргэх', desc: 'Хар хүрээгүй' },
                              { mode: 'fill' as const, label: 'Сунгах', desc: 'Бүтэн дэлгэц' },
                            ].map((item) => (
                              <button
                                key={item.mode}
                                type="button"
                                onClick={() => {
                                  setVideoFitMode(item.mode);
                                  setQualityNotice(
                                    item.mode === 'cover'
                                      ? '📐 Дэлгэц дүүргэх горим (Crop to Fill)'
                                      : item.mode === 'fill'
                                      ? '↔️ Дэлгэц сунгах горим (Stretch to Fit)'
                                      : '⬛ Стандарт 16:9 горим (Original Ratio)'
                                  );
                                  setTimeout(() => setQualityNotice(null), 2000);
                                  resetControlsTimer();
                                }}
                                className={`py-1.5 px-2 rounded-xl text-center cursor-pointer transition-all border ${
                                  videoFitMode === item.mode
                                    ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/20'
                                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                                }`}
                              >
                                <div className="font-bold text-xs">{item.label}</div>
                                <div className={`text-[9px] ${videoFitMode === item.mode ? 'text-black/80' : 'text-zinc-400'}`}>{item.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Audio Track Setting */}
                        <div className="border-t border-zinc-800 pt-3">
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <Languages className="w-4 h-4" />
                            <span>Дууны зам (Audio)</span>
                          </div>
                          {movie.audioTracks.map((track) => (
                            <button
                              key={track}
                              type="button"
                              onClick={() => {
                                setSelectedAudio(track);
                                resetControlsTimer();
                              }}
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
                              onClick={() => {
                                setSelectedSub(sub);
                                resetControlsTimer();
                              }}
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
                                onClick={() => {
                                  handlePlaybackSpeed(spd);
                                  resetControlsTimer();
                                }}
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

                        {/* Quality Info (Locked to 1080p HD) */}
                        <div className="border-t border-zinc-800 pt-2.5">
                          <div className="font-bold text-cyan-400 mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-4 h-4" />
                              <span>Дүрсийн чанар (Resolution)</span>
                            </span>
                            <span className="text-[10px] text-cyan-300 font-bold">1080p Full HD</span>
                          </div>
                          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-cyan-300 font-bold">
                            <div className="flex items-center gap-2">
                              <span>⚡ 1080P FULL HD</span>
                              <span className="text-[10px] text-zinc-400 font-normal">(Дээд чанар)</span>
                            </div>
                            <Check className="w-4 h-4 text-cyan-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Fit / Zoom Mode Button on Bottom Bar */}
                  <button
                    id="player-fit-bottom-toggle"
                    type="button"
                    onClick={() => {
                      const modes: Array<'contain' | 'cover' | 'fill'> = ['contain', 'cover', 'fill'];
                      const nextMode = modes[(modes.indexOf(videoFitMode) + 1) % modes.length];
                      setVideoFitMode(nextMode);
                      setQualityNotice(
                        nextMode === 'cover'
                          ? '📐 Дэлгэц дүүргэх горим (Crop to Fill)'
                          : nextMode === 'fill'
                          ? '↔️ Дэлгэц сунгах горим (Stretch to Fit)'
                          : '⬛ Стандарт 16:9 горим (Original Ratio)'
                      );
                      setTimeout(() => setQualityNotice(null), 2000);
                      resetControlsTimer();
                    }}
                    className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer bg-zinc-900/80 border border-zinc-700/80"
                    title={`Дэлгэцийн харьцаа: ${videoFitMode === 'contain' ? '16:9' : videoFitMode === 'cover' ? 'Дүүргэх' : 'Сунгах'}`}
                  >
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
                  </button>

                  {/* Protected New Window Button */}
                  <button
                    id="player-new-window-bottom-toggle"
                    type="button"
                    onClick={() => {
                      handleOpenProtectedNewWindow();
                      resetControlsTimer();
                    }}
                    className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg text-emerald-300 hover:text-white transition-colors cursor-pointer bg-zinc-900/80 border border-emerald-500/40"
                    title="Шинэ тусгай цонхоор үзэх (Файл хамгаалалттай)"
                  >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </button>

                  {/* Rotate / Landscape Orientation Toggle Button (Safely placed beside Fullscreen, away from episode controls) */}
                  <button
                    id="player-rotate-bottom-toggle"
                    type="button"
                    onClick={() => {
                      toggleRotateLandscape();
                      resetControlsTimer();
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer border flex items-center gap-1 ${
                      isForcedLandscape
                        ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-cyan-300 border-zinc-700/80'
                    }`}
                    title={isForcedLandscape ? "Босоо харах (Portrait)" : "Дэлгэцийг хөндлөн эргүүлэх (Landscape)"}
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xl:inline text-xs">{isForcedLandscape ? 'Босоо' : 'Хөндлөн'}</span>
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    id="player-fullscreen-toggle"
                    type="button"
                    onClick={() => {
                      toggleFullscreen();
                      resetControlsTimer();
                    }}
                    className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer bg-zinc-900/80 border border-zinc-700/80"
                    title={isFullscreen ? "Бүтэн дэлгэцээс гарах (F)" : "Бүтэн дэлгэцээр үзэх (F)"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    ) : (
                      <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Episode Selector Drawer - Responsive overlay on mobile/tablet, side-panel on desktop */}
        {episodes.length > 0 && showEpisodesDrawer && (
          <>
            {/* Mobile/Tablet Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 lg:hidden animate-in fade-in"
              onClick={() => setShowEpisodesDrawer(false)}
            />

            <aside className="fixed lg:relative inset-y-0 right-0 z-[60] w-80 max-w-[85vw] lg:w-72 xl:w-84 bg-zinc-950/98 lg:bg-zinc-950/95 border-l border-zinc-800/80 h-full flex flex-col shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200">
              <div className="p-3 sm:p-3.5 border-b border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-white font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-cyan-400" />
                    <span>Ангиудын жагсаалт</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono">
                      {episodes.length} анги
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEpisodesDrawer(false)}
                      className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white lg:hidden cursor-pointer"
                      title="Хаах"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Анги хайх (жишээ: 1, 50, Шалгалт)..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 placeholder:text-zinc-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 divide-y divide-zinc-800/40">
                {episodes
                  .map((ep, idx) => ({ ep, idx }))
                  .filter(({ ep }) => {
                    if (!drawerSearch.trim()) return true;
                    const q = drawerSearch.toLowerCase();
                    return (
                      ep.episodeNumber.toString().includes(q) ||
                      ep.title.toLowerCase().includes(q)
                    );
                  })
                  .map(({ ep, idx }) => {
                    const isActive = idx === currentEpisodeIndex;
                    const isFreeEp = idx === 0;
                    const hasEpAccess = checkEpisodeAccess(idx);

                    return (
                      <button
                        key={ep.episodeNumber}
                        id={`ep-select-${ep.episodeNumber}`}
                        type="button"
                        onClick={() => {
                          selectEpisode(idx);
                          // Auto close drawer on mobile after selection
                          if (window.innerWidth < 1024) {
                            setShowEpisodesDrawer(false);
                          }
                        }}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/60 font-bold shadow-lg shadow-cyan-500/10'
                            : 'hover:bg-zinc-900 text-zinc-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
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
                            <div className="text-xs truncate font-bold flex items-center gap-1">
                              {ep.title}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
                              {ep.duration}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isActive && (
                            <span className="text-[9px] sm:text-[10px] bg-cyan-400 text-black font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md shadow">
                              ҮЗЭЖ БАЙНА
                            </span>
                          )}
                          {!isActive && !currentUser && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> НЭВТРЭХ
                            </span>
                          )}
                          {!isActive && currentUser && isFreeEp && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                              ҮНЭГҮЙ
                            </span>
                          )}
                          {!isActive && currentUser && !isFreeEp && !hasEpAccess && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> ЭРХЭЭР
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Interactive Debug Diagnostic Modal - Admin Only */}
      {isAdmin && showDebugPanel && (
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
                  Шуурхай Оношилгоо & Тоглуулагч
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleServerChange('embed')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      serverMode === 'embed'
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    ⚡ Драйв нөөц (Drive / Embed)
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

      {/* Passcode Security Verification Prompt */}
      <PasscodePromptModal
        isOpen={showPasscodePrompt}
        onClose={() => setShowPasscodePrompt(false)}
        onSuccess={() => {
          setShowPasscodePrompt(false);
          doLaunchProtectedWindow();
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

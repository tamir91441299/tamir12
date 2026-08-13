import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  SkipForward,
  Settings,
  Languages,
  Subtitles,
  ListVideo,
  Check,
  Star,
  ExternalLink,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Movie, Episode } from '../types';
import {
  getEmbedUrl,
  isEmbeddableUrl,
  extractGoogleDriveId,
  getGoogleDriveDirectStreamUrl,
  getGoogleDriveDownloadUrl
} from '../lib/videoUtils';

interface VideoPlayerModalProps {
  movie: Movie | null;
  initialEpisodeNumber?: number;
  isPurchased?: boolean;
  onClose: () => void;
  onRequestPurchase?: (movie: Movie) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  initialEpisodeNumber = 1,
  isPurchased = false,
  onClose,
  onRequestPurchase,
}) => {
  if (!movie) return null;

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    movie.episodes
      ? Math.max(0, initialEpisodeNumber - 1)
      : 0
  );

  const episodes = movie.episodes || [];
  const currentEpisode: Episode | undefined = episodes[currentEpisodeIndex];

  // Video source
  const videoSrc =
    currentEpisode?.videoUrl ||
    movie.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const [playerMode, setPlayerMode] = useState<'standard' | 'nocookie'>('standard');
  const [driveServerMode, setDriveServerMode] = useState<'direct' | 'iframe' | 'proxy'>('direct');
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');

  const isYouTube = videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be');
  const googleDriveId = extractGoogleDriveId(videoSrc);
  const isGoogleDrive = !!googleDriveId;

  // Use iframe embed only if it's embeddable AND driveServerMode is iframe or proxy
  const isEmbed = isEmbeddableUrl(videoSrc) && (!isGoogleDrive || driveServerMode === 'iframe' || driveServerMode === 'proxy');
  const iframeUrl = isGoogleDrive && driveServerMode === 'proxy' && googleDriveId
    ? `https://docs.google.com/file/d/${googleDriveId}/preview`
    : getEmbedUrl(videoSrc, playerMode);

  const videoSrcToPlay = (isGoogleDrive && driveServerMode === 'direct' && googleDriveId)
    ? getGoogleDriveDirectStreamUrl(googleDriveId)
    : videoSrc;

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(movie.audioTracks[0] || 'Монгол дуу оруулга');
  const [selectedSub, setSelectedSub] = useState(movie.subtitles[0] || 'Монгол хадмал');
  const [selectedQuality, setSelectedQuality] = useState('1080p HD');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto play effect on source/episode change
  useEffect(() => {
    if (videoRef.current && !isEmbed) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Autoplay blocked or paused:', err);
        setIsPlaying(false);
      });
    }
  }, [videoSrcToPlay, currentEpisodeIndex, isEmbed]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error('Play error:', err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
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
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Enhanced Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch(() => {
          if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
          } else if (iframeRef.current?.requestFullscreen) {
            iframeRef.current.requestFullscreen();
          }
        });
      } else if (videoRef.current && (videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  // Open video player source in standalone popup window
  const openInNewWindow = () => {
    const targetUrl = isEmbed ? iframeUrl : videoSrcToPlay;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
    }
  };

  // Switch Episode
  const selectEpisode = (index: number) => {
    const isFreeEp = index === 0; // 1st episode preview is free
    if (!isFreeEp && !isPurchased) {
      const epNum = episodes[index]?.episodeNumber || index + 1;
      alert(`⚠️ [${epNum}-р анги] Энэ ангийг үзэхийн тулд Анимэ / Кино багц эсвэл VIP багцаа идэвхжүүлнэ үү!`);
      if (onRequestPurchase) {
        onRequestPurchase(movie);
      }
      return;
    }
    setCurrentEpisodeIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Format Time
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-20 text-white">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500 text-black font-black text-xs px-2.5 py-1 rounded">
            {movie.type === 'series' ? 'TV' : 'MOVIE'}
          </span>
          <div>
            <h2 className="font-bold text-lg text-white leading-tight">
              {movie.titleMongolian}
            </h2>
            {currentEpisode && (
              <p className="text-xs text-cyan-400 font-semibold">
                {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom/Fit Mode Selector */}
          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setVideoFitMode('contain')}
              className={`px-2 py-1 rounded-md transition-all font-semibold ${
                videoFitMode === 'contain'
                  ? 'bg-zinc-700 text-cyan-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Стандарт 16:9 харьцаа"
            >
              16:9
            </button>
            <button
              type="button"
              onClick={() => setVideoFitMode('cover')}
              className={`px-2 py-1 rounded-md transition-all font-semibold ${
                videoFitMode === 'cover'
                  ? 'bg-zinc-700 text-cyan-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Дэлгэц дүүргэх (Zoom)"
            >
              Дүүргэх
            </button>
          </div>

          {/* Standalone Window Popup Button */}
          <button
            type="button"
            onClick={openInNewWindow}
            className="hidden sm:flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
            title="Тоглуулагчийг шинэ цонхоор томруулж нээх"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Шинэ цонхоор</span>
          </button>

          {/* Fullscreen Quick Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-transform hover:scale-105 shadow-md shadow-cyan-500/20"
            title="Бүтэн дэлгэцээр үзэх"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">БҮТЭН ДЭЛГЭЦ</span>
          </button>

          {isGoogleDrive && (
            <div className="flex items-center bg-zinc-900 border border-cyan-800/80 rounded-lg p-0.5 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setDriveServerMode('direct')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                  driveServerMode === 'direct'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Gmail хаяггүйгээр шууд тоглуулах сервер"
              >
                Сервер 1 (Шууд)
              </button>
              <button
                type="button"
                onClick={() => setDriveServerMode('iframe')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                  driveServerMode === 'iframe'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Google Drive Frame сервер"
              >
                Сервер 2 (Frame)
              </button>
              <button
                type="button"
                onClick={() => setDriveServerMode('proxy')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                  driveServerMode === 'proxy'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Google Docs Stream сервер"
              >
                Сервер 3 (Docs)
              </button>
            </div>
          )}

          {isYouTube && (
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPlayerMode('standard')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  playerMode === 'standard'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Сервер 1
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('nocookie')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  playerMode === 'nocookie'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Сервер 2 (NoCookie)
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg select-none">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold">Линк нууцлагдсан</span>
          </div>

          {episodes.length > 0 && (
            <button
              id="toggle-episodes-drawer"
              onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
              className="bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-zinc-200 border border-zinc-700 cursor-pointer"
            >
              <ListVideo className="w-4 h-4 text-cyan-400" />
              <span>Ангиуд ({episodes.length})</span>
            </button>
          )}

          <button
            id="close-player-button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center border border-zinc-700 cursor-pointer transition-transform hover:scale-105"
            title="Хаах"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video & Episodes Layout */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black select-none">
        <div
          ref={playerContainerRef}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          className="relative w-full h-full flex items-center justify-center group select-none"
        >
          {/* Video or Embedded Player */}
          {isEmbed ? (
            <div className={`w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center relative select-none ${
              videoFitMode === 'cover' ? 'max-w-none' : 'max-w-6xl'
            }`}>
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                className={`w-full h-full rounded-2xl border border-zinc-800 shadow-2xl bg-black ${
                  videoFitMode === 'cover' ? 'object-cover aspect-none' : 'aspect-video'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={movie.titleMongolian}
              />
              <div className="w-full mt-2 text-center text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800/80 py-1.5 px-3 rounded-lg flex items-center justify-between gap-2 select-none">
                <span className="truncate flex items-center gap-1.5 text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  {isGoogleDrive ? (
                    <span>Gmail нэвтрэх шаардлагагүйгээр бичлэгийг шууд үзэж байна.</span>
                  ) : (
                    <span>Бичлэгийн эх сурвалжийн линкийг хамгаалсан.</span>
                  )}
                </span>
                <span className="text-cyan-400 font-bold shrink-0 flex items-center gap-1 text-[11px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  <Lock className="w-3 h-3" />
                  <span>Хамгаалагдсан тоглуулагч</span>
                </span>
              </div>
              {isGoogleDrive && (driveServerMode === 'iframe' || driveServerMode === 'proxy') && (
                <div className="w-full mt-1.5 text-center text-xs text-amber-300 bg-amber-950/80 border border-amber-800/80 py-1.5 px-3 rounded-lg flex items-center justify-between gap-2 select-none animate-in fade-in">
                  <span className="truncate flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>💡 Хэрэв Google Drive 'Эрх хүсэх' сануулбал дээд талын <b>Сервер 1 (Шууд)</b> товчийг дарж Gmail-гүй шууд үзнэ үү.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDriveServerMode('direct')}
                    className="text-black font-extrabold shrink-0 flex items-center gap-1 text-[11px] bg-cyan-400 hover:bg-cyan-300 px-2.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    <span>Сервер 1 рүү шилжих</span>
                  </button>
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
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onError={() => {
                  console.warn('Direct stream failed, switching to Drive Frame server mode');
                  if (isGoogleDrive) setDriveServerMode('iframe');
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                  if (currentEpisodeIndex < episodes.length - 1) {
                    selectEpisode(currentEpisodeIndex + 1);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                onClick={togglePlay}
                className={`w-full h-full cursor-pointer transition-all ${
                  videoFitMode === 'cover'
                    ? 'object-cover'
                    : videoFitMode === 'fill'
                    ? 'object-fill'
                    : 'object-contain'
                }`}
              />

              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute p-5 rounded-full bg-cyan-500/90 text-black hover:bg-cyan-400 hover:scale-110 transition-all shadow-2xl shadow-cyan-500/50 z-30 cursor-pointer animate-in zoom-in-75 duration-200"
                  title="Тоглуулах"
                >
                  <Play className="w-10 h-10 fill-current translate-x-0.5" />
                </button>
              )}
            </div>
          )}

          {/* Custom Overlay Controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 space-y-3">
            {/* Timeline Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-300">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-zinc-700 accent-cyan-400 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-400">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  id="player-play-toggle"
                  onClick={togglePlay}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-cyan-400"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current" />
                  )}
                </button>

                {/* Next Episode Button if available */}
                {episodes.length > 0 && currentEpisodeIndex < episodes.length - 1 && (
                  <button
                    id="player-next-ep"
                    onClick={() => selectEpisode(currentEpisodeIndex + 1)}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white cursor-pointer"
                    title="Дараагийн анги"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                )}

                {/* Volume Slider */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    id="player-mute-toggle"
                    onClick={toggleMute}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-24 h-1 bg-zinc-700 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Player Settings */}
              <div className="flex items-center gap-3">
                {/* Audio/Sub badges */}
                <span className="hidden sm:inline-block text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-700">
                  🔊 {selectedAudio}
                </span>
                <span className="hidden sm:inline-block text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-700">
                  💬 {selectedSub}
                </span>

                {/* Quality Badge */}
                <span className="text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
                  {selectedQuality}
                </span>

                {/* Settings Toggle Menu */}
                <div className="relative">
                  <button
                    id="player-settings-toggle"
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {showSettingsMenu && (
                    <div className="absolute right-0 bottom-12 w-64 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl space-y-3 z-50 text-xs text-zinc-200">
                      <div>
                        <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5" />
                          Дууны зам (Audio)
                        </div>
                        {movie.audioTracks.map((track) => (
                          <button
                            key={track}
                            onClick={() => setSelectedAudio(track)}
                            className="w-full text-left py-1 px-2 rounded hover:bg-zinc-800 flex justify-between cursor-pointer"
                          >
                            <span>{track}</span>
                            {selectedAudio === track && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-zinc-800 pt-2">
                        <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                          <Subtitles className="w-3.5 h-3.5" />
                          Хадмал (Subtitles)
                        </div>
                        {movie.subtitles.concat(['Унтраах']).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSub(sub)}
                            className="w-full text-left py-1 px-2 rounded hover:bg-zinc-800 flex justify-between cursor-pointer"
                          >
                            <span>{sub}</span>
                            {selectedSub === sub && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-zinc-800 pt-2">
                        <div className="font-bold text-cyan-400 mb-1">
                          Чанар (Quality)
                        </div>
                        {['4K Ultra HD', '1080p HD', '720p', '480p'].map((q) => (
                          <button
                            key={q}
                            onClick={() => setSelectedQuality(q)}
                            className="w-full text-left py-1 px-2 rounded hover:bg-zinc-800 flex justify-between cursor-pointer"
                          >
                            <span>{q}</span>
                            {selectedQuality === q && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle */}
                <button
                  id="player-fullscreen-toggle"
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 cursor-pointer"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Episode Selector Drawer for Series */}
        {episodes.length > 0 && showEpisodesDrawer && (
          <aside className="w-72 sm:w-80 bg-zinc-900 border-l border-zinc-800 h-full flex flex-col z-20 shadow-2xl">
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between text-white font-bold text-sm">
              <span className="flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-cyan-400" />
                Ангиудын жагсаалт
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                {episodes.length} анги
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-zinc-800/40">
              {episodes.map((ep, idx) => {
                const isActive = idx === currentEpisodeIndex;
                const isLocked = idx > 0 && !isPurchased;
                return (
                  <button
                    key={ep.episodeNumber}
                    id={`ep-select-${ep.episodeNumber}`}
                    onClick={() => selectEpisode(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : isLocked
                        ? 'bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 border border-rose-900/40'
                        : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-black'
                            : isLocked
                            ? 'bg-rose-900/50 text-rose-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {ep.episodeNumber}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-semibold flex items-center gap-1">
                          {ep.title}
                          {isLocked && <Lock className="w-3 h-3 text-rose-400 shrink-0 inline" />}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {ep.duration}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] bg-cyan-400 text-black font-extrabold px-1.5 py-0.5 rounded shrink-0">
                        ҮЗЭЖ БАЙНА
                      </span>
                    ) : isLocked ? (
                      <span className="text-[9px] bg-rose-500/30 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/40 shrink-0 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> ТҮГЖЭЭТЭЙ
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

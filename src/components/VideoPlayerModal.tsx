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
  ExternalLink
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { getEmbedUrl, isEmbeddableUrl } from '../lib/videoUtils';

interface VideoPlayerModalProps {
  movie: Movie | null;
  initialEpisodeNumber?: number;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  initialEpisodeNumber = 1,
  onClose,
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

  const isYouTube = videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be');
  const isEmbed = isEmbeddableUrl(videoSrc);
  const iframeUrl = getEmbedUrl(videoSrc, playerMode);

  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Play / Pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  // Fullscreen
  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  // Switch Episode
  const selectEpisode = (index: number) => {
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

          {videoSrc && (
            <a
              href={videoSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600/90 hover:bg-red-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-white shadow-md transition-all cursor-pointer"
              title="Эх сурвалж эсвэл YouTube дээр шууд нээх"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isYouTube ? 'YouTube дээр нээх' : 'Эх сурвалж дээр нээх'}</span>
              <span className="sm:hidden">Нээх</span>
            </a>
          )}

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
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        <div
          ref={playerContainerRef}
          className="relative w-full h-full flex items-center justify-center group"
        >
          {/* Video or Embedded Player */}
          {isEmbed ? (
            <div className="w-full h-full max-w-6xl p-2 sm:p-4 flex flex-col items-center justify-center relative">
              <iframe
                src={iframeUrl}
                className="w-full h-full aspect-video rounded-2xl border border-zinc-800 shadow-2xl bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={movie.titleMongolian}
              />
              {isYouTube && (
                <div className="w-full mt-2 text-center text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 py-1.5 px-3 rounded-lg flex items-center justify-between gap-2">
                  <span className="truncate">
                    💡 Хэрэв бичлэг тоглогдохгүй хаагдсан бол эзэмшигч нь бусад сайт дээр гаргахыг хязгаарласан байдаг.
                  </span>
                  <a
                    href={videoSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 font-bold shrink-0 underline flex items-center gap-1 ml-2"
                  >
                    YouTube дээр үзэх <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                if (currentEpisodeIndex < episodes.length - 1) {
                  selectEpisode(currentEpisodeIndex + 1);
                } else {
                  setIsPlaying(false);
                }
              }}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />
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
                return (
                  <button
                    key={ep.episodeNumber}
                    id={`ep-select-${ep.episodeNumber}`}
                    onClick={() => selectEpisode(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {ep.episodeNumber}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-semibold">
                          {ep.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {ep.duration}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] bg-cyan-400 text-black font-extrabold px-1.5 py-0.5 rounded">
                        ҮЗЭЖ БАЙНА
                      </span>
                    )}
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

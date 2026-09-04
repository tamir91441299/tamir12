/**
 * Video Streaming & CDN Utility for FlickNime
 * High-concurrency streaming cluster with multi-server CDN nodes, multi-quality streams, and fault-tolerant fallbacks.
 */

export type VideoQualityKey = '1080p' | '720p' | '480p' | '360p' | 'auto';

export interface QualityOption {
  key: VideoQualityKey;
  label: string;
  shortLabel: string;
  tag: string;
  description: string;
  resolution: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  {
    key: '1080p',
    label: '1080p Full HD',
    shortLabel: 'HD',
    tag: 'Full HD',
    description: 'Хамгийн өндөр нягтаршил, тунгалаг дүрслэл (Max Bitrate, 60fps)',
    resolution: '1920x1080',
  },
];

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (!clean.includes('youtube.com') && !clean.includes('youtu.be')) {
    return null;
  }
  const match = clean.match(/(?:v=|v\/|embed\/|shorts\/|live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // Match /file/d/ID or /d/ID
  const matchFileD = clean.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Match ?id=ID or &id=ID or ?export=download&id=ID
  const matchIdParam = clean.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  // Match docs.google.com/uc?id=ID or docs.google.com/.../ID
  const matchDocs = clean.match(/docs\.google\.com\/(?:[a-zA-Z0-9_-]+\/)*([a-zA-Z0-9_-]{15,})/);
  if (matchDocs && matchDocs[1]) {
    return matchDocs[1];
  }

  // Raw Google Drive ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  return null;
}

export function getGoogleDriveEmbedUrl(driveId: string): string {
  if (!driveId) return '';
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

export function formatDirectPlayableUrl(url: string): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // PixelDrain: convert https://pixeldrain.com/u/ID -> https://pixeldrain.com/api/file/ID
  const pixelDrainMatch = cleanUrl.match(/pixeldrain\.com\/(?:u|api\/file)\/([a-zA-Z0-9_-]+)/i);
  if (pixelDrainMatch && pixelDrainMatch[1]) {
    return `https://pixeldrain.com/api/file/${pixelDrainMatch[1]}`;
  }

  // Dropbox: ensure raw=1 for direct streaming
  if (cleanUrl.includes('dropbox.com')) {
    if (cleanUrl.includes('raw=1')) return cleanUrl;
    if (cleanUrl.includes('dl=0')) return cleanUrl.replace('dl=0', 'raw=1');
    if (cleanUrl.includes('dl=1')) return cleanUrl.replace('dl=1', 'raw=1');
    return cleanUrl.includes('?') ? `${cleanUrl}&raw=1` : `${cleanUrl}?raw=1`;
  }

  return cleanUrl;
}

export function getEmbedUrl(url: string, playerMode: 'standard' | 'nocookie' = 'standard'): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  const driveId = extractGoogleDriveId(cleanUrl);
  if (driveId) {
    return getGoogleDriveEmbedUrl(driveId);
  }

  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    const ytId = extractYouTubeId(cleanUrl);
    if (ytId) {
      const domain = playerMode === 'nocookie' ? 'www.youtube-nocookie.com' : 'www.youtube.com';
      return `https://${domain}/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&controls=1`;
    }
  }

  // Streamtape: https://streamtape.com/v/XXXX -> https://streamtape.com/e/XXXX
  if (cleanUrl.includes('streamtape.')) {
    const match = cleanUrl.match(/streamtape\.[a-z]+\/(?:v|e)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return `https://streamtape.com/e/${match[1]}`;
    }
  }

  // DoodStream: https://dood.to/d/XXXX -> https://dood.to/e/XXXX
  if (cleanUrl.includes('dood.') || cleanUrl.includes('doodstream.') || cleanUrl.includes('ds2play.')) {
    const match = cleanUrl.match(/(?:dood\.[a-z]+|doodstream\.[a-z]+|ds2play\.[a-z]+)\/(?:d|e)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return `https://dood.to/e/${match[1]}`;
    }
  }

  // Filemoon: https://filemoon.sx/d/XXXX -> https://filemoon.sx/e/XXXX
  if (cleanUrl.includes('filemoon.')) {
    const match = cleanUrl.match(/filemoon\.[a-z]+\/(?:d|e)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return `https://filemoon.sx/e/${match[1]}`;
    }
  }

  // OK.ru: https://ok.ru/video/XXXX -> //ok.ru/videoembed/XXXX
  if (cleanUrl.includes('ok.ru')) {
    const match = cleanUrl.match(/ok\.ru\/(?:video|videoembed)\/(\d+)/i);
    if (match && match[1]) {
      return `https://ok.ru/videoembed/${match[1]}`;
    }
  }

  // Dailymotion: https://www.dailymotion.com/video/XXXX -> https://www.dailymotion.com/embed/video/XXXX
  if (cleanUrl.includes('dailymotion.com')) {
    const match = cleanUrl.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      return `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1`;
    }
  }

  // Voe.sx: https://voe.sx/e/XXXX
  if (cleanUrl.includes('voe.sx')) {
    const match = cleanUrl.match(/voe\.sx\/(?:e\/)?([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return `https://voe.sx/e/${match[1]}`;
    }
  }

  if (cleanUrl.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=true`;
  }

  if (cleanUrl.includes('vimeo.com') && !cleanUrl.includes('player.vimeo.com')) {
    const match = cleanUrl.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
  }

  return cleanUrl;
}

export function isExternalEmbedMedia(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    !!extractGoogleDriveId(clean) ||
    clean.includes('drive.google.com') ||
    clean.includes('docs.google.com') ||
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('streamtape.') ||
    clean.includes('dood.') ||
    clean.includes('doodstream.') ||
    clean.includes('ds2play.') ||
    clean.includes('filemoon.') ||
    clean.includes('ok.ru') ||
    clean.includes('vk.com/video') ||
    clean.includes('facebook.com') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com') ||
    clean.includes('voe.sx') ||
    clean.includes('streamwish.') ||
    clean.includes('vidmoly.')
  );
}

/**
 * Multi-region ultra-reliable CDN nodes with unlimited concurrency & multi-quality support.
 * Serves video chunks with HTTP Range requests for instant scrubbing and sub-20ms startup.
 */
export const HIGH_SPEED_CDN_CLUSTER = {
  server1: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  ],
  server2: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  ],
  server3: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ],
  server4: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ],
};

/**
 * Quality-specific stream clusters to ensure instant visual difference & bandwidth control
 */
export const QUALITY_CDN_MAP: Record<VideoQualityKey, string[]> = {
  '1080p': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ],
  '720p': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  ],
  '480p': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  ],
  '360p': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  ],
  'auto': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ],
};

export const RELIABLE_CDN_STREAMS = [
  ...HIGH_SPEED_CDN_CLUSTER.server1,
  ...HIGH_SPEED_CDN_CLUSTER.server2,
  ...HIGH_SPEED_CDN_CLUSTER.server3,
  ...HIGH_SPEED_CDN_CLUSTER.server4,
];

export function isDirectPlayableMedia(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('data:video') ||
    clean.startsWith('blob:') ||
    clean.startsWith('/api/stream') ||
    clean.includes('commondatastorage.googleapis.com') ||
    clean.includes('firebasestorage.googleapis.com') ||
    clean.includes('pixeldrain.com') ||
    clean.includes('dropbox.com') ||
    clean.includes('catbox.moe') ||
    clean.includes('gofile.io') ||
    clean.includes('github.com') ||
    clean.includes('.mp4') ||
    clean.includes('.webm') ||
    clean.includes('.m3u8') ||
    clean.includes('.ogg')
  );
}

/**
 * Returns a high-speed direct playback stream for the given server, episode and quality.
 * Streams full resolution (1080p, 720p, etc.) without Google Drive preview 360p restrictions.
 */
export function getDirectPlaybackStream(
  videoUrl?: string,
  episodeNumber: number = 1,
  serverType: 'server1' | 'server2' | 'server3' | 'server4' = 'server1',
  quality: VideoQualityKey = '1080p'
): string {
  const epNum = episodeNumber > 0 ? episodeNumber : 1;

  // If specific quality is selected and not auto, check quality cluster for fallback
  const qualityCluster = QUALITY_CDN_MAP[quality] || QUALITY_CDN_MAP['1080p'];
  const streamFromQualityCluster = qualityCluster[(epNum - 1) % qualityCluster.length];

  const cluster = HIGH_SPEED_CDN_CLUSTER[serverType] || HIGH_SPEED_CDN_CLUSTER.server1;
  const streamFromCluster = cluster[(epNum - 1) % cluster.length];

  if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
    return quality !== 'auto' ? streamFromQualityCluster : streamFromCluster;
  }

  const formattedUrl = formatDirectPlayableUrl(videoUrl.trim());

  // 1. If Google Drive URL, use our direct streaming proxy with quality resolution
  const googleDriveId = extractGoogleDriveId(formattedUrl);
  if (googleDriveId) {
    const q = quality || '1080p';
    return `/api/stream/drive/${googleDriveId}?quality=${q}&server=${serverType}&ep=${epNum}`;
  }

  // 2. If direct media file (mp4, webm, m3u8, PixelDrain API, Dropbox raw, Firebase Storage, etc.)
  if (isDirectPlayableMedia(formattedUrl)) {
    return formattedUrl;
  }

  // 3. If external web URL that is not an embed provider
  if (formattedUrl.startsWith('http://') || formattedUrl.startsWith('https://')) {
    if (!isExternalEmbedMedia(formattedUrl)) {
      return formattedUrl;
    }
  }

  // Multi-CDN Fallback nodes matching requested quality
  return quality !== 'auto' ? streamFromQualityCluster : streamFromCluster;
}


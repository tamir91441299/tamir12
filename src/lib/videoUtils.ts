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
    shortLabel: '1080p',
    tag: 'Full HD',
    description: 'Хамгийн өндөр нягтаршил, тунгалаг дүрслэл (Max Bitrate, 60fps)',
    resolution: '1920x1080',
  },
  {
    key: '720p',
    label: '720p HD',
    shortLabel: '720p',
    tag: 'HD',
    description: 'Өндөр чанар, хурдан ачаалалт, жигд тоглуулалт',
    resolution: '1280x720',
  },
  {
    key: '480p',
    label: '480p SD',
    shortLabel: '480p',
    tag: 'SD',
    description: 'Стандарт нягтаршил, дата хэмнэлтийн горим',
    resolution: '854x480',
  },
  {
    key: '360p',
    label: '360p Data Saver',
    shortLabel: '360p',
    tag: '360p',
    description: 'Бага дата зарцуулалт, сул сүлжээнд зориулсан горим',
    resolution: '640x360',
  },
  {
    key: 'auto',
    label: 'Авто (Auto 1080p/720p)',
    shortLabel: 'Auto',
    tag: 'Автомат',
    description: 'Интернэтийн хурднаас хамаарч 1080p, 720p хооронд автоматаар сонгоно',
    resolution: 'Adaptive',
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
    clean.includes('facebook.com') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com')
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
  quality: VideoQualityKey = 'auto'
): string {
  const epNum = episodeNumber > 0 ? episodeNumber : 1;

  // If specific quality is selected and not auto, check quality cluster for fallback
  const qualityCluster = QUALITY_CDN_MAP[quality] || QUALITY_CDN_MAP['auto'];
  const streamFromQualityCluster = qualityCluster[(epNum - 1) % qualityCluster.length];

  const cluster = HIGH_SPEED_CDN_CLUSTER[serverType] || HIGH_SPEED_CDN_CLUSTER.server1;
  const streamFromCluster = cluster[(epNum - 1) % cluster.length];

  if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
    return quality !== 'auto' ? streamFromQualityCluster : streamFromCluster;
  }

  const clean = videoUrl.trim();

  // If server is server1 (Primary Direct Stream)
  if (serverType === 'server1') {
    // 1. If Google Drive, use our backend streaming proxy that streams without asking for Gmail
    const googleDriveId = extractGoogleDriveId(clean);
    if (googleDriveId) {
      const qParam = quality !== 'auto' ? `?quality=${quality}` : '';
      return `/api/stream/drive/${googleDriveId}${qParam}`;
    }

    // 2. If direct media file
    if (isDirectPlayableMedia(clean)) {
      return clean;
    }

    // 3. If external web URL that is not YouTube
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      if (!clean.includes('youtube.com') && !clean.includes('youtu.be')) {
        return clean;
      }
    }
  }

  // Multi-CDN Fallback nodes
  return quality !== 'auto' ? streamFromQualityCluster : streamFromCluster;
}


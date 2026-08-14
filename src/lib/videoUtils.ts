/**
 * Utility to parse and convert various video links (Google Drive, YouTube, Facebook, Vimeo, etc.)
 * into proper embed URLs and handle playback modes.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Matches standard watch?v=, embed/, shorts/, live/, v/, youtu.be/, or raw 11-char ID
  const match = url.match(/(?:v=|v\/|embed\/|shorts\/|live\/|youtu\.be\/|\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // Pattern 1: /file/d/ID or /d/ID
  const matchFileD = clean.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Pattern 2: ?id=ID or &id=ID (e.g. open?id=..., uc?id=..., etc.)
  const matchIdParam = clean.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  // Pattern 3: docs.google.com/file/d/ID
  const matchDocs = clean.match(/docs\.google\.com\/.*?\/([a-zA-Z0-9_-]{15,})/);
  if (matchDocs && matchDocs[1]) {
    return matchDocs[1];
  }

  // Pattern 4: Raw drive ID (typically 25 to 45 alphanumeric characters with underscores/hyphens)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  return null;
}

export function getGoogleDriveEmbedUrl(driveId: string): string {
  if (!driveId) return '';
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

export function getGoogleDriveDirectStreamUrl(driveId: string): string {
  if (!driveId) return '';
  return `https://lh3.googleusercontent.com/d/${driveId}`;
}

export function getGoogleDriveDownloadUrl(driveId: string): string {
  if (!driveId) return '';
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}

export function getEmbedUrl(url: string, playerMode: 'standard' | 'nocookie' = 'standard'): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // Google Drive -> Always converts to preview embed for 100% reliable streaming
  const driveId = extractGoogleDriveId(cleanUrl);
  if (driveId) {
    return getGoogleDriveEmbedUrl(driveId);
  }

  // YouTube
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    const ytId = extractYouTubeId(cleanUrl);
    if (ytId) {
      const domain = playerMode === 'nocookie' ? 'www.youtube-nocookie.com' : 'www.youtube.com';
      return `https://${domain}/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&controls=1`;
    }
  }

  // Facebook
  if (cleanUrl.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=true`;
  }

  // Vimeo
  if (cleanUrl.includes('vimeo.com') && !cleanUrl.includes('player.vimeo.com')) {
    const match = cleanUrl.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
  }

  return cleanUrl;
}

export function isEmbeddableUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.trim().toLowerCase();
  return (
    !!extractGoogleDriveId(cleanUrl) ||
    cleanUrl.includes('drive.google.com') ||
    cleanUrl.includes('docs.google.com') ||
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be') ||
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('vimeo.com') ||
    cleanUrl.includes('vk.com') ||
    cleanUrl.includes('ok.ru') ||
    cleanUrl.includes('/embed/') ||
    cleanUrl.endsWith('.html')
  );
}


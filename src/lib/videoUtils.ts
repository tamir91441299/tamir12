/**
 * Utility to parse and convert various video links (YouTube, Google Drive, Facebook, etc.)
 * into proper embed URLs for iframes and detect their types.
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
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function getEmbedUrl(url: string): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // YouTube
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    const ytId = extractYouTubeId(cleanUrl);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&controls=1`;
    }
  }

  // Google Drive
  if (cleanUrl.includes('drive.google.com')) {
    const driveId = extractGoogleDriveId(cleanUrl);
    if (driveId) {
      return `https://drive.google.com/file/d/${driveId}/preview`;
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
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be') ||
    cleanUrl.includes('drive.google.com') ||
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('vimeo.com') ||
    cleanUrl.includes('vk.com') ||
    cleanUrl.includes('ok.ru') ||
    cleanUrl.includes('/embed/') ||
    cleanUrl.endsWith('.html')
  );
}

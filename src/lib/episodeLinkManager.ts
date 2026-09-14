/**
 * 🎬 FlickNime - Анги холбох туслах үйлчилгээ (Episode Link Manager)
 * 
 * Энэхүү модуль нь:
 * 1. Gravity Falls, Monkart болон бүх хүүхэлдэйн кино, анимэгийн ангиудын линкийг найдвартай холбоно.
 * 2. Google Drive, YouTube, Filemoon, Ok.ru, MP4, HLS шууд дамжуулалтын линкүүдийг автоматаар хөрвүүлнэ.
 * 3. Хэрэглэгчид зориулсан хуулж тавих бэлэн TypeScript код болон тохиргоог гаргаж өгнө.
 */

import { Episode, Movie } from '../types';
import { extractGoogleDriveId, extractYouTubeId } from './videoUtils';
import {
  GRAVITY_FALLS,
  GRAVITY_FALLS_EPISODE_LINKS,
  setGravityFallsEpisodeLink,
  batchSetGravityFallsEpisodeLinks,
} from '../data/anime/gravityFalls';
import {
  MONKART,
  MONKART_EPISODE_LINKS,
  setMonkartEpisodeLink,
  batchSetMonkartEpisodeLinks,
} from '../data/anime/monkart';

/**
 * 🔗 Аливаа видео холбоосыг тоглуулагчид тааруулан цэвэрлэж, Google Drive эсвэл шууд линк болгон хөрвүүлнэ.
 */
export function formatEpisodeVideoUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  const clean = urlOrId.trim();

  // Google Drive ID эсвэл Линк
  const driveId = extractGoogleDriveId(clean);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=drivesdk`;
  }

  // YouTube линк
  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}`;
  }

  return clean;
}

/**
 * 🌲 Гравити Фоллс-ийн ангийг холбох (Gravity Falls Episode Linker)
 * @param episodeNumber Ангийн дугаар (1-20)
 * @param videoUrl Google Drive линк, ID эсвэл видеоны хаяг
 */
export function connectGravityFallsEpisode(episodeNumber: number, videoUrl: string): Episode | null {
  const formatted = formatEpisodeVideoUrl(videoUrl);
  setGravityFallsEpisodeLink(episodeNumber, formatted);
  
  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[GRAVITY_FALLS.id] = GRAVITY_FALLS.episodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to persist Gravity Falls episode link:', e);
  }

  return GRAVITY_FALLS.episodes?.find((e) => e.episodeNumber === episodeNumber) || null;
}

/**
 * 🏎️ Монкарт-ын ангийг холбох (Monkart Episode Linker)
 * @param episodeNumber Ангийн дугаар (1-16)
 * @param videoUrl Google Drive линк, ID эсвэл видеоны хаяг
 */
export function connectMonkartEpisode(episodeNumber: number, videoUrl: string): Episode | null {
  const formatted = formatEpisodeVideoUrl(videoUrl);
  setMonkartEpisodeLink(episodeNumber, formatted);
  
  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[MONKART.id] = MONKART.episodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to persist Monkart episode link:', e);
  }

  return MONKART.episodes?.find((e) => e.episodeNumber === episodeNumber) || null;
}

/**
 * 📝 Текстээс олон ангийн линкийг задлан ялгах туслах функц (Batch Link Parser)
 * Жишээ орцууд:
 * - 1: https://drive.google.com/...
 * - Анги 2: 1a2b3c4d...
 * - Эсвэл мөр мөрөөрөө зөвхөн линкүүд
 */
export function parseBatchEpisodeText(rawText: string): Record<number, string> {
  const result: Record<number, string> = {};
  if (!rawText) return result;

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  lines.forEach((line, index) => {
    // Формат: "1: https://..." эсвэл "1 - https://..." эсвэл "ep 1: https://..."
    const matchExplicit = line.match(/^(?:ep|анги|episode)?\s*(\d+)\s*[:=\-–]\s*(.+)$/i);
    if (matchExplicit) {
      const epNum = parseInt(matchExplicit[1], 10);
      const url = matchExplicit[2].trim();
      if (!isNaN(epNum) && url) {
        result[epNum] = formatEpisodeVideoUrl(url);
        return;
      }
    }

    // Хэрэв шууд линк мөрөөрөө байвал дарааллын дагуу 1, 2, 3... гэж авна
    const epNum = index + 1;
    result[epNum] = formatEpisodeVideoUrl(line);
  });

  return result;
}

/**
 * 💾 Олон ангийн линкийг нэг дор холбож хадгалах
 */
export function batchConnectEpisodes(
  movie: Movie,
  linksMap: Record<number, string>
): Episode[] {
  if (movie.id === GRAVITY_FALLS.id || movie.title.toLowerCase().includes('gravity falls')) {
    batchSetGravityFallsEpisodeLinks(linksMap);
  } else if (movie.id === MONKART.id || movie.title.toLowerCase().includes('monkart')) {
    batchSetMonkartEpisodeLinks(linksMap);
  }

  const currentEpisodes = movie.episodes || [];
  const updatedEpisodes: Episode[] = currentEpisodes.map((ep) => {
    if (linksMap[ep.episodeNumber]) {
      return {
        ...ep,
        videoUrl: linksMap[ep.episodeNumber],
      };
    }
    return ep;
  });

  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[movie.id] = updatedEpisodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to batch save episodes to local storage:', e);
  }

  return updatedEpisodes;
}

/**
 * 📋 Код үүсгэгч (Code Generator)
 * Хэрэглэгч өөрийн линкүүдээ оруулсны дараа шууд эх файлд хуулж тавих бэлэн TypeScript кодыг гаргана.
 */
export function generateEpisodeLinksCode(
  seriesName: 'GravityFalls' | 'Monkart',
  links: Record<number, string>
): string {
  const varName = seriesName === 'GravityFalls' ? 'GRAVITY_FALLS_EPISODE_LINKS' : 'MONKART_EPISODE_LINKS';
  const entries = Object.entries(links)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, url]) => `  ${num}: '${url}',`)
    .join('\n');

  return `export const ${varName}: Record<number, string> = {\n${entries}\n};`;
}

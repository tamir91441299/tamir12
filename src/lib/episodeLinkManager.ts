/**
 * 🎬 FlickNime - Анги холбох туслах үйлчилгээ (Episode Link Manager)
 * 
 * Энэхүү модуль нь:
 * 1. Бүх хүүхэлдэйн кино, анимэгийн ангиудын линкийг найдвартай холбоно.
 * 2. Google Drive, YouTube, Filemoon, Ok.ru, MP4, HLS шууд дамжуулалтын линкүүдийг автоматаар хөрвүүлнэ.
 * 3. Хэрэглэгчид зориулсан хуулж тавих бэлэн TypeScript код болон тохиргоог гаргаж өгнө.
 */

import { Episode, Movie } from '../types';
import { extractGoogleDriveId, extractYouTubeId } from './videoUtils';
import {
  LEGEND_OF_KORRA,
  batchSetLegendOfKorraEpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorra';
import {
  LEGEND_OF_KORRA_S2,
  batchSetLegendOfKorraS2EpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorraS2';
import {
  LEGEND_OF_KORRA_S3,
  batchSetLegendOfKorraS3EpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorraS3';
import {
  LEGEND_OF_KORRA_S4,
  batchSetLegendOfKorraS4EpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorraS4';
import {
  SPY_X_FAMILY,
  SPY_X_FAMILY_EPISODE_LINKS,
  setSpyXFamilyEpisodeLink,
  batchSetSpyXFamilyEpisodeLinks,
} from '../data/anime/spyXFamily';
import {
  HUNTER_X_HUNTER,
  HUNTER_X_HUNTER_EPISODE_LINKS,
  setHunterXHunterEpisodeLink,
  batchSetHunterXHunterEpisodeLinks,
} from '../data/anime/hunterXHunter';

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
 * 🕵️‍♂️ Тагнуулч х Гэр бүл (Spy x Family)-ийн ангийг холбох
 * @param episodeNumber Ангийн дугаар (1-25)
 * @param videoUrl Google Drive линк, ID эсвэл видеоны хаяг
 */
export function connectSpyXFamilyEpisode(episodeNumber: number, videoUrl: string): Episode | null {
  const formatted = formatEpisodeVideoUrl(videoUrl);
  setSpyXFamilyEpisodeLink(episodeNumber, formatted);
  
  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[SPY_X_FAMILY.id] = SPY_X_FAMILY.episodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to persist Spy x Family episode link:', e);
  }

  return SPY_X_FAMILY.episodes?.find((e) => e.episodeNumber === episodeNumber) || null;
}

/**
 * 🎯 Хантэр х Хантэр (Hunter x Hunter 2011)-ийн ангийг холбох (1-148)
 * @param episodeNumber Ангийн дугаар (1-148)
 * @param videoUrl Google Drive линк, ID эсвэл видеоны хаяг
 */
export function connectHunterXHunterEpisode(episodeNumber: number, videoUrl: string): Episode | null {
  const formatted = formatEpisodeVideoUrl(videoUrl);
  setHunterXHunterEpisodeLink(episodeNumber, formatted);
  
  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[HUNTER_X_HUNTER.id] = HUNTER_X_HUNTER.episodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to persist Hunter x Hunter episode link:', e);
  }

  return HUNTER_X_HUNTER.episodes?.find((e) => e.episodeNumber === episodeNumber) || null;
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
  if (movie.id === HUNTER_X_HUNTER.id || movie.title.toLowerCase().includes('hunter') || movie.titleMongolian.toLowerCase().includes('хантэр')) {
    batchSetHunterXHunterEpisodeLinks(linksMap);
  } else if (movie.id === SPY_X_FAMILY.id || movie.title.toLowerCase().includes('spy x family') || movie.titleMongolian.toLowerCase().includes('тагнуулч х гэр бүл')) {
    batchSetSpyXFamilyEpisodeLinks(linksMap);
  } else if (movie.id === LEGEND_OF_KORRA_S4.id || (movie.title.toLowerCase().includes('korra') && (movie.title.includes('4') || movie.titleMongolian.includes('4')))) {
    batchSetLegendOfKorraS4EpisodeLinks(linksMap);
  } else if (movie.id === LEGEND_OF_KORRA_S3.id || (movie.title.toLowerCase().includes('korra') && (movie.title.includes('3') || movie.titleMongolian.includes('3')))) {
    batchSetLegendOfKorraS3EpisodeLinks(linksMap);
  } else if (movie.id === LEGEND_OF_KORRA_S2.id || (movie.title.toLowerCase().includes('korra') && (movie.title.includes('2') || movie.titleMongolian.includes('2')))) {
    batchSetLegendOfKorraS2EpisodeLinks(linksMap);
  } else if (movie.id === LEGEND_OF_KORRA.id || movie.title.toLowerCase().includes('korra')) {
    batchSetLegendOfKorraEpisodeLinks(linksMap);
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
  seriesName: 'HunterXHunter' | 'SpyXFamily' | 'LegendOfKorra' | 'LegendOfKorraS2' | 'LegendOfKorraS3' | 'LegendOfKorraS4',
  links: Record<number, string>
): string {
  const varName = seriesName === 'HunterXHunter'
    ? 'HUNTER_X_HUNTER_EPISODE_LINKS'
    : seriesName === 'SpyXFamily'
    ? 'SPY_X_FAMILY_EPISODE_LINKS'
    : seriesName === 'LegendOfKorraS2'
    ? 'LEGEND_OF_KORRA_S2_EPISODE_LINKS'
    : seriesName === 'LegendOfKorraS3'
    ? 'LEGEND_OF_KORRA_S3_EPISODE_LINKS'
    : seriesName === 'LegendOfKorraS4'
    ? 'LEGEND_OF_KORRA_S4_EPISODE_LINKS'
    : 'LEGEND_OF_KORRA_EPISODE_LINKS';
  const entries = Object.entries(links)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, url]) => `  ${num}: '${url}',`)
    .join('\n');

  return `export const ${varName}: Record<number, string> = {\n${entries}\n};`;
}

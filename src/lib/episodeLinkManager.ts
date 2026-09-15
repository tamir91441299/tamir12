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
  DEATH_NOTE,
  DEATH_NOTE_EPISODE_LINKS,
  setDeathNoteEpisodeLink,
  batchSetDeathNoteEpisodeLinks,
} from '../data/anime/deathNote/deathNote';
import {
  CHAINSAW_MAN,
  CHAINSAW_MAN_EPISODE_LINKS,
  setChainsawManEpisodeLink,
  batchSetChainsawManEpisodeLinks,
} from '../data/anime/chainsawMan';
import {
  SOUL_EATER,
  SOUL_EATER_EPISODE_LINKS,
  setSoulEaterEpisodeLink,
  batchSetSoulEaterEpisodeLinks,
} from '../data/anime/soulEater';
import {
  DANDADAN,
  DANDADAN_EPISODE_LINKS,
  setDandadanEpisodeLink,
  batchSetDandadanEpisodeLinks,
} from '../data/anime/dandadan';
import {
  LEGEND_OF_KORRA,
  batchSetLegendOfKorraEpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorra';
import {
  LEGEND_OF_KORRA_S2,
  batchSetLegendOfKorraS2EpisodeLinks,
} from '../data/anime/legendOfKorra/legendOfKorraS2';

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
 * 📓 Үхлийн Тэмдэглэл (Death Note)-ийн ангийг холбох (Death Note Episode Linker)
 * @param episodeNumber Ангийн дугаар (1-37)
 * @param videoUrl Google Drive линк, ID эсвэл видеоны хаяг
 */
export function connectDeathNoteEpisode(episodeNumber: number, videoUrl: string): Episode | null {
  const formatted = formatEpisodeVideoUrl(videoUrl);
  setDeathNoteEpisodeLink(episodeNumber, formatted);
  
  // LocalStorage-д хадгалах
  try {
    const saved = localStorage.getItem('ioio_custom_episodes') || '{}';
    const epMap = JSON.parse(saved);
    epMap[DEATH_NOTE.id] = DEATH_NOTE.episodes;
    localStorage.setItem('ioio_custom_episodes', JSON.stringify(epMap));
  } catch (e) {
    console.error('Failed to persist Death Note episode link:', e);
  }

  return DEATH_NOTE.episodes?.find((e) => e.episodeNumber === episodeNumber) || null;
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
  } else if (movie.id === DEATH_NOTE.id || movie.title.toLowerCase().includes('death note') || movie.titleMongolian.toLowerCase().includes('үхлийн тэмдэглэл')) {
    batchSetDeathNoteEpisodeLinks(linksMap);
  } else if (movie.id === CHAINSAW_MAN.id || movie.title.toLowerCase().includes('chainsaw man')) {
    batchSetChainsawManEpisodeLinks(linksMap);
  } else if (movie.id === SOUL_EATER.id || movie.title.toLowerCase().includes('soul eater')) {
    batchSetSoulEaterEpisodeLinks(linksMap);
  } else if (movie.id === DANDADAN.id || movie.title.toLowerCase().includes('dandadan')) {
    batchSetDandadanEpisodeLinks(linksMap);
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
  seriesName: 'GravityFalls' | 'DeathNote' | 'ChainsawMan' | 'SoulEater' | 'Dandadan',
  links: Record<number, string>
): string {
  const varName = seriesName === 'GravityFalls' 
    ? 'GRAVITY_FALLS_EPISODE_LINKS' 
    : seriesName === 'DeathNote'
    ? 'DEATH_NOTE_EPISODE_LINKS'
    : seriesName === 'ChainsawMan'
    ? 'CHAINSAW_MAN_EPISODE_LINKS'
    : seriesName === 'SoulEater'
    ? 'SOUL_EATER_EPISODE_LINKS'
    : 'DANDADAN_EPISODE_LINKS';
  const entries = Object.entries(links)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, url]) => `  ${num}: '${url}',`)
    .join('\n');

  return `export const ${varName}: Record<number, string> = {\n${entries}\n};`;
}

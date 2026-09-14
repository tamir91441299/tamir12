import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🏎️ МОНКАРТ: МАНГАСЫН ХҮЛЭГ БААТРУУД (MONKART) - АНГИ ХОЛБОХ КОД & ТУСЛАХ ФУНКЦҮҮД
 * 
 * 📌 Хэрэглэх заавар:
 * 1. Доорх `MONKART_EPISODE_LINKS` хүснэгтэд ангийн дугаарын ард өөрийн Google Drive линк,
 *    YouTube, Filemoon, Ok.ru эсвэл шууд MP4 видеоны холбоосоо хуулж тавина.
 * 2. `setMonkartEpisodeLink(анги, линк)` функцээр шууд код дотроос холбох боломжтой.
 * 3. Бүх ангийг багцаар нь нэг дор шинэчлэхийн тулд `batchSetMonkartEpisodeLinks({...})` дуудна.
 */

// Google Drive эсвэл шууд линкийг тоглуулагчийн форматад хөрвүүлэх туслах функц
export function formatMonkartDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏎️ МОНКАРТ 1-Р БҮЛЭГ: 1-16 АНГИЙН ВИДЕО ХОЛБООС ТОХИРУУЛАХ ХҮСНЭГТ
 * Өөрийн Google Drive болон видео линкүүдээ энд дугаарын дагуу хуулж тавина уу:
 */
export const MONKART_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1monkart_ep02_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1monkart_ep03_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1monkart_ep04_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1monkart_ep05_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1monkart_ep06_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1monkart_ep07_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1monkart_ep08_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1monkart_ep09_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1monkart_ep10_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1monkart_ep11_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1monkart_ep12_link/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1monkart_ep13_link/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1monkart_ep14_link/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1monkart_ep15_link/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1monkart_ep16_link/view?usp=drivesdk',
};

/**
 * 🔗 Монкартын тодорхой ангийн видео линкийг шинэчлэх / холбох код
 */
export function setMonkartEpisodeLink(episodeNumber: number, linkOrDriveId: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 16) {
    const formatted = formatMonkartDriveLink(linkOrDriveId);
    MONKART_EPISODE_LINKS[episodeNumber] = formatted;
    
    // Ангиудын массив дахь линкийг шинэчлэх
    const ep = MONKART_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      MONKART.videoUrl = formatted;
    }
  }
}

/**
 * 🔗 Монкартын олон ангийн линкийг нэг дор багцаар шинэчлэх (Batch update) функц
 */
export function batchSetMonkartEpisodeLinks(linksMap: Record<number, string>): void {
  Object.entries(linksMap).forEach(([numStr, url]) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      setMonkartEpisodeLink(num, url);
    }
  });
}

/**
 * 🏎️ МОНКАРТ 1-Р БҮЛГИЙН АНГИУДЫН БҮРЭН ЖАГСААЛТ (Монгол нэршил, үргэлжлэх хугацаа)
 */
export const MONKART_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Дракатай учирсан нь (Meeting Draka)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Кармон хотын анхны уралдаан (Race in Carmon Town)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Хүлэг баатрын шалгуур (Knight\'s Grand Trial)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Сэна гүнжийн нууц даалгавар (Princess Sena\'s Mission)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Кармон улсын харанхуй аюул (Threat of the Dark Forces)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Галт луугийн сэргэлт ба Драка (Awakening of Fire Dragon)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Майкл Вайт ба Леогийн хурд (Michael White & Leo)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Битүү тойргийн морин зам (The Circuit Track Battle)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Дестрогийн харанхуй заль (Destro\'s Dark Treachery)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Мегарод хувьсал: Луугийн сүр хүч (Megaroid Evolution)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Робины үнэнч нөхөрлөл (Robin\'s Swift Assist)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Хагас шигшээ уралдаан (Semi-Final Championship)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Алтан картын нууц (Secret of the Golden Mon-Card)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Их Аренагийн шийдвэрлэх тулаан (Grand Arena Battle)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Кармон хаант улсыг хамгаалах нь (Defending Carmon Kingdom)',
    duration: '22 мин',
    videoUrl: MONKART_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Аварга хүлэг баатар Жин ба Драка (The Champion Knight Jin - Төгсгөл)',
    duration: '24 мин',
    videoUrl: MONKART_EPISODE_LINKS[16],
  },
];

/**
 * 🏎️ МОНКАРТ (MONKART: LEGEND OF MONSTER KART) КИНОНЫ МЭДЭЭЛЭЛ
 */
export const MONKART: Movie = {
  id: 'm_monkart',
  title: 'Monkart: Legend of Monster Kart',
  titleMongolian: 'Монкарт (Monkart: Legend of Monster Kart)',
  type: 'anime',
  poster: '/images/monkart_poster.jpg',
  backdrop: '/images/monkart_backdrop.jpg',
  year: 2024,
  duration: '16 анги (Бүлэг 1)',
  rating: 9.7,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Kids'],
  description: 'Кармон хаант улсад хүн ба мангасууд хамтран уралдааны Монкарт (Monkart) тэмцээнд өрсөлдөнө. Хөдөө тосгоны зоригт хүү Жин Хейст санамсаргүй байдлаар домогт галт улаан луу Дракатай (Draka) учирч, шилдэг Монкарт хүлэг баатар болохоор тэмүүлнэ. Тэд Сэна гүнж болон бусад баатруудтай нэгдэн, хаант улсын эрх мэдлийг булаан авахаар завдаж буй хорон санаат Дестро ба түүний харанхуй хүчний эсрэг сэтгэл түгшээм хурд, хүч, тактикийн уралдаанд оролцоно. Монгол дуу оруулгатай бүрэн цуврал.',
  director: 'EBS / SAMG Entertainment',
  cast: [
    'Жин Хейст (Jin Hayst - Дракагийн эзэн)',
    'Драка (Draka - Галт луу мангас)',
    'Сэна Форсизон (Princess Sena)',
    'Майкл Вайт (Michael White)',
    'Робин (Robin)',
    'Дестро (Destro - Харанхуйн эзэн)',
  ],
  country: 'Өмнөд Солонгос',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ АНИМЭШН • 16 АНГИ',
  totalEpisodes: 16,
  views: 760000,
  featured: true,
  featuredRank: 3,
  trailerUrl: 'https://www.youtube.com/embed/aE1N4z0r3lQ',
  videoUrl: MONKART_EPISODE_LINKS[1],
  ageRating: 'ALL',
  audioTracks: ['Монгол дуу оруулга', 'Солонгос эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: MONKART_EPISODES,
};

// Хялбар импорт хийх нэршлүүд (Aliases)
export const MONKART_S1 = MONKART;
export const MONKART_SERIES = MONKART;
export const MONKART_CARTOON = MONKART;

import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц
 */
export function formatSagaOfTanyaDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🎖️ ТАНЯГИЙН ТУУЛЬС (SAGA OF TANYA THE EVIL / YOUJO SENKI) - 1-ЭЭС 12 ХҮРТЭЛХ БҮХ АНГИЙН ЛИНКҮҮД
 * 
 * Та өөрийн Google Drive линк, pCloud, YouTube эсвэл шууд MP4 видеоны холбоосоо
 * доорх объектод хуулж тавихад тоглуулагч шууд тухайн ангийг холбон тоглуулах болно.
 */
export const SAGA_OF_TANYA_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZwL8YJZEEGACjkG2cY91JOeRBXNTm0WN7ak',
  2: 'https://u.pcloud.link/publink/show?code=XZ6L8YJZjsBEpFbSwa7UnFad4AtOGb4M90Wk',
  3: 'https://u.pcloud.link/publink/show?code=XZX48YJZkYtSKQRacJ8WAfChGDhMq513aeEX',
  4: 'https://u.pcloud.link/publink/show?code=XZR48YJZdwiAEr53kikd0BwLNvsoCQ77GfMV',
  5: 'https://u.pcloud.link/publink/show?code=XZm48YJZy8neKlyVhofuw1gNL9RdzfeMEBfX',
  6: 'https://u.pcloud.link/publink/show?code=XZh48YJZW1Gy2GtHf8BCq3Olf6meympwp74V',
  7: 'https://u.pcloud.link/publink/show?code=XZB48YJZhVJz8I4CYdXA8ExJ6bJptXyXckD7',
  8: 'https://u.pcloud.link/publink/show?code=XZe48YJZ4SqGj9YGDPpVeRuP3FRrBmy6Xwoy',
  9: 'https://u.pcloud.link/publink/show?code=XZx48YJZopyuYYar6WjzoEHJkMIpLmOFFEb7',
  10: 'https://u.pcloud.link/publink/show?code=XZi48YJZbmNXLtggDDyT5FQ8AUG5uky5NnUk',
  11: 'https://u.pcloud.link/publink/show?code=XZT88YJZdyMPzTT1jlyw23YYahrSq5v6ca57',
  12: 'https://u.pcloud.link/publink/show?code=XZl88YJZ1hrhJITKFVQgk4HAS2JcsyoMznMk',
};

export const SAGA_OF_TANYA_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Райны Чөтгөр (The Devil of the Rhine)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Өнгөрсөн үеийн эхлэл (Prologue)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Бурхан оршин байна (Deus lo vult)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Их сургуулийн амьдрал (Campus Life)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Анхны даалгавар (My First Battalion)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Дайны эхлэл (Beginning of Madness)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Фиордын тулаан (The Battle of Norden)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Галын туршилт (Trial by Fire)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Бэлтгэл сургуулилт (Preparing for Advance)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Ялалтын зам (Path to Victory)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Эсэргүүцэл (Resistance)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Ялалтын хэрэглээ (How to Use a Victory)',
    duration: '24 мин',
    videoUrl: SAGA_OF_TANYA_EPISODE_LINKS[12],
  },
];

export const SAGA_OF_TANYA: Movie = {
  id: 'm_saga_of_tanya',
  title: 'Saga of Tanya the Evil',
  titleMongolian: 'Танягийн Туульс: Бяцхан Чөтгөр (Youjo Senki)',
  type: 'anime',
  poster: 'https://m.media-amazon.com/images/I/81wlGn876zL._SL1500_.jpg',
  backdrop: 'https://images.alphacoders.com/834/834898.jpg',
  year: 2017,
  duration: '12 анги (Бүрэн)',
  rating: 9.8,
  genres: ['Исекай', 'Цэрэг дайн', 'Action', 'Magic', 'Military', 'Fantasy'],
  description: 'Токио хотын хүйтэн цэвдэг оффисын ажилтан эр үхлийнхээ өмнө "Х байгаль/Бурхан"-тай маргалдаж, шидэт хүч бүхий цэргийн дайн дүрэлзсэн өөр ертөнцөд өнчин бяцхан охин Таня Дегурешаф болон дахин төрнө. Тэрээр эзэнт гүрний шидэт цэргийн армид хамгийн залуу дэслэгч болж, тулааны талбарт дайснуудаа өршөөлгүй устган "Райны Чөтгөр" хэмээн алдаршина. Монгол дуу оруулга болон хадмалтай.',
  director: 'Ютака Уэмура (Yutaka Uemura)',
  cast: ['Аой Юки (Таня)', 'Саори Хаями (Виктория)', 'Шин-Ичиро Мики', 'Хоочю Ооцука'],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ АНИМЭ (12 анги)',
  totalEpisodes: 12,
  views: 890000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/fD3qP_fM0rI',
  videoUrl: SAGA_OF_TANYA_EPISODES[0].videoUrl,
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: SAGA_OF_TANYA_EPISODES,
};

export function setSagaOfTanyaEpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatSagaOfTanyaDriveLink(link) || link;
  SAGA_OF_TANYA_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = SAGA_OF_TANYA_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    SAGA_OF_TANYA.videoUrl = formatted;
  }
}

export function batchSetSagaOfTanyaEpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setSagaOfTanyaEpisodeLink(Number(epNum), link);
  });
}

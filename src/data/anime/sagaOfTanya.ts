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
  1: 'https://u.pcloud.link/publink/show?code=XZVxr4JZmd91ifa45qXME4rMOzt66p1Mbwl7',
  2: 'https://drive.google.com/file/d/1tanya_evil_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1tanya_evil_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1tanya_evil_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1tanya_evil_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1tanya_evil_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1tanya_evil_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1tanya_evil_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1tanya_evil_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1tanya_evil_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1tanya_evil_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1tanya_evil_ep12/view?usp=drivesdk',
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
  poster: 'https://m.media-amazon.com/images/M/MV5BMjA3NTYyMDQ0Ml5BMl5BanBnXkFtZTgwNTUwMDc0MTI@._V1_FMjpg_UX1000_.jpg',
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

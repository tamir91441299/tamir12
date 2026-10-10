import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц (Haikyu!! Season 3)
 */
export function formatHaikyuS3DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏐 ХАЙКЬЮ!! 3-Р БҮЛЭГ: КАРАСУНО VS ШИРАТОРИЗАВА (HAIKYU!! SEASON 3) - 1-ЭЭС 10 ХҮРТЭЛХ АНГИУД
 */
export const HAIKYU_S3_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1haikyu_s3_ep1/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1haikyu_s3_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1haikyu_s3_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1haikyu_s3_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1haikyu_s3_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1haikyu_s3_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1haikyu_s3_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1haikyu_s3_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1haikyu_s3_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1haikyu_s3_ep10/view?usp=drivesdk',
};

export const HAIKYU_S3_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Мэндчилгээ (Greetings)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - "Зүүн талын" аюул (The "Left" Threat)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - GUESS·MONSTER (Таамаглагч мангас)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Саран өнгө (Full Moon)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Хувь хүн ба Баг (One vs. Several)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Химийн урвал (The Chemical Reaction of Encounters)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Үнэнч хүсэл эрмэлзэл (Obsession)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Хүчирхэг залуу (An Annoying Guy)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Волейболын хорхойтнууд (The Volleyball Idiots)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Үзэл баримтлалын тулаан (The Battle of Concepts - Төгсгөл)',
    duration: '24 мин',
    videoUrl: HAIKYU_S3_EPISODE_LINKS[10],
  },
];

export const HAIKYU_S3: Movie = {
  id: 'm_haikyu_s3',
  title: 'Haikyu!! Season 3',
  titleMongolian: 'Хайкью!! 3-р бүлэг: Карасуно vs Шираторизава (Haikyuu!! S3)',
  type: 'anime',
  poster: 'https://wallpapersok.com/images/thumbnail/haikyuu-team-karasuno-volleyball-players-8ix45j4iv3nji2sl.jpg',
  backdrop: 'https://wallpapercave.com/wp/wp2422870.jpg',
  year: 2016,
  duration: '10 анги (3-р бүлэг)',
  rating: 9.9,
  genres: ['Спорт', 'Волейбол', 'Shounen', 'Sports', 'Drama', 'School', 'Action'],
  description: 'Мияги мужийн Хаврын тэмцээний финал! Бүх Японы шилдэг довтлогчдын нэг Ушижима Вакатоши тэргүүтэй аваргын титэмт хүчирхэг "Шираторизава" сургуулийн эсрэг Карасуно сургууль 5 үеийн турш бүх хүч чадлаа шавхан Бүх Японы аваргад оролцох цорын ганц эрхийн төлөө тулалдана!',
  director: 'Сүсүму Мицүнака (Susumu Mitsunaka)',
  cast: ['Аюму Мурасэ (Хината)', 'Кайто Ишикава (Кагеяма)', 'Рёта Такэүчи (Ушижима)', 'Коки Учияма (Цүкишима)'],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: '3-Р БҮЛЭГ (10 анги)',
  totalEpisodes: 10,
  views: 890000,
  featured: false,
  trailerUrl: 'https://www.youtube.com/embed/JOGp2c7-cKc',
  videoUrl: HAIKYU_S3_EPISODES[0].videoUrl,
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: HAIKYU_S3_EPISODES,
};

export function setHaikyuS3EpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatHaikyuS3DriveLink(link) || link;
  HAIKYU_S3_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = HAIKYU_S3_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    HAIKYU_S3.videoUrl = formatted;
  }
}

export function batchSetHaikyuS3EpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setHaikyuS3EpisodeLink(Number(epNum), link);
  });
}

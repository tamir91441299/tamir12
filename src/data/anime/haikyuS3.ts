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
  1: 'https://u.pcloud.link/publink/show?code=XZx4RbJZlVm61aTn55FqP4v2rQGeH4w1ziSk',
  2: 'https://u.pcloud.link/publink/show?code=XZA4RbJZjFlNHKSlAwRhQODhWj0o3myrOJgk',
  3:'https://u.pcloud.link/publink/show?code=XZa4RbJZMg8WVoGGfbfyaC9nP6vtxypXi79V',
  4: 'https://u.pcloud.link/publink/show?code=XZ78RbJZU4H8wDcxLTVn6oHGsjrQjX7bWbn7',
  5: 'https://u.pcloud.link/publink/show?code=XZX8RbJZHFkTELBhmeF0QQkFpkEk6mVTtpJk',
  6: 'https://u.pcloud.link/publink/show?code=XZQ8RbJZw4yV6LWVbwVLx6njg2ERwQ7dkaTk',
  7: 'https://u.pcloud.link/publink/show?code=XZY8RbJZEP8pg6LA0QmNt60rviCsJyid6Qry',
  8: 'https://u.pcloud.link/publink/show?code=XZm8RbJZ0xmK65X4uMBHWgVBsfkPE47NmudV',
  9: 'https://u.pcloud.link/publink/show?code=XZW8RbJZ4WA5eFlEa7jH5x6YI15y0HLowu9X',
  10: 'https://u.pcloud.link/publink/show?code=XZM8RbJZri3sljJb0AFYgrnac1NAGXp2iLj7',
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
  poster: 'https://images.justwatch.com/poster/199385768/s718/season-3.jpg',
  backdrop: '/images/haikyu_s3_backdrop.jpg',
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

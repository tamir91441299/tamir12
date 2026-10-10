import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц (Haikyu!! Season 2)
 */
export function formatHaikyuS2DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏐 ХАЙКЬЮ!! 2-Р БҮЛЭГ (HAIKYU!! SEASON 2) - 1-ЭЭС 25 ХҮРТЭЛХ АНГИУД
 */
export const HAIKYU_S2_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1haikyu_s2_ep1/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1haikyu_s2_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1haikyu_s2_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1haikyu_s2_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1haikyu_s2_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1haikyu_s2_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1haikyu_s2_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1haikyu_s2_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1haikyu_s2_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1haikyu_s2_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1haikyu_s2_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1haikyu_s2_ep12/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1haikyu_s2_ep13/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1haikyu_s2_ep14/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1haikyu_s2_ep15/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1haikyu_s2_ep16/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1haikyu_s2_ep17/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1haikyu_s2_ep18/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1haikyu_s2_ep19/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1haikyu_s2_ep20/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1haikyu_s2_ep21/view?usp=drivesdk',
  22: 'https://drive.google.com/file/d/1haikyu_s2_ep22/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1haikyu_s2_ep23/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1haikyu_s2_ep24/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1haikyu_s2_ep25/view?usp=drivesdk',
};

export const HAIKYU_S2_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Токио руу явцгаая! (Let\'s Go to Tokyo!)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Нар жаргах өмнө (Direct Sunlight)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Тосгоны хүн Б (Townsperson B)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Төвийн Ас (Center Ace)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Шунал (Greed)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Хурд (Tempo)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Сар мандах үе (Moonrise)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Дэвшил (Illusionary Hero)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Шүхэргүй нислэг (VS "Umbrella")',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Аянга (Thunderbolts)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Дээшлэх зам (Upstairs)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Тоглолт эхэллээ (Let the Games Begin!)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Энгийн бөгөөд цэвэр хүч (A Simple and Pure Strength)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Өсөн дэвжих хүч (Still Growing)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Тоглолтын талбай (Play Place)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Дараагийн өрсөлдөгч (Next)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[16],
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Цөхрөлгүй тулаан (The Battle Without Willpower)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[17],
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Ялагчийн зам (The Losers)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[18],
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Төмөр хананы сорилт (The Iron Wall Can Be Rebuilt)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[19],
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Дахин нүүр тулалт (Wiping Out)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[20],
  },
  {
    episodeNumber: 21,
    title: '21-р анги - Хуучин тулаанч (The Former Fighter)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[21],
  },
  {
    episodeNumber: 22,
    title: '22-р анги - Тэмцэл (Fight)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[22],
  },
  {
    episodeNumber: 23,
    title: '23-р анги - Багийн хүч (Team)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[23],
  },
  {
    episodeNumber: 24,
    title: '24-р анги - Хязгаар ба Давуу чанар (The Absolute Limit Switch)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[24],
  },
  {
    episodeNumber: 25,
    title: '25-р анги - Дайны тунхаг (Declaration of War - Төгсгөл)',
    duration: '24 мин',
    videoUrl: HAIKYU_S2_EPISODE_LINKS[25],
  },
];

export const HAIKYU_S2: Movie = {
  id: 'm_haikyu_s2',
  title: 'Haikyu!! Season 2',
  titleMongolian: 'Хайкью!! 2-р бүлэг (Haikyuu!! Season 2)',
  type: 'anime',
  poster: 'https://wallpapersok.com/images/thumbnail/haikyuu-team-karasuno-volleyball-players-8ix45j4iv3nji2sl.jpg',
  backdrop: 'https://wallpapercave.com/wp/wp2422870.jpg',
  year: 2016,
  duration: '25 анги (2-р бүлэг)',
  rating: 9.9,
  genres: ['Спорт', 'Волейбол', 'Shounen', 'Sports', 'Drama', 'School', 'Comedy'],
  description: 'Карасуно ахлах сургууль Токиод болох хамтарсан бэлтгэл цугларалтад уригдан Нэкома, Фүкүродани зэрэг Японы шилдэг багуудтай ширүүн тулалдаж шинэ довтолгооны тактикаа боловсруулна. Улмаар Хаврын тэмцээний урьдчилсан шатанд Аоба Жосай багтай өшөөгөө авахаар дахин нүүр тулна! Монгол дуу оруулгатай.',
  director: 'Сүсүму Мицүнака (Susumu Mitsunaka)',
  cast: ['Аюму Мурасэ (Хината)', 'Кайто Ишикава (Кагеяма)', 'Сатоши Хино (Дайчи)', 'Юү Хаяши (Танака)'],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: '2-Р БҮЛЭГ (25 анги)',
  totalEpisodes: 25,
  views: 980000,
  featured: false,
  trailerUrl: 'https://www.youtube.com/embed/JOGp2c7-cKc',
  videoUrl: HAIKYU_S2_EPISODES[0].videoUrl,
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: HAIKYU_S2_EPISODES,
};

export function setHaikyuS2EpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatHaikyuS2DriveLink(link) || link;
  HAIKYU_S2_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = HAIKYU_S2_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    HAIKYU_S2.videoUrl = formatted;
  }
}

export function batchSetHaikyuS2EpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setHaikyuS2EpisodeLink(Number(epNum), link);
  });
}

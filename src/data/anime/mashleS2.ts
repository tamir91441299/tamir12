import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц (Mashle Season 2)
 */
export function formatMashleS2DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏋️‍♂️ МАШЛ 2-Р БҮЛЭГ: БУРХАНЛАГ ХАРААТНЫ ШАЛГАЛТ (MASHLE SEASON 2) - 1-ЭЭС 12 ХҮРТЭЛХ АНГИУД
 * 
 * Та өөрийн Google Drive линк, pCloud, YouTube эсвэл шууд MP4 видеоны холбоосоо
 * энд шууд тохируулж болно.
 */
export const MASHLE_S2_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZYxr4JZ1Y6CjTSits509s6iSi2AR89QXaWk',
  2: 'https://drive.google.com/file/d/1mashle_s2_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1mashle_s2_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1mashle_s2_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1mashle_s2_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1mashle_s2_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1mashle_s2_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1mashle_s2_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1mashle_s2_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1mashle_s2_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1mashle_s2_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1mashle_s2_ep12/view?usp=drivesdk',
};

export const MASHLE_S2_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги (13) - Маш Вандед ба Бурханлаг хараатнууд (Mash Burnedead and the Divine Visionaries)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги (14) - Маш Вандед ба Гэрийн даалгавар (Mash Burnedead and the Home Visit)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги (15) - Рейн Эймс ба Бурханы бэлэг (Rayne Ames and God\'s Gift)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги (16) - Маш Вандед ба Хүчирхэг бөмбөлөг (Mash Burnedead and the Brawny Balloon)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги (17) - Финн Эймс ба Нөхөрлөл (Finn Ames and a Friend)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги (18) - Маш Вандед ба Аюултай үйлдэл (Mash Burnedead and the Dangerous Action)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги (19) - Маш Вандед ба Ид шидийн цамхаг (Mash Burnedead and the Magical Tower)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги (20) - Маш Вандед ба Цасан цайз (Mash Burnedead and the Snow Fortress)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги (21) - Маш Вандед ба Соронзон хүч (Mash Burnedead and the Magnetic Force)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги (22) - Маш Вандед ба Инносент Зеро (Mash Burnedead and Innocent Zero)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги (23) - Маш Вандед ба Шидийн ертөнцийн хууль (Mash Burnedead and the Origins of Magic)',
    duration: '24 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги (24) - Маш Вандед ба Сайн найзууд (Mash Burnedead and Friends - 2-р бүлгийн төгсгөл)',
    duration: '25 мин',
    videoUrl: MASHLE_S2_EPISODE_LINKS[12],
  },
];

export const MASHLE_S2: Movie = {
  id: 'm_mashle_s2',
  title: 'Mashle: Magic and Muscles Season 2',
  titleMongolian: 'Машл 2-р бүлэг: Бурханлаг хараатны шалгалт (Mashle S2)',
  type: 'anime',
  poster: '/images/mashle_s2_poster.jpg',
  backdrop: '/images/mashle_s2_backdrop.jpg',
  year: 2024,
  duration: '12 анги (2-р бүлэг)',
  rating: 9.8,
  genres: ['Action', 'Comedy', 'Fantasy', 'Magic', 'Shounen', 'School'],
  description: 'Шидтэнгүүдийн ертөнцөд шидгүй төрсөн Маш Вандед ер бусын булчингийн хүчээрээ эхний шалгууруудыг амжилттай давсан боловч түүний шидгүй гэх нууц Шидийн товчоонд илчлэгдэнэ! Цаазаар авах ялаас мултрахын тулд Маш дэлхийн хамгийн нэр хүндтэй цол болох "Бурханлаг хараатан" (Divine Visionary) болох сонгон шалгаруулалтад хүч үзэх болзол тавиулна. Шалгалтын үеэр академийн шилдэг шидтэнүүдтэй өрсөлдөхөөс гадна ертөнцийг сүйрүүлэх зорилготой "Innocent Zero" хэмээх хар шидийн аюулт бүлэглэл дайрч эхэлнэ. Маш алдарт "Bling-Bang-Bang-Born" хэмнэл дор бүх хүчирхэг дайснуудыг өөрийн төмөр булчин, цэвэр бяр тэнхээгээрээ бут ниргэнэ! Монгол дуу оруулга болон хадмалтай.',
  director: 'Томоя Танака (Tomoya Tanaka / A-1 Pictures)',
  cast: [
    'Чиаки Кобаяши (Маш Вандед)',
    'Рэйдзи Кавашима (Финн Эймс)',
    'Кайто Ишикава (Ланс Краун)',
    'Такуя Эгучи (Дот Барретт)',
    'Юүки Кажи (Рейн Эймс)',
    'Жүничи Сүвабэ (Рё Гранц)',
    'Хироки Нанами (Абисс Рэйзор)',
    'Кэнжиро Цүда (Уолберг Байт)'
  ],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ БҮЛЭГ • 2-Р УЛИРАЛ',
  totalEpisodes: 12,
  views: 1180000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/210R0ozmVwg',
  videoUrl: MASHLE_S2_EPISODES[0].videoUrl,
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: MASHLE_S2_EPISODES,
};

export function setMashleS2EpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatMashleS2DriveLink(link) || link;
  MASHLE_S2_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = MASHLE_S2_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    MASHLE_S2.videoUrl = formatted;
  }
}

export function batchSetMashleS2EpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setMashleS2EpisodeLink(Number(epNum), link);
  });
}

// Aliases for convenience
export const MASHLE_SEASON_2 = MASHLE_S2;

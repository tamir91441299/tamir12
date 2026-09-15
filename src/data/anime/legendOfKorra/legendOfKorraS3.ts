import { Movie, Episode } from '../../../types';
import { extractGoogleDriveId } from '../../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatLegendOfKorraS3DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean) || clean;
  if (id.startsWith('http')) return id;
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🌪️ КОРРАГИЙН ДОМОГ 3-Р БҮЛЭГ: ӨӨРЧЛӨЛТ (BOOK THREE: CHANGE) АНГИУДЫН ХОЛБООС
 * Анги бүрийн линкийг доор шууд оруулах эсвэл Админ цонхоор тохируулж болно.
 */
export const LEGEND_OF_KORRA_S3_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1rMcHRewZRVhCWRs45pHGz5UK8Bnl9dSc/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1WwpATNw1NgrluvsyRo_4lOTWjU0LGYfV/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1QuZPd3l-SHnmj2tIaGsfovr-4KwLIlHX/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1Bbu1k-6qDO3BuAaTi3966k1IoPjywh33/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1O_FcRypLfN7TNpDCjbr1Totn7lHMrBsT/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1hMwuhg8NQUL1t5XJBxlnK8u7nlAt11kA/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1p0PZgewuKJFt4W8_-4F0ech8USwGMi6r/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/18X-k0aseNx1epxsU4GSjmmLziRFPXgZU/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1h-4GeQYB9_fDIMsHhwiKKu8n8XDMYTZT/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1qbhfFfT6z3GWW4SKXcauz6o-X2HYQRaI/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1TB2sll4EzSUKjP1JFP5PBR2xAPHTmQJm/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1z9KE68veuxa80ussXtK1Q1fwk7mPLUlC/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1a71zCfysrKk0GT9YNujzhYLy8Trt2KWn/view?usp=drivesdk',
};

export function setLegendOfKorraS3EpisodeLink(episodeNumber: number, link: string) {
  if (LEGEND_OF_KORRA_S3_EPISODE_LINKS[episodeNumber] !== undefined) {
    LEGEND_OF_KORRA_S3_EPISODE_LINKS[episodeNumber] = link;
    const ep = LEGEND_OF_KORRA_S3_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = link;
    }
  }
}

export function batchSetLegendOfKorraS3EpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setLegendOfKorraS3EpisodeLink(Number(epNum), link);
  });
}

export const LEGEND_OF_KORRA_S3_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги (27) - Цэвэр агаар амьсгалах нь (A Breath of Fresh Air)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги (28) - Дахин төрөлт (Rebirth)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги (29) - Шороон Хаант Улсын хатан хаан (The Earth Queen)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги (30) - Агаарын махирчид аюулд (In Harm\'s Way)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги (31) - Төмрийн овог (The Metal Clan)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги (32) - Хуучин шарх сорви (Old Wounds)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги (33) - Анхны агаарын махирчид (Original Airbenders)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги (34) - Нууц дайснууд (The Terror Within)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги (35) - Харуул хамгаалалт (The Stakeout)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги (36) - Хатан хааны уналт (Long Live the Queen)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги (37) - Сүүлчийн шаардлага (The Ultimatum)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги (38) - Хоосон орон зайд нэвтрэхүй (Enter the Void)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги (39) - Улаан бадамлянхуа цэцгийн хор (Venom of the Red Lotus - Төгсгөл)',
    duration: '25 мин',
    videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[13],
  },
];

/**
 * 🌪️ КОРРАГИЙН ДОМОГ: 3-Р БҮЛЭГ ӨӨРЧЛӨЛТ (THE LEGEND OF KORRA: BOOK 3 CHANGE)
 */
export const LEGEND_OF_KORRA_S3: Movie = {
  id: 'm_legend_of_korra_s3',
  title: 'The Legend of Korra Season 3',
  titleMongolian: 'Коррагийн Домог Бүлэг 3: Өөрчлөлт (The Legend of Korra: Book 3 Change)',
  type: 'anime',
  poster: 'https://tse3.mm.bing.net/th/id/OIP.utdn6ecq_YsAtNIX5gMJoQHaNK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  backdrop: 'https://tse3.mm.bing.net/th/id/OIP.sXvwmuD7XOetcdvAxVnJBQAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  year: 2024,
  duration: '13 анги (Бүлэг 3)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Superpower', 'Shounen'],
  description: 'Коррагийн Домог 3-р бүлэг буюу "Өөрчлөлт" (Book Three: Change) цуврал. Эв зохицлын нийлэмжийн дараа дэлхий даяар шинэ агаарын махирчид гэнэт төрөн гарч, Тэнзин болон Аватар Корра тэднийг сургаж, Агаарын сүмийг дахин сэргээхээр аялалд гарна. Гэвч үүний сацуу анархист үзэлт Захир тэргүүтэй "Улаан Бадамлянхуа" (Red Lotus) бүлэглэлийн аюул занал задарч, Аватарын эсрэг сүүлчийн хатуу тэмцлийг эхлүүлнэ. Монгол дуу оруулгатай бүрэн 13 анги.',
  director: 'Майкл Данте ДиМартино, Брайн Кониецко (Nickelodeon / Studio Mir)',
  cast: [
    'Жанет Варни (Корра / Avatar Korra)',
    'Ж.К. Симмонс (Тэнзин / Tenzin)',
    'Генри Роллинз (Захир / Zaheer)',
    'Мин-На Вен (Сүйлин Бэйфонг / Suyin Beifong)',
    'Дэвид Фаустино (Мако / Mako)',
    'П.Ж. Бирн (Болин / Bolin)',
    'Сейшелл Габриэль (Асами Сато)',
  ],
  country: 'АНУ / Япон / Солонгос',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ ЦУВРАЛ • 13 АНГИ',
  totalEpisodes: 13,
  views: 940000,
  featured: true,
  featuredRank: 3,
  trailerUrl: 'https://www.youtube.com/embed/ioSCSZgW2-0',
  videoUrl: LEGEND_OF_KORRA_S3_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: LEGEND_OF_KORRA_S3_EPISODES,
};

export const KORRA_SEASON_3 = LEGEND_OF_KORRA_S3;
export const KORRA_S3 = LEGEND_OF_KORRA_S3;

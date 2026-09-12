import { Movie, Episode } from '../../../types';
import { extractGoogleDriveId } from '../../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 * Та Google Drive-ын Share хийсэн линк эсвэл зөвхөн File ID (жишээ: 1a2b3c4d...)-г
 * доорх LEGEND_OF_KORRA_EPISODE_LINKS объектод оруулж хялбар холбоно.
 */
export function formatLegendOfKorraDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🌊 КОРРАГИЙН ДОМОГ (THE LEGEND OF KORRA - 1-Р БҮЛЭГ: САЛХИ) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Хэрэв та өөрийн Google Drive линкүүдээ шууд оруулахыг хүсвэл
 * доорх 1-12 дугаарын ард Drive линк эсвэл ID-гаа хуулж тавина уу:
 */
export const LEGEND_OF_KORRA_EPISODE_LINKS: Record<number, string> = {
  1: 'https://filemoon.org/en/7d5GLnE73xRJ/file',
  2: 'https://drive.google.com/file/d/1JkuW6SKaV65XxfDgmZ9MrQ7k-6Pkt_i8/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1VOmLbJQU9fscXdj147epT0WTnLePG-KL/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1korra_ep04_drive_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1korra_ep05_drive_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1korra_ep06_drive_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1korra_ep07_drive_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1korra_ep08_drive_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1korra_ep09_drive_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1korra_ep10_drive_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1korra_ep11_drive_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1korra_ep12_drive_link/view?usp=drivesdk',
};

export const LEGEND_OF_KORRA_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Бүгд Найрамдах Хотод Тавтай Морил (Welcome to Republic City)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Салхин дахь навч (A Leaf in the Wind)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Илчлэлт (The Revelation)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Шөнийн дуу хоолой (The Voice in the Night)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Өрсөлдөөний сүнс (The Spirit of Competition)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Ялагч нь... (And the Winner Is...)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Үр дагавар (The Aftermath)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Хязгаарууд уулзах үед (When Extremes Meet)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Өнгөрснөөс эргэн ирсэн нь (Out of the Past)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Эргэлтийн цэг (Turning the Tides)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Нуугдмал үнэн (Skeletons in the Closet)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Төгсгөлийн тулаан (Endgame - Төгсгөл)',
    duration: '25 мин',
    videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[12],
  },
];

/**
 * 🌊 КОРРАГИЙН ДОМОГ (THE LEGEND OF KORRA)
 */
export const LEGEND_OF_KORRA: Movie = {
  id: 'm_legend_of_korra',
  title: 'The Legend of Korra',
  titleMongolian: 'Коррагийн Домог (The Legend of Korra)',
  type: 'anime',
  poster: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/04/legend-of-korra-tv-series-poster.jpg',
  backdrop: 'https://www.comingsoon.net/wp-content/uploads/sites/3/2021/02/LOK_Steelbook_Book4_Back.jpg?w=800',
  year: 2024,
  duration: '12 анги (Бүлэг 1)',
  rating: 9.8,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Superpower', 'Shounen'],
  description: 'Аватар Аангийн үйл явдлаас 70 жилийн дараа Өмнөд Усны Овгийн зоригт дайчин охин Корра шинэ Аватар болон төрнө. Ус, шороо, галын махбодыг төгс эзэмшсэн тэрээр агаарын махбодод суралцаж, Бүгд Найрамдах Хотыг (Republic City) заналхийлж буй Амон тэргүүтэй тэгшитгэгчдийн бослогыг зогсоож, ертөнцийн тэнцвэрийг хадгалахаар шийдвэрлэх тулаанд орно. Монгол дуу оруулгатай бүрэн цуврал.',
  director: 'Майкл Данте ДиМартино, Брайн Кониецко (Nickelodeon / Studio Mir)',
  cast: [
    'Жанет Варни (Корра / Avatar Korra)',
    'Ж.К. Симмонс (Тэнзин / Tenzin)',
    'Дэвид Фаустино (Мако / Mako)',
    'П.Ж. Бирн (Болин / Bolin)',
    'Сейшелл Габриэль (Асами Сато)',
    'Стив Блюм (Амон / Amon)',
  ],
  country: 'АНУ / Япон / Солонгос',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ ЦУВРАЛ • 12 АНГИ',
  totalEpisodes: 12,
  views: 820000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/1vRzT45GZ2w',
  videoUrl: LEGEND_OF_KORRA_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: LEGEND_OF_KORRA_EPISODES,
};

// Aliases for convenient importing
export const LEGEND_OF_KORRA_S1 = LEGEND_OF_KORRA;
export const KORRA_SERIES = LEGEND_OF_KORRA;
export const KORRA_ANIME = LEGEND_OF_KORRA;

import { Movie, Episode } from '../../../types';
import { extractGoogleDriveId } from '../../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatLegendOfKorraS4DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean) || clean;
  if (id.startsWith('http')) return id;
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * ⚙️ КОРРАГИЙН ДОМОГ 4-Р БҮЛЭГ: ТЭНЦВЭР (BOOK FOUR: BALANCE) АНГИУДЫН ХОЛБООС
 * Анги бүрийн линкийг доор шууд оруулах эсвэл Админ цонхоор тохируулж болно.
 */
export const LEGEND_OF_KORRA_S4_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZKWkRJZqxPt5OWXRmuFY19tKTapoRpyW2ny',
  2: 'https://u.pcloud.link/publink/show?code=XZtWkRJZLQ51C4hEHYFpW9dCNnpe9yuhTyS7',
  3: 'https://drive.google.com/file/d/1Ukqpyrd6ggwDe2YBfz-Na9vtrhsbTvl2/view?usp=drivesdk&usp=embed_facebook',
  4: 'https://u.pcloud.link/publink/show?code=XZOWkRJZGufCfO0EyBy6quTELsuUELQ6FDj7',
  5: 'https://u.pcloud.link/publink/show?code=XZIWkRJZTxypW6rBOSmtKMp8cMLoRLEGEpr7',
  6: 'https://drive.google.com/file/d/1mwHci8uzMLmDBY1ygQHvjnvj3sLewed_/view?usp=drivesdk&usp=embed_facebook',
  7: 'https://u.pcloud.link/publink/show?code=XZAWkRJZ3nTpLBnRSffVgOHuRXXL7bGBts1V',
  8: 'https://u.pcloud.link/publink/show?code=XZNWkRJZ6gMy0cs79mkewooAkazXhHbrmlqV',
  9: 'https://drive.google.com/file/d/1vwiVkUlHUbQbdfn0cjfdOz-BaCtPL-Vv/view?usp=drivesdk&usp=embed_facebook',
  10: 'https://u.pcloud.link/publink/show?code=XZvWkRJZax1tCbUpaGJwuIavyMFID8GNYd1k',
  11: 'https://drive.google.com/file/d/1SEtHj9hffbI7xAxgyqeSlnw1asH74h8e/view?usp=drivesdk&usp=embed_facebook',
  12: 'https://u.pcloud.link/publink/show?code=XZcDkRJZR0SRbuCbFz5kbwP55v1FgyEW2o9X',
  13: '',
};

export function setLegendOfKorraS4EpisodeLink(episodeNumber: number, link: string) {
  if (LEGEND_OF_KORRA_S4_EPISODE_LINKS[episodeNumber] !== undefined) {
    LEGEND_OF_KORRA_S4_EPISODE_LINKS[episodeNumber] = link;
    const ep = LEGEND_OF_KORRA_S4_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = link;
    }
  }
}

export function batchSetLegendOfKorraS4EpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setLegendOfKorraS4EpisodeLink(Number(epNum), link);
  });
}

export const LEGEND_OF_KORRA_S4_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги (40) - Олон жилийн дараа (After All These Years)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги (41) - Ганцаардсан Корра (Korra Alone)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги (42) - Хаан ширээнд залах ёслол (The Coronation)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги (43) - Замыг олох дуудлага (The Calling)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги (44) - Дайснууд хаалганы цаана (Enemy at the Gates)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги (45) - Заофугийн тулаан (The Battle of Zaofu)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги (46) - Дахин нэгдэл (Reunion)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги (47) - Дурсамж (Remembrances)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги (48) - Цаашдын зэрлэг замнал (Beyond the Wilds)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги (49) - Бэйфонгийн ажиллагаа (Operation Beifong)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги (50) - Кувирагийн дайралт (Kuvira\'s Gambit)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги (51) - Колоссусын өдөр (Day of the Colossus)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги (52) - Сүүлчийн зогсоол (The Last Stand - Бүрэн төгсгөл)',
    duration: '25 мин',
    videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[13],
  },
];

/**
 * ⚙️ КОРРАГИЙН ДОМОГ: 4-Р БҮЛЭГ ТЭНЦВЭР (THE LEGEND OF KORRA: BOOK 4 BALANCE)
 */
export const LEGEND_OF_KORRA_S4: Movie = {
  id: 'm_legend_of_korra_s4',
  title: 'The Legend of Korra Season 4',
  titleMongolian: 'Коррагийн Домог Бүлэг 4: Тэнцвэр (The Legend of Korra: Book 4 Balance)',
  type: 'anime',
  poster: 'https://images5.alphacoders.com/131/thumb-1920-1319768.jpeg',
  backdrop: 'https://static1.cbrimages.com/wordpress/wp-content/uploads/2020/09/Korra-Heroes-and-Villains.jpg',
  year: 2024,
  duration: '13 анги (Бүлэг 4)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Superpower', 'Shounen'],
  description: 'Коррагийн Домог 4-р бүлэг буюу "Тэнцвэр" (Book Four: Balance) - Коррагийн домог цувралын төгсгөлийн сүүлчийн бүлэг. Захиртай хийсэн хүнд тулааны дараа бие, сэтгэлийн гүн шарх авсан Корра 3 жилийн турш өөрийгөө эрэн хайж, дахин хүчирхэгжихээр тэмцэнэ. Энэ хооронд төмрийн жанжин Кувира Шороон Хаант Улсыг дарангуйллын дор нэгтгэж, Бүгд Найрамдах Хотыг эзлэхээр аварга мех зэвсэгтэй хөдөлнө. Аватар Корра ертөнцөд жинхэнэ тэнцвэрийг авчрах сүүлчийн агуу тулаанд орно. Монгол дуу оруулгатай бүрэн 13 анги.',
  director: 'Майкл Данте ДиМартино, Брайн Кониецко (Nickelodeon / Studio Mir)',
  cast: [
    'Жанет Варни (Корра / Avatar Korra)',
    'Ж.К. Симмонс (Тэнзин / Tenzin)',
    'Зельда Уильямс (Кувира / Kuvira)',
    'Филис Диллер / Пхайлис Смит (Тоф Бэйфонг / Toph Beifong)',
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
  views: 980000,
  featured: true,
  featuredRank: 4,
  trailerUrl: 'https://www.youtube.com/embed/5Tuh04vXFhI',
  videoUrl: LEGEND_OF_KORRA_S4_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: LEGEND_OF_KORRA_S4_EPISODES,
};

export const KORRA_SEASON_4 = LEGEND_OF_KORRA_S4;
export const KORRA_S4 = LEGEND_OF_KORRA_S4;

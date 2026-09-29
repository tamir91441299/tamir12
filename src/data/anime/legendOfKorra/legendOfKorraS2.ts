import { Movie, Episode } from '../../../types';
import { extractGoogleDriveId } from '../../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatLegendOfKorraS2DriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean) || clean;
  if (id.startsWith('http')) return id;
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🌊 КОРРАГИЙН ДОМОГ 2-Р БҮЛЭГ: СҮНСНҮҮД (BOOK TWO: SPIRITS) АНГИУДЫН ХОЛБООС
 * Анги бүрийн линкийг доор шууд оруулах эсвэл Админ цонхоор тохируулж болно.
 */
export const LEGEND_OF_KORRA_S2_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZ3Tr4JZXPfMie5WRKys2mShL09NFy4YNwx7',
  2: 'https://u.pcloud.link/publink/show?code=XZrTr4JZm4OSXGn9XWXU460HQWTHf57zWHI7',
  3: 'https://u.pcloud.link/publink/show?code=XZoTr4JZ4akFHGeqv4R1ccI6JNu6DBJ8rCuV',
  4: 'https://u.pcloud.link/publink/show?code=XZFgr4JZpwvxD87vhd5SX8VxmfbSizxwXhJ7',
  5: 'https://u.pcloud.link/publink/show?code=XZpgr4JZM5yBozLivjjqFjp9pXbMoVDAbsTX',
  6: 'https://u.pcloud.link/publink/show?code=XZ8gr4JZb2ygpyxL0x0iROlD8kRMQm0NCLdV',
  7: 'https://u.pcloud.link/publink/show?code=XZQgr4JZPCCnUpK1fqSR8XU0VrtCpfKvzyRX',
  8: 'https://u.pcloud.link/publink/show?code=XZfgr4JZKhMzXhycpOmYhAeed2oeJBsl7iNX',
  9: 'https://u.pcloud.link/publink/show?code=XZBgr4JZKIOvJgVfN9LIwEUzgH15KmL5Ah77',
  10: 'https://u.pcloud.link/publink/show?code=XZMgr4JZrVbazH4STgRGNi9MLJmkSmxtCqKV',
  11: 'https://u.pcloud.link/publink/show?code=XZCgr4JZPwXa3khkbmbT2tv3HtBFNQNGAgxy',
  12: 'https://u.pcloud.link/publink/show?code=XZxgr4JZx94gyrEcjoScfXYOHgFT3LaDAyHV',
  13: 'https://u.pcloud.link/publink/show?code=XZlgr4JZ7G17D8YVIgF09crzSzaNCYEqJiay',
  14: 'https://u.pcloud.link/publink/show?code=XZdgr4JZ2FmXn1tfmrm74fcu6imL4FA04VV0',
};

export function setLegendOfKorraS2EpisodeLink(episodeNumber: number, link: string) {
  if (LEGEND_OF_KORRA_S2_EPISODE_LINKS[episodeNumber] !== undefined) {
    LEGEND_OF_KORRA_S2_EPISODE_LINKS[episodeNumber] = link;
    const ep = LEGEND_OF_KORRA_S2_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = link;
    }
  }
}

export function batchSetLegendOfKorraS2EpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setLegendOfKorraS2EpisodeLink(Number(epNum), link);
  });
}

export const LEGEND_OF_KORRA_S2_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги (13) - Босогч сүнс (Rebel Spirit)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги (14) - Өмнөдийн туйлын туяа (The Southern Lights)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги (15) - Иргэний дайн: 1-р хэсэг (Civil Wars: Part 1)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги (16) - Иргэний дайн: 2-р хэсэг (Civil Wars: Part 2)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги (17) - Энхийг сахиулагчид (Peacekeepers)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги (18) - Мэхлэлт (The Sting)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги (19) - Эхлэл: 1-р хэсэг - Анхны Аватар Ван (Beginnings: Part 1)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги (20) - Эхлэл: 2-р хэсэг - Раава ба Ваату (Beginnings: Part 2)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги (21) - Хөтөч (The Guide)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги (22) - Шинэ сүнслэг эрин (A New Spiritual Age)',
    duration: '23 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги (23) - Мянган оддын шөнө (Night of a Thousand Stars)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги (24) - Эв зохицлын нийлэмж (Harmonic Convergence)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги (25) - Харанхуй нөмрөх үед (Darkness Falls)',
    duration: '24 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги (26) - Харанхуй дахь гэрэл (Light in the Dark - Төгсгөл)',
    duration: '25 мин',
    videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[14],
  },
];

/**
 * 🌊 КОРРАГИЙН ДОМОГ: 2-Р БҮЛЭГ СҮНСНҮҮД (THE LEGEND OF KORRA: BOOK 2 SPIRITS)
 */
export const LEGEND_OF_KORRA_S2: Movie = {
  id: 'm_legend_of_korra_s2',
  title: 'The Legend of Korra Season 2',
  titleMongolian: 'Коррагийн Домог Бүлэг 2: Сүнснүүд (The Legend of Korra: Book 2 Spirits)',
  type: 'anime',
  poster: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/aec7f81f-3693-46a2-af0d-61dcb6b6d0c2/df1x3pu-dd0d8142-adbc-4c61-a677-6f8c94924248.png/v1/fill/w_670,h_1192,q_70,strp/the_legend_of_korra_season_2__my_canon__by_dfrab_df1x3pu-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTM2NSIsInBhdGgiOiJcL2ZcL2FlYzdmODFmLTM2OTMtNDZhMi1hZjBkLTYxZGNiNmI2ZDBjMlwvZGYxeDNwdS1kZDBkODE0Mi1hZGJjLTRjNjEtYTY3Ny02ZjhjOTQ5MjQyNDgucG5nIiwid2lkdGgiOiI8PTc2OCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.RTyAZ5InmGEs-Dx_Ma4_K6kIeDwjjxcc-sQ7My2zJLM',
  backdrop: 'https://comicvine.gamespot.com/a/uploads/scale_medium/6/67663/4108706-02.jpg',
  year: 2024,
  duration: '14 анги (Бүлэг 2)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Superpower', 'Shounen'],
  description: 'Коррагийн Домог 2-р бүлэг буюу "Сүнснүүд" (Book Two: Spirits) цуврал. Аватар Корра өмнөд ба умард усны овгийн хоорондох хурцадмал байдал болон хүний ертөнцийг заналхийлж буй харанхуй сүнснүүдийн дайралттай нүүр тулна. Тэрээр 10,000 жилийн тэртээх анхны Аватар Ваны үүсэл түүх, гэрлийн сүнс Раава ба харанхуйн сүнс Ваату нарын агуу тэмцлийн нууцыг нээж, ертөнцийн тэнцвэрийг хадгалахаар сүнсний ертөнц рүү аюулт аялалд гарна. Монгол дуу оруулгатай бүрэн 14 анги.',
  director: 'Майкл Данте ДиМартино, Брайн Кониецко (Nickelodeon / Studio Mir)',
  cast: [
    'Жанет Варни (Корра / Avatar Korra)',
    'Ж.К. Симмонс (Тэнзин / Tenzin)',
    'Стивен Юн (Анхны Аватар Ван / Wan)',
    'Дэвид Фаустино (Мако / Mako)',
    'П.Ж. Бирн (Болин / Bolin)',
    'Сейшелл Габриэль (Асами Сато)',
    'Жеймс Ремар (Тонрак / Tonraq)',
    'Эдриан ЛаТурелл (Уналак / Unalaq)',
  ],
  country: 'АНУ / Япон / Солонгос',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ ЦУВРАЛ • 14 АНГИ',
  totalEpisodes: 14,
  views: 890000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/5Tuh04vXFhI',
  videoUrl: LEGEND_OF_KORRA_S2_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: LEGEND_OF_KORRA_S2_EPISODES,
};

// Aliases for convenient importing
export const KORRA_SEASON_2 = LEGEND_OF_KORRA_S2;
export const KORRA_S2 = LEGEND_OF_KORRA_S2;

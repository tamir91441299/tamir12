import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatDeathNoteDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 📓 ҮХЛИЙН ДЭВТЭР (DEATH NOTE - БҮРЭН 37 АНГИ) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 */
export const DEATH_NOTE_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZVxr4JZmd91ifa45qXME4rMOzt66p1Mbwl7',
  2: 'https://u.pcloud.link/publink/show?code=XZYxr4JZ1Y6CjTSits509s6iSi2AR89QXaWk',
  3: 'https://u.pcloud.link/publink/show?code=XZTCr4JZ8pjjM0kAsubwYlknbhM01m3ISjsX',
  4: 'https://u.pcloud.link/publink/show?code=XZKCr4JZV06Vk2sQrKpIYhABwbUDCRmC1AX7',
  5: 'https://u.pcloud.link/publink/show?code=XZICr4JZfIMiKGUCexHMDa6vdshUCm7SETJ7',
  6: 'https://u.pcloud.link/publink/show?code=XZaCr4JZr8esUkVBSfykk0OP6VRG2b8W6E5X',
  7: 'https://u.pcloud.link/publink/show?code=XZGCr4JZLur7Ulv4ljXqvaSMPjKcYjb0PWaV',
  8: 'https://u.pcloud.link/publink/show?code=XZLDVQJZrLLzzxpRswj5xtrUK78Kv4X6FMqX',
  9: 'https://u.pcloud.link/publink/show?code=XZ4DVQJZWorUm95HCYBoXqfjlof4MuJ0Eosy',
  10: 'https://u.pcloud.link/publink/show?code=XZQDVQJZN5aFqzn1JbRfEDQRJaMnxRupMAV7',
  11: 'https://u.pcloud.link/publink/show?code=XZuDVQJZVGorNysvUN8ee18reIssQBtgxPVV',
  12: 'https://u.pcloud.link/publink/show?code=XZfDVQJZtkL1Oy2aYvRWFmB6x3Ow1yQfOjgX',
  13: 'https://u.pcloud.link/publink/show?code=XZMDVQJZhlz8AMs16JVP9B14lnlvPHDv4CY7',
  14: 'https://u.pcloud.link/publink/show?code=XZCDVQJZzD87UdHaSHyqBywSeAoByy3vVgJ7',
  15: 'https://u.pcloud.link/publink/show?code=XZhDc4JZr87t17ACqTRKJlHIzlVrwzlmOHoy',
  16: 'https://u.pcloud.link/publink/show?code=XZdDVQJZlYOjDKXroLjpXgqPfWBJ04pE917k',
  17: 'https://u.pcloud.link/publink/show?code=XZEDVQJZMSrlcTT38z8Xh7yH0XhaSbq3OAIV',
  18: 'https://u.pcloud.link/publink/show?code=XZODVQJZoqtpF5Tpx6JJsKTkyDfxBRBWBgzV',
  19: 'https://u.pcloud.link/publink/show?code=XZUDVQJZn9v52Kcs4EbkXS2jyNdg5VR6gSmk',
  20: 'https://u.pcloud.link/publink/show?code=XZADVQJZFsWu8fUxINLdCheuHw2bE5SK9FeV',
  21: 'https://u.pcloud.link/publink/show?code=XZNDVQJZigmPhH9s24btmaJoLWUixSqYGaUV',
  22: 'https://u.pcloud.link/publink/show?code=XZiDVQJZwm1phOIUtCXVYbzLGMuSoQrdjEfy',
  23: 'https://u.pcloud.link/publink/show?code=XZoDVQJZYJggyFhBKpFq0SsCu53z0Le2z8ey',
  24: 'https://u.pcloud.link/publink/show?code=XZz1VQJZrSN1kUCc6y8ziWgYGPK0XBueHbBV',
  25: 'https://u.pcloud.link/publink/show?code=XZR1VQJZpCapVSeOBd40f7vmTJkqRbcAU21X',
  26: 'https://u.pcloud.link/publink/show?code=XZ41VQJZB3kMtSupjXkH551R25Uu4BGvK7Ik',
  27: 'https://u.pcloud.link/publink/show?code=XZQ1VQJZMHEpdn3oKjz5gALGHRMW74JYxjH7',
  28: 'https://u.pcloud.link/publink/show?code=XZb1VQJZIk2dIUHXF6pzvx2uyM6UARbP12a7',
  29: 'https://u.pcloud.link/publink/show?code=XZS1VQJZ8hrT2MYpvMhBwI2VNUoG4F19oDTk',
  30: 'https://u.pcloud.link/publink/show?code=XZB1VQJZOlgcg1AMfvYFlV12ahHNBuLLf8PX',
  31: 'https://u.pcloud.link/publink/show?code=XZs1VQJZQtHNrppfBBmzLD6vO9npIk90QRkk',
  32: 'https://u.pcloud.link/publink/show?code=XZD1VQJZXWhmvajK92jLHgz1pJ3Vc44I8MQV',
  33: 'https://u.pcloud.link/publink/show?code=XZ91VQJZbP4tpV2FkVziIYPRHjwjQQiXklBy',
  34: 'https://u.pcloud.link/publink/show?code=XZM1VQJZnCYcRWVlmtRfWjcd3wDSRQVJyCYy',
  35: 'https://u.pcloud.link/publink/show?code=XZT1VQJZBOoxpzrmrepttAforePgy7gRyJx7',
  36: 'https://u.pcloud.link/publink/show?code=XZg1VQJZIhsrAaa6fsmg6fFc37urkhNghg1X',
  37: 'https://u.pcloud.link/publink/show?code=XZw1VQJZq7URuyoOr2m9INKwULXirY8Lh99y',
};

export const DEATH_NOTE_EPISODES: Episode[] = [
  { episodeNumber: 1, title: '1-р анги - Сэргэлт (Rebirth)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[1] },
  { episodeNumber: 2, title: '2-р анги - Сөргөлдөөн (Confrontation)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[2] },
  { episodeNumber: 3, title: '3-р анги - Гүйлгээ (Dealings)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[3] },
  { episodeNumber: 4, title: '4-р анги - Мөрдөлт (Pursuit)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[4] },
  { episodeNumber: 5, title: '5-р анги - Заль мэх (Tactics)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[5] },
  { episodeNumber: 6, title: '6-р анги - Сэтгэлийн шарх (Unraveling)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[6] },
  { episodeNumber: 7, title: '7-р анги - Үүлэрхэг тэнгэр (Overcast)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[7] },
  { episodeNumber: 8, title: '8-р анги - Харц (Gaze)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[8] },
  { episodeNumber: 9, title: '9-р анги - Уулзалт (Encounter)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[9] },
  { episodeNumber: 10, title: '10-р анги - Эргэлзээ (Doubt)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[10] },
  { episodeNumber: 11, title: '11-р анги - Дайралт (Assault)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[11] },
  { episodeNumber: 12, title: '12-р анги - Хайр (Love)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[12] },
  { episodeNumber: 13, title: '13-р анги - Илчлэлт (Confession)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[13] },
  { episodeNumber: 14, title: '14-р анги - Найз (Friend)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[14] },
  { episodeNumber: 15, title: '15-р анги - Бооцоо (Wager)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[15] },
  { episodeNumber: 16, title: '16-р анги - Шийдвэр (Decision)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[16] },
  { episodeNumber: 17, title: '17-р анги - Гүйцэтгэл (Execution)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[17] },
  { episodeNumber: 18, title: '18-р анги - Холбоотон (Ally)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[18] },
  { episodeNumber: 19, title: '19-р анги - Мацүда (Matsuda)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[19] },
  { episodeNumber: 20, title: '20-р анги - Түр аргацаалт (Makeshift)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[20] },
  { episodeNumber: 21, title: '21-р анги - Үзүүлбэр (Performance)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[21] },
  { episodeNumber: 22, title: '22-р анги - Удирдамж (Guidance)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[22] },
  { episodeNumber: 23, title: '23-р анги - Галзуурал (Frenzy)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[23] },
  { episodeNumber: 24, title: '24-р анги - Сэргэн мандалт (Revival)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[24] },
  { episodeNumber: 25, title: '25-р анги - Чимээгүй байдал (Silence)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[25] },
  { episodeNumber: 26, title: '26-р анги - Хойд дүр (Reincarnation)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[26] },
  { episodeNumber: 27, title: '27-р анги - Хулгай (Abduction)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[27] },
  { episodeNumber: 28, title: '28-р анги - Тэвчээргүй зан (Impatience)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[28] },
  { episodeNumber: 29, title: '29-р анги - Эцэг (Father)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[29] },
  { episodeNumber: 30, title: '30-р анги - Шударга ёс (Justice)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[30] },
  { episodeNumber: 31, title: '31-р анги - Шилжүүлэг (Transfer)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[31] },
  { episodeNumber: 32, title: '32-р анги - Сонголт (Selection)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[32] },
  { episodeNumber: 33, title: '33-р анги - Шоглоом (Scorn)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[33] },
  { episodeNumber: 34, title: '34-р анги - Сонор сэрэмж (Vigilance)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[34] },
  { episodeNumber: 35, title: '35-р анги - Хорсол (Malice)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[35] },
  { episodeNumber: 36, title: '36-р анги - 1-р сарын 28 (1.28)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[36] },
  { episodeNumber: 37, title: '37-р анги - Шинэ ертөнц (New World - Төгсгөл)', duration: '23 мин', videoUrl: DEATH_NOTE_EPISODE_LINKS[37] },
];

export function setDeathNoteEpisodeLink(episodeNumber: number, link: string) {
  if (DEATH_NOTE_EPISODE_LINKS[episodeNumber] !== undefined || episodeNumber >= 1) {
    const formatted = formatDeathNoteDriveLink(link) || link;
    DEATH_NOTE_EPISODE_LINKS[episodeNumber] = formatted;
    const ep = DEATH_NOTE_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      DEATH_NOTE.videoUrl = formatted;
    }
  }
}

export function batchSetDeathNoteEpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setDeathNoteEpisodeLink(Number(epNum), link);
  });
}

/**
 * 📓 ҮХЛИЙН ДЭВТЭР (DEATH NOTE) - Бүрэн 37 анги
 */
export const DEATH_NOTE: Movie = {
  id: 'm_death_note',
  title: 'Death Note',
  titleMongolian: 'Үхлийн дэвтэр (Death Note)',
  type: 'anime',
  poster: 'https://www.ixpap.com/images/2021/12/Death-Note-Wallpaper-6.jpg',
  backdrop: 'https://tse2.mm.bing.net/th/id/OIP.b3SUQ2FRR3XkE4_ZP9NvfQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  year: 2006,
  duration: '37 анги',
  rating: 9.9,
  genres: ['Animation', 'Mystery', 'Psychological', 'Supernatural', 'Thriller', 'Shounen'],
  description: 'Ахлах ангийн онц сурлагатан Ягами Лайт санамсаргүй байдлаар нэр нь бичигдсэн хүн үхдэг шидэт "Үхлийн дэвтэр"-ийг олж авна. Тэрээр гэмт хэрэгтнүүдийг устгаж, гэмт хэрэггүй төгс шинэ ертөнцийг Кира нэрээр бий болгохыг зорьдог. Гэвч түүний өөдөөс дэлхийн хамгийн суутан нууцлаг мөрдөгч L сөрөн зогсож, оюун ухаан, стратегийн сэтгэл хөдөлгөм агуу тэмцэл өрнөнө. Монгол дуу оруулгатай бүрэн 37 анги.',
  director: 'Тэцүро Араки (Tetsuro Araki - Madhouse)',
  cast: [
    'Мамору Мияно (Лайт Ягами / Кира)',
    'Каппэй Ямагүчи (L / Рюүзаки)',
    'Шидо Накамура (Шинигами Рюк)',
    'Ая Хирано (Миса Аманэ)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'Бүрэн 37 анги',
  totalEpisodes: 37,
  views: 960000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/NlJZ-YgAt-c',
  videoUrl: DEATH_NOTE_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: DEATH_NOTE_EPISODES,
};

import { Movie, Episode } from '../../../types';
import { extractGoogleDriveId } from '../../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 * Та Google Drive-ын Share хийсэн линк эсвэл зөвхөн File ID (жишээ: 1a2b3c4d...)-г
 * доорх DEATH_NOTE_EPISODE_LINKS объектод оруулж холбоно.
 */
export function formatDeathNoteDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 📓 ҮХЛИЙН ТЭМДЭГЛЭЛ (DEATH NOTE) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Хэрэв та өөрийн Google Drive линкүүдээ шууд нэг дор оруулахыг хүсвэл
 * доорх 1-37 дугаарын ард Drive линк эсвэл ID-гаа хуулж тавина уу:
 */
export const DEATH_NOTE_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1XS-Z_-TtLoNF4dgCgWL60hVQGCdvIhUE/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1deathnote_ep02_drive_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1deathnote_ep03_drive_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1deathnote_ep04_drive_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1deathnote_ep05_drive_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1deathnote_ep06_drive_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1deathnote_ep07_drive_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1deathnote_ep08_drive_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1deathnote_ep09_drive_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1deathnote_ep10_drive_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1deathnote_ep11_drive_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1deathnote_ep12_drive_link/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1deathnote_ep13_drive_link/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1deathnote_ep14_drive_link/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1deathnote_ep15_drive_link/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1deathnote_ep16_drive_link/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1deathnote_ep17_drive_link/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1deathnote_ep18_drive_link/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1deathnote_ep19_drive_link/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1deathnote_ep20_drive_link/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1deathnote_ep21_drive_link/view?usp=drivesdk',
  22: 'https://drive.google.com/file/d/1deathnote_ep22_drive_link/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1deathnote_ep23_drive_link/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1deathnote_ep24_drive_link/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1deathnote_ep25_drive_link/view?usp=drivesdk',
  26: 'https://drive.google.com/file/d/1deathnote_ep26_drive_link/view?usp=drivesdk',
  27: 'https://drive.google.com/file/d/1deathnote_ep27_drive_link/view?usp=drivesdk',
  28: 'https://drive.google.com/file/d/1deathnote_ep28_drive_link/view?usp=drivesdk',
  29: 'https://drive.google.com/file/d/1deathnote_ep29_drive_link/view?usp=drivesdk',
  30: 'https://drive.google.com/file/d/1deathnote_ep30_drive_link/view?usp=drivesdk',
  31: 'https://drive.google.com/file/d/1deathnote_ep31_drive_link/view?usp=drivesdk',
  32: 'https://drive.google.com/file/d/1deathnote_ep32_drive_link/view?usp=drivesdk',
  33: 'https://drive.google.com/file/d/1deathnote_ep33_drive_link/view?usp=drivesdk',
  34: 'https://drive.google.com/file/d/1deathnote_ep34_drive_link/view?usp=drivesdk',
  35: 'https://drive.google.com/file/d/1deathnote_ep35_drive_link/view?usp=drivesdk',
  36: 'https://drive.google.com/file/d/1deathnote_ep36_drive_link/view?usp=drivesdk',
  37: 'https://drive.google.com/file/d/1deathnote_ep37_drive_link/view?usp=drivesdk',
};

export const DEATH_NOTE_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Сэргэлт / Төрөлт (Rebirth)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Сөргөлдөөн (Confrontation)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Гүйлгээ (Dealings)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Мөрдөлт (Pursuit)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Тактик (Tactics)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Нээлттэй шарх (Unraveling)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Үүлэрхэг тэнгэр (Overcast)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Харц (Glare)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Уулзалт (Encounter)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Эргэлзээ (Doubt)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Довтолгоо (Assault)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Хайр (Love)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Мэдэгдэл (Confession)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Найз (Friend)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Бооцоо (Wager)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Шийдвэр (Decision)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[16],
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Цаазаар авах ял (Execution)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[17],
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Хамтрагч (Ally)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[18],
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Мацүда (Matsuda)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[19],
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Түр зогсолт (Makeshift)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[20],
  },
  {
    episodeNumber: 21,
    title: '21-р анги - Гүйцэтгэл (Performance)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[21],
  },
  {
    episodeNumber: 22,
    title: '22-р анги - Чиглүүлэлт (Guidance)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[22],
  },
  {
    episodeNumber: 23,
    title: '23-р анги - Догдлол (Frenzy)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[23],
  },
  {
    episodeNumber: 24,
    title: '24-р анги - Сэргэлт (Revival)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[24],
  },
  {
    episodeNumber: 25,
    title: '25-р анги - Чимээгүй байдал (Silence)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[25],
  },
  {
    episodeNumber: 26,
    title: '26-р анги - Дахин эхлэл (Renewal)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[26],
  },
  {
    episodeNumber: 27,
    title: '27-р анги - Хулгайлалт (Abduction)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[27],
  },
  {
    episodeNumber: 28,
    title: '28-р анги - Тэвчээр (Impatience)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[28],
  },
  {
    episodeNumber: 29,
    title: '29-р анги - Эцэг (Father)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[29],
  },
  {
    episodeNumber: 30,
    title: '30-р анги - Шударга ёс (Justice)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[30],
  },
  {
    episodeNumber: 31,
    title: '31-р анги - Шилжүүлэлт (Transfer)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[31],
  },
  {
    episodeNumber: 32,
    title: '32-р анги - Сонголт (Selection)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[32],
  },
  {
    episodeNumber: 33,
    title: '33-р анги - Үл тоомсорлолт (Scorn)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[33],
  },
  {
    episodeNumber: 34,
    title: '34-р анги - Хараацай / Сэрэмж (Vigilance)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[34],
  },
  {
    episodeNumber: 35,
    title: '35-р анги - Хорон санаа (Malice)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[35],
  },
  {
    episodeNumber: 36,
    title: '36-р анги - 1.28 (1.28)',
    duration: '24 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[36],
  },
  {
    episodeNumber: 37,
    title: '37-р анги - Шинэ ертөнц (New World - Төгсгөл)',
    duration: '25 мин',
    videoUrl: DEATH_NOTE_EPISODE_LINKS[37],
  },
];

/**
 * 📓 ҮХЛИЙН ТЭМДЭГЛЭЛ (DEATH NOTE) - Бүрэн 37 анги
 */
export const DEATH_NOTE: Movie = {
  id: 'm_death_note',
  title: 'Death Note',
  titleMongolian: 'Үхлийн Тэмдэглэл (Death Note)',
  type: 'anime',
  poster: 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w1280/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg',
  year: 2006,
  duration: '37 анги',
  rating: 9.9,
  genres: ['Animation', 'Mystery', 'Psychological', 'Thriller', 'Supernatural', 'Shounen'],
  description: 'Ахлах сургуулийн онц сурлагатан Ягами Лайт газарт унасан Үхлийн Тэмдэглэл (Death Note) хэмээх нууцлаг дэвтрийг олсноор түүх эхэлнэ. Хэрэв хүний нэрийг энэ дэвтэрт бичвэл тэр хүн үхэх жамтай. Лайт дэлхийг гэмт хэрэгтнүүдээс цэвэрлэж, өөрийгөө "Шинэ ертөнцийн бурхан Кира" хэмээн өргөмжлөх боловч түүний эсрэг дэлхийн шилдэг суут мөрдөгч L гарч ирж оюун ухааны ширүүн тулаан өрнөнө. Монгол дуу оруулгатай бүрэн 37 анги.',
  director: 'Тэцүро Араки (Tetsuro Araki - Madhouse)',
  cast: [
    'Мамору Мияно (Ягами Лайт / Кира)',
    'Каппей Ямагүчи (L Lawliet)',
    'Шидо Накамура (Рьюк)',
    'Ая Хирано (Аманэ Миса)',
    'Норико Хидака (Ниа)',
    'Сасаки Нозому (Мэлло)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'БҮРЭН 37 АНГИ ОРЛОО',
  totalEpisodes: 37,
  views: 1890000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/NlJZ-YgAt-c',
  videoUrl: DEATH_NOTE_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: DEATH_NOTE_EPISODES,
};

// Aliases for convenient importing
export const DEATH_NOTE_SERIES = DEATH_NOTE;
export const DEATH_NOTE_S1 = DEATH_NOTE;
export const DEATH_NOTE_ANIME = DEATH_NOTE;

import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 * Та Google Drive-ын Share хийсэн линк эсвэл зөвхөн File ID (жишээ: 1a2b3c4d...)-г
 * доорх episodes массив дахь videoUrl эсвэл JUJUTSU_KAISEN_DRIVE_LINKS объектод оруулж холбоно.
 */
export function formatDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🎬 ЖҮЖҮЦҮ КАЙСЭН (JUJUTSU KAISEN) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Хэрэв та өөрийн Google Drive линкүүдээ шууд нэг дор оруулахыг хүсвэл
 * доорх 1-24 дугаарын ард Drive линк эсвэл ID-гаа хуулж тавина уу:
 */
export const JUJUTSU_KAISEN_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1_UjBycpnTZwHz8a-_JMdcGAPxoaLdjuL/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1e3O8u7mMStWWU89gHUcGgUlwUKGlVOKr/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1_UjBycpnTZwHz8a-_JMdcGAPxoaLdjuL/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1Velzu0_OZciTmdCAvh4eK1fbBpUIEiJ5/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1G2wMEQHYA4m2ML5UyfMfTDQu0nMwHxBg/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1ngt2bXRYos-G5mb56Lpzh1AaNzgHLyO3/view?usp=drivesdk&usp=embed_facebook',
  7: 'https://drive.google.com/file/d/19M-XWb422v7GBPTMmxJCppHHNMwDLI8K/view?usp=drivesdk&usp=embed_facebook',
  8: 'https://drive.google.com/file/d/14AkZ-bfTILfOlaGKr0BscxTnBCgFHbMa/view?usp=drivesdk&usp=embed_facebook',
  9: 'https://drive.google.com/file/d/1Blowu2V99blTx4N8yz6gvhYsr8wfkT55/view?usp=drivesdk&usp=embed_facebook',
  10: 'https://drive.google.com/file/d/1Gxn36Q-sjnajWharitnH-YN3M9RUepX7/view?usp=drivesdk&usp=embed_facebook',
  11: 'https://drive.google.com/file/d/1fZTsC523B43ncUO9g3OJNALdaCg4Vccd/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/14lI-Iy0C7DGuDqtT25Ruk7SPECDsthEs/view?usp=drivesdk&usp=embed_facebook',
  13: 'https://drive.google.com/file/d/1YoVAEHc_ByCfqupt2SYcpXXPiUt8qZDY/view?usp=drivesdk&usp=embed_facebook',
  14: 'https://drive.google.com/file/d/1X8zp-CGFnQXhrcNVpsMGJlpwGnKblMis/view?usp=drivesdk&usp=embed_facebook',
  15: 'https://drive.google.com/file/d/1oRXPQUEkj8kLEHk-G77u97ghqMCVuOmY/view?usp=drivesdk&usp=embed_facebook',
  16: 'https://drive.google.com/file/d/1XjfFHLCwpMCt3xs4iNPnw04kq9Wxd2ce/view?usp=drivesdk&usp=embed_facebook',
  17: 'https://drive.google.com/file/d/1rxx5UlkmYkl_HFGmhcnXRnKZWLXup_1u/view?usp=drivesdk&usp=embed_facebook',
  18: 'https://drive.google.com/file/d/13uwy4a-hmYXbasZ72FbM7OW0OS_WSIl8/view?usp=drivesdk&usp=embed_facebook',
  19: 'https://drive.google.com/file/d/1w8e89UgX3BPpC4ASAgLHEiAqLq7TntFa/view?usp=drivesdk&usp=embed_facebook',
  20: 'https://drive.google.com/file/d/1CqcsH5igCWiQ5kHBvhKUQe6E0HrCVj23/view?usp=drivesdk&usp=embed_facebook',
  21: 'https://drive.google.com/file/d/1qlA2LMb8ZQkVGqisj_hkfcgn1rqSwKZg/view?usp=drivesdk&usp=embed_facebook',
  22: 'https://drive.google.com/file/d/13gDujAas6PUoNvvS0xeRNAtTnVlJy7P-/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/124Lid9ilQBbBsOnlbGWvkb9H9pvghUX8/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/124Lid9ilQBbBsOnlbGWvkb9H9pvghUX8/view?usp=drivesdk',
};

export const JUJUTSU_KAISEN_S1_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Рёмэн Сүкүна (Ryomen Sukuna)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[1]
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Өөрийнхөө төлөө (For Myself)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[2]
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Ган төмөр охин (Girl of Steel)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[3]
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Хараалын хэвлий дэх төрөлт (Curse Womb Must Die)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[4]
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Хараалын хэвлий дэх төрөлт - II (Curse Womb Must Die -II-)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[5]
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Борооны дараа (After Rain)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[6]
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Довтолгоо (Assault - Гожо Саторүгийн хүч)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[7]
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Уйтгар (Boredom)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[8]
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Бяцхан загас ба урвуу шийтгэл (Small Fry and Reverse Retribution)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[9]
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Сул хувиралт (Idle Transfiguration)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[10]
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Хатуу сэтгэл (Narrow-minded)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[11]
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Хэзээ нэг өдөр чамд (To You, Someday)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[12]
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Маргааш уулзъя (Tomorrow)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[13]
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Киотогийн сургуультай өрсөлдөх нь (Kyoto Sister School Exchange Event)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[14]
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Багийн тулаан 1 (Group Battle 1 - Тодотой учрах нь)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[15]
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Багийн тулаан 2 (Group Battle 2 - Пандагийн хүч)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[16]
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Багийн тулаан 3 (Group Battle 3 - Маки ба Маи)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[17]
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Мэргэн ухаан (Sage)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[18]
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Хар гялбаа (Black Flash - Кокүсэн цохилт)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[19]
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Стандарт бус (Nonstandard - Хананамигийн эсрэг)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[20]
  },
  {
    episodeNumber: 21,
    title: '21-р анги - Хараалчдын Бэйсбол (Jujutsu Koshien)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[21]
  },
  {
    episodeNumber: 22,
    title: '22-р анги - Үхлийн эхлэл (The Origin of Blind Obedience)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[22]
  },
  {
    episodeNumber: 23,
    title: '23-р анги - Үхлийн эхлэл - II (The Origin of Blind Obedience - Part 2)',
    duration: '24 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[23]
  },
  {
    episodeNumber: 24,
    title: '24-р анги - Хамсаатнууд (Accomplices - 1-р бүлгийн төгсгөл)',
    duration: '25 мин',
    videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[24]
  }
];

/**
 * 🎌 ЖҮЖҮЦҮ КАЙСЭН (JUJUTSU KAISEN) - Бүлэг 1 (Бүрэн 24 анги)
 */
export const JUJUTSU_KAISEN_S1: Movie = {
  id: 'm_jujutsu_kaisen_s1',
  title: 'Jujutsu Kaisen Season 1',
  titleMongolian: 'Хар Шидийн Дайн Бүлэг 1',
  type: 'anime',
  poster: 'https://www.themoviedb.org/t/p/original/uyyMrkDgjnpGFM9dnJEYlUya7O0.jpg',
  backdrop: 'https://tse2.mm.bing.net/th/id/OIP.FeVdxyWC0l81ybEo5RukWAHaD5?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  year: 2024,
  duration: '24 анги',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Dark Fantasy', 'Supernatural', 'Shounen'],
  description: 'Ахлах сургуулийн ер бусын бие бялдрын чадвартай хүү Юүжи Итадори найзуудаа аюулт хараалаас аврахын тулд Хараалын Хаан Рёмэн Сүкүнагийн хурууг залгиснаар хараалчдын далд ертөнцөд хөл тавина. Домогт Гожо Саторү багшийн удирдлага дор Токиогийн Хараалын ахлах сургуульд элсэн хараалын эсрэг амь өрссөн тулаанд орно. Монгол дуу оруулгатай бүрэн 24 анги.',
  director: 'Сонхү Пак (Sunghoo Park - MAPPA)',
  cast: ['Жүня Эноки (Юүжи Итадори)', 'Юүичи Накамура (Гожо Саторү)', 'Юма Үчида (Мэгүми Фүшигүро)', 'Асами Сэто (Нобара Күгисаки)'],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'БҮРЭН 24 АНГИ ОРЛОО',
  totalEpisodes: 24,
  views: 1250000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/4A_XgUP914U',
  videoUrl: JUJUTSU_KAISEN_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: JUJUTSU_KAISEN_S1_EPISODES
};

// Aliases for convenient importing
export const JUJUTSU_KAISEN = JUJUTSU_KAISEN_S1;
export const JJK_S1 = JUJUTSU_KAISEN_S1;

import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🌲 ГРАВИТИ ФОЛЛС (GRAVITY FALLS) - АНГИ ХОЛБОХ КОД БОЛОН ТУСЛАХ ФУНКЦҮҮД
 * 
 * 📌 Хэрэглэх заавар:
 * 1. Доорх `GRAVITY_FALLS_EPISODE_LINKS` хүснэгтэд ангийн дугаарын ард өөрийн Google Drive линк,
 *    YouTube, Filemoon, Ok.ru эсвэл MP4/HLS шууд видеоны холбоосоо хуулж тавина.
 * 2. `setGravityFallsEpisodeLink(анги, линк)` функцээр код дотроос эсвэл динамикаар линк оноож болно.
 * 3. Google Drive линк оруулахдаа бүтэн линк (https://drive.google.com/file/d/.../view) эсвэл
 *    зөвхөн File ID (жишээ нь: 1a2b3c4d...)-г бичиж болно.
 */

// Google Drive эсвэл шууд линкийг тоглуулагчийн форматад оруулах туслах функц
export function formatGravityFallsDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🌲 ГРАВИТИ ФОЛЛС 1-Р БҮЛЭГ: 1-20 АНГИЙН ВИДЕО ХОЛБООС ТОХИРУУЛАХ ХҮСНЭГТ
 * Өөрийн Google Drive болон видео линкүүдээ энд дугаарын дагуу хуулж тавина уу:
 */
export const GRAVITY_FALLS_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1gravity_falls_ep02_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1gravity_falls_ep03_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1gravity_falls_ep04_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1gravity_falls_ep05_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1gravity_falls_ep06_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1gravity_falls_ep07_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1gravity_falls_ep08_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1gravity_falls_ep09_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1gravity_falls_ep10_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1gravity_falls_ep11_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1gravity_falls_ep12_link/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1gravity_falls_ep13_link/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1gravity_falls_ep14_link/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1gravity_falls_ep15_link/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1gravity_falls_ep16_link/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1gravity_falls_ep17_link/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1gravity_falls_ep18_link/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1gravity_falls_ep19_link/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1gravity_falls_ep20_link/view?usp=drivesdk',
};

/**
 * 🔗 Тодорхой ангийн линкийг шинэчлэх / холбох функц
 */
export function setGravityFallsEpisodeLink(episodeNumber: number, linkOrDriveId: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 20) {
    const formatted = formatGravityFallsDriveLink(linkOrDriveId);
    GRAVITY_FALLS_EPISODE_LINKS[episodeNumber] = formatted;
    
    // Мөн ангиудын массив доторх линкийг шинэчилнэ
    const ep = GRAVITY_FALLS_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      GRAVITY_FALLS.videoUrl = formatted;
    }
  }
}

/**
 * 🔗 Олон ангийн линкийг нэг дор шинэчлэх (Batch Update) функц
 */
export function batchSetGravityFallsEpisodeLinks(linksMap: Record<number, string>): void {
  Object.entries(linksMap).forEach(([numStr, url]) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      setGravityFallsEpisodeLink(num, url);
    }
  });
}

/**
 * 🌲 ГРАВИТИ ФОЛЛС 1-Р БҮЛГИЙН АНГИУДЫН БҮРЭН ЖАГСААЛТ
 */
export const GRAVITY_FALLS_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Жуулчдын урхи (Tourist Trapped)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Гобблвонкерын домог (The Legend of the Gobblewonker)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Лааны баримлын ангуучид (Headhunters)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Мэйбэлийн эрх мэдэл ба Бяцхан Гидеон (The Hand That Rocks the Mabel)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Эвгүй сүнстэй дэлгүүр (The Inconveniencing)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Диппер эр зоригийн эрэлд (Dipper vs. Manliness)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Хоёр Диппер & Хувилсан ихрүүд (Double Dipper)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Цаг хугацааны аялагчийн гахай (Time Traveler\'s Pig)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Тоглоомын тулаанчид амилсан нь (Fight Fighters)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Жижиг Диппер & Кристалын нууц (Little Dipper)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Зуны Халловин (Summerween)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Захирал Мэйбэл & Нууцын овоохой (Boss Mabel)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Ёроолгүй нүхний нууц (Bottomless Pit!)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Гүн усанд шумбагч ба Мерман (The Deep End)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Хивсний цахилгаан нууц (Carpet Diem)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Хөвгүүдийн хамтлаг ба хувилах машин (Boyz Crazy)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[16],
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Гахайг аврах аварга динозавр (Land Before Swine)',
    duration: '22 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[17],
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Зүүдний ертөнц ба Билл Сайферын дайралт (Dreamscaperers)',
    duration: '23 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[18],
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Гидеоны мандалт (Gideon Rises - 1-р бүлгийн төгсгөл)',
    duration: '24 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[19],
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Нууцын тайлал & Билл Сайферын тусгай анги (Weirdmageddon Special)',
    duration: '25 мин',
    videoUrl: GRAVITY_FALLS_EPISODE_LINKS[20],
  },
];

/**
 * 🌲 ГРАВИТИ ФОЛЛС (GRAVITY FALLS) КИНОНЫ МЭДЭЭЛЭЛ
 */
export const GRAVITY_FALLS: Movie = {
  id: 'm_gravity_falls',
  title: 'Gravity Falls',
  titleMongolian: 'Гравити Фоллс (Gravity Falls)',
  type: 'anime',
  poster: '/images/gravity_falls_poster.jpg',
  backdrop: '/images/gravity_falls_backdrop.jpg',
  year: 2024,
  duration: '20 анги (Бүлэг 1)',
  rating: 9.9,
  genres: ['Animation', 'Adventure', 'Comedy', 'Mystery', 'Fantasy', 'Sci-Fi'],
  description: 'Зуны амралтаараа 12 настай ихэр ах дүү Диппер, Мэйбэл Пайнс нар Орегон мужийн алслагдсан нууцлаг Гравити Фоллс хотхон дахь өвөө Стэний (Grunkle Stan) "Нууцын Овоохой" (Mystery Shack) хэмээх жуулчдын үзмэрийн газарт ирнэ. Диппер ойд нуугдсан 3-р дугаартай ер бусын тэмдэглэлийн дэвтрийг олж илрүүлснээр хотхоны далд сүнснүүд, гномууд, зомбинууд, цаг хугацааны аялагчид болон Билл Сайферын нууцыг тайлахаар сонирхолтой бөгөөд аюултай адал явдалтай учирна. Монгол дуу оруулгатай бүрэн цуврал.',
  director: 'Алекс Хирш (Alex Hirsch - Disney Television Animation)',
  cast: [
    'Жейсон Риттер (Диппер Пайнс / Dipper Pines)',
    'Кристен Шаал (Мэйбэл Пайнс / Mabel Pines)',
    'Алекс Хирш (Стэнли Пайнс өвөө / Grunkle Stan)',
    'Линда Карделлини (Вэнди Кордрой / Wendy Corduroy)',
    'Алекс Хирш (Зүүс Рамирез / Soos Ramirez)',
    'Ж.К. Симмонс (Форд Пайнс / Stanford Pines)',
    'Алекс Хирш (Билл Сайфер / Bill Cipher)',
  ],
  country: 'АНУ',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ АНИМЭШН • 20 АНГИ',
  totalEpisodes: 20,
  views: 890000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/X2DUpDxFJyg',
  videoUrl: GRAVITY_FALLS_EPISODE_LINKS[1],
  ageRating: 'ALL',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: GRAVITY_FALLS_EPISODES,
};

// Хялбар импорт хийх нэршлүүд (Aliases)
export const GRAVITY_FALLS_S1 = GRAVITY_FALLS;
export const GRAVITY_FALLS_SERIES = GRAVITY_FALLS;
export const GRAVITY_FALLS_CARTOON = GRAVITY_FALLS;

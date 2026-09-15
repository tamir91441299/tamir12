import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🪚 ЧЭЙНСО МЭН (CHAINSAW MAN) - АНГИ ХОЛБОХ КОД & ТУСЛАХ ФУНКЦҮҮД
 * 
 * 📌 Хэрэглэх заавар:
 * 1. Доорх `CHAINSAW_MAN_EPISODE_LINKS` хүснэгтэд ангийн дугаарын ард өөрийн Google Drive линк,
 *    YouTube, Filemoon, Ok.ru эсвэл шууд MP4 видеоны холбоосоо хуулж тавина.
 * 2. `setChainsawManEpisodeLink(анги, линк)` функцээр шууд код дотроос холбох боломжтой.
 * 3. Бүх ангийг багцаар нь нэг дор шинэчлэхийн тулд `batchSetChainsawManEpisodeLinks({...})` дуудна.
 */

// Google Drive эсвэл шууд линкийг тоглуулагчийн форматад хөрвүүлэх туслах функц
export function formatChainsawManDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🪚 ЧЭЙНСО МЭН 1-Р БҮЛЭГ: 1-12 АНГИЙН ВИДЕО ХОЛБООС ТОХИРУУЛАХ ХҮСНЭГТ
 * Өөрийн Google Drive болон видео линкүүдээ энд дугаарын дагуу хуулж тавина уу:
 */
export const CHAINSAW_MAN_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1csm_ep02_drive_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1csm_ep03_drive_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1csm_ep04_drive_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1csm_ep05_drive_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1csm_ep06_drive_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1csm_ep07_drive_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1csm_ep08_drive_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1csm_ep09_drive_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1csm_ep10_drive_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1csm_ep11_drive_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1csm_ep12_drive_link/view?usp=drivesdk',
};

/**
 * 🔗 Чэйнсо Мэний тодорхой ангийн видео линкийг шинэчлэх / холбох код
 */
export function setChainsawManEpisodeLink(episodeNumber: number, linkOrDriveId: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 12) {
    const formatted = formatChainsawManDriveLink(linkOrDriveId);
    CHAINSAW_MAN_EPISODE_LINKS[episodeNumber] = formatted;
    
    // Ангиудын массив дахь линкийг шинэчлэх
    const ep = CHAINSAW_MAN_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      CHAINSAW_MAN.videoUrl = formatted;
    }
  }
}

/**
 * 🔗 Чэйнсо Мэний олон ангийн линкийг нэг дор багцаар шинэчлэх (Batch update) функц
 */
export function batchSetChainsawManEpisodeLinks(linksMap: Record<number, string>): void {
  Object.entries(linksMap).forEach(([numStr, url]) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      setChainsawManEpisodeLink(num, url);
    }
  });
}

/**
 * 🪚 ЧЭЙНСО МЭН 1-Р БҮЛГИЙН АНГИУДЫН БҮРЭН ЖАГСААЛТ (12 анги)
 */
export const CHAINSAW_MAN_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Нохой ба Хөрөө (Dog & Chainsaw)',
    duration: '25 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Токиод ирсэн нь (Arrival in Tokyo)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Муурны хувь заяа (Meow\'s Whereabouts)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Аврал (Rescue)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Бууны чөтгөр (Gun Devil)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Дэнжийг устгах тушаал (Kill Denji)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Үнсэлтийн амт (The Taste of a Kiss)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Гэнэтийн буун дуу (Gunfire)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Киотогоос ирсэн дэмжлэг (From Kyoto)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Хүнд цохилт ба Бэлтгэл (Bruised & Battered)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Даалгавар эхэллээ (Mission Start)',
    duration: '24 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Катанатай тулалдсан нь (Katana vs. Chainsaw - 1-р бүлгийн төгсгөл)',
    duration: '25 мин',
    videoUrl: CHAINSAW_MAN_EPISODE_LINKS[12],
  },
];

/**
 * 🪚 ЧЭЙНСО МЭН (CHAINSAW MAN) БҮТЭЭЛИЙН МЭДЭЭЛЭЛ
 */
export const CHAINSAW_MAN: Movie = {
  id: 'm_chainsaw_man',
  title: 'Chainsaw Man',
  titleMongolian: 'Чэйнсо Мэн (Chainsaw Man)',
  type: 'anime',
  poster: '/images/chainsaw_man_poster.jpg',
  backdrop: '/images/chainsaw_man_backdrop.jpg',
  year: 2024,
  duration: '12 анги (Бүлэг 1)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Dark Fantasy', 'Supernatural', 'Shounen', 'Horror'],
  description: 'Өр төлбөртөө баригдсан ядуу хүү Дэнжи Почита хэмээх хөрөөт чөтгөр нохойтойгоо хамтран чөтгөрийн ангууч хийдэг байв. Гэвч якузад урвагдан амиа алдах үед Почита зүрхээ Дэнжид өгч нэгдсэнээр тэрээр цээж, гараасаа цахилгаан хөрөө гарган хувирах чадвартай эрлийз "Хөрөөт хүн" болон дахин төрнө. Улмаар Нийтийн аюулгүй байдлын тусгай албаны удирдагч Макиматай уулзаж, Аки Хаякава, Цусан чөтгөр Пауэр нарын хамт аймшигт Бууны чөтгөрийг устгах аюултай даалгаварт орно. Монгол дуу оруулгатай бүрэн 12 анги.',
  director: 'Рюү Накаяма (Ryu Nakayama - MAPPA Studio)',
  cast: [
    'Тоя Кикүносүкэ (Дэнжи / Denji)',
    'Томори Күсүноки (Макима / Makima)',
    'Шого Саката (Аки Хаякава / Aki Hayakawa)',
    'Файроз Ай (Пауэр / Power)',
    'Шиори Изава (Почита / Pochita)',
    'Карин Такахаши (Кобени / Kobeni Higashiyama)',
    'Мария Исэ (Химено / Himeno)',
    'Кэнжиро Цүда (Кишибэ / Kishibe)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'БҮРЭН 12 АНГИ ОРЛОО',
  totalEpisodes: 12,
  views: 1450000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/q15CRdE5Bv0',
  videoUrl: CHAINSAW_MAN_EPISODE_LINKS[1],
  ageRating: '+18',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: CHAINSAW_MAN_EPISODES,
};

// Aliases for convenient importing
export const CHAINSAW_MAN_S1 = CHAINSAW_MAN;
export const CSM = CHAINSAW_MAN;
export const CSM_S1 = CHAINSAW_MAN;

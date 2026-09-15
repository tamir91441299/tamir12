import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🌙 СОУЛ ИЙТЭР / СҮНС ИДЭШТЭН (SOUL EATER) - БҮРЭН 51 АНГИ ХОЛБОХ КОД & ТУСЛАХ ФУНКЦҮҮД
 * 
 * 📌 Хэрэглэх заавар:
 * 1. Доорх `SOUL_EATER_EPISODE_LINKS` хүснэгтэд 1-51 дугаарын ард өөрийн Google Drive линк,
 *    YouTube, Filemoon, Ok.ru эсвэл шууд MP4 видеоны холбоосоо хуулж тавина.
 * 2. `setSoulEaterEpisodeLink(анги, линк)` функцээр шууд код дотроос холбох боломжтой.
 * 3. Олон ангийг багцаар нь нэг дор шинэчлэхийн тулд `batchSetSoulEaterEpisodeLinks({...})` дуудна.
 */

// Google Drive эсвэл шууд линкийг тоглуулагчийн форматад хөрвүүлэх туслах функц
export function formatSoulEaterDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🌙 СОУЛ ИЙТЭР 1-Р БҮЛЭГ: 1-51 АНГИЙН ВИДЕО ХОЛБООС ТОХИРУУЛАХ ХҮСНЭГТ
 */
export const SOUL_EATER_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1zbpUSEE8wa6N8ulz4JY4-MUoDe2ZT5EI/view?usp=drivesd',
  2: 'https://drive.google.com/file/d/1soul_eater_ep02_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1soul_eater_ep03_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1soul_eater_ep04_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1soul_eater_ep05_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1soul_eater_ep06_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1soul_eater_ep07_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1soul_eater_ep08_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1soul_eater_ep09_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1soul_eater_ep10_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1soul_eater_ep11_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1soul_eater_ep12_link/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1soul_eater_ep13_link/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1soul_eater_ep14_link/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1soul_eater_ep15_link/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1soul_eater_ep16_link/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1soul_eater_ep17_link/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1soul_eater_ep18_link/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1soul_eater_ep19_link/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1soul_eater_ep20_link/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1soul_eater_ep21_link/view?usp=drivesdk',
  22: 'https://drive.google.com/file/d/1soul_eater_ep22_link/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1soul_eater_ep23_link/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1soul_eater_ep24_link/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1soul_eater_ep25_link/view?usp=drivesdk',
  26: 'https://drive.google.com/file/d/1soul_eater_ep26_link/view?usp=drivesdk',
  27: 'https://drive.google.com/file/d/1soul_eater_ep27_link/view?usp=drivesdk',
  28: 'https://drive.google.com/file/d/1soul_eater_ep28_link/view?usp=drivesdk',
  29: 'https://drive.google.com/file/d/1soul_eater_ep29_link/view?usp=drivesdk',
  30: 'https://drive.google.com/file/d/1soul_eater_ep30_link/view?usp=drivesdk',
  31: 'https://drive.google.com/file/d/1soul_eater_ep31_link/view?usp=drivesdk',
  32: 'https://drive.google.com/file/d/1soul_eater_ep32_link/view?usp=drivesdk',
  33: 'https://drive.google.com/file/d/1soul_eater_ep33_link/view?usp=drivesdk',
  34: 'https://drive.google.com/file/d/1soul_eater_ep34_link/view?usp=drivesdk',
  35: 'https://drive.google.com/file/d/1soul_eater_ep35_link/view?usp=drivesdk',
  36: 'https://drive.google.com/file/d/1soul_eater_ep36_link/view?usp=drivesdk',
  37: 'https://drive.google.com/file/d/1soul_eater_ep37_link/view?usp=drivesdk',
  38: 'https://drive.google.com/file/d/1soul_eater_ep38_link/view?usp=drivesdk',
  39: 'https://drive.google.com/file/d/1soul_eater_ep39_link/view?usp=drivesdk',
  40: 'https://drive.google.com/file/d/1soul_eater_ep40_link/view?usp=drivesdk',
  41: 'https://drive.google.com/file/d/1soul_eater_ep41_link/view?usp=drivesdk',
  42: 'https://drive.google.com/file/d/1soul_eater_ep42_link/view?usp=drivesdk',
  43: 'https://drive.google.com/file/d/1soul_eater_ep43_link/view?usp=drivesdk',
  44: 'https://drive.google.com/file/d/1soul_eater_ep44_link/view?usp=drivesdk',
  45: 'https://drive.google.com/file/d/1soul_eater_ep45_link/view?usp=drivesdk',
  46: 'https://drive.google.com/file/d/1soul_eater_ep46_link/view?usp=drivesdk',
  47: 'https://drive.google.com/file/d/1soul_eater_ep47_link/view?usp=drivesdk',
  48: 'https://drive.google.com/file/d/1soul_eater_ep48_link/view?usp=drivesdk',
  49: 'https://drive.google.com/file/d/1soul_eater_ep49_link/view?usp=drivesdk',
  50: 'https://drive.google.com/file/d/1soul_eater_ep50_link/view?usp=drivesdk',
  51: 'https://drive.google.com/file/d/1soul_eater_ep51_link/view?usp=drivesdk',
};

/**
 * 🔗 Тодорхой ангийн видео линкийг шинэчлэх / холбох код
 */
export function setSoulEaterEpisodeLink(episodeNumber: number, linkOrDriveId: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 51) {
    const formatted = formatSoulEaterDriveLink(linkOrDriveId);
    SOUL_EATER_EPISODE_LINKS[episodeNumber] = formatted;
    
    // Ангиудын массив дахь линкийг шинэчлэх
    const ep = SOUL_EATER_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      SOUL_EATER.videoUrl = formatted;
    }
  }
}

/**
 * 🔗 Олон ангийн линкийг нэг дор багцаар шинэчлэх (Batch update) функц
 */
export function batchSetSoulEaterEpisodeLinks(linksMap: Record<number, string>): void {
  Object.entries(linksMap).forEach(([numStr, url]) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      setSoulEaterEpisodeLink(num, url);
    }
  });
}

/**
 * 🌙 СОУЛ ИЙТЭР 1-51 АНГИЙН БҮРЭН ЖАГСААЛТ
 */
export const SOUL_EATER_EPISODES: Episode[] = [
  { episodeNumber: 1, title: '1-р анги - Сүнсний цуурай (Echo of the Soul)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[1] },
  { episodeNumber: 2, title: '2-р анги - Би бол од! (I Am the Star!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[2] },
  { episodeNumber: 3, title: '3-р анги - Төгс төгөлдөр эрхэм (The Perfect Boy: Death the Kid)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[3] },
  { episodeNumber: 4, title: '4-р анги - Сүнс ангууч идэвхжлээ (Engage the Witch Hunter!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[4] },
  { episodeNumber: 5, title: '5-р анги - Сүнсний хэлбэр (Shape of the Soul: Enter Meister Stein)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[5] },
  { episodeNumber: 6, title: '6-р анги - Домогт шинэ оюутан (The Rumored New Student)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[6] },
  { episodeNumber: 7, title: '7-р анги - Хар цусны айдас (Black Blood Terror)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[7] },
  { episodeNumber: 8, title: '8-р анги - Медуза шулмын хуйвалдаан (The Witch Medusa)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[8] },
  { episodeNumber: 9, title: '9-р анги - Домогт ариун сэлэм (Legend of the Holy Sword)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[9] },
  { episodeNumber: 10, title: '10-р анги - Ид шидийн сэлэм Масамунэ (The Enchanted Sword Masamune)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[10] },
  { episodeNumber: 11, title: '11-р анги - Камелиа цэцгийн өнгө (Camellia Blossom)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[11] },
  { episodeNumber: 12, title: '12-р анги - Айдас ба зориг (Courage That Surpasses Fear)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[12] },
  { episodeNumber: 13, title: '13-р анги - Шулмын нүд (The Man with the Magic Eye)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[13] },
  { episodeNumber: 14, title: '14-р анги - Хэт шалгалт (The Super Written Exam)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[14] },
  { episodeNumber: 15, title: '15-р анги - Сүнс залгигч хар луу (The Black Dragon)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[15] },
  { episodeNumber: 16, title: '16-р анги - Сүнст хөлөг онгоцны тулаан (Fierce Fight on the Ghost Ship)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[16] },
  { episodeNumber: 17, title: '17-р анги - Домогт ариун сэлэм II (Legend of the Holy Sword 2)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[17] },
  { episodeNumber: 18, title: '18-р анги - Сургуулийн баярын шөнө (The Eve of Destruction)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[18] },
  { episodeNumber: 19, title: '19-р анги - Газар доорх тулаан (Underground Battle Commences)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[19] },
  { episodeNumber: 20, title: '20-р анги - Хар цусны резонанс (The Black Blood Resonance Battle)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[20] },
  { episodeNumber: 21, title: '21-р анги - Макагийн шийдвэр (May My Soul Reach You)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[21] },
  { episodeNumber: 22, title: '22-р анги - Битүүмжлэлийн сүм (The Seal Sanctuary)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[22] },
  { episodeNumber: 23, title: '23-р анги - Кишиний сэргэлт (Dead or Alive: In the Rift)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[23] },
  { episodeNumber: 24, title: '24-р анги - Бурханы тулаан (Battle of the Gods)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[24] },
  { episodeNumber: 25, title: '25-р анги - Үхлийн зэвсгүүд цугларав (Death Scythes Convene!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[25] },
  { episodeNumber: 26, title: '26-р анги - Аймшигт эргэлзээ (The DWMA New Semester Starts)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[26] },
  { episodeNumber: 27, title: '27-р анги - 800 жилийн цуст өшөө (800 Years of Bloodshed: Arachne)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[27] },
  { episodeNumber: 28, title: '28-р анги - Илдний хаан гарч ирэв (The Sword God Arrives)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[28] },
  { episodeNumber: 29, title: '29-р анги - Медузагийн дахин сэргэлт (Medusa\'s Revival!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[29] },
  { episodeNumber: 30, title: '30-р анги - Галзуу галт тэрэг (The Blazing Runaway Express)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[30] },
  { episodeNumber: 31, title: '31-р анги - Сүнсний харанхуй (Drying Happiness: In the Moonlight)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[31] },
  { episodeNumber: 32, title: '32-р анги - Домогт ариун сэлэм III (Legend of the Holy Sword 3)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[32] },
  { episodeNumber: 33, title: '33-р анги - Багийн резонанс (Resonance Link: Soul Melody)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[33] },
  { episodeNumber: 34, title: '34-р анги - БРЮгийн төлөөх тулаан (The Battle for BREW!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[34] },
  { episodeNumber: 35, title: '35-р анги - Шумуул шулам ба Москито (Mosquito\'s Storm!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[35] },
  { episodeNumber: 36, title: '36-р анги - Багийн резонансын дээд цэг (Concert of Destruction)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[36] },
  { episodeNumber: 37, title: '37-р анги - Анхны мөрдөгч (The First Detective: Kid\'s Investigation)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[37] },
  { episodeNumber: 38, title: '38-р анги - Галзуурлын уруу таталт (Temptation to Carnage)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[38] },
  { episodeNumber: 39, title: '39-р анги - Кронагийн зугталт (Crona\'s Escape)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[39] },
  { episodeNumber: 40, title: '40-р анги - Медузагийн буулт (Medusa Surrenders to DWMA)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[40] },
  { episodeNumber: 41, title: '41-р анги - Эргэлдэх дугуй (The Doctor Dances to a New World)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[41] },
  { episodeNumber: 42, title: '42-р анги - Баба Яга цайз руу (Charge! Baba Yaga\'s Castle)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[42] },
  { episodeNumber: 43, title: '43-р анги - Сүүлчийн чөтгөрийн зэвсэг (The Last Demon Tool)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[43] },
  { episodeNumber: 44, title: '44-р анги - Кронагийн шийдвэр (Weakling Crona\'s Resolution)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[44] },
  { episodeNumber: 45, title: '45-р анги - Эсрэг чөтгөрийн долгион (Anti-Demon Wavelength)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[45] },
  { episodeNumber: 46, title: '46-р анги - Зориг уу, Галзуурал уу (Warrior or Lunatic?: Mifune vs Black Star)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[46] },
  { episodeNumber: 47, title: '47-р анги - Арахнегийн мөхөл (The Miraculous Coffee Table Flip!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[47] },
  { episodeNumber: 48, title: '48-р анги - Зэвсэгт Шинигами (Lord Death Wields a Death Scythe!)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[48] },
  { episodeNumber: 49, title: '49-р анги - Асура Кишиний сэрэлт (Asura Wakes! What Is the World\'s Destination?)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[49] },
  { episodeNumber: 50, title: '50-р анги - Нэгэн зорилго (Sink or Swim?! The Men Who Surpass the Gods)', duration: '24 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[50] },
  { episodeNumber: 51, title: '51-р анги - Зориг бол түлхүүр (The Secret Word Is Courage! - Төгсгөл)', duration: '25 мин', videoUrl: SOUL_EATER_EPISODE_LINKS[51] },
];

/**
 * 🌙 СОУЛ ИЙТЭР (SOUL EATER) АНИМЭ МЭДЭЭЛЭЛ
 */
export const SOUL_EATER: Movie = {
  id: 'm_soul_eater',
  title: 'Soul Eater',
  titleMongolian: 'Соул Ийтэр (Soul Eater)',
  type: 'anime',
  poster: 'https://www.bing.com/th/id/OIP.uL1-G4nS-Gk5666m_8zIdAHaF1?w=193&h=152&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=ImgAns&rm=2',
  backdrop: '/images/soul_eater_backdrop.jpg',
  year: 2024,
  duration: '51 анги (Бүрэн цуврал)',
  rating: 9.8,
  genres: ['Animation', 'Action', 'Dark Fantasy', 'Comedy', 'Supernatural', 'Shounen'],
  description: 'Үхлийн Бурхан Шинигами-самагаас байгуулсан Үхлийн Зэвсэг Баригчдын Академид (DWMA) дайчид болон амьд зэвсэг болон хувирах чадвартай оюутнууд бэлтгэгдэнэ. Гол баатар Мака Албарн өөрийн хадуур зэвсэг Соул Ийтэрийн хамт 99 муу ёрын сүнс болон 1 шулмын сүнсийг цуглуулан Соулыг Үхлийн Зэвсэг (Death Scythe) болгохын тулд Black☆Star, Death the Kid нарын нөхдийн хамт Кишин хэмээх галзуурлын чөтгөрийн эсрэг ертөнцийг аврахаар тулалдана. Монгол дуу оруулгатай бүрэн 51 анги.',
  director: 'Такуя Игараши (Takuya Igarashi - Studio Bones)',
  cast: [
    'Чиаки Омигава (Мака Албарн / Maka Albarn)',
    'Коки Үчияма (Соул Ийтэр / Soul Eater Evans)',
    'Юмико Кобаяши (Блэк Стар / Black☆Star)',
    'Каори Назүка (Цүбаки Накацүкаса / Tsubaki)',
    'Мамору Мияно (Үхлийн Хүү / Death the Kid)',
    'Акеми Канда (Лиз Томпсон / Liz Thompson)',
    'Наруми Такахира (Патти Томпсон / Patty Thompson)',
    'Рикия Кояма (Шинигами-сама / Lord Death)',
    'Кеничи Учияма (Доктор Франкен Штайн / Stein)'
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'БҮРЭН 51 АНГИ ОРЛОО',
  totalEpisodes: 51,
  views: 1120000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/g2J1r9944vA',
  videoUrl: SOUL_EATER_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: SOUL_EATER_EPISODES,
};

// Aliases
export const SOUL_EATER_SERIES = SOUL_EATER;
export const SOUL_EATER_ANIME = SOUL_EATER;

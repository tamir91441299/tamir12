import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 👽 ДАНДАДАН (DANDADAN) - 1-Р БҮЛЭГ (1-12 АНГИ) ХОЛБОХ КОД & ТУСЛАХ ФУНКЦҮҮД
 * 
 * 📌 Хэрэглэх заавар:
 * 1. Доорх `DANDADAN_EPISODE_LINKS` хүснэгтэд 1-12 дугаарын ард өөрийн Google Drive линк,
 *    YouTube, Filemoon, Ok.ru эсвэл шууд MP4 видеоны холбоосоо хуулж тавина.
 * 2. `setDandadanEpisodeLink(анги, линк)` функцээр шууд код дотроос холбох боломжтой.
 * 3. Олон ангийг багцаар нь нэг дор шинэчлэхийн тулд `batchSetDandadanEpisodeLinks({...})` дуудна.
 */

// Google Drive эсвэл шууд линкийг тоглуулагчийн форматад хөрвүүлэх туслах функц
export function formatDandadanDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 👽 ДАНДАДАН 1-Р БҮЛЭГ: 1-12 АНГИЙН ВИДЕО ХОЛБООС ТОХИРУУЛАХ ХҮСНЭГТ
 */
export const DANDADAN_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk',
  2: 'https://drive.google.com/file/d/1dandadan_ep02_link/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1dandadan_ep03_link/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1dandadan_ep04_link/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1dandadan_ep05_link/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1dandadan_ep06_link/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1dandadan_ep07_link/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1dandadan_ep08_link/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1dandadan_ep09_link/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1dandadan_ep10_link/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1dandadan_ep11_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1dandadan_ep12_link/view?usp=drivesdk',
};

/**
 * 🔗 Тодорхой ангийн видео линкийг шинэчлэх / холбох код
 */
export function setDandadanEpisodeLink(episodeNumber: number, linkOrDriveId: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 12) {
    const formatted = formatDandadanDriveLink(linkOrDriveId);
    DANDADAN_EPISODE_LINKS[episodeNumber] = formatted;
    
    // Ангиудын массив дахь линкийг шинэчлэх
    const ep = DANDADAN_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      DANDADAN.videoUrl = formatted;
    }
  }
}

/**
 * 🔗 Олон ангийн линкийг нэг дор багцаар шинэчлэх (Batch update) функц
 */
export function batchSetDandadanEpisodeLinks(linksMap: Record<number, string>): void {
  Object.entries(linksMap).forEach(([numStr, url]) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      setDandadanEpisodeLink(num, url);
    }
  });
}

/**
 * 👽 ДАНДАДАН 1-12 АНГИЙН БҮРЭН ЖАГСААЛТ
 */
export const DANDADAN_EPISODES: Episode[] = [
  { episodeNumber: 1, title: '1-р анги - Энэ бол хайрын эхлэл үү? (That\'s How Love Starts, Ya Know!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[1], isNew: true },
  { episodeNumber: 2, title: '2-р анги - Энэ бол сансрын харь гарагийнхан биш гэж үү? (That\'s a Space Alien, Ain\'t It?!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[2], isNew: true },
  { episodeNumber: 3, title: '3-р анги - Эмээгийн сөргөлдөөн (Clash! Granny vs. Granny!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[3] },
  { episodeNumber: 4, title: '4-р анги - Турбо эмгэнийг дарах нь (Let\'s Kick Turbo Granny\'s Butt!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[4] },
  { episodeNumber: 5, title: '5-р анги - Алдагдсан алтан бөмбөлөг хаана байна? (Where Are the Kintama?!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[5] },
  { episodeNumber: 6, title: '6-р анги - Аюултай охин ирлээ (A Dangerous Woman Arrives!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[6] },
  { episodeNumber: 7, title: '7-р анги - Сайхан сэтгэлт ертөнц рүү (To a Kinder World)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[7] },
  { episodeNumber: 8, title: '8-р анги - Сэтгэл тавгүй өдрүүд (Somehow, I Feel Gloomy)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[8] },
  { episodeNumber: 9, title: '9-р анги - Нэгдсэн тулаан (Merge! Turbo Granny and Aira!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[9] },
  { episodeNumber: 10, title: '10-р анги - Аварга амьтны сэрэлт (Danger! The Giant Crabby Alien!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[10] },
  { episodeNumber: 11, title: '11-р анги - Анхны хайр Жижи эргэн ирсэн нь (First Love, Jiji Returns!)', duration: '24 мин', videoUrl: DANDADAN_EPISODE_LINKS[11] },
  { episodeNumber: 12, title: '12-р анги - Хараалт байшин (Let\'s Go to the Cursed House! - 1-р бүлгийн төгсгөл)', duration: '25 мин', videoUrl: DANDADAN_EPISODE_LINKS[12] },
];

/**
 * 👽 ДАНДАДАН (DANDADAN) АНИМЭ МЭДЭЭЛЭЛ
 */
export const DANDADAN: Movie = {
  id: 'm_dandadan',
  title: 'Dandadan',
  titleMongolian: 'Дандадан (Dandadan)',
  type: 'anime',
  poster: 'https://animotaku.fr/wp-content/uploads/2024/03/anime-dandadan-visuel-2.jpg',
  backdrop: '/images/dandadan_backdrop.jpg',
  year: 2024,
  duration: '12 анги (Бүлэг 1)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Comedy', 'Sci-Fi', 'Supernatural', 'Shounen'],
  description: 'Сүнс хий үзэгдэлд итгэдэг Момо Аясэ болон сансрын харь гаригийнхан, нисдэг тавагт итгэдэг Окарун (Кэн Такакура) хоёр хэн нь зөв болохыг нотлохоор мөрийцөнө. Момо харь гаригийнхны буусан газар луу, харин Окарун хараалт хонгил руу очсоноор Момо телекинез чадвараа нээн илрүүлж, Окарун Турбо Эмгэний хүчирхэг хараалд автан өөрсдийн бие махбод, сүнсийг хамгаалах галзуу, хурдтай тулаанд нэгдэнэ. Science SARU студийн өнгөлөг анимацитай хит цуврал.',
  director: 'Фүга Ямаширо (Fuga Yamashiro - Science SARU)',
  cast: [
    'Шион Вакаяма (Момо Аясэ / Momo Ayase)',
    'Нацүки Ханаэ (Кэн Такакура - Окарун / Okarun)',
    'Нана Мизүки (Сэйко Аясэ - Эмээ / Seiko Ayase)',
    'Маюми Танака (Турбо Эмгэн / Turbo Granny)',
    'Аянэ Сакүра (Айра Ширатори / Aira Shiratori)',
    'Каито Ишикава (Жин Энджожи - Жижи / Jiji)',
    'Казүя Накаи (Серпо харийнхан / Serpoian)'
  ],
  country: 'Япон',
  price: 4500,
  isNewEpisode: true,
  newEpisodeLabel: '1-Р БҮЛЭГ БҮРЭН ОРЛОО',
  totalEpisodes: 12,
  views: 1350000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/5aLhA_6x_34',
  videoUrl: DANDADAN_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: DANDADAN_EPISODES,
};

// Aliases
export const DANDADAN_SERIES = DANDADAN;
export const DANDADAN_ANIME = DANDADAN;

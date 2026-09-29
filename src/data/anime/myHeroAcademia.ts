import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatMyHeroAcademiaDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🦸‍♂️ МИНИЙ БААТРЫН АКАДЕМИ (MY HERO ACADEMIA) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 */
export const MY_HERO_ACADEMIA_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZaMHA01JzNq7T0w1xK9mP8q1Xmha',
  2: 'https://u.pcloud.link/publink/show?code=XZbMHA02JzNq8T0w2xK0mP8q2Ymha',
  3: 'https://u.pcloud.link/publink/show?code=XZcMHA03JzNq9T0w3xK1mP8q3Zmha',
  4: 'https://u.pcloud.link/publink/show?code=XZdMHA04JzNq0T0w4xK2mP8q4Amha',
  5: 'https://u.pcloud.link/publink/show?code=XZeMHA05JzNq1T0w5xK3mP8q5Bmha',
  6: 'https://u.pcloud.link/publink/show?code=XZfMHA06JzNq2T0w6xK4mP8q6Cmha',
  7: 'https://u.pcloud.link/publink/show?code=XZgMHA07JzNq3T0w7xK5mP8q7Dmha',
  8: 'https://u.pcloud.link/publink/show?code=XZhMHA08JzNq4T0w8xK6mP8q8Emha',
  9: 'https://u.pcloud.link/publink/show?code=XZiMHA09JzNq5T0w9xK7mP8q9Fmha',
  10: 'https://u.pcloud.link/publink/show?code=XZjMHA10JzNq6T0w0xK8mP8q0Gmha',
  11: 'https://u.pcloud.link/publink/show?code=XZkMHA11JzNq7T0w1xK9mP8q1Hmha',
  12: 'https://u.pcloud.link/publink/show?code=XZlMHA12JzNq8T0w2xK0mP8q2Imha',
  13: 'https://u.pcloud.link/publink/show?code=XZmMHA13JzNq9T0w3xK1mP8q3Jmha',
};

export const MY_HERO_ACADEMIA_EPISODES: Episode[] = [
  { episodeNumber: 1, title: '1-р анги - Мидория Изүкү: Гарал үүсэл (Izuku Midoriya: Origin)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[1] },
  { episodeNumber: 2, title: '2-р анги - Баатар болохын тулд (What It Takes to Be a Hero)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[2] },
  { episodeNumber: 3, title: '3-р анги - Архирах булчингууд (Roaring Muscles)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[3] },
  { episodeNumber: 4, title: '4-р анги - Гарааны шугам (Start Line)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[4] },
  { episodeNumber: 5, title: '5-р анги - Миний одоо хийж чадах зүйл (What I Can Do For Now)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[5] },
  { episodeNumber: 6, title: '6-р анги - Уур хилэн, муу хог (Rage, You Damn Nerd)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[6] },
  { episodeNumber: 7, title: '7-р анги - Дэкү ба Каччан (Deku vs. Kacchan)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[7] },
  { episodeNumber: 8, title: '8-р анги - Бакугогийн гарааны шугам (Bakugo\'s Start Line)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[8] },
  { episodeNumber: 9, title: '9-р анги - Хичээгээрэй Ийда! (Yeah, Just Do Your Best, Iida!)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[9] },
  { episodeNumber: 10, title: '10-р анги - Үл мэдэгдэх дайсантай тулгарсан нь (Encounter with the Unknown)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[10] },
  { episodeNumber: 11, title: '11-р анги - Тоглоом дууслаа (Game Over)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[11] },
  { episodeNumber: 12, title: '12-р анги - Бүхний Дээд All Might (All Might)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[12] },
  { episodeNumber: 13, title: '13-р анги - Зүрх бүхэнд орших баатар (In Each of Our Hearts - Төгсгөл)', duration: '24 мин', videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[13] },
];

export function setMyHeroAcademiaEpisodeLink(episodeNumber: number, link: string) {
  if (MY_HERO_ACADEMIA_EPISODE_LINKS[episodeNumber] !== undefined || episodeNumber >= 1) {
    const formatted = formatMyHeroAcademiaDriveLink(link) || link;
    MY_HERO_ACADEMIA_EPISODE_LINKS[episodeNumber] = formatted;
    const ep = MY_HERO_ACADEMIA_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      MY_HERO_ACADEMIA_S1.videoUrl = formatted;
    }
  }
}

export function batchSetMyHeroAcademiaEpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setMyHeroAcademiaEpisodeLink(Number(epNum), link);
  });
}

/**
 * 🦸‍♂️ МИНИЙ БААТРЫН АКАДЕМИ (MY HERO ACADEMIA) - Бүлэг 1 (Бүрэн 13 анги)
 */
export const MY_HERO_ACADEMIA_S1: Movie = {
  id: 'm_my_hero_academia',
  title: 'My Hero Academia (Season 1)',
  titleMongolian: 'Миний Баатрын Академи (1-р бүлэг)',
  type: 'anime',
  poster: '/images/mha_poster.jpg',
  backdrop: '/images/mha_backdrop.jpg',
  year: 2016,
  duration: '13 анги',
  rating: 9.8,
  genres: ['Animation', 'Action', 'Adventure', 'Superpower', 'Shounen', 'School'],
  description: 'Дэлхийн хүн амын 80 хувь нь ер бусын супер чадвар (Quirk)-тай болсон цаг үед ямар ч хүчгүй жирийн нэгэн болж төрсөн Мидория Изүкү хүү бүхнээс илүү агуу баатар болохыг мөрөөддөг. Түүний тууштай сэтгэл зүрхийг үнэлсэн дэлхийн №1 домогт баатар All Might өөрийн залгамжлагчаараа Изүкүг сонгож, хүчээ шилжүүлнэ. Изүкү шилдэг баатруудыг бэлтгэдэг алдарт U.A. Ахлах сургуульд элсэн орж суралцана. Монгол дуу оруулгатай бүрэн 13 анги.',
  director: 'Кэнжи Нагасаки (Kenji Nagasaki - Studio Bones)',
  cast: [
    'Дайки Ямашита (Мидория Изүкү / Дэкү)',
    'Кэнта Миякэ (Олл Майт / All Might)',
    'Нобухико Окамото (Бакуго Кацүки)',
    'Аянэ Сакура (Урарака Очако)',
    'Юүки Кажи (Тодороки Шото)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'Бүрэн 13 анги',
  totalEpisodes: 13,
  views: 890000,
  featured: true,
  featuredRank: 3,
  trailerUrl: 'https://www.youtube.com/embed/EPZe3_m5-7k',
  videoUrl: MY_HERO_ACADEMIA_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: MY_HERO_ACADEMIA_EPISODES,
};

export const MY_HERO_ACADEMIA = MY_HERO_ACADEMIA_S1;

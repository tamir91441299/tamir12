import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц
 */
export function formatHaikyuDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏐 ХАЙКЬЮ!! (HAIKYU!! / HAIKYUU!! SEASON 1) - 1-ЭЭС 25 ХҮРТЭЛХ БҮХ АНГИЙН ЛИНКҮҮД
 * 
 * Та өөрийн Google Drive линк, pCloud, YouTube эсвэл шууд MP4 видеоны холбоосоо
 * доорх объектод хуулж тавихад тоглуулагч шууд тухайн ангийг холбон тоглуулах болно.
 */
export const HAIKYU_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZTCr4JZ8pjjM0kAsubwYlknbhM01m3ISjsX',
  2: 'https://drive.google.com/file/d/1haikyu_s1_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1haikyu_s1_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1haikyu_s1_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1haikyu_s1_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1haikyu_s1_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1haikyu_s1_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1haikyu_s1_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1haikyu_s1_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1haikyu_s1_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1haikyu_s1_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1haikyu_s1_ep12/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1haikyu_s1_ep13/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1haikyu_s1_ep14/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1haikyu_s1_ep15/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1haikyu_s1_ep16/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1haikyu_s1_ep17/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1haikyu_s1_ep18/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1haikyu_s1_ep19/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1haikyu_s1_ep20/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1haikyu_s1_ep21/view?usp=drivesdk',
  22: 'https://drive.google.com/file/d/1haikyu_s1_ep22/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1haikyu_s1_ep23/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1haikyu_s1_ep24/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1haikyu_s1_ep25/view?usp=drivesdk',
};

export const HAIKYU_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Төгсгөл ба Эхлэл (The End and The Beginning)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Карасуно ахлах сургуулийн волейболын клуб (Karasuno High School Volleyball Club)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Хамгийн аюултай холбоотон (The Formidable Ally)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Хамгаалалтын хана (The View from the Top)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Түгшүүрт өрсөлдөгч (A Coward\'s Anxiety)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Сонирхолтой баг (An Interesting Team)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Аугаа Их Хаан (Versus the Great King)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Багийн Ас (He Who is Called "Ace")',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Ас руу дамжуулах бөмбөг (A Toss to the Ace)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Бахдал ба хүсэл (Yearning)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Шийдвэр (Decision)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Муур ба Хэрээний уулзалт (The Neko-Karasu Reunion)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Өрсөлдөгч (Rival)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Хүчирхэг дайснууд (Formidable Opponents)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Сэргэн мандалт (Revival)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Ялагчид ба Ялагдагчид (Winners and Losers)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[16],
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Төмөр Хана (The Iron Wall)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[17],
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Ханыг нэвтлэх нь (Guarding Your Back)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[18],
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Удирдагч (Conductors)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[19],
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Ойкава Тооругийн сүр жавхлан (Oikawa Tooru is Not a Genius)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[20],
  },
  {
    episodeNumber: 21,
    title: '21-р анги - Ахмад хүний чадвар (Senpai\'s True Abilities)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[21],
  },
  {
    episodeNumber: 22,
    title: '22-р анги - Хувьсал (Evolution)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[22],
  },
  {
    episodeNumber: 23,
    title: '23-р анги - Хөдөлгөгч хүч (The Point That Decides the Point)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[23],
  },
  {
    episodeNumber: 24,
    title: '24-р анги - Ганцаардсан хааны төгсгөл (Removing the "Lonely King")',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[24],
  },
  {
    episodeNumber: 25,
    title: '25-р анги - Гурав дахь өдөр (The Third Day - Төгсгөл)',
    duration: '24 мин',
    videoUrl: HAIKYU_EPISODE_LINKS[25],
  },
];

export const HAIKYU: Movie = {
  id: 'm_haikyu',
  title: 'Haikyu!!',
  titleMongolian: 'Хайкью!!: Волейболын Оргил (Haikyuu!!)',
  type: 'anime',
  poster: 'https://wallpapersok.com/images/thumbnail/haikyuu-team-karasuno-volleyball-players-8ix45j4iv3nji2sl.jpg',
  backdrop: 'https://wallpapercave.com/wp/wp2422870.jpg',
  year: 2020,
  duration: '25 анги (1-р бүлэг)',
  rating: 9.9,
  genres: ['Спорт', 'Волейбол', 'Shounen', 'Sports', 'Drama', 'School', 'Comedy'],
  description: 'Жижигхэн биетэй ч агаарт шувуу шиг дүүлэн нисэх ер бусын харайлтын чадвартай Шоё Хината "Бяцхан Аварга"-ыг шүтэж волейболын спортоор хичээллэнэ. Ахлах сургуульд ороод тэрээр өөрийн заналт өрсөлдөгч, гоц авьяаст давуулагч Тобио Кагеяматай Карасуно сургуулийн багт нэгдэж, "Хаягдсан хэрээнүүд" хэмээн дуудагддаг багийнхаа нэр төрийг сэргээн Бүх Японы аварга болохоор тулалдана! Монгол дуу оруулга болон хадмалтай.',
  director: 'Сүсүму Мицүнака (Susumu Mitsunaka)',
  cast: ['Аюму Мурасэ (Хината)', 'Кайто Ишикава (Кагеяма)', 'Сатоши Хино (Дайчи)', 'Юү Хаяши (Танака)'],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ АНИМЭ (25 анги)',
  totalEpisodes: 25,
  views: 1200000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/JOGp2c7-cKc',
  videoUrl: HAIKYU_EPISODES[0].videoUrl,
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: HAIKYU_EPISODES,
};

export function setHaikyuEpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatHaikyuDriveLink(link) || link;
  HAIKYU_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = HAIKYU_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    HAIKYU.videoUrl = formatted;
  }
}

export function batchSetHaikyuEpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setHaikyuEpisodeLink(Number(epNum), link);
  });
}

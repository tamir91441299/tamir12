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
  1: 'https://u.pcloud.link/publink/show?code=XZN0vYJZg6UjyW9AR8VeEvcvLierrjonN7Cy',
  2: 'https://u.pcloud.link/publink/show?code=XZa0vYJZudKTbCbYXbV5wKmxtduVzzj7vV0y',
  3: 'https://u.pcloud.link/publink/show?code=XZG0vYJZvifp9utHdIfhnvbLtwstyVCevSyV',
  4: 'https://u.pcloud.link/publink/show?code=XZr0vYJZg8NwLEloRXpnDyuTlUrOl76fbVxk',
  5: 'https://u.pcloud.link/publink/show?code=XZy5vYJZqCWvxinuoVBohuBndX6zsmE5NPD7',
  6: 'https://u.pcloud.link/publink/show?code=XZ75vYJZaNbjUjEGfgHBdLAyPvIWsmWlVSG7',
  7: 'https://u.pcloud.link/publink/show?code=XZM5vYJZ3CA5Yzt7p9h8glwezdks7BjFhHR7',
  8: 'https://u.pcloud.link/publink/show?code=XZP5vYJZ4VVfTkcB3ChM5bVh51cBgV5DqC2V',
  9: 'https://u.pcloud.link/publink/show?code=XZC5vYJZteK8VLvpE6S2xR4q2zvw2kASJHKk',
  10: 'https://u.pcloud.link/publink/show?code=XZx5vYJZudGAF37rCYy96TjlIYWNVFkUnRK7',
  11: 'https://u.pcloud.link/publink/show?code=XZE5vYJZHgQPd3OykKh1LHN5bg8WQJ7i5kb7',
  12: 'https://u.pcloud.link/publink/show?code=XZU5vYJZyqHyIakVGCJxlEIlgzNSHQgJQdV7',
  13: 'https://u.pcloud.link/publink/show?code=XZI5vYJZWf2XpA1XtPuq8DjpMoE39yzUvEOk',
  14: 'https://u.pcloud.link/publink/show?code=XZA5vYJZExR0sAScfdXltPzkUl7TYm7jMr0k',
  15: 'https://u.pcloud.link/publink/show?code=XZa5vYJZnEYJzi1b34jbWBf9DF1QjbUDU3ky',
  16: 'https://u.pcloud.link/publink/show?code=XZG5vYJZmYfGUtXoCXX6OLbplkwpXVh3nTVy',
  17: 'https://u.pcloud.link/publink/show?code=XZHJvYJZkxRtRPM1ruQwOokbhQ6MWbebMxo7',
  18: 'https://u.pcloud.link/publink/show?code=XZzJvYJZK2mKvBkkrtXu7R8iNhlJs5TBQqVX',
  19: 'https://u.pcloud.link/publink/show?code=XZLJvYJZrdhlBWSk6MjuKmmPGoO9ducaO8uV',
  20: 'https://u.pcloud.link/publink/show?code=XZ4JvYJZ4UBwHu6pPKQNWfO86Ub2KV9vLjLV',
  21: 'https://u.pcloud.link/publink/show?code=XZYJvYJZ1LavEYoRcHzCwsWxoCPhHuddAMOk',
  22: 'https://u.pcloud.link/publink/show?code=XZBJvYJZXkfeAk09Cu5VBloFntgy4VUYkIp7',
  23: 'https://u.pcloud.link/publink/show?code=XZWJvYJZP1wDdd6k1NS5c5avtSzG27eEBozX',
  24: 'https://u.pcloud.link/publink/show?code=XZDJvYJZARnKNAO9N7YorYWkDeOSoFVjGx0y',
  25: 'https://u.pcloud.link/publink/show?code=XZ1JvYJZXvG9xTpfgEJljEMH5IomqkeIQIfk',
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

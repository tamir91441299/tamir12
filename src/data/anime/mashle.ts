import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц
 */
export function formatMashleDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🏋️‍♂️ МАШЛ: ШИД БА БУЛЧИН (MASHLE: MAGIC AND MUSCLES) - 1-ЭЭС 12 ХҮРТЭЛХ БҮХ АНГИЙН ЛИНКҮҮД
 * 
 * Та өөрийн Google Drive линк, pCloud, YouTube эсвэл шууд MP4 видеоны холбоосоо
 * доорх объектод хуулж тавихад тоглуулагч шууд тухайн ангийг холбон тоглуулах болно.
 */
export const MASHLE_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZYxr4JZ1Y6CjTSits509s6iSi2AR89QXaWk',
  2: 'https://drive.google.com/file/d/1mashle_magic_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1mashle_magic_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1mashle_magic_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1mashle_magic_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1mashle_magic_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1mashle_magic_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1mashle_magic_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1mashle_magic_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1mashle_magic_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1mashle_magic_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1mashle_magic_ep12/view?usp=drivesdk',
};

export const MASHLE_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Маш Вандед ба Бурханлаг булчингийн хүч (Mash Burnedead and the Body of the Gods)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Маш Вандед ба Ээдрээтэй лабиринт (Mash Burnedead and the Mysterious Maze)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Маш Вандед ба Уур хүрсэн дээрэлхэгч (Mash Burnedead and the Baleful Bully)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Маш Вандед ба Хүчирхэг шидтэн (Mash Burnedead and the Challenging Magic User)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Маш Вандед ба Хүсээгүй ангийн анд (Mash Burnedead and the Unpopular Classmate)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Маш Вандед ба Төмрийн шид (Mash Burnedead and the Magic of Iron)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Маш Вандед ба Хүүхэлдэйн шидтэн (Mash Burnedead and the Puppet Master)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Маш Вандед ба Чононуудын тулаан (Mash Burnedead and the Wolves of Magic)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Маш Вандед ба Хурдны тулаан (Mash Burnedead and the Accelerated Battle)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Маш Вандед ба Бурханлаг хараатан (Mash Burnedead and the Divine Visionary)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Маш Вандед ба Амьд үлдэх дүрэм (Mash Burnedead and the Survival of the Fittest)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Маш Вандед ба Шидэт толь (Mash Burnedead and the Magic Mirror)',
    duration: '24 мин',
    videoUrl: MASHLE_EPISODE_LINKS[12],
  },
];

export const MASHLE: Movie = {
  id: 'm_mashle',
  title: 'Mashle: Magic and Muscles',
  titleMongolian: 'Машл: Шид ба Булчин (Mashle)',
  type: 'anime',
  poster: 'https://4kwallpapers.com/images/walls/thumbs_2t/16339.jpg',
  backdrop: 'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/12/mashle.jpg',
  year: 2023,
  duration: '12 анги (Бүрэн)',
  rating: 9.7,
  genres: ['Action', 'Comedy', 'Fantasy', 'Magic', 'Shounen', 'School'],
  description: 'Шидтэнгүүдийн ертөнцөд шидгүй төрсөн хүн шийтгэгдэн амь насаа алддаг харгис хуультай. Гэвч ойн гүнд нуугдан зөвхөн хүндийн өргөлт, фитнессээр хичээллэж биеэ төмөр мэт хатуужуулсан Маш Вандед хэмээх хүү өөрийгөө болон өвөөгөө хамгаалахын тулд дэлхийн хамгийн нэр хүндтэй Истоны шидийн академид элсэж, бүх хүчирхэг шидтэнгүүдийг цэвэр булчингийн бяраараа бут ниргэж эхэлнэ! Монгол дуу оруулга болон хадмалтай.',
  director: 'Томоя Танака (Tomoya Tanaka)',
  cast: ['Чиаки Кобаяши (Маш)', 'Рэйдзи Кавашима (Финн)', 'Кайто Ишикава (Ланс)', 'Такуя Эгучи (Дот)'],
  country: 'Япон',
  price: 3500,
  isNewEpisode: true,
  newEpisodeLabel: 'ШИНЭ АНИМЭ (12 анги)',
  totalEpisodes: 12,
  views: 950000,
  featured: true,
  featuredRank: 3,
  trailerUrl: 'https://www.youtube.com/embed/U3l1y8h7k78',
  videoUrl: MASHLE_EPISODES[0].videoUrl,
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: MASHLE_EPISODES,
};

export function setMashleEpisodeLink(episodeNumber: number, link: string): void {
  const formatted = formatMashleDriveLink(link) || link;
  MASHLE_EPISODE_LINKS[episodeNumber] = formatted;
  const ep = MASHLE_EPISODES.find((e) => e.episodeNumber === episodeNumber);
  if (ep) {
    ep.videoUrl = formatted;
  }
  if (episodeNumber === 1) {
    MASHLE.videoUrl = formatted;
  }
}

export function batchSetMashleEpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setMashleEpisodeLink(Number(epNum), link);
  });
}

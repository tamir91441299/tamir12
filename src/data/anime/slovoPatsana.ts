import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 */
export function formatSlovoPatsanaDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🩸 СЛОВО ПАЦАНА: КРОВЬ НА АСФАЛЬТЕ (БҮРЭН 8 АНГИ) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Админ эсвэл хэрэглэгч өөрийн Google Drive, YouTube, pCloud эсвэл MP4 шууд линкийг энд оруулж шинэчлэх боломжтой.
 */
export const SLOVO_PATSANA_EPISODE_LINKS: Record<number, string> = {
  1: 'https://u.pcloud.link/publink/show?code=XZM7kRJZIjivk9nogvpNHQythHtmwVJoj2jX',
  2: 'https://u.pcloud.link/publink/show?code=XZi7kRJZxdYqzRRNmLkiYSY6UR8cuyWmrzEV',
  3: 'https://u.pcloud.link/publink/show?code=XZ0VkRJZI85lDhM215yCC6UwpDFj1F5UKNVX',
  4: 'https://u.pcloud.link/publink/show?code=XZla7LJZsJsk4fuqbRpRujhHkDHyOb7MIiAy',
  5: 'https://u.pcloud.link/publink/show?code=XZCQU4JZHL4NEa7v8OmIlHDBeMTHFQHE5NVX',
  6: 'https://u.pcloud.link/publink/show?code=XZ6a7LJZVAfp7IhHJ9fHWm0W9GunfmNfQWUk',
  7: 'https://u.pcloud.link/publink/show?code=XZImU4JZiLAlDSNx0AfQOeTGwgjKJVMHOu6V',
  8: 'https://u.pcloud.link/publink/show?code=XZamU4JZFDTBhGv6OzbjGCSXxVllI4aWb75k',
};

export function setSlovoPatsanaEpisodeLink(episodeNumber: number, link: string) {
  if (SLOVO_PATSANA_EPISODE_LINKS[episodeNumber] !== undefined) {
    const formatted = formatSlovoPatsanaDriveLink(link) || link;
    SLOVO_PATSANA_EPISODE_LINKS[episodeNumber] = formatted;
    const ep = SLOVO_PATSANA_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      SLOVO_PATSANA.videoUrl = formatted;
    }
  }
}

export function batchSetSlovoPatsanaEpisodeLinks(links: Record<number, string>) {
  Object.entries(links).forEach(([epNum, link]) => {
    setSlovoPatsanaEpisodeLink(Number(epNum), link);
  });
}

export const SLOVO_PATSANA_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Чушпан ба Пацан (Гудамжинд орсон нь)',
    duration: '52 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[1],
    releaseDate: '2023-11-09',
    isNew: false,
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Асфальт дээрх тулаан (Хатуу шийтгэл)',
    duration: '50 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[2],
    releaseDate: '2023-11-09',
    isNew: false,
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Вова Адидасын эргэн ирэлт (Шинэ дүрэм)',
    duration: '52 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[3],
    releaseDate: '2023-11-16',
    isNew: false,
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Гудамжны дайн (Өшөө авалт ба хилэн)',
    duration: '49 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[4],
    releaseDate: '2023-11-23',
    isNew: false,
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Айгулийн эмгэнэл (Урвалт ба цөхрөл)',
    duration: '51 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[5],
    releaseDate: '2023-11-30',
    isNew: false,
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Пацаны үг (Хүнд сонголт ба хуваагдал)',
    duration: '53 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[6],
    releaseDate: '2023-12-07',
    isNew: false,
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Салаа зам (Хуулийн өмнө ба зугталт)',
    duration: '50 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[7],
    releaseDate: '2023-12-14',
    isNew: false,
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Төгсгөл: Цусан дээрх төлөөс (Финал)',
    duration: '55 мин',
    videoUrl: SLOVO_PATSANA_EPISODE_LINKS[8],
    releaseDate: '2023-12-21',
    isNew: true,
  },
];

/**
 * 🩸 СЛОВО ПАЦАНА: КРОВЬ НА АСФАЛЬТЕ (THE BOY'S WORD: BLOOD ON THE ASPHALT) - Бүрэн 8 анги
 */
export const SLOVO_PATSANA: Movie = {
  id: 'm_slovo_patsana',
  title: "The Boy's Word: Blood on the Asphalt",
  titleMongolian: 'Слово пацана: Кровь на асфальте',
  type: 'series',
  poster: '/https://tse3.mm.bing.net/th/id/OIP.i9gvw35vL7WQJD-gXPbhJgHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  backdrop: 'https://tse3.mm.bing.net/th/id/OIP.i9gvw35vL7WQJD-gXPbhJgHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  year: 2023,
  duration: '8 анги (Бүрэн)',
  rating: 9.8,
  genres: ['Гэмт хэрэг', 'Драма', 'Тулаант', 'Crime', 'Drama', 'Action'],
  description: '1980-аад оны сүүл үеийн ЗХУ-ын Казань хот. Гудамжны гэмт бүлэглэлүүд газар нутгаа булаалдан хувааж, "пацан"-уудын харгис дүрэм ноёлсон эрин үе. Хөгжмийн сургуулийн төгөлдөр хуурч, хичээнгүй 14 настай сурагч Андрей (Пальто) өөрийгөө хамгаалахын тулд гудамжны бүлэглэлийн гишүүн Мараттай нөхөрлөж, "чушпан"-аас жинхэнэ "пацан" болох шийдвэр гаргана. Афганистаны дайнаас буцаж ирсэн ах Вова Адидас гудамжны хуучин дэг журмыг өөрчлөхөөр тэмцэх боловч цус, өшөө авалт, урвалтын харгис эргүүлэг тэдний амьдралыг бүхэлд нь сүйрүүлнэ. Монгол хадмал болон дуу оруулгатай бүрэн 8 анги.',
  director: 'Жора Крыжовников (Zhora Kryzhovnikov)',
  cast: [
    'Иван Янковский (Вова Адидас)',
    'Рузиль Минекаев (Марат)',
    'Леон Кемстач (Андрей Пальто)',
    'Анна Пересильд (Айгуль)',
    'Лев Зулькарнаев (Зима)',
    'Никита Кологривый (Кощей)',
    'Сергей Бурунов (Кирилл - аав)',
    'Слава Копейкин (Турбо)',
    'Елизавета Базыкина (Наташа)',
  ],
  country: 'ОХУ',
  price: 3000,
  isNewEpisode: true,
  newEpisodeLabel: 'Бүрэн 8 анги орлоо',
  totalEpisodes: 8,
  views: 1250000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/Z0H_8X3hW7k',
  videoUrl: SLOVO_PATSANA_EPISODE_LINKS[1],
  ageRating: '+18',
  audioTracks: ['Монгол дуу оруулга', 'Орос эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Орос хадмал'],
  episodes: SLOVO_PATSANA_EPISODES,
};

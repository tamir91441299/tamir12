import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 * Та Google Drive-ын Share хийсэн линк эсвэл зөвхөн File ID (жишээ: 1a2b3c4d...)-г
 * доорх SPY_X_FAMILY_EPISODE_LINKS объектод оруулж холбоно.
 */
export function formatSpyXFamilyDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🕵️‍♂️ ТАГНУУЛЧ Х ГЭР БҮЛ (SPY X FAMILY) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Хэрэв та өөрийн Google Drive линкүүдээ шууд нэг дор оруулахыг хүсвэл
 * доорх 1-25 дугаарын ард Drive линк эсвэл ID-гаа хуулж тавина уу:
 */
export const SPY_X_FAMILY_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1OnGBSiqEY7V-OgzLXYhhdBYNy9xlTXfz/view?usp=drivesdk&usp=embed_facebook',
  2: 'https://u.pcloud.link/publink/show?code=XZcJkRJZcgBcJLEWXcQmKmsavqwdWzuSQg4X',
  3: 'https://u.pcloud.link/publink/show?code=XZzFkRJZfyMcM6od88Sov84BHxHmDSyURaTy',
  4: 'https://u.pcloud.link/publink/show?code=XZzFkRJZfyMcM6od88Sov84BHxHmDSyURaTy',
  5: 'https://u.pcloud.link/publink/show?code=XZYFkRJZXoAaJO64an0Na7na1se4cp0tXHW7',
  6: 'https://u.pcloud.link/publink/show?code=XZuFkRJZL5cjLEbKX4BYQCzOf378BS503Yi7',
  7: 'https://u.pcloud.link/publink/show?code=XZipkRJZpAoY6rpxCuuilQQS0bEukQcoIq3y',
  8: 'https://u.pcloud.link/publink/show?code=XZRHkRJZVATw3PYySLQmWfBbbkh3lfQBHhXk',
  9: 'https://u.pcloud.link/publink/show?code=XZYHkRJZjLw7avBhrnVOh7D2D7RKzQsBUyuy',
  10: 'https://u.pcloud.link/publink/show?code=XZuHkRJZntCjlYf1kr5V9CFjKGBf4p4cOPny',
  11: 'https://drive.google.com/file/d/1spy_family_ep11_drive_link/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1spy_family_ep12_drive_link/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1spy_family_ep13_drive_link/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1spy_family_ep14_drive_link/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1spy_family_ep15_drive_link/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1spy_family_ep16_drive_link/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1spy_family_ep17_drive_link/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1spy_family_ep18_drive_link/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1spy_family_ep19_drive_link/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1spy_family_ep20_drive_link/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1spy_family_ep21_drive_link/view?usp=drivesdk',
  22: 'https://drive.google.com/file/d/1spy_family_ep22_drive_link/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1spy_family_ep23_drive_link/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1spy_family_ep24_drive_link/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1spy_family_ep25_drive_link/view?usp=drivesdk',
};

export function setSpyXFamilyEpisodeLink(episodeNumber: number, link: string): void {
  if (SPY_X_FAMILY_EPISODE_LINKS[episodeNumber] !== undefined || episodeNumber >= 1) {
    const formatted = formatSpyXFamilyDriveLink(link) || link;
    SPY_X_FAMILY_EPISODE_LINKS[episodeNumber] = formatted;
    const ep = SPY_X_FAMILY_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      SPY_X_FAMILY.videoUrl = formatted;
    }
  }
}

export function batchSetSpyXFamilyEpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setSpyXFamilyEpisodeLink(Number(epNum), link);
  });
}

export const SPY_X_FAMILY_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Стрикс ажиллагаа (Operation Strix)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Эхнэр сонгох даалгавар (Secure a Wife)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Сургуулийн ярилцлагад бэлтгэсэн нь (Prepare for the Interview)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Нэр хүндтэй Эден академийн шалгалт (The Prestigious School\'s Interview)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Тэнцэх үү, эсвэл унах уу? (Will They Pass or Fail)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Нөхөрлөлийн төлөвлөгөө (The Friendship Scheme)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Зорилтот этгээдийн хоёр дахь хүү (The Target\'s Second Son)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Нууц цагдаагийн сөрөг ажиллагаа (The Counter-Secret Police Cover Operation)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Жинхэнэ хосууд гэдгээ харуул (Show Off How in Love You Are)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Доджболлын агуу стратеги (The Great Dodgeball Plan)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[10],
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Стелла од хүртсэн нь (Stella)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[11],
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Оцон шувууны хүрээлэнгийн нууц (Penguin Park)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[12],
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Алим төсөл (Project Apple)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[13],
  },
  {
    episodeNumber: 14,
    title: '14-р анги - Цаг хугацаат бөмбөгийг аюулгүй болго (Disarm the Time Bomb)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[14],
  },
  {
    episodeNumber: 15,
    title: '15-р анги - Гэр бүлийн шинэ гишүүн: Бонд (A New Family Member)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[15],
  },
  {
    episodeNumber: 16,
    title: '16-р анги - Йорын гал тогоо / Мэдээлэгчийн дурлал (Yor\'s Kitchen / The Informant\'s Great Romance Plan)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[16],
  },
  {
    episodeNumber: 17,
    title: '17-р анги - Гриффин ажиллагаа / Ган хатагтай / Омлет (Carry Out the Griffin Plan / Fullmetal Lady / Omelet Rice)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[17],
  },
  {
    episodeNumber: 18,
    title: '18-р анги - Хувийн багш авга ах Юри / Дэйбрейк тагнуулч (Uncle the Private Tutor / Daybreak)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[18],
  },
  {
    episodeNumber: 19,
    title: '19-р анги - Десмондын өшөө авалт / Салхи мэт ээж (A Revenge Plot Against Desmond / Mama Becomes the Wind)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[19],
  },
  {
    episodeNumber: 20,
    title: '20-р анги - Нэгдсэн эмнэлгийн мөрдлөг / Нууц кодын учир (Investigate the General Hospital / Decipher the Perplexing Code)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[20],
  },
  {
    episodeNumber: 21,
    title: '21-р анги - Найтфол тагнуулч / Анхны атаархал (Nightfall / First Fit of Jealousy)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[21],
  },
  {
    episodeNumber: 22,
    title: '22-р анги - Газар доорх теннисний тэмцээн (The Underground Tennis Tournament: Campbelldon)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[22],
  },
  {
    episodeNumber: 23,
    title: '23-р анги - Гуйвшгүй шийдвэр (The Unwavering Path)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[23],
  },
  {
    episodeNumber: 24,
    title: '24-р анги - Эхнэр ба эхийн үүрэг / Найзуудтайгаа дэлгүүр хэссэн нь (The Role of a Mother and Wife / Shopping with Friends)',
    duration: '24 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[24],
  },
  {
    episodeNumber: 25,
    title: '25-р анги - Анхны холбоо тогтоолт (First Contact - 1-р бүлгийн төгсгөл)',
    duration: '25 мин',
    videoUrl: SPY_X_FAMILY_EPISODE_LINKS[25],
  },
];

/**
 * 🕵️‍♂️ ТАГНУУЛЧ Х ГЭР БҮЛ (SPY X FAMILY) - Бүрэн 25 анги
 */
export const SPY_X_FAMILY: Movie = {
  id: 'm_spy_x_family',
  title: 'Spy x Family',
  titleMongolian: 'Тагнуулч х Гэр бүл (Spy x Family)',
  type: 'anime',
  poster: 'https://i.pinimg.com/736x/37/b7/db/37b7dbaa0f00af4b3888d9782615ee9c.jpg',
  backdrop: 'https://images3.alphacoders.com/123/1230103.jpg',
  year: 2022,
  duration: '25 анги',
  rating: 9.8,
  genres: ['Animation', 'Comedy', 'Action', 'Shounen', 'Mystery'],
  description: 'Дэлхийн энх тайвныг сахин хамгаалахын тулд Весталисын шилдэг тагнуулч "Твайлайт" (Twilight) дайсны улс төрчид ойртох "Стрикс ажиллагаа"-г эхлүүлнэ. Тэрээр Лойд Форжер нэртэй сэтгэцийн эмчийн дүрд орж, телепат чадвартай өнчин охин Аняг үрчилж, төрийн албан хаагч нэрээр далд алуурчин хийдэг Йор Брайарыг эхнэрээ болгоно. Гэр бүлийн гишүүд бие биенийхээ жинхэнэ нууцыг мэддэггүй (зөвхөн бүх бодлыг уншдаг бяцхан Анягаас бусад нь). Хөгжилтэй, сэтгэл дулаацуулам, адал явдал дүүрэн хуурамч гэр бүлийн нууц даалгавар эхэлнэ! Монгол дуу оруулгатай.',
  director: 'Казүхиро Фүрүхаши (Kazuhiro Furuhashi - Wit Studio & CloverWorks)',
  cast: [
    'Такуя Эгүчи (Лойд Форжер / Твайлайт)',
    'Ацүми Танэзаки (Аня Форжер)',
    'Саори Хаями (Йор Форжер / Өргөст гүнж)',
    'Кэнширо Мацүда (Бонд Форжер)',
    'Нацүми Фүживара (Дамиан Десмонд)',
    'Хироюки Ёшино (Фрэнки Франклин)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'БҮРЭН 25 АНГИ ОРЛОО',
  totalEpisodes: 25,
  views: 1650000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/ofXigq9aIpo',
  videoUrl: SPY_X_FAMILY_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр', 'Англи дуу оруулга'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: SPY_X_FAMILY_EPISODES,
};

// Aliases for convenient importing
export const SPY_X_FAMILY_SERIES = SPY_X_FAMILY;
export const SPY_X_FAMILY_S1 = SPY_X_FAMILY;
export const SPY_X_FAMILY_ANIME = SPY_X_FAMILY;

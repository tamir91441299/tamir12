import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл шууд линк холбох туслах функц:
 * Та Google Drive-ын Share хийсэн линк эсвэл зөвхөн File ID-г
 * доорх KAMI_KUZU_IDOL_EPISODE_LINKS объектод оруулж холбоно.
 */
export function formatKamiKuzuDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

/**
 * 🎤 КАМИ КҮЗҮ АЙДОЛ (KAMI KUZU IDOL / PHANTOM OF THE IDOL) АНГИ БҮРИЙН ЛИНК ТОХИРУУЛАХ ХЭСЭГ
 * Хэрэв та өөрийн Google Drive линкүүдээ шууд нэг дор оруулахыг хүсвэл
 * доорх 1-10 дугаарын ард Drive линк эсвэл ID-гаа хуулж тавина уу:
 */
export const KAMI_KUZU_IDOL_EPISODE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/file/d/1EmjiJeQYSsZoZueJhVldZ8zGjlBsYmY-/view?usp=drivesdk&usp=embed_facebook',
  2: 'https://drive.google.com/file/d/1Y0sSVUMsjrPlqMrdOAUA6GnQryH8aUlq/view?usp=drivesdk&usp=embed_facebook',
  3: 'https://drive.google.com/file/d/12xSLydSnAImoLj-Peafl7TmBcbEy42DS/view?usp=drivesdk&usp=embed_facebook',
  4: 'https://drive.google.com/file/d/1e4_aYTTlCdMPQh-UFYKZbrwr0cUQrh71/view?usp=drivesdk&usp=embed_facebook',
  5: 'https://drive.google.com/file/d/1Cij53-qS6PKECQ_r-bimg3V3HXeHwR81/view?usp=drivesdk&usp=embed_facebook',
  6: 'https://drive.google.com/file/d/1AzXXH7pvxTMDNeC69KZXQ9-0dVNv5HnM/view?usp=drivesdk&usp=embed_facebook',
  7: 'https://drive.google.com/file/d/1axi1oVcIfGYZdVuqAUzJ1yL_FmgLBMi8/view?usp=drivesdk&usp=embed_facebook',
  8: 'https://drive.google.com/file/d/1a_bxUnt3uj98LUaM5UMT6AzvZqQoIfy4/view?usp=drivesdk&usp=embed_facebook',
  9: 'https://drive.google.com/file/d/1wjhlMnxf67V8lqAkYMNqElAHxG8TbXc6/view?usp=drivesdk&usp=embed_facebook',
  10: 'https://drive.google.com/file/d/1eFszO2SF_9M6sx1thTZMrpd7O_4PwC6N/view?usp=drivesdk',
};

export const KAMI_KUZU_IDOL_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Ниёдо, сүнсэнд эзэмдүүлсэн нь (Niyodo, Get Possessing!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[1],
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Ниёдо, тулаанд орсон нь (Niyodo, Join the Battle!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[2],
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Ниёдо, жинхэнэ чадвараа харуулсан нь (Niyodo, Show Your Mettle!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[3],
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Ниёдо, шинэ хамтрагчтай болсон нь (Niyodo, Get Connected!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[4],
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Ниёдо, зуны бэлтгэлд явсан нь (Niyodo, Go to Summer Camp!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[5],
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Ниёдо, тайзан дээр гялалзав (Niyodo, Stand on Stage!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[6],
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Ниёдо, болзоонд гарсан нь (Niyodo, Go on a Date!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[7],
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Ниёдо, айдолын замналаа сонгов (Niyodo, Be an Idol!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[8],
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Ниёдо, өнгөрсөнтэй нүүр тулав (Niyodo, Face the Past!)',
    duration: '24 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[9],
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Ниёдо ба Асахи (Niyodo and Asahi - Төгсгөл)',
    duration: '25 мин',
    videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[10],
  },
];

/**
 * 🎤 КАМИ КҮЗҮ АЙДОЛ (KAMI KUZU IDOL / PHANTOM OF THE IDOL) - Бүлэг 1 (Бүрэн 10 анги)
 */
export const KAMI_KUZU_IDOL: Movie = {
  id: 'm_kami_kuzu_idol',
  title: 'Kami Kuzu Idol (Phantom of the Idol)',
  titleMongolian: 'Ками Күзү Айдол (Phantom of the Idol)',
  type: 'anime',
  poster: 'https://ramenparados.com/wp-content/uploads/2021/11/Kami-Kuzu-Idol-1-destacado.jpg',
  backdrop: 'https://ramenparados.com/wp-content/uploads/2021/11/Kami-Kuzu-Idol-1-destacado.jpg',
  year: 2024,
  duration: '10 анги',
  rating: 9.7,
  genres: ['Animation', 'Comedy', 'Music', 'Supernatural', 'Idol', 'Shounen'],
  description: 'ZINGS хөвгүүдийн айдол хамтлагийн гишүүн Юүя Ниёдо бол тайзан дээр дуулж бүжиглэх дургүй, фэнүүдээ үл тоомсорлодог, зөвхөн хялбар мөнгө олох гэж салбарт орсон залхуу "хог" айдол. Гэтэл нэг өдөр тайзан дээр гарах туйлын хүсэлтэй байсан домогт талийгаач айдол охин Асахи Могамигийн сүнстэй таарна. Асахи Юүягийн биед шилжин орж гайхамшигтай тоглолт үзүүлж эхэлснээр хөгжилтэй, сонирхолтой адал явдал өрнөнө. Монгол дуу оруулгатай бүрэн 10 анги.',
  director: 'Дайсүкэ Чиба (Daisuke Chiba - Studio Gokumi)',
  cast: [
    'Фүмия Имай (Юүя Ниёдо)',
    'Нао Тояма (Асахи Могами)',
    'Шүн Хориэ (Казүки Ёшино)',
    'Эри Китамура (Хитоми Шинано)',
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'Шинэ анимэ • 10 анги',
  totalEpisodes: 10,
  views: 640000,
  featured: true,
  featuredRank: 4,
  trailerUrl: 'https://www.youtube.com/embed/Z7dE6_pXQYg',
  videoUrl: KAMI_KUZU_IDOL_EPISODE_LINKS[1],
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: KAMI_KUZU_IDOL_EPISODES,
};

// Aliases
export const KAMI_KUZU_IDOL_S1 = KAMI_KUZU_IDOL;
export const PHANTOM_OF_THE_IDOL = KAMI_KUZU_IDOL;

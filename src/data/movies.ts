import { Movie, Comment, Episode } from '../types';
import { MY_HERO_ACADEMIA_S1 } from './anime/myHeroAcademia';
import { MY_HERO_ACADEMIA_S2 } from './anime/myHeroAcademiaS2';
import { MEGALO_BOX_S1 } from './anime/megaloBox';
import { JUJUTSU_KAISEN_S1 } from './anime/jujutsuKaisen';
import { extractGoogleDriveId, extractYouTubeId } from '../lib/videoUtils';

/**
 * 🎬 ВИДЕО ХОЛБООС ХОЛБОХ ТУСЛАХ ФУНКЦҮҮД (Video Link Helpers)
 * Та өөрийн Google Drive, YouTube эсвэл MP4 шууд линкийг энд ашиглаж хялбар холбож болно.
 */

// Google Drive линк эсвэл ID-г шууд холбоход зориулсан функц
export function getDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl.trim();
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
}

// YouTube трейлер / видео линк холбох функц
export function getYouTubeLink(ytUrlOrId: string): string {
  if (!ytUrlOrId) return '';
  const id = extractYouTubeId(ytUrlOrId) || ytUrlOrId.trim();
  return `https://www.youtube.com/embed/${id}`;
}

// Анги үүсгэх туслах функц (Episode generator)
export function createEpisode(
  episodeNumber: number,
  title: string,
  videoUrl: string,
  duration: string = '24 мин'
): Episode {
  return {
    episodeNumber,
    title,
    duration,
    videoUrl: videoUrl.includes('drive.google.com') || extractGoogleDriveId(videoUrl)
      ? getDriveLink(videoUrl)
      : videoUrl
  };
}

/**
 * 🤖 ДЭЛХИЙН СҮЙРЭЛ (1 ангитай AI Кино)
 * Доорх `videoUrl` болон `episodes[0].videoUrl` хэсэгт өөрийн Google Drive эсвэл шууд видеоны холбоосоо тавина.
 */
export const DELHIIN_SUIREL_MOVIE: Movie = {
  id: 'm_delhiin_suirel',
  title: 'World Collapse: Zombie Apocalypse',
  titleMongolian: 'Дэлхийн Сүйрэл: Зомби Апокалипсис',
  type: 'movie',
  poster: 'https://gridinsoft.com/blogs/wp-content/uploads/2023/04/ChaosGPT-was-asked-to-destroy-humanity.jpg',
  backdrop: '/images/zombie_backdrop_1787565630511.jpg',
  year: 2025,
  duration: '1 анги (118 мин)',
  rating: 9.9,
  genres: ['Зомби', 'Дэлхийн сүйрэл', 'Horror', 'Action', 'Sci-Fi'],
  description: 'Дэлхий даяар тархсан нууцлаг мутант вирус хүн төрөлхтнийг зомби болгон хувиргаж, хотууд нуран сүйрэх үед амьд үлдсэн цөөн хэдэн дайчид дэлхийн сүүлчийн аюулгүй бүс рүү хүрэхийн тулд зомбийн сүрэгтэй үхэл сэхлийн шийдвэрлэх тулаанд орно. Монгол дуу оруулгатай шинэ бүрэн хэмжээний блокбастер кино.',
  director: 'Алекс Гарланд (Alex Garland)',
  cast: ['Кристиан Бэйл', 'Эмили Блант', 'Оскар Айзек', 'Киллиан Мөрфи'],
  country: 'АНУ',
  price: 3000,
  isNewEpisode: true,
  newEpisodeLabel: 'ЗОМБИ ШИНЭ КИНО',
  totalEpisodes: 1,
  views: 980000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  videoUrl: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk',
  ageRating: '+18',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх хэлээр'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: [
    {
      episodeNumber: 1,
      title: '1-р анги - Дэлхийн Сүйрэл: Зомби Апокалипсис (Бүрэн кино)',
      duration: '118 мин',
      videoUrl: 'https://drive.google.com/file/d/1g3iWpH9hG7cp4JrCBem3-rhqZBtVCOOE/view?usp=drivesdk'
    }
  ]
};

export const SAMPLE_MOVIES: Movie[] = [
  {
    id: 'm_91_days',
    title: '91 Days',
    titleMongolian: '91 Өдөр',
    type: 'anime',
    poster: 'https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/10/91-days-anime-cover-art.jpg',
    backdrop: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/99b0b4b2-1ec2-42db-8d72-689653733407/dagx653-ad709f69-bf46-4136-b075-6ae9c48a78e6.png/v1/fill/w_512,h_512,q_80,strp/91_days_folder_icon_by_holiekay_dagx653-fullview.jpg',
    year: 2024,
    duration: '13 анги',
    rating: 9.7,
    genres: ['Animation', 'Action', 'Crime', 'Drama', 'Thriller'],
    description: 'Хориглолтын үеийн Америк (Lawless хот) дахь мафийн гэр бүлийн цуст аллагын гэрч болж, гэр бүлээ алдсан Анджело Лагуза (Авилио Бруно) нэрт нууцлаг захидал хүлээн авснаар 7 жилийн дараа эргэн ирж, Ванетти мафийн бүлэглэлийн эсрэг 91 хоногийн өшөө авалтын нарийн төлөвлөгөөг эхлүүлнэ. Монгол дуу оруулгатай.',
    director: 'Хиро Кабураги (Hiro Kaburagi)',
    cast: ['Такаши Кондо', 'Такуя Эгучи', 'Дайсүкэ Оно', 'Сома Сайто'],
    country: 'Япон',
    price: 4000,
    isNewEpisode: true,
    newEpisodeLabel: 'Бүрэн 13 анги орлоо',
    totalEpisodes: 13,
    views: 790000,
    featured: true,
    featuredRank: 1,
    trailerUrl: 'https://www.youtube.com/embed/a9rZ24kXvEE',
    videoUrl: 'https://drive.google.com/file/d/1Q6W8jgTtnYJo7E_LQNOJkCUiAtI39Nku/view?usp=drivesdk',
    ageRating: '+16',
    audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
    subtitles: ['Монгол хадмал'],
    episodes: [
      {
        episodeNumber: 1,
        title: '1-р анги - Үдэшлэгийн шөнө (Night of the Murder)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1vJn-t0_68Z0PVFz2IaQeOV0ZmOpnxuhA/view?usp=drivesdk'
      },
      {
        episodeNumber: 2,
        title: '2-р анги - Хуурмаг дүр төрх (Phantom of Falsehood)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1QP1BAEg_qgmrjAMHvdzN9e5ABf_lN-3R/view?usp=drivesdk'
      },
      {
        episodeNumber: 3,
        title: '3-р анги - Хаашаа чиглэсэн буун дуу (Where the Footsteps Lead)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1GLa61eek5jmVQ_nviEvXifCebAp4C7TN/view?usp=drivesdk'
      },
      {
        episodeNumber: 4,
        title: '4-р анги - Ялагдал ба Холбоотон (Lose to Win, and What Comes After)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1RA6tP9YeYblF95MsGdQFPuCssQM5OonL/view?usp=drivesdk'
      },
      {
        episodeNumber: 5,
        title: '5-р анги - Цусны үнэр (Blood Will Have Blood)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1W5KZGKjEqfSanWmui3o6tS19RguKYhHS/view?usp=drivesdk'
      },
      {
        episodeNumber: 6,
        title: '6-р анги - Хүн алахын тулд (To Slaughter a Pig)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1bAqg-QojH9BUMTcG2qpegKq9_WzT_cvQ/view?usp=drivesdk'
      },
      {
        episodeNumber: 7,
        title: '7-р анги - Муу ёрын өдөр (A Poor Player)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1548zu4SvzlkgtrRKq_RvLvB9lkA5pt_3/view?usp=drivesdk'
      },
      {
        episodeNumber: 8,
        title: '8-р анги - Далд хөшиг (Behind the Curtain)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1dT89Xw6u3RWna9YEXUVPH-MeD8YyZabY/view?usp=drivesdk'
      },
      {
        episodeNumber: 9,
        title: '9-р анги - Хар харгис сэтгэл (Black and Deep Desires)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1Ur_Gaa-9vKV2lrDevEo_PHuEspfyDgNI/view?usp=drivesdk'
      },
      {
        episodeNumber: 10,
        title: '10-р анги - Баталгаагүй замнал (Proof of Good Faith)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1WqjqzlDH-lcQJ0r69UZrSiIHGFV2nDVz/view?usp=drivesdk'
      },
      {
        episodeNumber: 11,
        title: '11-р анги - Бүх зүйл хоосон (All for Nothing)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1k8alH27GDARVtAZ6ggbyKZWnWK0TK3um/view?usp=drivesdk'
      },
      {
        episodeNumber: 12,
        title: '12-р анги - Салхи өнгөрөх мөч (Treading on Dirty Ground - Төгсгөл)',
        duration: '24 мин',
        videoUrl: 'https://drive.google.com/file/d/1ZC6mn86ZQo4C9Vr7MJTDCII8JobUAuJa/view?usp=drivesdk'
      },
      {
        episodeNumber: 13,
        title: '13-р анги - Гунигт бөгөөд богинохон (Shoe Sole Bottle - OVA)',
        duration: '25 мин',
        videoUrl: 'https://drive.google.com/file/d/1ZuvAt1eMParGnQTD_WivW7D9C1ukNYmE/view?usp=drivesdk'
      }
    ]
  },
  MY_HERO_ACADEMIA_S1,
  MY_HERO_ACADEMIA_S2,
  MEGALO_BOX_S1,
  JUJUTSU_KAISEN_S1
];

export { JUJUTSU_KAISEN_S1 };

export const GENRE_COUNTS: { name: string; count: number }[] = [
  { name: 'Animation', count: 51 },
  { name: 'Shounen', count: 38 },
  { name: 'Action', count: 51 },
  { name: 'Superpower', count: 38 },
  { name: 'Drama', count: 26 },
  { name: 'Crime', count: 13 },
  { name: 'Thriller', count: 13 },
  { name: 'Sports', count: 13 },
  { name: 'Adventure', count: 38 },
  { name: 'Sci-Fi', count: 13 },
  { name: 'Fantasy', count: 38 },
  { name: 'Comedy', count: 25 }
];

export const RELEASE_YEARS = [
  2026, 2025, 2024,
  2023, 2022, 2021,
  2020, 2019, 2018
];

export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'c1',
    movieId: 'm_91_days',
    userName: 'Батболд',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    text: '91 Days анимэ үнэхээр өшөө авалтын сонгодог бүтээл болсон байна. Монгол дуу оруулга нь маш өндөр түвшинд хийгджээ!',
    rating: 10,
    date: 'Өнөөдөр 18:30',
    likes: 24
  },
  {
    id: 'c2',
    movieId: 'm_91_days',
    userName: 'Анужин',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    text: 'Авилио Бруногийн зохион байгуулалт, өрнөл нь сэтгэл түгшээм гайхалтай байлаа. Бүх ангийг нь нэг дор үзлээ.',
    rating: 10,
    date: 'Өчигдөр 21:15',
    likes: 18
  },
  {
    id: 'c3',
    movieId: 'm_mha_s1',
    userName: 'Тэмүүжин',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    text: 'Миний Баатрын Академи 1-р бүлэг бүрэн 13 ангиараа орсонд баярлалаа! Дэкү All Might-тай уулздаг хэсэг үргэлж сэтгэл хөдөлгөдөг.',
    rating: 10,
    date: '3 хоногийн өмнө',
    likes: 35
  },
  {
    id: 'c4',
    movieId: 'm_mha_s2',
    userName: 'Энхжин',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    text: '2-р бүлгийн Спортын наадам ба Тодорокигийн тулаан галзуу болсон. Дуу оруулга нь супер!',
    rating: 10,
    date: 'Өнөөдөр 14:10',
    likes: 42
  },
  {
    id: 'c5',
    movieId: 'm_megalo_box_s1',
    userName: 'Билгүүн',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
    text: 'Мегало Бокс анимэ бол жинхэнэ эр зориг, хөлс хүч, боксын гал цогтой бүтээл! 13 анги бүгд дуу оруулгатай орсонд баярлалаа.',
    rating: 10,
    date: 'Өнөөдөр 19:20',
    likes: 31
  }
];

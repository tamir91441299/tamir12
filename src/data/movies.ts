import { Movie, Comment } from '../types';
import { MY_HERO_ACADEMIA_S1 } from './anime/myHeroAcademia';

export const SAMPLE_MOVIES: Movie[] = [
  {
    id: 'm_91_days',
    title: '91 Days',
    titleMongolian: '91 Өдөр (91 Days)',
    type: 'anime',
    poster: 'https://m.media-amazon.com/images/M/MV5BMGU5MTQwM2UtYTgzYS00ODhkLWE3ZDItZmZjNTlmOTYyNzU0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    backdrop: 'https://static1.cbrimages.com/wordpress/wp-content/uploads/sharedimages/2024/04/91-days.jpg',
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
  MY_HERO_ACADEMIA_S1
];

export const GENRE_COUNTS: { name: string; count: number }[] = [
  { name: 'Animation', count: 26 },
  { name: 'Action', count: 26 },
  { name: 'Crime', count: 13 },
  { name: 'Drama', count: 13 },
  { name: 'Thriller', count: 13 },
  { name: 'Adventure', count: 13 },
  { name: 'Fantasy', count: 13 },
  { name: 'Shounen', count: 13 }
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
    text: '91 Days аниме үнэхээр өшөө авалтын сонгодог бүтээл болсон байна. Монгол дуу оруулга нь маш өндөр түвшинд хийгджээ!',
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
    movieId: 'm_91_days',
    userName: 'Тэмүүжин',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    text: 'Хөгжим, уур амьсгал, 1920-иод оны хориглолтын үеийн дүрслэл нь яг л кино шиг сайн болсон.',
    rating: 10,
    date: '3 хоногийн өмнө',
    likes: 35
  },
  {
    id: 'c4',
    movieId: 'm_mha_s1',
    userName: 'Энхжин',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    text: 'Миний Баатрын Академи 1-р бүлэг бүрэн 13 ангиараа орсонд баярлалаа! Дэкү All Might-тай уулздаг хэсэг үргэлж сэтгэл хөдөлгөдөг.',
    rating: 10,
    date: 'Өнөөдөр 14:10',
    likes: 42
  }
];

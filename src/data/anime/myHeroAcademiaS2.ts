import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🎬 MY HERO ACADEMIA SEASON 2 (Миний Баатрын Академи Бүлэг 2)
 * 
 * 📌 Видео холбоос (Google Drive / Direct MP4) холбох заавар:
 * Доорх `videoUrl` эсвэл `episodes` жагсаалт дахь ангиудын `videoUrl` хэсэгт 
 * өөрийн Google Drive холбоос эсвэл File ID-г хуулж тавина.
 * 
 * Жишээ:
 * videoUrl: 'https://drive.google.com/file/d/1iYlA5sjPde_efhLsAMOYee9P97RgsjPB/view?usp=drivesdk'
 * эсвэл зүгээр File ID:
 * videoUrl: '1iYlA5sjPde_efhLsAMOYee9P97RgsjPB'
 */

// Анги үүсгэх туслах функц
function createMhaEpisode(
  episodeNumber: number,
  title: string,
  driveIdOrUrl: string = '',
  duration: string = '24 мин'
): Episode {
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean) || clean;
  const finalUrl = id
    ? (id.startsWith('http') ? id : `https://drive.google.com/file/d/${id}/view?usp=drivesdk`)
    : `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

  return {
    episodeNumber,
    title,
    duration,
    videoUrl: finalUrl
  };
}

export const MY_HERO_ACADEMIA_S2: Movie = {
  id: 'm_mha_s2',
  title: 'My Hero Academia Season 2',
  titleMongolian: 'Миний Баатрын Сургууль Бүлэг 2',
  type: 'anime',
  poster: 'https://i.pinimg.com/originals/f7/97/f5/f797f539cc6fc62d0b13ccf678d12ab2.png',
  backdrop: 'https://images.alphacoders.com/814/814674.jpg',
  year: 2024,
  duration: '25 анги',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Shounen', 'Super Power'],
  description: 'Юүэй Академийн сурагчдын хамгийн том өрсөлдөөн болох Спортын Их Наадам (UA Sports Festival) эхэлнэ! Дэкү, Тодороки Шото, Бакуго нарын хоорондын ширүүн өрсөлдөөн болон хотын харанхуй гудамжинд заналхийлэх Баатрын Алуурчин Стэйн (Hero Killer Stain)-тэй хийх амь өрссөн тулаан өрнөнө. Монгол дуу оруулгатай бүрэн 25 анги.',
  director: 'Кэнжи Нагасаки (Kenji Nagasaki)',
  cast: [
    'Дайки Ямашита (Изуку Мидория / Дэкү)',
    'Юүки Кажи (Тодороки Шото)',
    'Нобухико Окамото (Бакуго Кацүки)',
    'Кэнта Миякэ (All Might)',
    'Го Иноүэ (Баатрын Алуурчин Стэйн)',
    'Аянэ Сакура (Очако Урарака)'
  ],
  country: 'Япон',
  price: 4000,
  isNewEpisode: true,
  newEpisodeLabel: 'Бүрэн 25 анги',
  totalEpisodes: 25,
  views: 940000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/oDXZ8uX51eY',
  videoUrl: 'https://drive.google.com/file/d/1iYlA5sjPde_efhLsAMOYee9P97RgsjPB/view?usp=drivesdk',
  ageRating: '+13',
  audioTracks: ['Монгол дуу оруулга', 'Япон эх хэлээр'],
  subtitles: ['Монгол хадмал'],
  episodes: [
    createMhaEpisode(1, '1-р анги (14) - Тэр бол Миний Түүх (That\'s the Idea, Ochaco)', 'https://drive.google.com/file/d/1VV4WuQNWYEtNJ2K13v9AKna6t1yD7y8d/view?usp=drivesdk'),
    createMhaEpisode(2, '2-р анги (15) - Тамирчдын Их Наадам (Roaring Sports Festival)', 'https://drive.google.com/file/d/165fq1HUV4v13QW-flsBMgg_axyHRVa3_/view?usp=drivesdk'),
    createMhaEpisode(3, '3-р анги (16) - Тулааны гараа (In Their Own Quirky Ways)', 'https://drive.google.com/file/d/1HyRcIrtQAxnznKIQutT0BIA88SB7XyUe/view?usp=drivesdk'),
    createMhaEpisode(4, '4-р анги (17) - Стратеги, Төлөвлөгөө (Strategy, Strategy, Strategy)', '/'),
    createMhaEpisode(5, '5-р анги (18) - Морьтны тулааны төгсгөл (Cavalry Battle Finale)', '1lkye7Ooy6qjPuGfDRA_ugsJtr7ijIkh3'),
    createMhaEpisode(6, '6-р анги (19) - Бүхнийг хүртсэн хүү (The Boy Born with Everything)', '1Yiw53fhOze1axyJbXBFUP0eVi8xiKjqV'),
    createMhaEpisode(7, '7-р анги (20) - Ялалт ба Ялагдал (Victory or Defeat)', '1qBtj7rlUSg8pI1rL6Fe64l1rU6JfvrYy'),
    createMhaEpisode(8, '8-р анги (21) - Бүсгүйчүүдийн тулаан (Battle on, Challengers!)', '1EcjzJh_Y-p7FfxD5R4RsAA4iUbFasw43'),
    createMhaEpisode(9, '9-р анги (22) - Бакуго vs Урарака (Bakugo vs. Uraraka)', '10gRVvR_dVZ_seD4spInvdmFsAo2OA8Tp'),
    createMhaEpisode(10, '10-р анги (23) - Шото Тодороки: Эхлэл (Shoto Todoroki: Origin)', '1UBVIA2klzF1l6DMkpseGEZtxggkpHZRP'),
    createMhaEpisode(11, '11-р анги (24) - Ийдагийн тэмцэл (Fight on, Iida)', '1v7P8zTyUDa_gybVpmzEfmQn-rl3uC9D5'),
    createMhaEpisode(12, '12-р анги (25) - Тодороки vs Бакуго (Todoroki vs. Bakugo)', '1s9nrCSBZ9RyzpXXOWV7-UL1qcf5sgJ9_'),
    createMhaEpisode(13, '13-р анги (26) - Нэр сонгох өдөр (Time to Pick Some Names)', '132zF0IW3NCRCyi_JM36IRamRrAbVT4r0'),
    createMhaEpisode(14, '14-р анги (27) - Хачин жигтэй Гран Торино (Bizarre! Gran Torino Appears)', ''),
    createMhaEpisode(15, '15-р анги (28) - Дэкү ба Баатрын Алуурчин Стэйн (Midoriya and Shigaraki)', ''),
    createMhaEpisode(16, '16-р анги (29) - Баатрын Алуурчин Стэйн vs Юүэй (Hero Killer: Stain vs U.A. Students)', ''),
    createMhaEpisode(17, '17-р анги (30) - Шийдвэрлэх тулаан (Climax)', ''),
    createMhaEpisode(18, '18-р анги (31) - Стэйн Баатрын Алуурчны үр дагавар (The Aftermath of Hero Killer: Stain)', ''),
    createMhaEpisode(19, '19-р анги (32) - Дадлага бүрийн сургамж (Everyone\'s Internships)', ''),
    createMhaEpisode(20, '20-р анги (33) - Сонс! Өнгөрсөн үеийн нууц (Listen Up!! A Tale from the Past)', ''),
    createMhaEpisode(21, '21-р анги (34) - Шалгалтын бэлтгэл (Gear up for Final Exams)', ''),
    createMhaEpisode(22, '22-р анги (35) - Яаоёорозугийн сэргэлт (Yaoyorozu: Rising)', ''),
    createMhaEpisode(23, '23-р анги (36) - Хана хэрэм нурах үед (Stripping the Varnish)', ''),
    createMhaEpisode(24, '24-р анги (37) - Кацуки Бакуго: Эхлэл (Katsuki Bakugo: Origin)', ''),
    createMhaEpisode(25, '25-р анги (38) - Уулзалт (Encounter - Төгсгөл)', '')
  ]
};

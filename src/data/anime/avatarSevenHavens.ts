import { Movie, Episode } from '../../types';

/**
 * 🌊 АВАТАР: ДОЛООН ОРОМЖ (AVATAR: SEVEN HAVENS - BOOK 1: SURVIVAL)
 * 2026 оны албан ёсны цоо шинэ Аватарын цуврал.
 * Коррагаас хойш 225 жилийн дараа шинээр мэндэлсэн шороон махбодот Аватар Пави ба түүний ихэр Ниша нарын адал явдал.
 */

export const AVATAR_SEVEN_HAVENS_EPISODES: Episode[] = [
  {
    episodeNumber: 1,
    title: '1-р анги - Шинэ Эрин (A New Era: Survival)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 2,
    title: '2-р анги - Сүйрлийн Мөрөөр (Ruins of the Past)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 3,
    title: '3-р анги - Шороон Махбод (Earthbending Awakens)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 4,
    title: '4-р анги - Хоёр Аватар (The Twin Avatars)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 5,
    title: '5-р анги - Долоон Оромжийн Нууц (Secret of the Seven Havens)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 6,
    title: '6-р анги - Сүнсний Шуурга (The Spirit Tempest)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 7,
    title: '7-р анги - Төмөр ба Гал (Steel and Fire)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 8,
    title: '8-р анги - Сүйрлийн Үр (Seeds of Cataclysm)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 9,
    title: '9-р анги - Раавагийн Дуу хоолой (Voice of Raava)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 10,
    title: '10-р анги - Уулын Цайз (The Mountain Stronghold)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 11,
    title: '11-р анги - Салхи ба Ус (Water and Air)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 12,
    title: '12-р анги - Харанхуй Хавцал (The Dark Rift)',
    duration: '24 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
  {
    episodeNumber: 13,
    title: '13-р анги - Долоон Оромжийн Тулаан (Battle for the Seven Havens)',
    duration: '26 мин',
    videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  },
];

export const AVATAR_SEVEN_HAVENS: Movie = {
  id: 'm_avatar_seven_havens',
  title: 'Avatar: Seven Havens (Seven Heavens)',
  titleMongolian: 'Аватар: Долоон Оромж (Avatar: Seven Havens)',
  type: 'anime',
  poster: 'https://nexuspointnews.com/wp-content/uploads/2026/10/Avatar-Seven-Havens-scaled.jpg',
  backdrop: 'https://www.comicbasics.com/wp-content/uploads/2026/09/AVATAR-SEVEN-HAVENS.webp',
  year: 2026,
  duration: '13 анги (1-р бүлэг)',
  rating: 9.9,
  genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
  description: 'Аватар Коррагийн эрин үеэс хойш 225 жилийн дараах сүйрсэн дэлхийд хүн төрөлхтөн тусгаарлагдсан Долоон Оромж (Seven Havens)-д хоргодон амьдарч байна. Коррагийн дараах шинэ Аватар болсон шороон махбодот залуу охин Пави болон түүний ихэр эгч Ниша нар сүйрлийн шалтгааныг тайлж, хүн төрөлхтний үлдсэн сүүлчийн найдварыг хамгаалах агуу тулаанд гарна. 2026 оны албан ёсны шинэ Аватар цуврал! Монгол дуу оруулгатай.',
  director: 'Майкл Данте ДиМартино & Брайан Кониецко (Avatar Studios)',
  cast: ['Пави (Аватар)', 'Ниша (Ихэр Аватар)', 'Корра (Өвөг Сүнс)', 'Раава'],
  country: 'АНУ / Япон',
  price: 5000,
  isNewEpisode: true,
  newEpisodeLabel: '2026 ЦОО ШИНЭ ЦУВРАЛ',
  totalEpisodes: 13,
  views: 920000,
  featured: true,
  featuredRank: 1,
  trailerUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4',
  ageRating: '13+',
  audioTracks: ['Монгол дуу оруулга', 'Англи эх дуу'],
  subtitles: ['Монгол хадмал', 'Англи хадмал'],
  episodes: AVATAR_SEVEN_HAVENS_EPISODES,
};

export type MovieType = 'movie' | 'series' | 'anime';

export type TabType =
  | 'home'
  | 'movies'
  | 'series'
  | 'anime'
  | 'chinese'
  | 'ai_movies'
  | 'ai'
  | 'favorites'
  | 'purchased'
  | 'games';

export type MovieSubcategory =
  | 'all'
  | 'mongolian'
  | 'hollywood'
  | 'korean'
  | 'chinese'
  | 'new'
  | 'top_rated'
  | 'action'
  | 'horror'
  | 'comedy'
  | 'scifi'
  | 'vip';

export interface Episode {
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  releaseDate?: string;
  season?: number;
  seasonTitle?: string;
}

export interface Comment {
  id: string;
  movieId: string;
  userName: string;
  avatar: string;
  text: string;
  rating: number;
  date: string;
  likes: number;
}

export interface Movie {
  id: string;
  title: string;
  titleMongolian: string;
  type: MovieType;
  poster: string;
  backdrop: string;
  year: number;
  duration: string;
  rating: number; // 0 to 10
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  country: string;
  isNewEpisode?: boolean;
  newEpisodeLabel?: string;
  totalEpisodes?: number;
  views: number;
  trailerUrl: string; // YouTube embed or video URL
  videoUrl?: string; // Direct sample video or embed
  episodes?: Episode[];
  ageRating: '+18' | '+16' | '+13' | 'ALL';
  audioTracks: string[];
  subtitles: string[];
  price?: number; // Price in MNT (defaults to 1000)
  featured?: boolean;
  featuredRank?: number;
}

export interface FilterState {
  search: string;
  genre: string | null;
  type: MovieType | 'all';
  year: number | null;
  ageRating: string | null;
  sortBy: 'newest' | 'popular' | 'rating';
}

export interface UserWatchProgress {
  movieId: string;
  episodeNumber?: number;
  currentTime: number;
  duration: number;
  updatedAt: string;
}

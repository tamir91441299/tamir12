import { Episode, Movie } from '../types';

export interface SeasonInfo {
  seasonNumber: number;
  seasonLabel: string; // e.g. "S1", "S2"
  seasonTitle: string; // e.g. "S1: Хантерийн шалгалт (1-21)"
  startEpisode: number;
  endEpisode: number;
  episodesCount: number;
}

/**
 * Returns available seasons (S1, S2, S3...) for a movie/anime/series
 */
export function getMovieSeasons(movie: Movie | null, episodes: Episode[]): SeasonInfo[] {
  if (!movie || !episodes || episodes.length === 0) return [];

  // Check if episodes already have explicit season tags
  const explicitSeasons = new Set<number>();
  episodes.forEach((ep) => {
    if (ep.season && ep.season > 0) {
      explicitSeasons.add(ep.season);
    }
  });

  if (explicitSeasons.size > 1) {
    return Array.from(explicitSeasons)
      .sort((a, b) => a - b)
      .map((sNum) => {
        const sEps = episodes.filter((e) => e.season === sNum);
        const minEp = Math.min(...sEps.map((e) => e.episodeNumber));
        const maxEp = Math.max(...sEps.map((e) => e.episodeNumber));
        return {
          seasonNumber: sNum,
          seasonLabel: `S${sNum}`,
          seasonTitle: `${sNum}-р улирал (S${sNum})`,
          startEpisode: minEp,
          endEpisode: maxEp,
          episodesCount: sEps.length,
        };
      });
  }

  const titleLower = (movie.title + ' ' + movie.titleMongolian).toLowerCase();

  // Hunter x Hunter 148 episodes canonical story arcs
  if (movie.id === 'm_hunter_x_hunter' || titleLower.includes('hunter x hunter') || episodes.length === 148) {
    return [
      { seasonNumber: 1, seasonLabel: 'S1', seasonTitle: 'S1: Хантерийн шалгалт (1-21)', startEpisode: 1, endEpisode: 21, episodesCount: 21 },
      { seasonNumber: 2, seasonLabel: 'S2', seasonTitle: 'S2: Золдикийн гэр бүл (22-26)', startEpisode: 22, endEpisode: 26, episodesCount: 5 },
      { seasonNumber: 3, seasonLabel: 'S3', seasonTitle: 'S3: Тэнгэрийн цамхаг (27-36)', startEpisode: 27, endEpisode: 36, episodesCount: 10 },
      { seasonNumber: 4, seasonLabel: 'S4', seasonTitle: 'S4: Йоркшин хот (37-58)', startEpisode: 37, endEpisode: 58, episodesCount: 22 },
      { seasonNumber: 5, seasonLabel: 'S5', seasonTitle: 'S5: Грид Айлэнд (59-75)', startEpisode: 59, endEpisode: 75, episodesCount: 17 },
      { seasonNumber: 6, seasonLabel: 'S6', seasonTitle: 'S6: Химера Шоргоолж (76-136)', startEpisode: 76, endEpisode: 136, episodesCount: 61 },
      { seasonNumber: 7, seasonLabel: 'S7', seasonTitle: 'S7: 13 дахь Сонгууль (137-148)', startEpisode: 137, endEpisode: 148, episodesCount: 12 },
    ];
  }

  // One Piece 1-100 episodes
  if (movie.id === 'm_one_piece' || titleLower.includes('one piece') || titleLower.includes('ван пис')) {
    return [
      { seasonNumber: 1, seasonLabel: 'S1', seasonTitle: 'S1: East Blue - Зүүн тэнгис (1-61)', startEpisode: 1, endEpisode: 61, episodesCount: 61 },
      { seasonNumber: 2, seasonLabel: 'S2', seasonTitle: 'S2: Arabasta - Алабаста цөл (62-100)', startEpisode: 62, endEpisode: 100, episodesCount: 39 },
    ];
  }

  // Multi-season anime / series partitions
  if (episodes.length > 50) {
    const chunkSize = 25;
    const count = Math.ceil(episodes.length / chunkSize);
    return Array.from({ length: count }, (_, i) => {
      const sNum = i + 1;
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, episodes.length);
      return {
        seasonNumber: sNum,
        seasonLabel: `S${sNum}`,
        seasonTitle: `S${sNum} (${start}-${end}-р анги)`,
        startEpisode: start,
        endEpisode: end,
        episodesCount: end - start + 1,
      };
    });
  }

  if (episodes.length > 13) {
    // Standard 12-13 episode anime cours / seasons
    const chunkSize = episodes.length <= 26 ? Math.ceil(episodes.length / 2) : 13;
    const count = Math.ceil(episodes.length / chunkSize);
    return Array.from({ length: count }, (_, i) => {
      const sNum = i + 1;
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, episodes.length);
      return {
        seasonNumber: sNum,
        seasonLabel: `S${sNum}`,
        seasonTitle: `S${sNum} (${start}-${end}-р анги)`,
        startEpisode: start,
        endEpisode: end,
        episodesCount: end - start + 1,
      };
    });
  }

  // Single season or short series
  return [
    {
      seasonNumber: 1,
      seasonLabel: 'S1',
      seasonTitle: 'S1 (1-р улирал)',
      startEpisode: 1,
      endEpisode: episodes.length,
      episodesCount: episodes.length,
    },
  ];
}

/**
 * Given an episode number and movie, find which season it belongs to
 */
export function getEpisodeSeason(movie: Movie | null, episodeNumber: number, episodes: Episode[]): SeasonInfo | undefined {
  const seasons = getMovieSeasons(movie, episodes);
  return seasons.find(
    (s) => episodeNumber >= s.startEpisode && episodeNumber <= s.endEpisode
  ) || seasons[0];
}

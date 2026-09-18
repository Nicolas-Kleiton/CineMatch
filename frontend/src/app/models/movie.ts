/**
 * Filme retornado pelo TMDB (através do proxy do Laravel)
 */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export type MovieSessionStatus = 'pendente' | 'assistido';

/**
 * Sessão de filme salva no histórico do usuário
 */
export interface MovieSession {
  id: number;
  user_id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  status: MovieSessionStatus;
  rating: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

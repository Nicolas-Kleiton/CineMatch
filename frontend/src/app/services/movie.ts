import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:8000/api/movies/popular';
  private searchUrl = 'http://localhost:8000/api/movies/search';
  private sessionUrl = 'http://localhost:8000/api/movie-sessions';

  public getPopularMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  public searchMovies(termo: string): Observable<any> {
    return this.http.get(this.searchUrl, { params: { query: termo } });
  }

  /**
   * Registra a sessão de filme sorteada e confirmada no backend
   */
  public salvarSessaoSorteada(filme: any): Observable<any> {
    const dadosSessao = {
      tmdb_id: filme.id,
      title: filme.title,
      poster_path: filme.poster_path
    };
    return this.http.post(this.sessionUrl, dadosSessao);
  }

  /**
   * Recupera o histórico de sessões do usuário autenticado
   */
  public obterHistoricoSessoes(): Observable<any> {
    return this.http.get(`${this.sessionUrl}/history`);
  }

  public avaliarSessao(id: number, rating: number, comment: string): Observable<any> {
    const dadosForm = { rating, comment };
    return this.http.put(`${this.sessionUrl}/${id}/evaluate`, dadosForm);
  }

  public removerSessaoPendente(id: number): Observable<any> {
    return this.http.delete(`${this.sessionUrl}/${id}`);
  }
}
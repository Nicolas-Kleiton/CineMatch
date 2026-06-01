import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:8000/api/movies/popular';
  private searchUrl = 'http://localhost:8000/api/movies/search';
  private sessionUrl = 'http://localhost:8000/api/movie-sessions';

  /**
   * Monta os cabeçalhos HTTP com o Token de autenticação Bearer
   */
  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('cinematch_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public getPopularMovies(): Observable<any[]> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  public searchMovies(termo: string): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get(this.searchUrl, { headers, params: { query: termo } });
  }

  /**
   * Registra a sessão de filme sorteada e confirmada no backend
   */
  public salvarSessaoSorteada(filme: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    const dadosSessao = {
      tmdb_id: filme.id,
      title: filme.title,
      poster_path: filme.poster_path
    };
    return this.http.post(this.sessionUrl, dadosSessao, { headers });
  }

  /**
   * Recupera o histórico de sessões do usuário autenticado
   */
  public obterHistoricoSessoes(): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get(`${this.sessionUrl}/history`, { headers });
  }

  public avaliarSessao(id: number, rating: number, comment: string): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    const dadosForm = { rating, comment };
    return this.http.put(`${this.sessionUrl}/${id}/evaluate`, dadosForm, { headers });
  }

  public removerSessaoPendente(id: number): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.delete(`${this.sessionUrl}/${id}`, { headers });
  }
}
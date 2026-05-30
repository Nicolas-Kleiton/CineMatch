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

  public getPopularMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  public searchMovies(termo: string): Observable<any> {
    return this.http.get(this.searchUrl, { params: { query: termo } });
  }
}
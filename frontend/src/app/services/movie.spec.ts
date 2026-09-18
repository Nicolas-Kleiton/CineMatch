import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MovieService } from './movie';
import { environment } from '../../environments/environment';
import { Movie } from '../models/movie';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('envia o termo de busca como query param', () => {
    service.searchMovies('matrix').subscribe();
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/movies/search`);

    expect(req.request.params.get('query')).toBe('matrix');
    req.flush([]);
  });

  it('envia apenas os campos necessários ao salvar a sessão', () => {
    const filme: Movie = {
      id: 603,
      title: 'Matrix',
      overview: 'Descrição',
      poster_path: '/poster.jpg',
      release_date: '1999-03-31',
      vote_average: 8.2,
    };

    service.salvarSessaoSorteada(filme).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/movie-sessions`);

    expect(req.request.body).toEqual({ tmdb_id: 603, title: 'Matrix', poster_path: '/poster.jpg' });
    req.flush({});
  });
});

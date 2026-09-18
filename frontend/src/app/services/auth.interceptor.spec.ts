import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { ToastService } from './toast';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('adiciona o header Authorization quando há token', () => {
    localStorage.setItem('cinematch_token', 'token-123');

    http.get('/api/movies/popular').subscribe();
    const req = httpMock.expectOne('/api/movies/popular');

    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush([]);
  });

  it('não adiciona o header quando não há token', () => {
    http.get('/api/movies/popular').subscribe();
    const req = httpMock.expectOne('/api/movies/popular');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('encerra a sessão e redireciona para o login ao receber 401', () => {
    localStorage.setItem('cinematch_token', 'token-expirado');
    const toastSpy = vi.spyOn(TestBed.inject(ToastService), 'show');

    http.get('/api/movie-sessions/history').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/movie-sessions/history')
      .flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('cinematch_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastSpy).toHaveBeenCalledTimes(1);
  });

  it('não redireciona quando o 401 vem da própria tela de login', () => {
    localStorage.setItem('cinematch_token', 'token-antigo');

    http.post('/api/login', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/login')
      .flush({ message: 'Email ou senha incorretos.' }, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});

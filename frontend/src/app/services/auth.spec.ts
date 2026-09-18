import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Auth } from './auth';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/user';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  const respostaLogin: AuthResponse = {
    message: 'ok',
    access_token: 'token-123',
    token_type: 'Bearer',
    user: { id: 1, name: 'Ana', email: 'ana@teste.com', is_guest: false },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('salva token e usuário após o login', () => {
    service.login({ email: 'ana@teste.com', password: '123456' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/login`).flush(respostaLogin);

    expect(service.obterToken()).toBe('token-123');
    expect(service.estaAutenticado()).toBe(true);
    expect(service.obterUsuarioSalvo()?.name).toBe('Ana');
  });

  it('salva a sessão após o login de visitante', () => {
    service.guestLogin().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/guest-login`).flush({
      ...respostaLogin,
      user: { ...respostaLogin.user, is_guest: true },
    });

    expect(service.estaAutenticado()).toBe(true);
    expect(service.obterUsuarioSalvo()?.is_guest).toBe(true);
  });

  it('revoga o token no servidor e limpa a sessão no logout', () => {
    localStorage.setItem('cinematch_token', 'token-123');
    localStorage.setItem('cinematch_user', JSON.stringify(respostaLogin.user));

    let concluiu = false;
    service.logout().subscribe(() => (concluiu = true));
    httpMock.expectOne({ method: 'POST', url: `${environment.apiUrl}/logout` }).flush({});

    expect(concluiu).toBe(true);
    expect(service.estaAutenticado()).toBe(false);
    expect(service.obterUsuarioSalvo()).toBeNull();
  });

  it('limpa a sessão local mesmo se o logout falhar no servidor', () => {
    localStorage.setItem('cinematch_token', 'token-expirado');

    let concluiu = false;
    service.logout().subscribe(() => (concluiu = true));
    httpMock
      .expectOne(`${environment.apiUrl}/logout`)
      .flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(concluiu).toBe(true);
    expect(service.estaAutenticado()).toBe(false);
  });
});

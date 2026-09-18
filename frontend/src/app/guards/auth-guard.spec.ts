import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('permite o acesso quando há token salvo', () => {
    localStorage.setItem('cinematch_token', 'token-123');
    expect(executeGuard(route, state)).toBe(true);
  });

  it('redireciona para /login quando não há token', () => {
    const resultado = executeGuard(route, state) as UrlTree;
    expect(resultado instanceof UrlTree).toBe(true);
    expect(resultado.toString()).toBe('/login');
  });
});

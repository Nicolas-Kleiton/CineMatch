import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginCredentials, ProfileUpdateData, RegisterData, User, UserResponse } from '../models/user';

const TOKEN_KEY = 'cinematch_token';
const USER_KEY = 'cinematch_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  public register(userData: RegisterData): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, userData);
  }

  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.salvarSessao(response))
    );
  }

  public guestLogin(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/guest-login`, {}).pipe(
      tap(response => this.salvarSessao(response))
    );
  }

  /**
   * Revoga o token no servidor e limpa a sessão local.
   * Mesmo se a requisição falhar (ex.: token já expirado), a sessão local é removida.
   */
  public logout(): Observable<void> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.limparSessao()),
      map(() => undefined)
    );
  }

  public atualizarPerfil(dados: ProfileUpdateData): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/user/profile`, dados).pipe(
      tap(response => this.salvarUsuario(response.user))
    );
  }

  public obterUsuarioLogado(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/me`).pipe(
      tap(response => this.salvarUsuario(response.user))
    );
  }

  public obterToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public estaAutenticado(): boolean {
    return !!this.obterToken();
  }

  public obterUsuarioSalvo(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  public limparSessao(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private salvarSessao(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    this.salvarUsuario(response.user);
  }

  private salvarUsuario(user: User | undefined): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
}

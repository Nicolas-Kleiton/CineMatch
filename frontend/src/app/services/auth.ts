import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginCredentials, ProfileUpdateData, RegisterData, UserResponse } from '../models/user';

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
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  public guestLogin(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/guest-login`, {});
  }

  public atualizarPerfil(dados: ProfileUpdateData): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/user/profile`, dados);
  }

  public obterUsuarioLogado(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/me`);
  }
}

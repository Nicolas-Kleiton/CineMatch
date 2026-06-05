import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  public register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  public login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  public guestLogin(): Observable<any> {
    return this.http.post(`${this.apiUrl}/guest-login`, {});
  }

  public atualizarPerfil(dados: { name: string; email: string; password?: string; password_confirmation?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile`, dados);
  }

  public obterUsuarioLogado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/me`);
  }
}

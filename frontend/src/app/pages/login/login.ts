import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);
  private toastService = inject(ToastService);

  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  public isSubmitting = signal<boolean>(false);
  public isGuestSubmitting = signal<boolean>(false);
  public loginError = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.loginError.set(null);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso!', response);
          localStorage.setItem('cinematch_token', response.access_token);
          if (response.user) {
            localStorage.setItem('cinematch_user', JSON.stringify(response.user));
          }

          this.loginForm.reset();
          this.isSubmitting.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loginError.set('E-mail ou senha incorretos!');
          console.error('Erro ao realizar login!', error);
          this.isSubmitting.set(false);
        },
      });
    }
  }

  protected loginAsGuest(): void {
    this.isGuestSubmitting.set(true);
    this.loginError.set(null);
    this.authService.guestLogin().subscribe({
      next: (response) => {
        console.log('Login de visitante realizado com sucesso!', response);
        localStorage.setItem('cinematch_token', response.access_token);
        if (response.user) {
          localStorage.setItem('cinematch_user', JSON.stringify(response.user));
        }
        this.isGuestSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loginError.set('Erro ao entrar como visitante!');
        console.error('Erro no login de visitante', error);
        this.isGuestSubmitting.set(false);
      },
    });
  }
}

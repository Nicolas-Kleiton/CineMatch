import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
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

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
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
          this.toastService.show('E-mail ou senha incorretos!', 'error');
          console.error('Erro ao realizar login!', error);
          this.isSubmitting.set(false);
        },
      });
    }
  }

  protected loginAsGuest(): void {
    this.isGuestSubmitting.set(true);
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
        this.toastService.show('Erro ao entrar como visitante!', 'error');
        console.error('Erro no login de visitante', error);
        this.isGuestSubmitting.set(false);
      },
    });
  }
}

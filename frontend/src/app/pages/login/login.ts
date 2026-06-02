import { Component, inject } from '@angular/core';
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

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso!', response);
          localStorage.setItem('cinematch_token', response.access_token);

          this.loginForm.reset();

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.toastService.show('E-mail ou senha incorretos!', 'error');
          console.error('Erro ao realizar login!', error);
        },
      });
    }
  }
}

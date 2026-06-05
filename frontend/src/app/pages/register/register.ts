import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  private authService = inject(Auth);
  private router = inject(Router);
  private toastService = inject(ToastService);

  protected registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  public isSubmitting = signal<boolean>(false);
  public registerError = signal<string | null>(null);

  protected onSubmit(): void {
    if(this.registerForm.valid) {
      this.isSubmitting.set(true);
      this.registerError.set(null);
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.toastService.show('Cadastro realizado com sucesso!', 'success');
          console.log('Usuário cadastrado com sucesso!', response);

          this.registerForm.reset();
          this.isSubmitting.set(false);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          if (error.status === 422 && error.error?.errors?.email) {
            this.registerError.set('Este e-mail já está em uso!');
          } else {
            this.registerError.set('Erro ao cadastrar usuário! Tente novamente.');
          }
          console.error('Erro ao cadastrar usuário!', error);
          this.isSubmitting.set(false);
        }
      });
    }
  }
}

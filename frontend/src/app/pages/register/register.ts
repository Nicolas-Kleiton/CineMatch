import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  private authService = inject(Auth);

  protected registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  protected onSubmit(): void {
    if(this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Usuário cadastrado com sucesso!', response);
          alert('Cadastro realizado com sucesso!');
          this.registerForm.reset();
        },
        error: (error) => {
          console.error('Erro ao cadastrar usuário!', error);
          alert('Erro ao cadastrar usuário. Verifique os dados.');
        }
      });
    }
  }
}

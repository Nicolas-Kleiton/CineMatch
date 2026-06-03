import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  public isEditing = false;
  public currentUser: any = { name: '', email: '' };

  protected profileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.minLength(8)]),
    password_confirmation: new FormControl('')
  });

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  private carregarDadosUsuario(): void {
    const userData = localStorage.getItem('cinematch_user');
    if (userData) {
      this.atualizarCampos(JSON.parse(userData));
    }

    this.authService.obterUsuarioLogado().subscribe({
      next: (response) => {
        if (response.user) {
          localStorage.setItem('cinematch_user', JSON.stringify(response.user));
          this.atualizarCampos(response.user);
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error('Erro ao buscar usuário logado:', error)
    });
  }

  private atualizarCampos(user: any): void {
    this.currentUser = user;
    this.profileForm.patchValue({
      name: user.name,
      email: user.email
    });
  }

  get formMudou(): boolean {
    if (!this.currentUser) return false;
    const formValue = this.profileForm.value;
    const nomeMudou = formValue.name !== this.currentUser.name;
    const emailMudou = formValue.email !== this.currentUser.email;
    const digitouSenha = !!formValue.password;
    
    return nomeMudou || emailMudou || digitouSenha;
  }

  public toggleEdit(): void {
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  public cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.currentUser.name,
      email: this.currentUser.email,
      password: '',
      password_confirmation: ''
    });
    this.cdr.detectChanges();
  }

  protected onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      
      if (formValue.password && formValue.password !== formValue.password_confirmation) {
        this.toastService.show('As senhas não coincidem!', 'error');
        return;
      }

      const dados: any = { name: formValue.name, email: formValue.email };
      if (formValue.password) {
        dados.password = formValue.password;
        dados.password_confirmation = formValue.password_confirmation;
      }

      this.authService.atualizarPerfil(dados).subscribe({
        next: (response) => {
          if (response.user) {
            localStorage.setItem('cinematch_user', JSON.stringify(response.user));
            this.currentUser = response.user;
          }
          
          this.cancelEdit();
          this.toastService.show('Perfil atualizado com sucesso!', 'success');
        },
        error: (error) => {
          this.toastService.show('Erro ao atualizar perfil!', 'error');
          console.error('Erro:', error);
        }
      });
    }
  }

  protected voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}

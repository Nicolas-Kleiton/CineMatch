import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private router = inject(Router);

  protected logout(): void {
    localStorage.removeItem('cinematch_token');
    alert('Sessão encerrada com sucesso!');
    this.router.navigate(['/login']);
  }
}

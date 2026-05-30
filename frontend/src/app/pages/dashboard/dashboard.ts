import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private movieService = inject(MovieService);

  // Lista reativa para armazenar os filmes vindo do Laravel
  public SampleMovies = signal<any[]>([]);

  ngOnInit(): void {
    this.obterCatalogoFilmes();
  }

  /**
   * Busca os filmes populares no backend
   */
  public obterCatalogoFilmes(): void {
    this.movieService.getPopularMovies().subscribe({
      next: (filmes) => {
        this.SampleMovies.set(filmes);
      },
      error: (erro) => {
        console.error('Erro ao buscar filmes do backend Laravel:', erro);
      }
    });
  }

  /**
   * Faz o carrossel deslizar horizontalmente
   * @param elemento O container HTML do carrossel
   * @param distancia Quantidade de pixels para rolar (positivo avança, negativo recua)
   */
  public moverCarrossel(elemento: HTMLElement, distancia: number): void {
    elemento.scrollBy({
      left: distancia,
      behavior: 'smooth'
    });
  }

  /**
   * Destrói a sessão local e retorna para a tela de login
   */
  protected logout(): void {
    localStorage.removeItem('cinematch_token');
    alert('Sessão encerrada com sucesso!');
    this.router.navigate(['/login']);
  }
}
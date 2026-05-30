import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private movieService = inject(MovieService);

  public SampleMovies = signal<any[]>([]);
  public termoPesquisa = signal<string>('');

  private pesquisadorSubject = new Subject<string>();
  private pesquisaSubscription!: Subscription;

  ngOnInit(): void {
    this.obterCatalogoFilmes();
    this.configurarPesquisaDebounce();
  }

  /**
   * Configura o fluxo de debounce para evitar requisições repetidas ao digitar
   */
  private configurarPesquisaDebounce(): void {
    this.pesquisaSubscription = this.pesquisadorSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termo) => {
      this.executarBuscaNoBackend(termo);
    });
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
   * Método acionado pelo evento (input) do HTML a cada tecla
   */
  public pesquisar(): void {
    // Alimenta o canal do RxJS com o valor atual do input limpo de espaços
    this.pesquisadorSubject.next(this.termoPesquisa().trim());
  }

  /**
   * Executa de fato a requisição para a rota de busca no Laravel
   */
  private executarBuscaNoBackend(termo: string): void {
    if (termo === '') {
      this.obterCatalogoFilmes();
      return;
    }

    this.movieService.searchMovies(termo).subscribe({
      next: (resultados) => this.SampleMovies.set(resultados),
      error: (erro) => console.error('Erro na pesquisa via Laravel:', erro)
    });
  }

  /**
   * Limpa a inscrição para evitar vazamentos de memória ao trocar de página
   */
  ngOnDestroy(): void {
    if (this.pesquisaSubscription) {
      this.pesquisaSubscription.unsubscribe();
    }
  }

  /**
   * Controla o deslocamento horizontal do carrossel
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
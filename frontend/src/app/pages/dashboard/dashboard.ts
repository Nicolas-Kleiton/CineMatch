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
  public filmesSelecionados = signal<any[]>([]);
  public filmeSorteado = signal<any | null>(null);
  public estaSorteando = signal<boolean>(false);

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
   * Adiciona um filme à lista de filmes selecionados
   */

  public adicionarFilmeALista(filme: any): void {
    const jaExiste = this.filmesSelecionados().some(item => item.id === filme.id);

    if (jaExiste) {
      alert(`O filme "${filme.title}" já está na sua lista de votação!`);
      return;
    }
    this.filmesSelecionados.set([...this.filmesSelecionados(), filme]);
  }

    /**
   * Remove um filme da lista de filmes selecionados
   */

  public removerFilmeDaLista(filmeId: number): void {
    const listaFiltrada = this.filmesSelecionados().filter(item => item.id !== filmeId);
    this.filmesSelecionados.set(listaFiltrada);
  }

  /**
   * Realiza o sorteio aleatório com efeito de roleta
   */
  public sortearFilme(): void {
    const lista = this.filmesSelecionados();

    if (lista.length === 0) {
      alert('Adicione pelo menos um filme à lista antes de sortear!');
      return;
    }

    this.estaSorteando.set(true);
    this.filmeSorteado.set(null);

    let contador = 0;
    const totalGiros = 15;

    // Cria um intervalo que roda a cada 100ms mudando o filme focado
    const intervalo = setInterval(() => {
      const indiceAleatorio = Math.floor(Math.random() * lista.length);
      this.filmeSorteado.set(lista[indiceAleatorio]);
      contador++;
      if (contador >= totalGiros) {
        clearInterval(intervalo);
        this.estaSorteando.set(false);
      }
    }, 100);
  }

  /**
   * Limpa o filme sorteado da tela para fechar o destaque
   */
  public fecharSorteio(): void {
    this.filmeSorteado.set(null);
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
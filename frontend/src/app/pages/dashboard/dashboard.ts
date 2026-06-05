import { Component, inject, OnInit, signal, OnDestroy, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { ToastService } from '../../services/toast';
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
  private toastService = inject(ToastService);

  public SampleMovies = signal<any[]>([]);
  public isLoading = signal<boolean>(true);
  public termoPesquisa = signal<string>('');
  public filmesSelecionados = signal<any[]>([]);
  public filmeSorteado = signal<any | null>(null);
  public estaSorteando = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public mostrarSetaEsquerda = signal<boolean>(false);
  
  // Controla o estado de origem para alternar os textos dos botões do painel de resultado
  public foiEscolhaManual = signal<boolean>(false);

  // Trava reativa para impedir que a seta direita apareça quando o carrossel estiver vazio
  private podeDarScrollDireita = signal<boolean>(true);
  public mostrarSetaDireita = computed(() => {
    if (this.SampleMovies().length === 0) {
      return false;
    }
    return this.podeDarScrollDireita();
  });

  private pesquisadorSubject = new Subject<string>();
  private pesquisaSubscription!: Subscription;

  ngOnInit(): void {
    this.obterCatalogoFilmes();
    this.configurarPesquisaDebounce();
  }

  private configurarPesquisaDebounce(): void {
    this.pesquisaSubscription = this.pesquisadorSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termo) => {
      this.executarBuscaNoBackend(termo);
    });
  }

  public obterCatalogoFilmes(): void {
    this.isLoading.set(true);
    this.movieService.getPopularMovies().subscribe({
      next: (filmes) => {
        this.SampleMovies.set(filmes);
        this.mostrarSetaEsquerda.set(false);
        this.podeDarScrollDireita.set(filmes.length > 0);
        this.isLoading.set(false);
      },
      error: (erro) => {
        this.toastService.show('Erro ao buscar filmes!', 'error');
        console.error('Erro ao buscar filmes populares:', erro);
        this.isLoading.set(false);
      }
    });
  }

  public pesquisar(): void {
    this.pesquisadorSubject.next(this.termoPesquisa().trim());
  }

  private executarBuscaNoBackend(termo: string): void {
    if (termo === '') {
      this.obterCatalogoFilmes();
      return;
    }

    this.isLoading.set(true);
    this.movieService.searchMovies(termo).subscribe({
      next: (resultados) => {
        this.SampleMovies.set(resultados);

        const container = document.querySelector('.carousel-container') as HTMLElement;
        if (container) {
          container.scrollLeft = 0;
          setTimeout(() => this.checarLimitesScroll(container), 50);
        }
        this.isLoading.set(false);
      },
      error: (erro) => {
        this.toastService.show('Erro na pesquisa!', 'error');
        console.error('Erro na pesquisa via Laravel:', erro);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pesquisaSubscription) {
      this.pesquisaSubscription.unsubscribe();
    }
  }

  public adicionarFilmeALista(filme: any): void {
    const jaExiste = this.filmesSelecionados().some(item => item.id === filme.id);

    if (jaExiste) {
      this.toastService.show('Este filme já foi adicionado!', 'warning');
      return;
    }
    this.filmesSelecionados.set([...this.filmesSelecionados(), filme]);
  }

  public removerFilmeDaLista(filmeId: number): void {
    const listaFiltrada = this.filmesSelecionados().filter(item => item.id !== filmeId);
    this.filmesSelecionados.set(listaFiltrada);
  }

  public sortearFilme(): void {
    const lista = this.filmesSelecionados();

    if (lista.length === 0) {
      this.toastService.show('Adicione pelo menos um filme para sortear!', 'info');
      return;
    }

    this.foiEscolhaManual.set(false); // Reseta a flag indicando fluxo de sorteio por roleta
    this.estaSorteando.set(true);
    this.filmeSorteado.set(null);

    let contador = 0;
    const totalGiros = 15;

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
   * Pula o sorteio e confirma o filme selecionado diretamente no banco
   */
  public escolherFilmeDiretamente(filme: any): void {
    if (!filme) return;

    this.foiEscolhaManual.set(true); // Marca que o fluxo atual veio de uma escolha manual
    this.filmeSorteado.set(filme);   // Joga o filme escolhido direto para exibição do painel
  }

  public fecharSorteio(): void {
    this.filmeSorteado.set(null);
    this.foiEscolhaManual.set(false);
  }

  public checarLimitesScroll(container: HTMLElement): void {
    this.mostrarSetaEsquerda.set(container.scrollLeft > 5);
    const temConteudoParaRolar = container.scrollWidth > container.clientWidth;
    const chegouAoFim = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
    this.podeDarScrollDireita.set(temConteudoParaRolar && !chegouAoFim);
  }

  public moverCarrossel(elemento: HTMLElement, distancia: number): void {
    elemento.scrollBy({
      left: distancia,
      behavior: 'smooth'
    });

    setTimeout(() => this.checarLimitesScroll(elemento), 350);
  }

  public confirmarFilmeSorteado(): void {
    const filme = this.filmeSorteado();
    
    if (!filme) return;

    this.isSubmitting.set(true);
    this.movieService.salvarSessaoSorteada(filme).subscribe({
      next: () => {
        this.filmeSorteado.set(null);
        this.filmesSelecionados.set([]);
        this.foiEscolhaManual.set(false);
        this.isSubmitting.set(false);
        this.router.navigate(['/history']);
      },
      error: (erro) => {
        this.toastService.show('Erro ao confirmar sessão no histórico!', 'error');
        console.error('Erro ao confirmar sessão no banco:', erro);
        this.isSubmitting.set(false);
      }
    });
  }
  
  public irParaHistorico(): void {
    this.router.navigate(['/history']);
  }

  public irParaPerfil(): void {
    this.router.navigate(['/profile']);
  }

  protected logout(): void {
    localStorage.removeItem('cinematch_token');
    this.router.navigate(['/login']);
  }
}
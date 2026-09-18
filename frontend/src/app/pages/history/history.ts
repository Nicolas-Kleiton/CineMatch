import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { ToastService } from '../../services/toast';
import { MovieSession } from '../../models/movie-session';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})

export class History implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Signal para armazenar todas as sessões vindas do banco
  public sessoes = signal<MovieSession[]>([]);
  public isLoadingHistory = signal<boolean>(true);

  // Signals para controlar o estado do Modal de Avaliação
  public exibindoModal = signal<boolean>(false);
  public sessaoSelecionada = signal<MovieSession | null>(null);
  
  // Campos do formulário de avaliação
  public notaSelecionada = signal<number>(5);
  public comentarioOriginal = signal<string>('');
  public isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    this.carregarHistorico();
  }

  /**
   * Busca as sessões gravadas no Laravel
   */
  public carregarHistorico(): void {
    this.isLoadingHistory.set(true);
    this.movieService.obterHistoricoSessoes().subscribe({
      next: (dados) => {
        this.sessoes.set(dados);
        this.isLoadingHistory.set(false);
      },
      error: (erro) => {
        this.toastService.show('Erro ao carregar o histórico!', 'error');
        console.error('Erro ao buscar histórico:', erro);
        this.isLoadingHistory.set(false);
      }
    });
  }

  /**
   * Abre o modal de feedback para o filme pendente selecionado
   */
  public abrirModalAvaliacao(sessao: MovieSession): void {
    this.sessaoSelecionada.set(sessao);
    
    // Se o status for 'assistido', carrega os dados já salvos para edição
    if (sessao.status === 'assistido') {
      this.notaSelecionada.set(sessao.rating ?? 5);
      this.comentarioOriginal.set(sessao.comment || '');
    } else {
      // Se for pendente, inicia o formulário limpo
      this.notaSelecionada.set(5);
      this.comentarioOriginal.set('');
    }
    
    this.exibindoModal.set(true);
  }

  /**
   * Envia os dados do formulário para consolidar o encerramento da sessão no Laravel
   */
  public enviarAvaliacao(): void {
    const sessaoId = this.sessaoSelecionada()?.id;
    
    if (!sessaoId) return;

    this.isSubmitting.set(true);
    this.movieService.avaliarSessao(
      sessaoId, 
      this.notaSelecionada(), 
      this.comentarioOriginal()
    ).subscribe({
      next: () => {
        this.fecharModal();
        this.carregarHistorico(); // Atualiza a tela reativamente
        this.isSubmitting.set(false);
        this.toastService.show('Avaliação salva com sucesso!', 'success');
      },
      error: (erro) => {
        this.toastService.show('Erro ao salvar avaliação!', 'error');
        console.error('Erro ao salvar avaliação:', erro);
        this.isSubmitting.set(false);
      }
    });
  }

  public removerSessao(sessao: MovieSession): void {
    if (!confirm(`Remover "${sessao.title}" da sua lista?`)) {
      return;
    }

    this.movieService.removerSessaoPendente(sessao.id).subscribe({
      next: () => {
        this.carregarHistorico();
        this.toastService.show('Filme removido da lista.', 'success');
      },
      error: (erro) => {
        this.toastService.show('Erro ao remover o filme!', 'error');
        console.error('Erro ao remover sessão:', erro);
      }
    });
  }
  

  /**
   * Fecha o modal de feedback
   */
  public fecharModal(): void {
    this.exibindoModal.set(false);
    this.sessaoSelecionada.set(null);
  }

  /**
   * Retorna ao Dashboard de sorteio
   */
  public voltarAoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
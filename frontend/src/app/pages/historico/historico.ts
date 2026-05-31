import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-historico',
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.html',
  styleUrl: './historico.scss'
})

export class Historico implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);

  // Signal para armazenar todas as sessões vindas do banco
  public sessoes = signal<any[]>([]);

  // Signals para controlar o estado do Modal de Avaliação
  public exibindoModal = signal<boolean>(false);
  public sessaoSelecionada = signal<any | null>(null);
  
  // Campos do formulário de avaliação
  public notaSelecionada = signal<number>(5);
  public comentarioOriginal = signal<string>('');

  ngOnInit(): void {
    this.carregarHistorico();
  }

  /**
   * Busca as sessões gravadas no Laravel
   */
  public carregarHistorico(): void {
    this.movieService.obterHistoricoSessoes().subscribe({
      next: (dados) => this.sessoes.set(dados),
      error: (erro) => console.error('Erro ao buscar histórico:', erro)
    });
  }

  /**
   * Abre o modal de feedback para o filme pendente selecionado
   */
  public abrirModalAvaliacao(sessao: any): void {
    this.sessaoSelecionada.set(sessao);
    this.notaSelecionada.set(5); // Reseta para nota máxima padrão
    this.comentarioOriginal.set(''); // Limpa o texto
    this.exibindoModal.set(true);
  }

  /**
   * Envia os dados do formulário para consolidar o encerramento da sessão no Laravel
   */
  public enviarAvaliacao(): void {
    const sessaoId = this.sessaoSelecionada()?.id;
    
    if (!sessaoId) return;

    this.movieService.avaliarSessao(
      sessaoId, 
      this.notaSelecionada(), 
      this.comentarioOriginal()
    ).subscribe({
      next: (resposta) => {
        alert('Sessão encerrada e avaliada com sucesso! 🎉');
        this.fecharModal();
        this.carregarHistorico(); // Atualiza a tela reativamente
      },
      error: (erro) => {
        console.error('Erro ao salvar avaliação:', erro);
        alert('Não foi possível salvar sua nota. Verifique os dados e tente novamente.');
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
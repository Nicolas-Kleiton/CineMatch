<?php

namespace Tests\Feature;

use App\Models\MovieSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MovieTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.tmdb.token' => 'token-tmdb',
            'services.tmdb.base_url' => 'https://tmdb.test/3',
        ]);

        $this->user = User::factory()->create();
    }

    private function criarSessao(User $dono, string $status = 'pendente'): MovieSession
    {
        return MovieSession::create([
            'user_id' => $dono->id,
            'tmdb_id' => 603,
            'title' => 'Matrix',
            'status' => $status,
        ]);
    }

    public function test_rotas_de_filmes_exigem_autenticacao(): void
    {
        $this->getJson('/api/movies/popular')->assertUnauthorized();
        $this->getJson('/api/movie-sessions/history')->assertUnauthorized();
    }

    public function test_busca_filmes_populares_no_tmdb_usando_a_config(): void
    {
        Http::fake(['tmdb.test/*' => Http::response(['results' => [['id' => 603, 'title' => 'Matrix']]])]);

        $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/movies/popular')
            ->assertOk()
            ->assertJsonPath('0.title', 'Matrix');

        Http::assertSent(fn (Request $request) =>
            str_starts_with($request->url(), 'https://tmdb.test/3/movie/popular')
            && $request->hasHeader('Authorization', 'Bearer token-tmdb')
            && $request['language'] === 'pt-BR'
        );
    }

    public function test_busca_vazia_retorna_lista_vazia_sem_chamar_o_tmdb(): void
    {
        Http::fake();

        $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/movies/search?query=%20%20')
            ->assertOk()
            ->assertExactJson([]);

        Http::assertNothingSent();
    }

    public function test_falha_no_tmdb_retorna_502(): void
    {
        Http::fake(['tmdb.test/*' => Http::response([], 500)]);

        $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/movies/search?query=matrix')
            ->assertStatus(502);
    }

    public function test_salva_uma_sessao_como_pendente(): void
    {
        $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/movie-sessions', [
                'tmdb_id' => 603,
                'title' => 'Matrix',
                'poster_path' => '/poster.jpg',
            ])->assertCreated();

        $this->assertDatabaseHas('movie_sessions', [
            'user_id' => $this->user->id,
            'tmdb_id' => 603,
            'status' => 'pendente',
        ]);
    }

    public function test_historico_mostra_apenas_as_sessoes_do_usuario(): void
    {
        $this->criarSessao($this->user);
        $this->criarSessao(User::factory()->create());

        $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/movie-sessions/history')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_avalia_sessao_e_marca_como_assistida(): void
    {
        $sessao = $this->criarSessao($this->user);

        $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/movie-sessions/{$sessao->id}/evaluate", ['rating' => 4, 'comment' => 'Muito bom'])
            ->assertOk();

        $this->assertDatabaseHas('movie_sessions', ['id' => $sessao->id, 'status' => 'assistido', 'rating' => 4]);
    }

    public function test_nota_fora_do_intervalo_e_rejeitada(): void
    {
        $sessao = $this->criarSessao($this->user);

        $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/movie-sessions/{$sessao->id}/evaluate", ['rating' => 6])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rating');
    }

    public function test_usuario_nao_avalia_nem_remove_sessao_de_outro_usuario(): void
    {
        $sessaoAlheia = $this->criarSessao(User::factory()->create());

        $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/movie-sessions/{$sessaoAlheia->id}/evaluate", ['rating' => 1])
            ->assertNotFound();

        $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/movie-sessions/{$sessaoAlheia->id}")
            ->assertNotFound();

        $this->assertModelExists($sessaoAlheia);
    }

    public function test_remove_apenas_sessoes_pendentes(): void
    {
        $pendente = $this->criarSessao($this->user);
        $assistida = $this->criarSessao($this->user, 'assistido');

        $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/movie-sessions/{$pendente->id}")
            ->assertOk();

        $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/movie-sessions/{$assistida->id}")
            ->assertNotFound();

        $this->assertModelMissing($pendente);
        $this->assertModelExists($assistida);
    }
}

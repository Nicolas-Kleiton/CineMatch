<?php

namespace Tests\Feature;

use App\Models\MovieSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registra_um_novo_usuario(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ana',
            'email' => 'ana@teste.com',
            'password' => 'segredo123',
        ]);

        $response->assertCreated()->assertJsonMissingPath('user.password');
        $this->assertDatabaseHas('users', ['email' => 'ana@teste.com', 'is_guest' => false]);
    }

    public function test_nao_registra_email_duplicado(): void
    {
        User::factory()->create(['email' => 'ana@teste.com']);

        $this->postJson('/api/register', [
            'name' => 'Ana',
            'email' => 'ana@teste.com',
            'password' => 'segredo123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_login_retorna_token_com_expiracao(): void
    {
        $user = User::factory()->create(['password' => 'segredo123']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'segredo123',
        ])->assertOk()->assertJsonStructure(['access_token', 'user']);

        $token = $user->tokens()->first();
        $this->assertNotNull($token->expires_at);
        $this->assertTrue($token->expires_at->between(now()->addDays(6), now()->addDays(8)));
    }

    public function test_login_com_senha_errada_retorna_401(): void
    {
        $user = User::factory()->create(['password' => 'segredo123']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'errada',
        ])->assertUnauthorized();
    }

    public function test_login_remove_tokens_vencidos(): void
    {
        $user = User::factory()->create(['password' => 'segredo123']);
        $user->createToken('vencido', ['*'], now()->subDay());

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'segredo123',
        ])->assertOk();

        $this->assertSame(1, $user->tokens()->count());
        $this->assertDatabaseMissing('personal_access_tokens', ['name' => 'vencido']);
    }

    public function test_logout_revoga_o_token_atual(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertSame(0, PersonalAccessToken::count());

        // Limpa o usuário em cache no guard para simular uma nova requisição
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->getJson('/api/user/me')->assertUnauthorized();
    }

    public function test_rotas_de_login_tem_rate_limit(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', ['email' => 'x@teste.com', 'password' => 'errada']);
        }

        $this->postJson('/api/login', ['email' => 'x@teste.com', 'password' => 'errada'])
            ->assertTooManyRequests();
    }

    public function test_cada_visitante_recebe_uma_conta_propria(): void
    {
        $primeiro = $this->postJson('/api/guest-login')->assertOk()->json('user');
        $segundo = $this->postJson('/api/guest-login')->assertOk()->json('user');

        $this->assertNotSame($primeiro['id'], $segundo['id']);
        $this->assertTrue($primeiro['is_guest']);
        $this->assertSame(2, User::where('is_guest', true)->count());
    }

    public function test_login_de_visitante_nao_apaga_dados_de_outro_visitante_ativo(): void
    {
        $visitante = User::find($this->postJson('/api/guest-login')->json('user.id'));
        MovieSession::create([
            'user_id' => $visitante->id,
            'tmdb_id' => 603,
            'title' => 'Matrix',
            'status' => 'pendente',
        ]);

        $this->postJson('/api/guest-login')->assertOk();

        $this->assertDatabaseHas('movie_sessions', ['user_id' => $visitante->id]);
    }

    public function test_visitantes_expirados_sao_removidos_com_tokens_e_sessoes(): void
    {
        $antigo = User::factory()->create(['is_guest' => true, 'created_at' => now()->subDays(2)]);
        $antigo->createToken('auth_token');
        MovieSession::create([
            'user_id' => $antigo->id,
            'tmdb_id' => 603,
            'title' => 'Matrix',
            'status' => 'pendente',
        ]);
        $usuarioComum = User::factory()->create(['created_at' => now()->subDays(30)]);

        $this->postJson('/api/guest-login')->assertOk();

        $this->assertModelMissing($antigo);
        $this->assertModelExists($usuarioComum);
        $this->assertDatabaseMissing('movie_sessions', ['user_id' => $antigo->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $antigo->id]);
    }

    public function test_visitante_nao_pode_editar_o_perfil(): void
    {
        $visitante = User::factory()->create(['is_guest' => true]);

        $this->actingAs($visitante, 'sanctum')
            ->putJson('/api/user/profile', ['name' => 'Hacker', 'email' => 'h@teste.com'])
            ->assertForbidden();
    }

    public function test_usuario_atualiza_o_proprio_perfil(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/profile', [
                'name' => 'Novo Nome',
                'email' => 'novo@teste.com',
                'password' => 'novasenha',
                'password_confirmation' => 'novasenha',
            ])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Novo Nome', 'email' => 'novo@teste.com']);
    }
}

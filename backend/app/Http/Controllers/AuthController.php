<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    // Tempo de vida dos tokens de acesso
    private const DIAS_VALIDADE_TOKEN = 7;

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Usuário registrado com sucesso!',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou senha incorretos.',
            ], 401);
        }

        $token = $this->emitirToken($user);

        return response()->json([
            'message' => 'Login efetuado com sucesso!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }

    /**
     * Login rápido e automático para Visitantes (Portfólio)
     */
    public function guestLogin()
    {
        $user = User::firstOrCreate(
            ['email' => 'visitante@cinematch.com'],
            [
                'name' => 'Visitante',
                'password' => Hash::make('visitante123')
            ]
        );

        // Limpa o histórico antigo toda vez que alguém clica no botão "Visitante"
        \App\Models\MovieSession::where('user_id', $user->id)->delete();

        $token = $this->emitirToken($user);

        return response()->json([
            'message' => 'Login de visitante efetuado com sucesso!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }

    /**
     * Atualiza os dados de perfil do usuário logado
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Bloqueia qualquer tentativa de edição no perfil de visitante (Portfólio)
        if ($user->email === 'visitante@cinematch.com') {
            return response()->json([
                'message' => 'O perfil de Visitante é bloqueado para edições.'
            ], 403);
        }

        // Validação dos dados enviados
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            // A senha é opcional. Se enviada, precisa ter confirmação (password_confirmation) e mínimo de 6 caracteres
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        // Atualiza nome e e-mail
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Se o usuário digitou uma nova senha, criptografa antes de salvar
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil atualizado com sucesso!',
            'user' => $user
        ]);
    }

    /**
     * Revoga o token usado na requisição atual
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout efetuado com sucesso!'
        ], 200);
    }

    /**
     * Retorna os dados do usuário atualmente logado
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], 200);
    }

    /**
     * Cria um token com prazo de validade e remove os tokens vencidos,
     * evitando que a tabela de tokens cresça indefinidamente
     */
    private function emitirToken(User $user): string
    {
        $limite = now()->subDays(self::DIAS_VALIDADE_TOKEN);

        PersonalAccessToken::where('expires_at', '<', now())
            ->orWhere(fn ($query) => $query->whereNull('expires_at')->where('created_at', '<', $limite))
            ->delete();

        return $user->createToken(
            'auth_token',
            ['*'],
            now()->addDays(self::DIAS_VALIDADE_TOKEN)
        )->plainTextToken;
    }
}

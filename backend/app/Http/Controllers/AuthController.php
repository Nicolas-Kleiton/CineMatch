<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request) {
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

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou senha incorretos.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'=> 'Login efetuado com sucesso!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }

    /**
     * Login rápido e automático para Visitantes (Portfólio)
     */
    public function guestLogin() {
        $user = User::firstOrCreate(
            ['email' => 'visitante@cinematch.com'],
            [
                'name' => 'Visitante',
                'password' => Hash::make('visitante123')
            ]
        );

        // Limpa o histórico antigo toda vez que alguém clica no botão "Visitante"
        \App\Models\MovieSession::where('user_id', $user->id)->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'=> 'Login de visitante efetuado com sucesso!',
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

    // Validaçãodos dados enviados
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => [
            'required',
            'string',
            'email',
            'max:255',
            Rule::unique('users')->ignore($user->id),
        ],
        // A senha é opcional. Se enviada, precisa ter confirmação (password_confirmation) e mínimo de 8 caracteres
        'password' => 'nullable|string|min:8|confirmed',
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
 * Retorna os dados do usuário atualmente logado
 */
public function me(Request $request)
{
    return response()->json([
        'user' => $request->user()
    ], 200);
}
}

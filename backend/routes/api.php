<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;

// Rotas públicas de autenticação: limite de 10 tentativas por minuto por IP (evita força bruta)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/guest-login', [AuthController::class, 'guestLogin']);
});

// Rotas autenticadas: limite de 60 requisições por minuto por usuário
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    
    // Catálogo e Busca de Filmes
    Route::get('/movies/popular', [MovieController::class, 'getPopular']);
    Route::get('/movies/search', [MovieController::class, 'search']);
    
    // Gerenciamento do Histórico de Sessões
    Route::post('/movie-sessions', [MovieController::class, 'store']);
    Route::get('/movie-sessions/history', [MovieController::class, 'history']);
    Route::put('/movie-sessions/{id}/evaluate', [MovieController::class, 'evaluate']);
    Route::delete('/movie-sessions/{id}', [MovieController::class, 'destroy']);

    // Rota para atualizar e ler o perfil
    Route::get('/user/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
});
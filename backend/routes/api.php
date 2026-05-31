<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;

Route::post("/register", [AuthController::class,"register"]);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    // Catálogo e Busca de Filmes
    Route::get('/movies/popular', [MovieController::class, 'getPopular']);
    Route::get('/movies/search', [MovieController::class, 'search']);
    
    // Gerenciamento do Histórico de Sessões
    Route::post('/movie-sessions', [MovieController::class, 'store']);
    Route::get('/movie-sessions/history', [MovieController::class, 'history']);
    
});
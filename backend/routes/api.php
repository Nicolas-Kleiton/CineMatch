<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;

Route::post("/register", [AuthController::class,"register"]);

Route::post('/login', [AuthController::class, 'login']);

Route::get('/movies/popular', [MovieController::class, 'getPopular']);

Route::get('/movies/search', [MovieController::class, 'search']);
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MovieController extends Controller
{
    public function getPopular()
    {
        $token = env('TMDB_BEARER_TOKEN');
        $baseUrl = env('TMDB_BASE_URL');

        $response = Http::withToken($token)
            ->get("{$baseUrl}/movie/popular", [
                'language' => 'pt-BR',
                'page' => 1
            ]);

            if ($response->successful()) {
                return response()->json($response->json()['results']);
            }

            return response()->json(['error' => 'Não foi possível buscar os filmes'], 500);
    }
}

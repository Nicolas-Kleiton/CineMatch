<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

use App\Models\MovieSession;

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

    public function search(Request $request)
    {
        $query = $request->query('query');
        
        if(!$query){
            return response()->json(['error'=> ''],404);
        }

        $token = env('TMDB_BEARER_TOKEN');
        $baseUrl = env('TMDB_BASE_URL');

        $response = Http::withToken($token)
            ->get("{$baseUrl}/search/movie", [
                'language'      => 'pt-BR',
                'query'         => $query,
                'page'          => 1,
                'include_adult' => false,
            ]);

            if ($response->successful()) {
                return response()->json($response->json()['results']);
            }

            return response()->json(['error'=> 'Não foi possível buscar os filmes'], 500);
    }

    /**
     * Salva uma nova sessão de filme sorteada e confirmada
    */
    public function store(Request $request)
    {
        // Valida os dados mínimos que o Angular precisa enviar do filme vencedor
        $validated = $request->validate([
            'tmdb_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'poster_path' => 'nullable|string|max:255'
        ]);

        $session = MovieSession::create([
        'user_id'     => Auth::id(), // Pega o ID do usuário logado no momento
        'tmdb_id'     => $validated['tmdb_id'],
        'title'       => $validated['title'],
        'poster_path' => $validated['poster_path'],
        'status'      => 'pendente'  // Nasce como pendente até ser assistido
    ]);

    return response()->json([
        'message' => 'Sessão de filme confirmada com sucesso!',
        'session' => $session
    ],201);

    }

    /**
     * Retorna o histórico de sessões do usuário logado
    */
    public function history()
    {
        $history = MovieSession::where('user_id', Auth::id())
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($history);
    }

    /**
     * Atualiza a sessão de filme com a nota e o comentário do grupo, marcando como assistida
    */
    public function evaluate(Request $request, $id)
    {
        // Valida as notas aceitando apenas o intervalo de 1 a 5 estrelas
        $validated = $request->validate([
            'rating'  => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Busca a sessão garantindo que ela pertença ao usuário logado (segurança extra)
        $session = MovieSession::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Atualiza os dados consolidando o encerramento da sessão
        $session->update([
            'status'  => 'assistido',
            'rating'  => $validated['rating'],
            'comment' => $validated['comment']
        ]);

        return response()->json([
            'message' => 'Sessão avaliada com sucesso!',
            'session' => $session
        ]);
    }
}

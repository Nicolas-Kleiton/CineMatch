<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieSession extends Model
{
    use HasFactory;

    // Define quais campos podem ser gravados diretamente via requisição
    protected $fillable = [
        'user_id', 
        'tmdb_id', 
        'title', 
        'poster_path', 
        'status', 
        'rating', 
        'comment'
    ];

    // Uma sessão de filme pertence a um único usuário
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

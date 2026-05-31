<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movie_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->unsignedBigInteger('tmdb_id');
            $table->string('title');
            $table->string('poster_path')->nullable();

            $table->enum('status', ['pendente', 'assistido'])->default('pendente');

            $table->tinyInteger('rating')->nullable();
            $table->text('comment')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_sessions');
    }
};

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\User;
use App\Models\MovieSession;

// Limpa o histórico do visitante a cada hora para evitar poluição do banco no portfólio
Schedule::call(function () {
    $visitante = User::where('email', 'visitante@cinematch.com')->first();
    
    if ($visitante) {
        MovieSession::where('user_id', $visitante->id)->delete();
    }
})->hourly();

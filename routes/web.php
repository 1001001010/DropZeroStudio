<?php

use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/toy/{code}', [ProfileController::class, 'profile'])->middleware('auth')->name('toy.profile');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

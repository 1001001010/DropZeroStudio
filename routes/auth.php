<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::controller(AuthenticatedSessionController::class)->group(function () {
    Route::get('/login', 'login')->name('login');

    Route::middleware('guest')->group(function () {
        Route::post('/login', 'store')->name('login.store');

        Route::prefix('auth')->group(function () {
            Route::post('/send-code', 'code')->name('auth.send-code');

            Route::prefix('registration')->name('auth.registration.')->group(function () {
                Route::post('/verify', 'verify')->name('verify');
                Route::post('/confirm', 'confirm')->name('confirm');
            });

            Route::prefix('login')->name('auth.login.')->group(function () {
                Route::post('/', 'toyLoginCode')->name('send-code');
                Route::post('/confirm', 'confirmToyLogin')->name('confirm');
            });
        });
    });
});
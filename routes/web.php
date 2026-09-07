<?php

use App\Http\Controllers\Admins\AdminController;
use App\Http\Controllers\DropController;
use App\Http\Controllers\SkinController;
use App\Http\Controllers\ToyController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/toy/{code}', [ProfileController::class, 'profile'])->middleware('auth')->name('toy.profile');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::controller(AdminController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(SkinController::class)->prefix('skins')->name('skins.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/{skin}/update', 'update')->name('update');
        Route::delete('/{skin}', 'destroy')->name('destroy');
        Route::post('/{skin}/restore', 'restore')->withTrashed()->name('restore');
    });

    Route::controller(DropController::class)->prefix('drops')->name('drops.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{drop}', 'update')->name('update');
        Route::delete('/{drop}', 'destroy')->name('destroy');

    });

    Route::controller(ToyController::class)->prefix('toys')->name('toys.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{toy}', 'update')->name('update');
        Route::delete('/{toy}', 'destroy')->name('destroy');
    });

});

require __DIR__ . '/settings.php';

require __DIR__ . '/auth.php';
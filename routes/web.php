<?php

use App\Http\Controllers\Admins\AdminController;
use App\Http\Controllers\DropController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\Admin\Cdek\{CdekLocationController, CdekCalculatorController};
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Admin\Cdek\CdekOfficeImageController;
use App\Http\Controllers\SkinController;
use App\Http\Controllers\Admin\{OrderController, OrderPaymentController};
use App\Http\Controllers\ToyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Публичные маршруты
|--------------------------------------------------------------------------
*/

// Главная страница.
Route::get('/', [ToyController::class, 'welcome'])
    ->name('home');

// Юридические документы.
Route::controller(LegalController::class)
    ->prefix('legal')
    ->name('legal.')
    ->group(function (): void {
        Route::get('/privacy', 'privacy')->name('privacy');

        Route::get('/personal-data-consent', 'personalDataConsent')
            ->name('personal-data-consent');

        Route::get('/terms', 'terms')->name('terms');

        Route::get('/offer', 'offer')->name('offer');
    });

// Личный профиль владельца фигурки.
Route::get('/toy/{code}', [ProfileController::class, 'profile'])
    ->middleware('auth')
    ->name('toy.profile');

/*
|--------------------------------------------------------------------------
| Административные маршруты
|--------------------------------------------------------------------------
|
| Все маршруты этой группы доступны только авторизованным администраторам.
| Middleware admin должен самостоятельно проверять поле is_admin.
|
*/

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {

        // Главная страница административной панели.
        Route::get('/', [AdminController::class, 'index'])
            ->name('index');


        /*
 |--------------------------------------------------------------------------
 | Управление заказами
 |--------------------------------------------------------------------------
 */
        Route::controller(OrderController::class)
            ->prefix('orders')
            ->name('orders.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');

                Route::get('/{order}', 'show')->name('show');

                // Управление оплатой заказа.
                Route::post('/{order}/payment', 'storePayment')
                    ->name('payments.store');

                Route::put('/{order}/payment', 'updatePayment')
                    ->name('payments.update');
            });

        Route::get(
            '/orders/{order}/payment/receipt',
            [OrderController::class, 'downloadPaymentReceipt'],
        )->name('orders.payments.receipt');

        Route::post('/{order}/payment', [
            OrderPaymentController::class,
            'storePayment',
        ])->name('payments.store');

        Route::put('/{order}/payment', [
            OrderPaymentController::class,
            'updatePayment',
        ])->name('payments.update');


        /*
        |--------------------------------------------------------------------------
        | Управление юридическими документами
        |--------------------------------------------------------------------------
        */

        Route::controller(LegalController::class)
            ->prefix('legal')
            ->name('legal.')
            ->group(function (): void {
                Route::get('/', 'index')->name('index');

                Route::post('/{document}/versions', 'storeVersion')
                    ->name('versions.store');

                Route::put('/{document}/versions/{version}', 'updateVersion')
                    ->name('versions.update');

                Route::post('/{document}/versions/{version}/publish', 'publishVersion')
                    ->name('versions.publish');
            });

        Route::prefix('cdek')
            ->name('cdek.')
            ->group(function () {
                Route::get('/cities', [
                    CdekLocationController::class,
                    'cities',
                ])->name('cities');

                Route::get('/pickup-points', [
                    CdekLocationController::class,
                    'pickupPoints',
                ])->name('pickup-points');
            });

        Route::get(
            '/cdek/office-images/{uuid}',
            [CdekOfficeImageController::class, 'show']
        )
            ->whereUuid('uuid')
            ->name('cdek.office-image');
        /*
        |--------------------------------------------------------------------------
        | Управление скинами
        |--------------------------------------------------------------------------
        */

        Route::controller(SkinController::class)
            ->prefix('skins')
            ->name('skins.')
            ->group(function (): void {
                Route::get('/', 'index')->name('index');

                Route::post('/', 'store')->name('store');

                Route::put('/{skin}', 'update')->name('update');

                Route::delete('/{skin}', 'destroy')->name('destroy');

                // Восстановление мягко удалённого скина.
                Route::post('/{skin}/restore', 'restore')
                    ->withTrashed()
                    ->name('restore');
            });

        /*
        |--------------------------------------------------------------------------
        | Управление коллекциями (Drops)
        |--------------------------------------------------------------------------
        */

        Route::controller(DropController::class)
            ->prefix('drops')
            ->name('drops.')
            ->group(function (): void {
                Route::get('/', 'index')->name('index');

                Route::post('/', 'store')->name('store');

                Route::put('/{drop}', 'update')->name('update');

                Route::delete('/{drop}', 'destroy')->name('destroy');
            });

        // Расчёт стоимости доставки СДЭК.
        Route::post('/cdek/calculate', [
            CdekCalculatorController::class,
            'calculate',
        ])->name('cdek.calculate');

        /*
        |--------------------------------------------------------------------------
        | Управление фигурками (Toys)
        |--------------------------------------------------------------------------
        */

        Route::controller(ToyController::class)
            ->prefix('toys')
            ->name('toys.')
            ->group(function (): void {
                Route::get('/', 'index')->name('index');

                Route::delete('/{toy}', 'destroy')->name('destroy');

                // Восстановление мягко удалённой фигурки.
                Route::post('/{toy}/restore', 'restore')
                    ->withTrashed()
                    ->name('restore');
            });
    });

/*
|--------------------------------------------------------------------------
| Дополнительные маршруты
|--------------------------------------------------------------------------
*/

// Настройки профиля и авторизация.
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

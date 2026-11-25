<?php

use App\Http\Controllers\Webhooks\CdekWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/cdek', CdekWebhookController::class)
    ->name('webhooks.cdek');
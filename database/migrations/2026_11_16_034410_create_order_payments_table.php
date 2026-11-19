<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание таблицы платежей.
     */
    public function up(): void
    {
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();

            /*
             * Связь с заказом.
             *
             * У заказа может быть несколько платежей:
             * - первоначальная оплата;
             * - повторная оплата;
             * - частичная оплата;
             * - возврат.
             */
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            /*
             * Сумма и валюта платежа.
             */
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('RUB');

            /*
             * Статус платежа.
             *
             * pending
             * paid
             * failed
             * refunded
             * partially_refunded
             */
            $table->string('status', 32)->default('pending');

            /*
             * Способ оплаты.
             *
             * Например:
             * telegram
             * bank_transfer
             * card
             * cash
             * crypto
             */
            $table->string('method', 64)->nullable();

            /*
             * Платёжный провайдер.
             *
             * Например:
             * manual
             * telegram_payments
             * yookassa
             * stripe
             */
            $table->string('provider', 64)->nullable();

            /*
             * Идентификатор транзакции
             * во внешней платёжной системе.
             */
            $table->string('transaction_id', 255)->nullable()->unique();

            /*
             * Даты проведения платежа и возврата.
             */
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            /*
             * Дополнительные данные провайдера.
             *
             * Сюда можно сохранить:
             * - ответ API;
             * - идентификатор платежа;
             * - данные проверки;
             * - дополнительные параметры.
             */
            $table->json('metadata')->nullable();

            $table->timestamps();

            /*
             * Индексы.
             */
            $table->index('order_id');
            $table->index('status');
            $table->index('method');
            $table->index('provider');
            $table->index('paid_at');
        });
    }

    /**
     * Удаление таблицы платежей.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};
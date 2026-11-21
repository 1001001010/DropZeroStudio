<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание таблицы платежей.
     *
     * Один заказ — один платёж.
     */
    public function up(): void
    {
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();

            // Связь с заказом. Один заказ может иметь только один платёж.
            $table->foreignId('order_id')
                ->unique()
                ->constrained('orders')
                ->cascadeOnDelete();

            // Сумма и валюта платежа.
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('RUB');

            // Статус платежа.
            $table->string('status', 32)->default('pending');

            // Способ оплаты.
            // Например: bank_transfer, card, cash, crypto.
            $table->string('method', 64)->nullable();

            // Платёжный провайдер.
            // Например: manual, yookassa, stripe.
            $table->string('provider', 64)->nullable();

            // ID транзакции, если имеется.
            $table->string('transaction_id', 255)->nullable();

            // Даты проведения платежа и возврата.
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            // Чек перевода.
            $table->string('receipt_path')->nullable();
            $table->string('receipt_name')->nullable();
            $table->string('receipt_mime', 100)->nullable();
            $table->unsignedBigInteger('receipt_size')->nullable();

            // Администратор, подтвердивший оплату.
            $table->foreignId('confirmed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Дополнительные данные платежа.
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Индексы.
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

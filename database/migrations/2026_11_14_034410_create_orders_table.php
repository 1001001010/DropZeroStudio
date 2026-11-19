<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание основной таблицы заказов.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            /*
             * Уникальный номер заказа.
             *
             * Пример:
             * DZ-2026-000001
             */
            $table->string('number', 32)->unique();

            /*
             * Информация о покупателе.
             *
             * Покупатель может не иметь аккаунта на сайте.
             * Поэтому все данные хранятся непосредственно в заказе.
             */
            $table->string('customer_name', 255);

            $table->unsignedBigInteger('telegram_id')->nullable();
            $table->string('telegram_username', 64)->nullable();
            $table->string('telegram_url', 255)->nullable();

            $table->string('email', 255)->nullable();
            $table->string('phone', 32)->nullable();

            /*
             * Статус заказа.
             *
             * pending      — ожидает обработки
             * accepted     — принят
             * processing   — собирается
             * shipped      — отправлен
             * completed    — завершён
             * cancelled    — отменён
             */
            $table->string('status', 32)->default('pending');

            /*
             * Валюта заказа.
             *
             * Например:
             * RUB, EUR, USD
             */
            $table->char('currency', 3)->default('RUB');

            /*
             * Финансовые данные заказа.
             *
             * Все значения сохраняются в момент создания заказа,
             * чтобы изменение цены товара в каталоге не влияло
             * на уже существующие заказы.
             */
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('delivery_price', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            /*
             * Комментарий покупателя.
             */
            $table->text('comment')->nullable();

            /*
             * Внутренняя заметка администратора.
             * Не должна отображаться покупателю.
             */
            $table->text('admin_note')->nullable();

            /*
             * Администратор, создавший заказ.
             *
             * При удалении пользователя заказ сохраняется.
             */
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Даты жизненного цикла заказа.
             */
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            /*
             * Soft delete позволяет скрывать заказ,
             * не уничтожая его историю.
             */
            $table->timestamps();
            $table->softDeletes();

            /*
             * Индексы для админ-панели.
             */
            $table->index('status');
            $table->index('telegram_id');
            $table->index('telegram_username');
            $table->index('phone');
            $table->index('created_at');
            $table->index('paid_at');
        });
    }

    /**
     * Удаление таблицы заказов.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
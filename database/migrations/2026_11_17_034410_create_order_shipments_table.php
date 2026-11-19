<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание таблицы доставок.
     */
    public function up(): void
    {
        Schema::create('order_shipments', function (Blueprint $table) {
            $table->id();

            /*
             * Связь с заказом.
             *
             * Один заказ может иметь несколько отправлений.
             */
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            /*
             * Служба доставки.
             *
             * Например:
             * cdek
             * russian_post
             * other
             */
            $table->string('provider', 64)->nullable();

            /*
             * Идентификатор заказа в системе доставки.
             */
            $table->string('provider_order_id', 255)->nullable();

            /*
             * Трек-номер.
             */
            $table->string('tracking_number', 255)->nullable();

            /*
             * Статус доставки.
             *
             * not_shipped
             * preparing
             * in_transit
             * delivered
             * returned
             */
            $table->string('status', 32)->default('not_shipped');

            /*
             * Данные получателя.
             *
             * Сохраняются непосредственно в отправлении,
             * чтобы при изменении контактных данных
             * покупателя история доставки не менялась.
             */
            $table->string('recipient_name', 255)->nullable();
            $table->string('phone', 32)->nullable();

            /*
             * Адрес доставки.
             */
            $table->string('country', 100)->nullable();
            $table->string('city', 150)->nullable();
            $table->string('postal_code', 32)->nullable();
            $table->text('address')->nullable();

            /*
             * Дополнительные данные службы доставки.
             *
             * Например:
             * - ID пункта выдачи;
             * - параметры тарифа;
             * - данные API;
             * - информация о посылке;
             * - история статусов от CDEK.
             */
            $table->json('shipping_data')->nullable();

            /*
             * Даты отправления и получения.
             */
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->timestamps();

            /*
             * Индексы.
             */
            $table->index('order_id');
            $table->index('provider');
            $table->index('tracking_number');
            $table->index('status');
            $table->index('shipped_at');
            $table->index('delivered_at');
        });
    }

    /**
     * Удаление таблицы доставок.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_shipments');
    }
};

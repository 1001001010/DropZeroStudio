<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Добавляет поля, необходимые для оформления отправлений СДЭК.
     */
    public function up(): void
    {
        Schema::table('order_shipments', function (Blueprint $table) {
            // Города отправления и получения.
            $table->unsignedInteger('from_city_code')->nullable();
            $table->unsignedInteger('to_city_code')->nullable();

            $table->string('from_city', 150)->nullable();
            $table->string('to_city', 150)->nullable();

            // Способ доставки: до двери или до пункта выдачи.
            $table->string('delivery_mode', 32)->nullable();

            // Выбранный тариф СДЭК.
            $table->unsignedInteger('tariff_code')->nullable();
            $table->string('tariff_name', 255)->nullable();

            // Пункт выдачи.
            $table->string('pickup_point_code', 64)->nullable();
            $table->text('pickup_point_address')->nullable();

            // Параметры посылки.
            // Вес хранится в граммах, размеры — в сантиметрах.
            $table->unsignedInteger('weight')->nullable();
            $table->unsignedInteger('length')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();

            // Стоимость доставки.
            $table->decimal('delivery_cost', 12, 2)->nullable();
            $table->char('currency', 3)->default('RUB');

            // Путь к сохранённой накладной.
            $table->string('label_path')->nullable();
        });
    }

    /**
     * Удаляет добавленные поля.
     */
    public function down(): void
    {
        Schema::table('order_shipments', function (Blueprint $table) {
            $table->dropColumn([
                'from_city_code',
                'to_city_code',
                'from_city',
                'to_city',
                'delivery_mode',
                'tariff_code',
                'tariff_name',
                'pickup_point_code',
                'pickup_point_address',
                'weight',
                'length',
                'width',
                'height',
                'delivery_cost',
                'currency',
                'label_path',
            ]);
        });
    }
};

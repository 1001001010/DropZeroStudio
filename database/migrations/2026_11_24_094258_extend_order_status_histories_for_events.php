<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Расширяем историю заказа для событий оплаты и доставки.
     */
    public function up(): void
    {
        Schema::table('order_status_histories', function (Blueprint $table) {
            // Тип события: изменение статуса, оплата, доставка и т. д.
            $table->string('event_type', 32)
                ->default('order_status')
                ->after('order_id');

            // Заголовок события, например «Отправление передано перевозчику».
            $table->string('title')->nullable()->after('event_type');

            // Для событий, не связанных со статусом заказа,
            // новый статус не требуется.
            $table->string('new_status', 32)->nullable()->change();
        });
    }

    /**
     * Возвращаем прежнюю структуру таблицы.
     */
    public function down(): void
    {
        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->string('new_status', 32)->nullable(false)->change();

            $table->dropColumn([
                'event_type',
                'title',
            ]);
        });
    }
};
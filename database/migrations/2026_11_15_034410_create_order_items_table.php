<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание таблицы товаров заказа.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            /*
             * Заказ, к которому относится позиция.
             *
             * При удалении заказа его позиции удаляются.
             */
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            /*
             * Связи с каталогом.
             *
             * Эти поля nullable, поскольку каталог может
             * изменяться или товары могут быть удалены.
             *
             * Историческая информация о товаре сохраняется
             * ниже в snapshot-полях.
             */
            $table->foreignId('drop_id')
                ->nullable()
                ->constrained('drops')
                ->nullOnDelete();

            $table->foreignId('skin_id')
                ->nullable()
                ->constrained('skins')
                ->nullOnDelete();

            $table->foreignId('toy_id')
                ->nullable()
                ->constrained('toys')
                ->nullOnDelete();

            /*
             * Снимок информации о товаре на момент заказа.
             *
             * Не используем только связи с каталогом:
             * название, цена и код должны сохраняться
             * даже после изменения или удаления товара.
             */
            $table->string('product_name', 255);
            $table->string('drop_name', 255)->nullable();
            $table->string('skin_name', 255)->nullable();
            $table->string('product_code', 64)->nullable();

            /*
             * Количество и цена.
             */
            $table->unsignedInteger('quantity')->default(1);

            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);

            /*
             * Дополнительные характеристики позиции.
             *
             * Например:
             * - индивидуальная комплектация;
             * - параметры фигурки;
             * - дополнительные опции.
             */
            $table->json('metadata')->nullable();

            $table->timestamps();

            /*
             * Индексы.
             */
            $table->index('order_id');
            $table->index('drop_id');
            $table->index('skin_id');
            $table->index('toy_id');
            $table->index('product_code');
        });
    }

    /**
     * Удаление таблицы товаров заказа.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};

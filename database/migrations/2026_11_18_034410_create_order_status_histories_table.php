<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание истории изменения статусов заказов.
     */
    public function up(): void
    {
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();

            /*
             * Заказ, к которому относится событие.
             *
             * История удаляется вместе с заказом.
             */
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            /*
             * Предыдущий статус.
             *
             * Nullable, поскольку первое событие
             * не имеет предыдущего статуса.
             */
            $table->string('old_status', 32)->nullable();

            /*
             * Новый статус.
             */
            $table->string('new_status', 32);

            /*
             * Комментарий к изменению.
             *
             * Например:
             * "Заказ передан в CDEK"
             * "Покупатель запросил отмену"
             */
            $table->text('comment')->nullable();

            /*
             * Пользователь, изменивший статус.
             *
             * Nullable, поскольку статус может меняться
             * автоматически через API или систему.
             */
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Здесь намеренно нет updated_at.
             *
             * События истории не редактируются.
             * Они создаются один раз и сохраняются.
             */
            $table->timestamp('created_at')->useCurrent();

            /*
             * Индексы.
             */
            $table->index('order_id');
            $table->index('new_status');
            $table->index('created_at');
            $table->index(['order_id', 'created_at']);
        });
    }

    /**
     * Удаление таблицы истории.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
    }
};
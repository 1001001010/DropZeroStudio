<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Создание таблицы файлов заказов.
     */
    public function up(): void
    {
        Schema::create('order_attachments', function (Blueprint $table) {
            $table->id();

            /*
             * Заказ, к которому относится файл.
             */
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            /*
             * Файл может относиться к конкретному платежу.
             *
             * Например:
             * - чек первоначальной оплаты;
             * - документ о возврате.
             */
            $table->foreignId('order_payment_id')
                ->nullable()
                ->constrained('order_payments')
                ->cascadeOnDelete();

            /*
             * Пользователь, загрузивший файл.
             */
            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Диск Laravel Storage.
             *
             * Например:
             * local
             * private
             * s3
             */
            $table->string('disk', 64)->default('local');

            /*
             * Путь к файлу на диске.
             *
             * Например:
             * orders/2026/DZ-2026-000001/receipt.pdf
             */
            $table->string('path', 1024);

            /*
             * Оригинальное название файла.
             */
            $table->string('original_name', 255);

            /*
             * MIME-тип файла.
             *
             * Например:
             * application/pdf
             * image/jpeg
             * image/png
             */
            $table->string('mime_type', 127)->nullable();

            /*
             * Размер файла в байтах.
             */
            $table->unsignedBigInteger('size')->nullable();

            /*
             * Тип вложения.
             *
             * payment_receipt
             * shipping_document
             * product_photo
             * other
             */
            $table->string('type', 64)->default('other');

            /*
             * SHA-256 хеш файла.
             *
             * Может использоваться для проверки целостности
             * и обнаружения повторных загрузок.
             */
            $table->char('checksum', 64)->nullable();

            /*
             * Дополнительная информация.
             */
            $table->json('metadata')->nullable();

            /*
             * Для файлов достаточно created_at.
             * Историю загрузки не редактируем.
             */
            $table->timestamp('created_at')->useCurrent();

            /*
             * Индексы.
             */
            $table->index('order_id');
            $table->index('order_payment_id');
            $table->index('uploaded_by');
            $table->index('type');
            $table->index('checksum');
        });
    }

    /**
     * Удаление таблицы файлов.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_attachments');
    }
};

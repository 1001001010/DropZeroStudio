<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_consents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('document_version_id')
                ->constrained('legal_document_versions')
                ->restrictOnDelete();

            // Заказ, к которому относится акцепт оферты.
            // Внешний ключ добавим, когда определим структуру orders.
            $table->unsignedBigInteger('order_id')->nullable();

            // Для согласия, полученного до создания аккаунта.
            $table->uuid('registration_uuid')->nullable();

            // Например: registration, checkout.
            $table->string('source', 30)->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('accepted_at');

            // Используется, если пользователь отозвал согласие.
            $table->timestamp('revoked_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'accepted_at']);
            $table->index(['document_version_id', 'accepted_at']);
            $table->index('order_id');
            $table->index('registration_uuid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_consents');
    }
};
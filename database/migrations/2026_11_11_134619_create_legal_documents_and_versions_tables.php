<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('route')->unique();

            $table->unsignedBigInteger('current_version_id')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        Schema::create('legal_document_versions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('document_id')
                ->constrained('legal_documents')
                ->cascadeOnDelete();

            $table->string('version', 20);
            $table->longText('content');

            $table->char('content_hash', 64);

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('status', 20)->default('draft');

            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            $table->unique(
                ['document_id', 'version'],
                'legal_document_version_unique'
            );

            $table->index(['document_id', 'status']);
        });

        Schema::table('legal_documents', function (Blueprint $table) {
            $table->foreign('current_version_id')
                ->references('id')
                ->on('legal_document_versions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('legal_documents', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });

        Schema::dropIfExists('legal_document_versions');
        Schema::dropIfExists('legal_documents');
    }
};

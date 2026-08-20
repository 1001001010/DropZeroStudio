<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('drops', function (Blueprint $table) {
            $table->id();

            $table->foreignId('skin_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->unsignedInteger('edition_size');

            $table->decimal('price', 10, 2);

            $table->date('production_started_at')->nullable();
            $table->date('production_completed_at')->nullable();

            $table->date('sale_started_at')->nullable();
            $table->date('sale_ended_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drops');
    }
};
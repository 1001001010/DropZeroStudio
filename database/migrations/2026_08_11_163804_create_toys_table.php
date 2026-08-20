<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\SoftDeletes;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('toys', function (Blueprint $table) {
            $table->id();

            $table->foreignId('drop_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('code')->unique();

            $table->string('secret_hash');

            $table->unsignedInteger('number');

            $table->enum('status', [
                'produced', // изготовлена
                'available', // доступна для покупки
                'sold', // продана
            ])->default('produced');

            $table->timestamp('claimed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toys');
    }
};

<?php

namespace Database\Seeders;

use App\Models\Drop;
use App\Models\Skin;
use App\Models\Toy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Создаём скин
        $skin = Skin::create([
            'name' => 'Test Skin',
            'slug' => 'test-skin',
            'description' => 'Тестовый скин для разработки.',
            'model_path' => '/models/Model.glb',
            'primary_color' => '#AA141E',
            'secondary_color' => '#050505',
            'accent_color' => '#FFFFFF',
            'preview_image' => null,
            'is_active' => true,
        ]);

        // Создаём дроп
        $drop = Drop::create([
            'skin_id' => $skin->id,
            'name' => 'Test Drop',
            'edition_size' => 100,
            'price' => 1990.00,

            'production_started_at' => now()->toDateString(),
            'production_completed_at' => null,

            'sale_started_at' => now()->toDateString(),
            'sale_ended_at' => null,
        ]);

        // Создаём игрушку
        Toy::create([
            'drop_id' => $drop->id,
            'user_id' => null,

            'code' => 'XE-123',

            // Сам секрет: TEST-SECRET
            // В БД хранится только его hash
            'secret_hash' => Hash::make('TEST-SECRET'),

            'number' => 1,
            'status' => 'available',
            'claimed_at' => null,
        ]);
    }
}
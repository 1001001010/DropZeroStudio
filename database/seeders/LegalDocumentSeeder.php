<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

class LegalDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'title' => 'Политика конфиденциальности',
                'slug' => 'privacy',
                'route' => '/legal/privacy',
            ],
            [
                'title' => 'Согласие на обработку персональных данных',
                'slug' => 'personal-data-consent',
                'route' => '/legal/personal-data-consent',
            ],
            [
                'title' => 'Пользовательское соглашение',
                'slug' => 'terms',
                'route' => '/legal/terms',
            ],
            [
                'title' => 'Публичная оферта',
                'slug' => 'offer',
                'route' => '/legal/offer',
            ],
        ];

        foreach ($documents as $document) {
            LegalDocument::firstOrCreate(
                ['slug' => $document['slug']],
                $document
            );
        }
    }
}

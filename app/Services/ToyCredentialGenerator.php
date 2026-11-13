<?php

namespace App\Services;

use App\Models\Toy;

class ToyCredentialGenerator
{
    private const SECRET_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    /**
     * Генерирует уникальный код формата XX-000.
     */
    public function generateCode(): string
    {
        do {
            $letters = chr(random_int(65, 90))
                . chr(random_int(65, 90));

            $numbers = str_pad(
                (string) random_int(0, 999),
                3,
                '0',
                STR_PAD_LEFT
            );

            $code = "{$letters}-{$numbers}";

        } while (
            Toy::withTrashed()->where('code', $code)->exists()
        );

        return $code;
    }

    /**
     * Генерирует секрет формата XXXX-XXXX-XXXX.
     */
    public function generateSecret(): string
    {
        $groups = [];

        for ($group = 0; $group < 3; $group++) {
            $part = '';

            for ($i = 0; $i < 4; $i++) {
                $index = random_int(
                    0,
                    strlen(self::SECRET_ALPHABET) - 1
                );

                $part .= self::SECRET_ALPHABET[$index];
            }

            $groups[] = $part;
        }

        return implode('-', $groups);
    }
}
<?php

namespace App\Services\Orders;

use Illuminate\Support\Str;
use InvalidArgumentException;

class OrderNumberService
{
    /**
     * Создать временный уникальный номер.
     *
     * Он используется только внутри транзакции при создании
     * заказа и никогда не должен попасть в готовый ответ.
     */
    public function temporary(): string
    {
        return 'TMP-' . Str::upper(Str::random(20));
    }

    /**
     * Сформировать постоянный номер заказа на основании его ID.
     *
     * Формат: DZ-ГОД-НОМЕР
     *
     * Пример: DZ-2026-000001
     *
     * @param int $orderId Первичный ключ заказа.
     * @param string|null $year Год создания заказа.
     */
    public function generate(int $orderId, ?string $year = null): string
    {
        if ($orderId < 1) {
            throw new InvalidArgumentException(
                'ID заказа должен быть положительным числом.'
            );
        }

        $year ??= now()->format('Y');

        if (!preg_match('/^\d{4}$/', $year)) {
            throw new InvalidArgumentException(
                'Год должен содержать ровно четыре цифры.'
            );
        }

        return sprintf(
            'DZ-%s-%06d',
            $year,
            $orderId,
        );
    }
}
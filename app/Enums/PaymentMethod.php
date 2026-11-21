<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Manual = 'manual';
    case BankTransfer = 'bank_transfer';
    case Card = 'card';
    case Cash = 'cash';
    case Crypto = 'crypto';

    /**
     * Возвращает название способа оплаты.
     */
    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Вручную',
            self::BankTransfer => 'Банковский перевод',
            self::Card => 'Банковская карта',
            self::Cash => 'Наличные',
            self::Crypto => 'Криптовалюта',
        };
    }
}

<?php

namespace App\Enums;

enum PaymentStatus: string
{
    /**
     * Платёж ожидает подтверждения.
     */
    case Pending = 'pending';

    /**
     * Оплата успешно проведена.
     */
    case Paid = 'paid';

    /**
     * Платёж завершился ошибкой.
     */
    case Failed = 'failed';

    /**
     * Средства полностью возвращены.
     */
    case Refunded = 'refunded';

    /**
     * Выполнен частичный возврат средств.
     */
    case PartiallyRefunded = 'partially_refunded';

    /**
     * Человекочитаемое название статуса.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает оплаты',
            self::Paid => 'Оплачен',
            self::Failed => 'Ошибка оплаты',
            self::Refunded => 'Возвращён',
            self::PartiallyRefunded => 'Частичный возврат',
        };
    }

    /**
     * Семантический цвет статуса.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Paid => 'success',
            self::Failed => 'destructive',
            self::Refunded => 'secondary',
            self::PartiallyRefunded => 'info',
        };
    }

    /**
     * Проверить, подтверждена ли оплата.
     */
    public function isSuccessful(): bool
    {
        return $this === self::Paid
            || $this === self::PartiallyRefunded;
    }

    /**
     * Проверить, допускает ли статус возврат.
     */
    public function canBeRefunded(): bool
    {
        return $this === self::Paid
            || $this === self::PartiallyRefunded;
    }
}

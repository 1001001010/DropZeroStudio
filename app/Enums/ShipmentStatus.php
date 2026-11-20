<?php

namespace App\Enums;

enum ShipmentStatus: string
{
    /**
     * Отправление ещё не создано.
     */
    case NotShipped = 'not_shipped';

    /**
     * Заказ готовится к отправке.
     */
    case Preparing = 'preparing';

    /**
     * Отправление находится в пути.
     */
    case InTransit = 'in_transit';

    /**
     * Покупатель получил отправление.
     */
    case Delivered = 'delivered';

    /**
     * Отправление возвращено отправителю.
     */
    case Returned = 'returned';

    /**
     * Человекочитаемое название статуса.
     */
    public function label(): string
    {
        return match ($this) {
            self::NotShipped => 'Не отправлен',
            self::Preparing => 'Подготовка',
            self::InTransit => 'В пути',
            self::Delivered => 'Доставлен',
            self::Returned => 'Возвращён',
        };
    }

    /**
     * Семантический цвет статуса.
     */
    public function color(): string
    {
        return match ($this) {
            self::NotShipped => 'secondary',
            self::Preparing => 'warning',
            self::InTransit => 'info',
            self::Delivered => 'success',
            self::Returned => 'destructive',
        };
    }

    /**
     * Проверить, завершена ли доставка.
     */
    public function isFinal(): bool
    {
        return $this === self::Delivered
            || $this === self::Returned;
    }
}

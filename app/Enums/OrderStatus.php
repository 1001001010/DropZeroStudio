<?php

namespace App\Enums;

enum OrderStatus: string
{
    /**
     * Заказ создан и ожидает обработки.
     */
    case Pending = 'pending';

    /**
     * Заказ принят администратором.
     */
    case Accepted = 'accepted';

    /**
     * Заказ находится в процессе сборки.
     */
    case Processing = 'processing';

    /**
     * Заказ передан службе доставки.
     */
    case Shipped = 'shipped';

    /**
     * Заказ успешно завершён.
     */
    case Completed = 'completed';

    /**
     * Заказ отменён.
     */
    case Cancelled = 'cancelled';

    /**
     * Получить человекочитаемое название статуса.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает обработки',
            self::Accepted => 'Принят',
            self::Processing => 'Собирается',
            self::Shipped => 'Отправлен',
            self::Completed => 'Завершён',
            self::Cancelled => 'Отменён',
        };
    }

    /**
     * Получить цвет статуса для интерфейса.
     *
     * Возвращается семантическое название цвета,
     * а не конкретный CSS-класс.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Accepted => 'info',
            self::Processing => 'secondary',
            self::Shipped => 'default',
            self::Completed => 'success',
            self::Cancelled => 'destructive',
        };
    }

    /**
     * Проверить, является ли заказ конечным.
     */
    public function isFinal(): bool
    {
        return match ($this) {
            self::Completed,
            self::Cancelled => true,

            default => false,
        };
    }

    /**
     * Получить допустимые следующие статусы.
     *
     * Это базовая схема переходов.
     * Дополнительные бизнес-проверки будут в сервисе.
     *
     * Например, отправить неоплаченный заказ нельзя,
     * даже если переход в Shipped разрешён здесь.
     *
     * @return array<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [
                self::Accepted,
                self::Cancelled,
            ],

            self::Accepted => [
                self::Processing,
                self::Cancelled,
            ],

            self::Processing => [
                self::Shipped,
                self::Cancelled,
            ],

            self::Shipped => [
                self::Completed,
            ],

            self::Completed,
            self::Cancelled => [],
        };
    }

    /**
     * Проверить возможность перехода в другой статус.
     */
    public function canTransitionTo(self $status): bool
    {
        return in_array(
            $status,
            $this->allowedTransitions(),
            true,
        );
    }
}
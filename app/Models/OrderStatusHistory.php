<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    /**
     * Отключаем updated_at.
     *
     * Исторические события неизменяемы.
     */
    public const UPDATED_AT = null;

    /**
     * Поля, доступные для массового заполнения.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'event_type',
        'title',
        'old_status',
        'new_status',
        'comment',
        'changed_by',
        'created_at',
    ];
    /**
     * Преобразование типов атрибутов.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_status' => OrderStatus::class,
            'new_status' => OrderStatus::class,
            'created_at' => 'datetime',
        ];
    }

    /**
     * Заказ, к которому относится событие.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Пользователь, изменивший статус.
     *
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
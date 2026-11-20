<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPayment extends Model
{
    /**
     * Поля, доступные для массового заполнения.
     *
     * @var list<string>
     */
    protected $fillable = [
        'amount',
        'currency',
        'status',
        'method',
        'provider',
        'transaction_id',
        'paid_at',
        'refunded_at',
        'metadata',
    ];

    /**
     * Преобразование типов атрибутов.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',

            'status' => PaymentStatus::class,
            'method' => PaymentMethod::class,

            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',

            'metadata' => 'array',
        ];
    }

    /**
     * Заказ, к которому относится платёж.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Файлы, связанные с этим платежом.
     *
     * @return HasMany<OrderAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(
            OrderAttachment::class,
            'order_payment_id',
        );
    }
}
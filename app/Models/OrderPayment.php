<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


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

        // Чек банковского перевода.
        'receipt_path',
        'receipt_name',
        'receipt_mime',
        'receipt_size',

        // Администратор, подтвердивший оплату.
        'confirmed_by',

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

            'receipt_size' => 'integer',

            'metadata' => 'array',
        ];
    }

    /**
     * Заказ, к которому относится платёж.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Администратор, подтвердивший оплату.
     */
    public function confirmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * Файлы, прикреплённые к платежу.
     *
     * @return HasMany<OrderAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(OrderAttachment::class);
    }
}

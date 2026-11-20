<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    /**
     * Поля, доступные для массового заполнения.
     *
     * Номер заказа, статусы и финансовые значения
     * будем устанавливать через сервисы, а не напрямую
     * из пользовательского запроса.
     *
     * @var list<string>
     */
    protected $fillable = [
        'customer_name',
        'telegram_id',
        'telegram_username',
        'telegram_url',
        'email',
        'phone',
        'currency',
        'comment',
        'admin_note',
        'created_by',
        'number'
    ];

    /**
     * Преобразование типов атрибутов.
     *
     * Денежные значения остаются decimal-строками,
     * чтобы избежать ошибок точности float.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,

            'telegram_id' => 'integer',

            'subtotal' => 'decimal:2',
            'delivery_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',

            'paid_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Товары, входящие в заказ.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Платежи заказа.
     *
     * @return HasMany<OrderPayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    /**
     * Отправления заказа.
     *
     * @return HasMany<OrderShipment, $this>
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(OrderShipment::class);
    }

    /**
     * История изменения статусов.
     *
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function history(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)
            ->orderByDesc('created_at');
    }

    /**
     * Файлы, прикреплённые к заказу.
     *
     * @return HasMany<OrderAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(OrderAttachment::class);
    }

    /**
     * Администратор, создавший заказ.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Проверить, оплачен ли заказ.
     *
     * Учитываются успешные платежи и частичные возвраты.
     * Проверка полной оплаты относительно суммы заказа
     * будет выполняться отдельным методом сервиса.
     */
    public function hasSuccessfulPayment(): bool
    {
        return $this->payments()
            ->whereIn('status', ['paid', 'partially_refunded'])
            ->exists();
    }
}

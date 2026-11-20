<?php

namespace App\Models;

use App\Enums\AttachmentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAttachment extends Model
{
    /**
     * Отключаем updated_at.
     *
     * Информация о загрузке файла не редактируется.
     */
    public const UPDATED_AT = null;

    /**
     * Поля, доступные для массового заполнения.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_payment_id',
        'uploaded_by',

        'disk',
        'path',
        'original_name',
        'mime_type',
        'size',

        'type',
        'checksum',
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
            'type' => AttachmentType::class,

            'size' => 'integer',

            'metadata' => 'array',

            'created_at' => 'datetime',
        ];
    }

    /**
     * Заказ, к которому относится файл.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Платёж, к которому относится файл.
     *
     * @return BelongsTo<OrderPayment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(
            OrderPayment::class,
            'order_payment_id',
        );
    }

    /**
     * Пользователь, загрузивший файл.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

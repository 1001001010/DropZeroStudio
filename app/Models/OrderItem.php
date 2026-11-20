<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    /**
     * Поля, доступные для массового заполнения.
     *
     * @var list<string>
     */
    protected $fillable = [
        'drop_id',
        'skin_id',
        'toy_id',
        'order_id',

        'product_name',
        'drop_name',
        'skin_name',
        'product_code',

        'quantity',
        'unit_price',
        'total_price',

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
            'quantity' => 'integer',

            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',

            'metadata' => 'array',
        ];
    }

    /**
     * Заказ, которому принадлежит позиция.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Связанный дроп из каталога.
     *
     * @return BelongsTo<Drop, $this>
     */
    public function drop(): BelongsTo
    {
        return $this->belongsTo(Drop::class);
    }

    /**
     * Связанный скин.
     *
     * @return BelongsTo<Skin, $this>
     */
    public function skin(): BelongsTo
    {
        return $this->belongsTo(Skin::class);
    }

    /**
     * Связанная физическая фигурка.
     *
     * @return BelongsTo<Toy, $this>
     */
    public function toy(): BelongsTo
    {
        return $this->belongsTo(Toy::class);
    }
}
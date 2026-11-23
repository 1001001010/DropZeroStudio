<?php

namespace App\Models;

use App\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderShipment extends Model
{
    /**
     * Атрибуты, доступные для массового заполнения.
     */
    protected $fillable = [
        // Основные данные отправления.
        'provider',
        'provider_order_id',
        'tracking_number',
        'status',

        // Получатель.
        'recipient_name',
        'phone',
        'country',
        'city',
        'postal_code',
        'address',

        // Города отправления и получения в системе СДЭК.
        'from_city_code',
        'to_city_code',
        'from_city',
        'to_city',

        // Способ и тариф доставки.
        'delivery_mode',
        'tariff_code',
        'tariff_name',

        // Пункт выдачи заказа.
        'pickup_point_code',
        'pickup_point_address',

        // Параметры посылки.
        'weight',
        'length',
        'width',
        'height',

        // Стоимость и документы.
        'delivery_cost',
        'currency',
        'label_path',

        // Дополнительные данные API СДЭК.
        'shipping_data',

        // Даты отправления и доставки.
        'shipped_at',
        'delivered_at',
    ];

    /**
     * Приведение атрибутов модели к нужным типам.
     */
    protected function casts(): array
    {
        return [
            'status' => ShipmentStatus::class,

            // Коды и числовые параметры посылки.
            'from_city_code' => 'integer',
            'to_city_code' => 'integer',
            'tariff_code' => 'integer',
            'weight' => 'integer',
            'length' => 'integer',
            'width' => 'integer',
            'height' => 'integer',

            // Денежные значения.
            'delivery_cost' => 'decimal:2',

            // JSON с дополнительными данными СДЭК.
            'shipping_data' => 'array',

            // Даты.
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    /**
     * Заказ, к которому относится отправление.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

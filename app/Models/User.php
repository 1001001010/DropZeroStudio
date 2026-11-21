<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    /**
     * Атрибуты, доступные для массового заполнения.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'is_admin',
    ];

    /**
     * Атрибуты, скрытые при сериализации модели.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Преобразование атрибутов модели.
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Фигурки, принадлежащие пользователю.
     */
    public function toys(): HasMany
    {
        return $this->hasMany(Toy::class);
    }

    /**
     * Проверяет, является ли пользователь администратором.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    /**
     * Заказы, созданные администратором.
     *
     * @return HasMany<Order, $this>
     */
    public function createdOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    /**
     * История изменений заказов.
     *
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function orderStatusChanges(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'changed_by');
    }

    /**
     * Файлы, загруженные пользователем.
     *
     * @return HasMany<OrderAttachment, $this>
     */
    public function uploadedOrderAttachments(): HasMany
    {
        return $this->hasMany(OrderAttachment::class, 'uploaded_by');
    }

    public function confirmedPayments(): HasMany
    {
        return $this->hasMany(OrderPayment::class, 'confirmed_by');
    }
}
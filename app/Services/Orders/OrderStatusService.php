<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    /**
     * Изменяет статус заказа.
     *
     * Проверяет допустимость перехода, необходимые условия
     * и сохраняет запись в истории изменения статусов.
     */
    public function change(
        Order $order,
        OrderStatus $status,
        ?string $comment = null,
        ?int $changedBy = null,
    ): Order {
        return DB::transaction(function () use ($order, $status, $comment, $changedBy, ): Order {
            // Блокируем заказ, чтобы исключить параллельное изменение статуса.
            $lockedOrder = Order::query()
                ->lockForUpdate()
                ->findOrFail($order->id);

            $currentStatus = $lockedOrder->status;

            // Повторное назначение текущего статуса не создаёт историю.
            if ($currentStatus === $status) {
                return $lockedOrder->load([
                    'items',
                    'payment',
                    'shipment',
                    'history',
                ]);
            }

            // Проверяем разрешённый переход между статусами.
            if (!$currentStatus->canTransitionTo($status)) {
                throw ValidationException::withMessages([
                    'status' => sprintf(
                        'Невозможно изменить статус заказа с "%s" на "%s".',
                        $currentStatus->label(),
                        $status->label(),
                    ),
                ]);
            }

            // Отправка заказа допускается только при наличии успешной оплаты.
            if ($status === OrderStatus::Shipped) {
                $this->validatePayment($lockedOrder);
            }

            // Обновляем статус и соответствующие даты.
            $lockedOrder->status = $status;

            if ($status === OrderStatus::Completed) {
                $lockedOrder->completed_at = now();
            }

            if ($status === OrderStatus::Cancelled) {
                $lockedOrder->cancelled_at = now();
            }

            $lockedOrder->save();

            // Сохраняем событие изменения статуса.
            OrderStatusHistory::query()->create([
                'order_id' => $lockedOrder->id,
                'old_status' => $currentStatus,
                'new_status' => $status,
                'comment' => $comment,
                'changed_by' => $changedBy,
            ]);

            return $lockedOrder->load([
                'items',
                'payment',
                'shipment',
                'history',
            ]);
        });
    }

    /**
     * Проверяет, что заказ имеет успешный платёж.
     */
    private function validatePayment(Order $order): void
    {
        $payment = $order->payment;

        if (!$payment) {
            throw ValidationException::withMessages([
                'status' => 'Нельзя отправить заказ без оплаты.',
            ]);
        }

        if (!$payment->status->isSuccessful()) {
            throw ValidationException::withMessages([
                'status' => 'Для отправки заказа необходимо подтвердить оплату.',
            ]);
        }
    }
}

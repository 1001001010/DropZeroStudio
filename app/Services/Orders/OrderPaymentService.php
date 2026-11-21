<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\OrderStatusHistory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class OrderPaymentService
{
    /**
     * Создаёт платёж для заказа.
     */
    public function create(
        Order $order,
        array $data,
        ?int $confirmedBy = null,
    ): OrderPayment {
        return $this->save(
            order: $order,
            data: $data,
            confirmedBy: $confirmedBy,
            requireExisting: false,
        );
    }

    /**
     * Обновляет существующий платёж заказа.
     */
    public function update(
        Order $order,
        array $data,
        ?int $confirmedBy = null,
    ): OrderPayment {
        return $this->save(
            order: $order,
            data: $data,
            confirmedBy: $confirmedBy,
            requireExisting: true,
        );
    }

    /**
     * Создаёт или обновляет платёж и при необходимости сохраняет квитанцию.
     */
    private function save(
        Order $order,
        array $data,
        ?int $confirmedBy = null,
        bool $requireExisting = false,
    ): OrderPayment {
        // Отделяем файл от остальных данных платежа.
        $receipt = $data['receipt'] ?? null;

        unset($data['receipt']);

        $newReceiptPath = null;
        $oldReceiptPath = null;

        try {
            $payment = DB::transaction(function () use ($order, $data, $receipt, $confirmedBy, $requireExisting, &$newReceiptPath, &$oldReceiptPath, ): OrderPayment {
                // Блокируем заказ от параллельного изменения.
                $lockedOrder = Order::query()
                    ->lockForUpdate()
                    ->findOrFail($order->id);

                // Получаем существующий платёж.
                $payment = OrderPayment::query()
                    ->where('order_id', $lockedOrder->id)
                    ->lockForUpdate()
                    ->first();

                if ($requireExisting && !$payment) {
                    throw ValidationException::withMessages([
                        'payment' => 'У этого заказа ещё нет платежа.',
                    ]);
                }

                if (!$requireExisting && $payment) {
                    throw ValidationException::withMessages([
                        'payment' => 'У этого заказа уже есть платёж. Используйте обновление.',
                    ]);
                }

                // Создаём платёж, если его ещё нет.
                if (!$payment) {
                    $payment = new OrderPayment();
                    $payment->order_id = $lockedOrder->id;
                }

                $amount = (float) $data['amount'];
                $orderTotal = (float) $lockedOrder->total;

                if ($amount > $orderTotal) {
                    throw ValidationException::withMessages([
                        'amount' => 'Сумма платежа не может превышать сумму заказа.',
                    ]);
                }

                $status = PaymentStatus::from($data['status']);
                $method = PaymentMethod::from($data['method']);

                if (
                    $status === PaymentStatus::Paid
                    && round($amount, 2) !== round($orderTotal, 2)
                ) {
                    throw ValidationException::withMessages([
                        'amount' => 'Для подтверждения оплаты сумма должна совпадать с суммой заказа.',
                    ]);
                }

                // Заполняем основные данные платежа.
                $payment->amount = $data['amount'];
                $payment->currency = $lockedOrder->currency;
                $payment->status = $status;
                $payment->method = $method;
                $payment->provider = $data['provider'] ?? null;
                $payment->transaction_id = $data['transaction_id'] ?? null;
                $payment->metadata = $data['metadata'] ?? null;

                // Обрабатываем подтверждение оплаты.
                if ($status->isSuccessful()) {
                    $payment->paid_at = !empty($data['paid_at'])
                        ? Carbon::parse($data['paid_at'])
                        : ($payment->paid_at ?? now());

                    $payment->confirmed_by = $confirmedBy
                        ?? $payment->confirmed_by;
                } else {
                    $payment->paid_at = null;
                    $payment->confirmed_by = null;
                }

                // Фиксируем дату полного возврата.
                $payment->refunded_at = $status === PaymentStatus::Refunded
                    ? ($payment->refunded_at ?? now())
                    : null;

                $payment->save();

                // Сохраняем новую квитанцию, если пользователь её выбрал.
                if ($receipt instanceof UploadedFile) {
                    $oldReceiptPath = $payment->receipt_path;

                    $newReceiptPath = $receipt->store(
                        "orders/payments/{$payment->id}",
                        'local',
                    );

                    if (!$newReceiptPath) {
                        throw new RuntimeException(
                            'Не удалось сохранить файл подтверждения оплаты.',
                        );
                    }

                    $payment->receipt_path = $newReceiptPath;
                    $payment->receipt_name = $receipt->getClientOriginalName();
                    $payment->receipt_mime = $receipt->getMimeType();
                    $payment->receipt_size = $receipt->getSize();

                    $payment->save();
                }

                // Обновляем дату оплаты заказа.
                $lockedOrder->paid_at = $status->isSuccessful()
                    ? $payment->paid_at
                    : null;

                // При успешной оплате переводим ожидающий заказ в статус «Принят».
                if (
                    $status === PaymentStatus::Paid
                    && $lockedOrder->status === OrderStatus::Pending
                ) {
                    $oldStatus = $lockedOrder->status;

                    $lockedOrder->status = OrderStatus::Accepted;
                    $lockedOrder->save();

                    // Записываем изменение статуса в историю заказа.
                    OrderStatusHistory::create([
                        'order_id' => $lockedOrder->id,
                        'old_status' => $oldStatus,
                        'new_status' => OrderStatus::Accepted,
                        'comment' => sprintf(
                            'Оплата получена: %s %s. Способ оплаты: %s.',
                            number_format(
                                (float) $payment->amount,
                                2,
                                '.',
                                ' ',
                            ),
                            $payment->currency,
                            $method->value,
                        ),
                        'changed_by' => $confirmedBy,
                    ]);
                } else {
                    $lockedOrder->save();
                }

                return $payment->load('attachments');
            });
        } catch (Throwable $exception) {
            // Если транзакция завершилась ошибкой, удаляем новый файл.
            if ($newReceiptPath) {
                Storage::disk('local')->delete($newReceiptPath);
            }

            throw $exception;
        }

        // Удаляем предыдущую квитанцию только после успешного сохранения.
        if ($oldReceiptPath && $oldReceiptPath !== $newReceiptPath) {
            Storage::disk('local')->delete($oldReceiptPath);
        }

        return $payment;
    }
}

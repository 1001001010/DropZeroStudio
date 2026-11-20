<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Models\Drop;
use App\Models\Order;
use App\Models\Skin;
use App\Models\Toy;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OrderService
{
    public function __construct(
        private readonly OrderNumberService $numberService,
    ) {
    }

    /**
     * Создать заказ вместе с позициями и первоначальной историей.
     *
     * Все операции выполняются в одной транзакции.
     *
     * Цена каждой позиции определяется по актуальной цене Drop
     * в базе данных, а не по данным, присланным клиентом.
     *
     * @param array{
     *     customer_name: string,
     *     telegram_id?: int|string|null,
     *     telegram_username?: string|null,
     *     telegram_url?: string|null,
     *     email?: string|null,
     *     phone?: string|null,
     *     currency?: string,
     *     delivery_price?: string|int|float,
     *     discount?: string|int|float,
     *     comment?: string|null,
     *     admin_note?: string|null,
     *     items: array<int, array{
     *         drop_id: int,
     *         toy_id?: int|null,
     *         quantity: int
     *     }>
     * } $data
     */
    public function create(array $data, User $actor): Order
    {
        return DB::transaction(function () use ($data, $actor): Order {
            $items = $data['items'] ?? [];

            if ($items === []) {
                throw new InvalidArgumentException(
                    'Заказ должен содержать хотя бы одну позицию.'
                );
            }

            /*
             * Создаём заказ с временным номером.
             *
             * forceFill используется намеренно: системные поля
             * не должны попадать в обычный список fillable.
             */
            $order = new Order();

            $order->forceFill([
                'number' => $this->numberService->temporary(),
                'status' => OrderStatus::Pending,

                'customer_name' => $data['customer_name'],
                'telegram_id' => $data['telegram_id'] ?? null,
                'telegram_username' => $data['telegram_username'] ?? null,
                'telegram_url' => $data['telegram_url'] ?? null,

                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,

                'currency' => strtoupper($data['currency'] ?? 'RUB'),

                'subtotal' => '0.00',
                'delivery_price' => '0.00',
                'discount' => '0.00',
                'total' => '0.00',

                'comment' => $data['comment'] ?? null,
                'admin_note' => $data['admin_note'] ?? null,

                'created_by' => $actor->getKey(),
            ]);

            $order->save();

            /*
             * Теперь, когда у заказа есть ID, формируем
             * окончательный номер.
             */
            $order->forceFill([
                'number' => $this->numberService->generate(
                    (int) $order->getKey(),
                ),
            ])->save();

            /*
             * Суммы считаем в копейках, чтобы избежать
             * погрешностей арифметики с float.
             */
            $subtotalMinor = 0;

            foreach ($items as $itemData) {
                $dropId = (int) $itemData['drop_id'];
                $quantity = (int) $itemData['quantity'];

                if ($quantity < 1) {
                    throw new InvalidArgumentException(
                        'Количество товара должно быть не меньше единицы.'
                    );
                }

                /*
                 * Блокируем запись Drop на время создания заказа.
                 * Это защищает чтение цены от конкурентного изменения
                 * в рамках текущей транзакции.
                 */
                $drop = Drop::query()
                    ->lockForUpdate()
                    ->findOrFail($dropId);

                /*
                 * Получаем Skin отдельно, чтобы не зависеть
                 * от наличия или реализации relationship в Drop.
                 */
                $skin = $drop->skin_id !== null
                    ? Skin::query()->find($drop->skin_id)
                    : null;

                $toy = null;
                $toyId = $itemData['toy_id'] ?? null;

                /*
                 * Если к позиции привязана конкретная фигурка,
                 * проверяем её принадлежность выбранному Drop.
                 */
                if ($toyId !== null) {
                    $toy = Toy::query()
                        ->lockForUpdate()
                        ->findOrFail((int) $toyId);

                    if ((int) $toy->drop_id !== (int) $drop->getKey()) {
                        throw new InvalidArgumentException(
                            'Выбранная фигурка не принадлежит указанному Drop.'
                        );
                    }

                    /*
                     * Конкретная физическая фигурка может быть
                     * добавлена в заказ только в одном экземпляре.
                     */
                    if ($quantity !== 1) {
                        throw new InvalidArgumentException(
                            'Для конкретной фигурки количество должно быть равно единице.'
                        );
                    }
                }

                /*
                 * Цена берётся исключительно из Drop.
                 */
                $unitPriceMinor = $this->toMinorUnits(
                    (string) $drop->price,
                );

                $itemTotalMinor = $unitPriceMinor * $quantity;

                $subtotalMinor += $itemTotalMinor;

                /*
                 * Сохраняем исторический снимок товара.
                 * Даже если Drop или Skin позже изменятся,
                 * заказ продолжит отображать прежние данные.
                 */
                $order->items()->create([
                    'drop_id' => $drop->getKey(),
                    'skin_id' => $skin?->getKey(),
                    'toy_id' => $toy?->getKey(),

                    'product_name' => $skin?->name ?? $drop->name,
                    'drop_name' => $drop->name,
                    'skin_name' => $skin?->name,
                    'product_code' => $toy?->code,

                    'quantity' => $quantity,

                    'unit_price' => $this->fromMinorUnits(
                        $unitPriceMinor,
                    ),

                    'total_price' => $this->fromMinorUnits(
                        $itemTotalMinor,
                    ),
                ]);
            }

            /*
             * Рассчитываем доставку и скидку.
             */
            $deliveryMinor = $this->toMinorUnits(
                (string) ($data['delivery_price'] ?? '0.00'),
            );

            $discountMinor = $this->toMinorUnits(
                (string) ($data['discount'] ?? '0.00'),
            );

            if ($discountMinor > $subtotalMinor) {
                throw new InvalidArgumentException(
                    'Скидка не может превышать стоимость товаров.'
                );
            }

            $totalMinor = $subtotalMinor
                + $deliveryMinor
                - $discountMinor;

            /*
             * Записываем рассчитанные финансовые значения.
             */
            $order->forceFill([
                'subtotal' => $this->fromMinorUnits($subtotalMinor),
                'delivery_price' => $this->fromMinorUnits($deliveryMinor),
                'discount' => $this->fromMinorUnits($discountMinor),
                'total' => $this->fromMinorUnits($totalMinor),
            ])->save();

            /*
             * Первое событие истории.
             *
             * Предыдущего статуса нет, поскольку заказ только создан.
             */
            $order->history()->create([
                'old_status' => null,
                'new_status' => OrderStatus::Pending,
                'comment' => 'Заказ создан.',
                'changed_by' => $actor->getKey(),
            ]);

            /*
             * Возвращаем заказ со всеми основными связями.
             */
            return $order->load([
                'items',
                'payments',
                'shipments',
                'history',
                'attachments',
                'creator',
            ]);
        }, attempts: 3);
    }

    /**
     * Преобразовать денежное значение в целое количество копеек.
     *
     * Принимаются только неотрицательные числа с точностью
     * не более двух знаков после десятичной точки.
     */
    private function toMinorUnits(string $amount): int
    {
        $amount = trim($amount);

        if (!preg_match('/^\d+(?:\.\d{1,2})?$/', $amount)) {
            throw new InvalidArgumentException(
                'Некорректный денежный формат: ' . $amount
            );
        }

        [$whole, $fraction] = array_pad(
            explode('.', $amount, 2),
            2,
            '',
        );

        $fraction = str_pad($fraction, 2, '0');

        return ((int) $whole * 100) + (int) $fraction;
    }

    /**
     * Преобразовать копейки в десятичную денежную строку.
     */
    private function fromMinorUnits(int $amount): string
    {
        if ($amount < 0) {
            throw new InvalidArgumentException(
                'Денежное значение не может быть отрицательным.'
            );
        }

        return sprintf(
            '%d.%02d',
            intdiv($amount, 100),
            $amount % 100,
        );
    }
}

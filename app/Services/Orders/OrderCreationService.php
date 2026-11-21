<?php

namespace App\Services\Orders;

use App\Models\Drop;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Toy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderCreationService
{
    public function __construct(
        private readonly OrderNumberService $orderNumberService,
    ) {
    }

    /**
     * Создаёт заказ, добавляет выбранные фигурки
     * и записывает первое событие в историю.
     */
    public function create(array $data, ?int $createdBy = null): Order
    {
        return DB::transaction(function () use ($data, $createdBy): Order {
            // Создаём заказ с временным номером.
            $order = Order::create([
                'number' => $this->orderNumberService->temporary(),

                'customer_name' => $data['customer_name'],
                'telegram_id' => $data['telegram_id'] ?? null,
                'telegram_username' => $data['telegram_username'] ?? null,
                'telegram_url' => $data['telegram_url'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,

                'currency' => $data['currency'] ?? 'RUB',
                'comment' => $data['comment'] ?? null,
                'admin_note' => $data['admin_note'] ?? null,

                'status' => 'pending',
                'created_by' => $createdBy,

                'delivery_price' => 0,
                'discount' => 0,
                'subtotal' => 0,
                'total' => 0,
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $index => $item) {
                // Получаем Drop вместе с его скином.
                $drop = Drop::with('skin')->find($item['drop_id']);

                if (!$drop || !$drop->skin || $drop->skin->trashed()) {
                    throw ValidationException::withMessages([
                        "items.{$index}.drop_id" =>
                            'Выбранный Drop или его скин недоступен.',
                    ]);
                }

                $quantity = (int) $item['quantity'];

                // Находим фигурки с блокировкой выбранных записей.
                $toys = $this->findToys(
                    $drop,
                    $item,
                    $quantity,
                    $index,
                );

                // Фиксируем цену на момент создания заказа.
                $unitPrice = (float) $drop->price;

                foreach ($toys as $toy) {
                    $itemTotal = $unitPrice;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'drop_id' => $drop->id,
                        'skin_id' => $drop->skin_id,
                        'toy_id' => $toy->id,

                        'product_name' => $drop->name,
                        'drop_name' => $drop->name,
                        'skin_name' => $drop->skin->name,
                        'product_code' => $toy->code,

                        'quantity' => 1,
                        'unit_price' => $unitPrice,
                        'total_price' => $itemTotal,

                        'metadata' => [
                            'toy_number' => $toy->number,
                        ],
                    ]);

                    $subtotal += $itemTotal;
                }
            }

            // Сохраняем итоговую стоимость заказа.
            $order->subtotal = $subtotal;
            $order->delivery_price = 0;
            $order->discount = 0;
            $order->total = $subtotal;

            $order->save();

            // Заменяем временный номер постоянным.
            $order->update([
                'number' => $this->orderNumberService->generate(
                    $order->id,
                ),
            ]);

            // Создаём первое событие истории заказа.
            $order->history()->create([
                'old_status' => null,
                'new_status' => $order->status,
                'comment' => 'Заказ создан',
                'changed_by' => $createdBy,
            ]);

            return $order->load([
                'items',
                'creator',
            ]);
        });
    }

    /**
     * Находит фигурки в соответствии с выбранным режимом.
     *
     * Используется внутри транзакции, чтобы заблокировать
     * выбранные записи на время создания заказа.
     *
     * @return Collection<int, Toy>
     */
    private function findToys(
        Drop $drop,
        array $item,
        int $quantity,
        int $index,
    ): Collection {
        $query = Toy::query()
            ->where('drop_id', $drop->id)
            ->where('status', 'available')
            ->lockForUpdate();

        return match ($item['selection_mode']) {
            'random' => $this->findRandomToys(
                $query,
                $quantity,
                $index,
            ),

            'number' => $this->findToyByNumber(
                $query,
                isset($item['toy_number'])
                ? (int) $item['toy_number']
                : null,
                $index,
            ),

            'code' => $this->findToyByCode(
                $query,
                $item['toy_code'] ?? null,
                $index,
            ),

            default => throw ValidationException::withMessages([
                "items.{$index}.selection_mode" =>
                    'Неизвестный способ выбора фигурки.',
            ]),
        };
    }

    /**
     * Случайный выбор доступных фигурок.
     *
     * @return Collection<int, Toy>
     */
    private function findRandomToys(
        Builder $query,
        int $quantity,
        int $index,
    ): Collection {
        $toys = $query
            ->inRandomOrder()
            ->limit($quantity)
            ->get();

        if ($toys->count() !== $quantity) {
            throw ValidationException::withMessages([
                "items.{$index}.quantity" =>
                    'Недостаточно доступных фигурок в выбранном Drop.',
            ]);
        }

        return $toys;
    }

    /**
     * Поиск фигурки по номеру.
     *
     * @return Collection<int, Toy>
     */
    private function findToyByNumber(
        Builder $query,
        ?int $number,
        int $index,
    ): Collection {
        $toy = $query
            ->where('number', $number)
            ->first();

        if (!$toy) {
            throw ValidationException::withMessages([
                "items.{$index}.toy_number" =>
                    'Доступная фигурка с таким номером не найдена.',
            ]);
        }

        return collect([$toy]);
    }

    /**
     * Поиск фигурки по коду.
     *
     * @return Collection<int, Toy>
     */
    private function findToyByCode(
        Builder $query,
        ?string $code,
        int $index,
    ): Collection {
        $toy = $query
            ->where('code', $code)
            ->first();

        if (!$toy) {
            throw ValidationException::withMessages([
                "items.{$index}.toy_code" =>
                    'Доступная фигурка с таким кодом не найдена.',
            ]);
        }

        return collect([$toy]);
    }
}

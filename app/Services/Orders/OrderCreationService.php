<?php

namespace App\Services\Orders;

use App\Models\Drop;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Toy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderCreationService
{
    public function __construct(
        private readonly OrderNumberService $orderNumberService,
    ) {
    }

    /**
     * Создать заказ и добавить в него выбранные фигурки.
     */
    public function create(array $data, ?int $createdBy = null): Order
    {
        return DB::transaction(function () use ($data, $createdBy) {
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

                'created_by' => $createdBy,

                'delivery_price' => 0,
                'discount' => 0,
                'subtotal' => 0,
                'total' => 0,
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $index => $item) {
                $drop = Drop::with('skin')->find($item['drop_id']);

                if (!$drop || !$drop->skin || $drop->skin->trashed()) {
                    throw ValidationException::withMessages([
                        "items.{$index}.drop_id" => 'Выбранный Drop или его скин недоступен.',
                    ]);
                }

                if (!$drop || !$drop->skin || $drop->skin->trashed()) {
                    throw ValidationException::withMessages([
                        "items.{$index}.drop_id" =>
                            'Выбранный Drop или его скин недоступен.',
                    ]);
                }

                $quantity = (int) $item['quantity'];

                $toys = $this->findToys(
                    $drop,
                    $item,
                    $quantity,
                    $index,
                );

                // Цена фиксируется на момент создания заказа.
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

            // Сохраняем итоговую стоимость.
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

            return $order->load([
                'items',
                'creator',
            ]);
        });
    }

    /**
     * Найти фигурки в соответствии с режимом выбора.
     */
    private function findToys(
        Drop $drop,
        array $item,
        int $quantity,
        int $index,
    ) {
        $query = Toy::query()
            ->where('drop_id', $drop->id)
            ->where('status', 'available');

        return match ($item['selection_mode']) {
            'random' => $this->findRandomToys(
                $query,
                $quantity,
                $index,
            ),

            'number' => $this->findToyByNumber(
                $query,
                $item['toy_number'] ?? null,
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
     */
    private function findRandomToys(
        $query,
        int $quantity,
        int $index,
    ) {
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
     */
    private function findToyByNumber(
        $query,
        ?int $number,
        int $index,
    ) {
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
     */
    private function findToyByCode(
        $query,
        ?string $code,
        int $index,
    ) {
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
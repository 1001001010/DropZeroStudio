<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\Orders\StoreOrderPaymentRequest;
use App\Http\Requests\Orders\UpdateOrderPaymentRequest;
use App\Models\Drop;
use App\Models\Order;
use App\Services\Orders\OrderCreationService;
use App\Services\Orders\OrderPaymentService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Отображает список заказов и передаёт доступные Drop
     * для формы создания нового заказа.
     */
    public function index(): Response
    {
        // Получаем заказы вместе с основными связями.
        $orders = Order::query()
            ->with([
                'items',
                'payment',
                'shipment',
            ])
            ->latest()
            ->get();

        // Получаем коллекции, в которых есть свободные фигурки.
        /** @var Collection<int, Drop> $dropCollection */
        $dropCollection = Drop::query()
            ->with([
                'skin:id,name,slug,description,model_path,primary_color,secondary_color,accent_color,preview_image',
            ])
            ->withCount([
                'toys as available_quantity' => fn(Builder $query) => $query
                    ->where('status', 'available'),
            ])
            ->whereHas('skin', fn(Builder $query) => $query
                ->where('is_active', true))
            ->whereHas('toys', fn(Builder $query) => $query
                ->where('status', 'available'))
            ->orderBy('name')
            ->get();

        // Подготавливаем данные для формы создания заказа.
        $drops = $dropCollection
            ->map(fn(Drop $drop): array => [
                'id' => $drop->id,
                'name' => $drop->name,
                'price' => (float) $drop->price,
                'editionSize' => $drop->edition_size,
                'availableQuantity' => $drop->available_quantity,

                'skin' => [
                    'id' => $drop->skin->id,
                    'name' => $drop->skin->name,
                    'slug' => $drop->skin->slug,
                    'description' => $drop->skin->description,
                    'modelPath' => $drop->skin->model_path,
                    'previewImage' => $drop->skin->preview_image,
                    'primaryColor' => $drop->skin->primary_color,
                    'secondaryColor' => $drop->skin->secondary_color,
                    'accentColor' => $drop->skin->accent_color,
                ],
            ])
            ->values();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'drops' => $drops,
        ]);
    }

    /**
     * Создаёт новый заказ.
     */
    public function store(
        StoreOrderRequest $request,
        OrderCreationService $orderCreationService,
    ): RedirectResponse {
        $orderCreationService->create(
            $request->validated(),
            $request->user()->id,
        );

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Заказ успешно создан.');
    }

    /**
     * Отображает подробную информацию о заказе.
     */
    public function show(Order $order): Response
    {
        // Загружаем заказ и необходимые связи.
        $order->load([
            // Позиции заказа и связанные сущности.
            'items.drop',
            'items.skin',
            'items.toy',

            // Оплата и отправление.
            'payment',
            'shipment',

            // История событий и создатель заказа.
            'history' => fn($query) => $query
                ->orderBy('created_at')
                ->orderBy('id'),

            'creator',
        ]);

        // Формируем временную ссылку на приватную квитанцию.
        if ($order->payment?->receipt_path) {
            $order->payment->setAttribute(
                'receipt_url',
                route('admin.orders.payments.receipt', $order),
            );
        } else {
            $order->payment?->setAttribute('receipt_url', null);
        }

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Создаёт платёж заказа.
     */
    public function storePayment(
        StoreOrderPaymentRequest $request,
        Order $order,
        OrderPaymentService $orderPaymentService,
    ): RedirectResponse {
        $userId = $request->user()?->getAuthIdentifier();

        $orderPaymentService->create(
            order: $order,
            data: $request->validated(),
            confirmedBy: $userId !== null ? (int) $userId : null,
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Оплата успешно добавлена.');
    }

    /**
     * Обновляет платёж заказа.
     */
    public function updatePayment(
        UpdateOrderPaymentRequest $request,
        Order $order,
        OrderPaymentService $orderPaymentService,
    ): RedirectResponse {
        $userId = $request->user()?->getAuthIdentifier();

        $orderPaymentService->update(
            order: $order,
            data: $request->validated(),
            confirmedBy: $userId !== null ? (int) $userId : null,
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Оплата успешно обновлена.');
    }

    /**
     * Открывает квитанцию об оплате заказа.
     */
    public function downloadPaymentReceipt(Order $order): StreamedResponse
    {
        $payment = $order->payment;

        abort_unless($payment?->receipt_path, 404);

        $disk = Storage::disk('local');

        abort_unless($disk->exists($payment->receipt_path), 404);

        $stream = $disk->readStream($payment->receipt_path);

        abort_if($stream === false, 404);

        // Определяем MIME-тип файла по его содержимому.
        $finfo = new \finfo(FILEINFO_MIME_TYPE);

        $mimeType = $finfo->file(
            stream_get_meta_data($stream)['uri'],
        ) ?: 'application/octet-stream';

        return response()->stream(
            static function () use ($stream): void {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            200,
            [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' .
                    addslashes($payment->receipt_name) . '"',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}

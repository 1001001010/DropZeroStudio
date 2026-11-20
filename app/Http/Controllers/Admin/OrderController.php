<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Drop;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Requests\StoreOrderRequest;
use App\Services\Orders\OrderCreationService;
use Illuminate\Http\RedirectResponse;
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
        // Получаем реальные заказы из базы данных.
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
                ->where('is_active', true)
                ->whereNull('skins.deleted_at'))
            ->whereHas('toys', fn(Builder $query) => $query
                ->where('status', 'available'))
            ->orderBy('name')
            ->get();

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
     * Создать новый заказ.
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
     * Отображение подробной информации о заказе.
     */
    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load([
                // Позиции заказа и связанные с ними сущности.
                'items.drop',
                'items.skin',
                'items.toy',

                // Основные связи заказа.
                'payment',
                'shipment',
                'history',
                'creator',
            ]),
        ]);
    }
}

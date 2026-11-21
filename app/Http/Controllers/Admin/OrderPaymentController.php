<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Orders\StoreOrderPaymentRequest;
use App\Http\Requests\Admin\Orders\UpdateOrderPaymentRequest;
use App\Models\Order;
use App\Services\Orders\OrderPaymentService;
use Illuminate\Http\RedirectResponse;

class OrderPaymentController extends Controller
{
    public function __construct(
        private readonly OrderPaymentService $paymentService,
    ) {
    }

    /**
     * Создаёт платёж заказа.
     */
    public function storePayment(
        StoreOrderPaymentRequest $request,
        Order $order,
    ): RedirectResponse {
        $userId = $request->user()?->getAuthIdentifier();

        $this->paymentService->create(
            order: $order,
            data: $request->validated(),
            confirmedBy: $userId !== null ? (int) $userId : null,
        );

        return back()->with('success', 'Платёж успешно добавлен.');
    }

    /**
     * Обновляет платёж заказа.
     */
    public function updatePayment(
        UpdateOrderPaymentRequest $request,
        Order $order,
    ): RedirectResponse {
        $userId = $request->user()?->getAuthIdentifier();

        $this->paymentService->update(
            order: $order,
            data: $request->validated(),
            confirmedBy: $userId !== null ? (int) $userId : null,
        );

        return back()->with('success', 'Платёж успешно обновлён.');
    }
}

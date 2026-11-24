<?php

namespace App\Http\Controllers\Admin\Cdek;

use App\Http\Controllers\Controller;
use App\Services\Cdek\CdekCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CdekCalculatorController extends Controller
{
    public function __construct(
        private readonly CdekCalculatorService $calculatorService,
    ) {
    }

    /**
     * Рассчитывает доступные тарифы доставки СДЭК.
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Города обязательны независимо от способа доставки.
            'from_location' => [
                'required',
                'array',
            ],
            'from_location.code' => [
                'required',
                'integer',
            ],
            'from_location.address' => [
                'nullable',
                'string',
            ],

            'to_location' => [
                'required',
                'array',
            ],
            'to_location.code' => [
                'required',
                'integer',
            ],
            'to_location.address' => [
                'nullable',
                'string',
            ],

            // ПВЗ передаются дополнительно, если выбрана доставка через ПВЗ.
            'shipment_point' => [
                'nullable',
                'string',
            ],
            'delivery_point' => [
                'nullable',
                'string',
            ],

            'packages' => [
                'required',
                'array',
                'min:1',
            ],
            'packages.*.weight' => [
                'required',
                'numeric',
                'min:1',
            ],
            'packages.*.length' => [
                'required',
                'numeric',
                'min:1',
            ],
            'packages.*.width' => [
                'required',
                'numeric',
                'min:1',
            ],
            'packages.*.height' => [
                'required',
                'numeric',
                'min:1',
            ],
        ]);

        $tariffs = $this->calculatorService->calculate(
            fromLocation: $validated['from_location'],
            toLocation: $validated['to_location'],
            packages: $validated['packages'],
            shipmentPoint: $validated['shipment_point'] ?? null,
            deliveryPoint: $validated['delivery_point'] ?? null,
        );

        return response()->json([
            'data' => $tariffs,
        ]);
    }
}
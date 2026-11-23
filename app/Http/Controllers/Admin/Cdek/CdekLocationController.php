<?php

namespace App\Http\Controllers\Admin\Cdek;

use App\Http\Controllers\Controller;
use App\Services\Cdek\CdekLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Контроллер географических данных СДЭК.
 *
 * Используется для поиска городов и пунктов выдачи
 * в административной панели.
 */
class CdekLocationController extends Controller
{
    public function __construct(
        private readonly CdekLocationService $locationService,
    ) {
    }

    /**
     * Поиск городов по названию.
     */
    public function cities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:100'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ]);

        $cities = $this->locationService->searchCities(
            city: $validated['query'],
            countryCode: $validated['country_code'] ?? 'RU',
            size: 10,
        );

        return response()->json([
            'data' => $cities,
        ]);
    }

    /**
     * Получение пунктов выдачи выбранного города.
     */
    public function pickupPoints(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city_code' => ['required', 'integer', 'min:1'],
            'type' => ['nullable', 'string', 'in:ALL,PVZ,POSTAMAT'],
        ]);

        $points = $this->locationService->searchPickupPoints(
            cityCode: (int) $validated['city_code'],
            type: $validated['type'] ?? 'ALL',
        );

        return response()->json([
            'data' => $points,
        ]);
    }
}
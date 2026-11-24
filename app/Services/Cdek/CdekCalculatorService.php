<?php

declare(strict_types=1);

namespace App\Services\Cdek;

use InvalidArgumentException;
use RuntimeException;

class CdekCalculatorService
{
    public function __construct(
        private readonly CdekClient $client,
    ) {
    }

    /**
     * Рассчитывает стоимость доставки по доступным тарифам.
     *
     * Города отправления и получения обязательны всегда.
     * Пункты выдачи передаются дополнительно, если выбрана доставка через ПВЗ.
     *
     * Вес указывается в граммах, размеры — в сантиметрах.
     *
     * @param array<string, int|string> $fromLocation
     * @param array<string, int|string> $toLocation
     * @param array<int, array{
     *     weight: int,
     *     length: int,
     *     width: int,
     *     height: int
     * }> $packages
     *
     * @return array<int, array<string, mixed>>
     */
    public function calculate(
        array $fromLocation,
        array $toLocation,
        array $packages,
        ?string $shipmentPoint = null,
        ?string $deliveryPoint = null,
    ): array {
        $this->validateLocations(
            $fromLocation,
            $toLocation,
            $shipmentPoint,
            $deliveryPoint,
        );

        $this->validatePackages($packages);

        // Основные параметры расчёта.
        $payload = [
            'type' => 2,
            'currency' => 1,
            'lang' => 'rus',
            'from_location' => $fromLocation,
            'to_location' => $toLocation,
            'packages' => $packages,
        ];

        // При доставке через ПВЗ дополнительно указываем его код.
        if ($shipmentPoint !== null) {
            $payload['shipment_point'] = $shipmentPoint;
        }

        if ($deliveryPoint !== null) {
            $payload['delivery_point'] = $deliveryPoint;
        }

        $response = $this->client->post(
            'calculator/tarifflist',
            $payload,
        );

        $tariffs = $response['tariff_codes'] ?? null;

        if (!is_array($tariffs)) {
            throw new RuntimeException(
                'СДЭК вернул некорректный ответ при расчёте доставки.',
            );
        }

        // Убираем дубликаты тарифов по коду.
        $uniqueTariffs = [];

        foreach ($tariffs as $tariff) {
            if (!isset($tariff['tariff_code'])) {
                continue;
            }

            $code = (int) $tariff['tariff_code'];

            $uniqueTariffs[$code] = [
                'tariff_code' => $code,
                'tariff_name' => (string) ($tariff['tariff_name'] ?? ''),
                'tariff_description' => (string) (
                    $tariff['tariff_description'] ?? ''
                ),
                'delivery_mode' => (int) ($tariff['delivery_mode'] ?? 0),
                'delivery_sum' => (float) ($tariff['delivery_sum'] ?? 0),
                'period_min' => (int) ($tariff['period_min'] ?? 0),
                'period_max' => (int) ($tariff['period_max'] ?? 0),
                'calendar_min' => (int) ($tariff['calendar_min'] ?? 0),
                'calendar_max' => (int) ($tariff['calendar_max'] ?? 0),
                'delivery_date_range' => [
                    'min' => $tariff['delivery_date_range']['min'] ?? null,
                    'max' => $tariff['delivery_date_range']['max'] ?? null,
                ],
            ];
        }

        return array_values($uniqueTariffs);
    }

    /**
     * Проверяет корректность направлений доставки.
     *
     * Код города обязателен независимо от выбранного способа доставки.
     * ПВЗ может использоваться одновременно с кодом города.
     */
    private function validateLocations(
        array $fromLocation,
        array $toLocation,
        ?string $shipmentPoint,
        ?string $deliveryPoint,
    ): void {
        if (empty($fromLocation['code'])) {
            throw new InvalidArgumentException(
                'Необходимо указать город отправления.',
            );
        }

        if (empty($toLocation['code'])) {
            throw new InvalidArgumentException(
                'Необходимо указать город получения.',
            );
        }

        if (
            $shipmentPoint !== null &&
            trim($shipmentPoint) === ''
        ) {
            throw new InvalidArgumentException(
                'Некорректно указан пункт отправления СДЭК.',
            );
        }

        if (
            $deliveryPoint !== null &&
            trim($deliveryPoint) === ''
        ) {
            throw new InvalidArgumentException(
                'Некорректно указан пункт получения СДЭК.',
            );
        }
    }

    /**
     * Проверяет параметры упаковки.
     *
     * @param array<int, array{
     *     weight: int,
     *     length: int,
     *     width: int,
     *     height: int
     * }> $packages
     */
    private function validatePackages(array $packages): void
    {
        if ($packages === []) {
            throw new InvalidArgumentException(
                'Необходимо указать хотя бы одну посылку.',
            );
        }

        foreach ($packages as $package) {
            foreach (['weight', 'length', 'width', 'height'] as $field) {
                if (
                    !isset($package[$field]) ||
                    (int) $package[$field] < 1
                ) {
                    throw new InvalidArgumentException(
                        'Некорректные параметры упаковки.',
                    );
                }
            }
        }
    }
}
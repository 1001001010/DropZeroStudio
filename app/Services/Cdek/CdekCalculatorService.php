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
     * Для отправления и получения можно указать адрес или ПВЗ СДЭК.
     * Вес указывается в граммах, габариты — в сантиметрах.
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
        if ($fromLocation === [] && !$shipmentPoint) {
            throw new InvalidArgumentException(
                'Укажите адрес или пункт отправления СДЭК.'
            );
        }

        if ($toLocation === [] && !$deliveryPoint) {
            throw new InvalidArgumentException(
                'Укажите адрес или пункт получения СДЭК.'
            );
        }

        if (empty($fromLocation)) {
            throw new InvalidArgumentException(
                'Необходимо указать город отправления.'
            );
        }

        if (empty($toLocation)) {
            throw new InvalidArgumentException(
                'Необходимо указать город получения.'
            );
        }

        // if ($fromLocation !== [] && $shipmentPoint) {
        //     throw new InvalidArgumentException(
        //         'Нельзя одновременно указывать адрес и ПВЗ отправления.'
        //     );
        // }

        // if ($toLocation !== [] && $deliveryPoint) {
        //     throw new InvalidArgumentException(
        //         'Нельзя одновременно указывать адрес и ПВЗ получения.'
        //     );
        // }

        if ($packages === []) {
            throw new InvalidArgumentException(
                'Необходимо указать хотя бы одну посылку.'
            );
        }

        $payload = [
            'type' => 2,
            'currency' => 1,
            'lang' => 'rus',
            'packages' => $packages,
        ];

        if ($fromLocation !== []) {
            $payload['from_location'] = $fromLocation;
        }

        if ($toLocation !== []) {
            $payload['to_location'] = $toLocation;
        }

        if ($shipmentPoint) {
            $payload['shipment_point'] = $shipmentPoint;
        }

        if ($deliveryPoint) {
            $payload['delivery_point'] = $deliveryPoint;
        }

        $response = $this->client->post(
            'calculator/tarifflist',
            $payload,
        );

        $tariffs = $response['tariff_codes'] ?? null;

        if (!is_array($tariffs)) {
            throw new RuntimeException(
                'СДЭК вернул некорректный ответ при расчёте доставки.'
            );
        }

        // Убираем дубликаты тарифов по их коду.
        $uniqueTariffs = [];

        foreach ($tariffs as $tariff) {
            if (!isset($tariff['tariff_code'])) {
                continue;
            }

            $code = (int) $tariff['tariff_code'];

            $uniqueTariffs[$code] = [
                'tariff_code' => $code,
                'tariff_name' => (string) ($tariff['tariff_name'] ?? ''),
                'tariff_description' => (string) ($tariff['tariff_description'] ?? ''),
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
}
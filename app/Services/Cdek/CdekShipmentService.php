<?php

declare(strict_types=1);

namespace App\Services\Cdek;

use InvalidArgumentException;

class CdekShipmentService
{
    public function __construct(
        private readonly CdekClient $client,
    ) {
    }

    /**
     * Создаёт заказ на доставку в СДЭК.
     *
     * Пока используем тестовый API. Метод возвращает исходный
     * ответ СДЭК, включая UUID и информацию об обработке запроса.
     */
    public function create(
        int $tariffCode,
        array $sender,
        array $recipient,
        array $packages,
        ?array $fromLocation = null,
        ?array $toLocation = null,
        ?string $shipmentPoint = null,
        ?string $deliveryPoint = null,
        ?string $number = null,
        ?string $comment = null,
    ): array {
        $payload = $this->buildPayload(
            tariffCode: $tariffCode,
            sender: $sender,
            recipient: $recipient,
            packages: $packages,
            fromLocation: $fromLocation,
            toLocation: $toLocation,
            shipmentPoint: $shipmentPoint,
            deliveryPoint: $deliveryPoint,
            number: $number,
            comment: $comment,
        );

        return $this->client->post('orders', $payload);
    }

    /**
     * Формирует и проверяет JSON для создания отправления.
     *
     * Метод не обращается к API — его можно безопасно
     * использовать для предварительной проверки данных.
     */
    public function buildPayload(
        int $tariffCode,
        array $sender,
        array $recipient,
        array $packages,
        ?array $fromLocation = null,
        ?array $toLocation = null,
        ?string $shipmentPoint = null,
        ?string $deliveryPoint = null,
        ?string $number = null,
        ?string $comment = null,
    ): array {
        $this->validateTariff($tariffCode);

        $this->validateContact($sender, 'отправителя');
        $this->validateContact($recipient, 'получателя');

        $this->validateLocation(
            $fromLocation,
            $shipmentPoint,
            'отправления',
        );

        $this->validateLocation(
            $toLocation,
            $deliveryPoint,
            'получения',
        );

        $this->validatePackages($packages);

        // Базовые данные заказа на доставку.
        $payload = [
            'type' => 2,
            'tariff_code' => $tariffCode,
            'sender' => $sender,
            'recipient' => $recipient,
            'packages' => $packages,
        ];

        // На каждой стороне передаём либо адрес, либо код ПВЗ.
        if ($fromLocation !== null) {
            $payload['from_location'] = $fromLocation;
        } else {
            $payload['shipment_point'] = trim($shipmentPoint);
        }

        if ($toLocation !== null) {
            $payload['to_location'] = $toLocation;
        } else {
            $payload['delivery_point'] = trim($deliveryPoint);
        }

        if ($number !== null && trim($number) !== '') {
            $payload['number'] = trim($number);
        }

        if ($comment !== null && trim($comment) !== '') {
            $payload['comment'] = trim($comment);
        }

        return $payload;
    }

    /**
     * Проверяет код тарифа.
     */
    private function validateTariff(int $tariffCode): void
    {
        if ($tariffCode <= 0) {
            throw new InvalidArgumentException(
                'Необходимо указать корректный код тарифа СДЭК.',
            );
        }
    }

    /**
     * Проверяет контактные данные отправителя или получателя.
     */
    private function validateContact(array $contact, string $role): void
    {
        if (
            !isset($contact['name'])
            || trim((string) $contact['name']) === ''
        ) {
            throw new InvalidArgumentException(
                "Необходимо указать имя {$role}.",
            );
        }

        if (
            empty($contact['phones'])
            || !is_array($contact['phones'])
        ) {
            throw new InvalidArgumentException(
                "Необходимо указать телефон {$role}.",
            );
        }

        foreach ($contact['phones'] as $phone) {
            if (
                !is_array($phone)
                || empty($phone['number'])
            ) {
                throw new InvalidArgumentException(
                    "Некорректный телефон {$role}.",
                );
            }
        }
    }

    /**
     * Проверяет способ отправления или получения.
     */
    private function validateLocation(
        ?array $location,
        ?string $point,
        string $role,
    ): void {
        $hasLocation = $location !== null && $location !== [];
        $hasPoint = $point !== null && trim($point) !== '';

        if ($hasLocation === $hasPoint) {
            throw new InvalidArgumentException(
                "Укажите только один вариант {$role}: адрес или ПВЗ СДЭК.",
            );
        }

        if (!$hasLocation) {
            return;
        }

        if (empty($location['code'])) {
            throw new InvalidArgumentException(
                "Для {$role} необходимо указать код города СДЭК.",
            );
        }

        if (
            !isset($location['address'])
            || trim((string) $location['address']) === ''
        ) {
            throw new InvalidArgumentException(
                "Для {$role} необходимо указать полный адрес.",
            );
        }
    }

    /**
     * Проверяет список грузовых мест.
     *
     * Вес — в граммах, размеры — в сантиметрах.
     */
    private function validatePackages(array $packages): void
    {
        if ($packages === []) {
            throw new InvalidArgumentException(
                'Необходимо указать хотя бы одну упаковку.',
            );
        }

        foreach ($packages as $index => $package) {
            $requiredFields = [
                'number',
                'weight',
                'length',
                'width',
                'height',
            ];

            foreach ($requiredFields as $field) {
                if (!array_key_exists($field, $package)) {
                    throw new InvalidArgumentException(
                        'В упаковке №' . ($index + 1)
                        . " отсутствует поле {$field}.",
                    );
                }
            }

            if (trim((string) $package['number']) === '') {
                throw new InvalidArgumentException(
                    'Необходимо указать номер упаковки №' . ($index + 1) . '.',
                );
            }

            foreach (['weight', 'length', 'width', 'height'] as $field) {
                if (
                    !is_numeric($package[$field])
                    || (float) $package[$field] <= 0
                ) {
                    throw new InvalidArgumentException(
                        "Некорректное значение {$field} "
                        . 'в упаковке №' . ($index + 1) . '.',
                    );
                }
            }
        }
    }
}
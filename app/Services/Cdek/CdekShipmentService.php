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
     * Возвращает исходный ответ API, включая UUID отправления
     * и информацию об обработке запроса.
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
     * Формирует и проверяет данные для создания отправления.
     *
     * Метод не обращается к API и может использоваться
     * отдельно для предварительной проверки payload.
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

        // Компания обязательна для отправителя, но не для получателя.
        $this->validateContact(
            contact: $sender,
            role: 'отправителя',
            requireCompany: true,
        );

        $this->validateContact(
            contact: $recipient,
            role: 'получателя',
        );

        // Проверяем способы отправления и получения.
        $this->validateLocation(
            location: $fromLocation,
            point: $shipmentPoint,
            role: 'отправления',
        );

        $this->validateLocation(
            location: $toLocation,
            point: $deliveryPoint,
            role: 'получения',
        );

        $this->validatePackages($packages);

        // Приводим контакты к формату API СДЭК.
        $senderPayload = $this->normalizeContact(
            contact: $sender,
            includeCompany: true,
        );

        $recipientPayload = $this->normalizeContact(
            contact: $recipient,
        );

        // Приводим упаковки к ожидаемой структуре API.
        $packagesPayload = $this->normalizePackages($packages);

        $payload = [
            'type' => 2,
            'tariff_code' => $tariffCode,
            'sender' => $senderPayload,
            'recipient' => $recipientPayload,
            'packages' => $packagesPayload,
        ];

        /*
         * Для каждой стороны передаём только один вариант:
         * адресную доставку или код пункта СДЭК.
         */
        if ($fromLocation !== null) {
            $payload['from_location'] = $this->normalizeLocation(
                $fromLocation,
            );
        } else {
            $payload['shipment_point'] = trim((string) $shipmentPoint);
        }

        if ($toLocation !== null) {
            $payload['to_location'] = $this->normalizeLocation(
                $toLocation,
            );
        } else {
            $payload['delivery_point'] = trim((string) $deliveryPoint);
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
    private function validateContact(
        array $contact,
        string $role,
        bool $requireCompany = false,
    ): void {
        if (
            !isset($contact['name'])
            || trim((string) $contact['name']) === ''
        ) {
            throw new InvalidArgumentException(
                "Необходимо указать имя {$role}.",
            );
        }

        if (
            $requireCompany
            && (
                !isset($contact['company'])
                || trim((string) $contact['company']) === ''
            )
        ) {
            throw new InvalidArgumentException(
                "Необходимо указать название компании {$role}.",
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
                || !isset($phone['number'])
                || trim((string) $phone['number']) === ''
            ) {
                throw new InvalidArgumentException(
                    "Некорректный телефон {$role}.",
                );
            }
        }
    }

    /**
     * Приводит контакт к формату API СДЭК.
     */
    private function normalizeContact(
        array $contact,
        bool $includeCompany = false,
    ): array {
        $result = [
            'name' => trim((string) $contact['name']),
            'phones' => [],
        ];

        if ($includeCompany) {
            $result['company'] = trim((string) $contact['company']);
        }

        foreach ($contact['phones'] as $phone) {
            $result['phones'][] = [
                'number' => trim((string) $phone['number']),
            ];
        }

        if (
            isset($contact['email'])
            && trim((string) $contact['email']) !== ''
        ) {
            $result['email'] = trim((string) $contact['email']);
        }

        return $result;
    }

    /**
     * Проверяет способ отправления или получения.
     *
     * Для каждого направления должен быть указан ровно один вариант:
     * полный адрес или код пункта СДЭК.
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

        if (
            !isset($location['code'])
            || !is_numeric($location['code'])
            || (int) $location['code'] <= 0
        ) {
            throw new InvalidArgumentException(
                "Для {$role} необходимо указать корректный код города СДЭК.",
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
     * Приводит адрес к формату API СДЭК.
     */
    private function normalizeLocation(array $location): array
    {
        return [
            'code' => (int) $location['code'],
            'address' => trim((string) $location['address']),
        ];
    }

    /**
     * Проверяет список грузовых мест.
     *
     * Вес указывается в граммах, размеры — в сантиметрах.
     * Комментарий обязателен согласно требованиям API,
     * полученным при проверке запроса СДЭК.
     */
    private function validatePackages(array $packages): void
    {
        if ($packages === []) {
            throw new InvalidArgumentException(
                'Необходимо указать хотя бы одну упаковку.',
            );
        }

        foreach ($packages as $index => $package) {
            if (!is_array($package)) {
                throw new InvalidArgumentException(
                    'Некорректные данные упаковки №' . ($index + 1) . '.',
                );
            }

            $requiredFields = [
                'number',
                'weight',
                'length',
                'width',
                'height',
                'comment',
            ];

            foreach ($requiredFields as $field) {
                if (!array_key_exists($field, $package)) {
                    throw new InvalidArgumentException(
                        'В упаковке №' . ($index + 1)
                        . " отсутствует обязательное поле {$field}.",
                    );
                }
            }

            if (trim((string) $package['number']) === '') {
                throw new InvalidArgumentException(
                    'Необходимо указать номер упаковки №'
                    . ($index + 1) . '.',
                );
            }

            if (trim((string) $package['comment']) === '') {
                throw new InvalidArgumentException(
                    'Необходимо указать комментарий упаковки №'
                    . ($index + 1) . '.',
                );
            }

            foreach (
                ['weight', 'length', 'width', 'height'] as $field
            ) {
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

    /**
     * Приводит грузовые места к формату API СДЭК.
     */
    private function normalizePackages(array $packages): array
    {
        $result = [];

        foreach ($packages as $package) {
            $result[] = [
                'number' => trim((string) $package['number']),
                'weight' => (int) $package['weight'],
                'length' => (int) $package['length'],
                'width' => (int) $package['width'],
                'height' => (int) $package['height'],
                'comment' => trim((string) $package['comment']),
            ];
        }

        return $result;
    }

    /**
     * Получает информацию об отправлении СДЭК по UUID.
     */
    public function get(string $uuid): array
    {
        $this->validateUuid($uuid);

        return $this->client->get(
            'orders/' . rawurlencode($uuid),
        );
    }

    /**
     * Отправляет запрос на отмену отправления СДЭК.
     *
     * Фактический статус отмены необходимо проверить
     * последующей синхронизацией.
     */
    public function cancel(string $uuid): array
    {
        $this->validateUuid($uuid);

        return $this->client->delete(
            'orders/' . rawurlencode($uuid),
        );
    }

    /**
     * Проверяет UUID отправления.
     */
    private function validateUuid(string $uuid): void
    {
        if (trim($uuid) === '') {
            throw new InvalidArgumentException(
                'Необходимо указать UUID отправления СДЭК.',
            );
        }
    }

    /**
     * Преобразует историю статусов СДЭК во внутренний статус отправления.
     *
     * @param array<string, mixed> $order
     * @return array{
     *     status: string|null,
     *     shipped_at: \Carbon\Carbon|null,
     *     delivered_at: \Carbon\Carbon|null,
     *     tracking_number: string|null,
     *     statuses: array
     * }
     */
    public function getStatusSummary(array $order): array
    {
        $statuses = $order['statuses'] ?? [];

        if (!is_array($statuses)) {
            $statuses = [];
        }

        // Сортируем события по времени от старых к новым.
        usort($statuses, function (array $first, array $second): int {
            $firstDate = strtotime($first['date_time'] ?? '') ?: 0;
            $secondDate = strtotime($second['date_time'] ?? '') ?: 0;

            return $firstDate <=> $secondDate;
        });

        /**
         * Статусы оформления и подготовки отправления.
         */
        $preparingStatuses = [
            'CREATED',
            'ACCEPTED',
            'RECEIVED_AT_SHIPMENT_WAREHOUSE',
            'READY_FOR_SHIPMENT_IN_SENDER_CITY',
            'READY_TO_SHIP_AT_SENDING_OFFICE',
            'RETURNED_TO_SENDER_WAREHOUSE',
        ];

        /**
         * Статусы движения отправления.
         *
         * Сюда также входят промежуточные склады, таможня,
         * пункты выдачи и передача курьеру.
         */
        $inTransitStatuses = [
            'PASSED_TO_CARRIER_AT_SENDING_OFFICE',
            'TAKEN_BY_TRANSPORTER_FROM_SENDER_CITY',
            'SEND_TO_TRANSIT_OFFICE',
            'SENT_TO_TRANSIT_CITY',
            'MET_AT_TRANSIT_OFFICE',
            'ACCEPTED_TO_OFFICE_TRANSIT_WAREHOUSE',
            'ACCEPTED_IN_TRANSIT_CITY',
            'ACCEPTED_AT_TRANSIT_WAREHOUSE',
            'ACCEPTED_AT_TRANSIT_WAREHOUS',
            'ENTERED_TO_OFFICE_TRANSIT_WAREHOUSE',
            'READY_TO_SHIP_IN_TRANSIT_OFFICE',
            'PASSED_TO_CARRIER_AT_TRANSIT_OFFICE',
            'TAKEN_BY_TRANSPORTER_FROM_TRANSIT_CITY',
            'RETURNED_TO_TRANSIT_WAREHOUSE',
            'SEND_TO_SENDING_OFFICE',
            'MET_AT_SENDING_OFFICE',
            'SEND_TO_RECIPIENT_OFFICE',
            'SENT_TO_RECIPIENT_CITY',
            'MET_AT_RECIPIENT_OFFICE',
            'ACCEPTED_IN_RECIPIENT_CITY',
            'ACCEPTED_AT_DELIVERY_WAREHOUSE',
            'ACCEPTED_AT_WAREHOUSE_ON_DEMAND',
            'ENTERED_TO_DELIVERY_WAREHOUSE',
            'ENTERED_TO_WAREHOUSE_ON_DEMAND',
            'RETURNED_TO_DELIVERY_WAREHOUSE',
            'RETURNED_TO_RECIPIENT_CITY_WAREHOUSE',
            'ISSUED_FOR_DELIVERY',
            'TAKEN_BY_COURIER',
            'IN_CUSTOMS_INTERNATIONAL',
            'IN_CUSTOMS_LOCAL',
            'CUSTOMS_COMPLETE',
            'SHIPPED_TO_DESTINATION',
            'PASSED_TO_TRANSIT_CARRIER',
            'POSTOMAT_POSTED',
            'POSTOMAT_SEIZED',
            'READY_TO_SHIP_AT_SENDING_OFFICE',
        ];

        /**
         * События, означающие фактическую передачу отправления
         * перевозчику или начало его движения.
         */
        $shippedStatuses = [
            'PASSED_TO_CARRIER_AT_SENDING_OFFICE',
            'TAKEN_BY_TRANSPORTER_FROM_SENDER_CITY',
            'SEND_TO_TRANSIT_OFFICE',
            'SENT_TO_TRANSIT_CITY',
            'PASSED_TO_CARRIER_AT_TRANSIT_OFFICE',
            'TAKEN_BY_TRANSPORTER_FROM_TRANSIT_CITY',
            'SEND_TO_SENDING_OFFICE',
            'SEND_TO_RECIPIENT_OFFICE',
            'SENT_TO_RECIPIENT_CITY',
            'SHIPPED_TO_DESTINATION',
            'PASSED_TO_TRANSIT_CARRIER',
        ];

        $deliveredStatuses = [
            'DELIVERED',
            'POSTOMAT_RECEIVED',
        ];

        // Определяем последний известный внутренний статус.
        $status = null;

        foreach (array_reverse($statuses) as $event) {
            $code = $event['code'] ?? null;

            if (!is_string($code)) {
                continue;
            }

            if (in_array($code, $deliveredStatuses, true)) {
                $status = 'delivered';
                break;
            }

            if ($code === 'RETURNED') {
                $status = 'returned';
                break;
            }

            if (in_array($code, $inTransitStatuses, true)) {
                $status = 'in_transit';
                break;
            }

            if (in_array($code, $preparingStatuses, true)) {
                $status = 'preparing';
                break;
            }
        }

        // Определяем дату первой передачи отправления перевозчику.
        $shippedAt = null;

        foreach ($statuses as $event) {
            $code = $event['code'] ?? null;
            $dateTime = $event['date_time'] ?? null;

            if (
                is_string($code)
                && in_array($code, $shippedStatuses, true)
                && is_string($dateTime)
                && $dateTime !== ''
            ) {
                $shippedAt = \Carbon\Carbon::parse($dateTime);
                break;
            }
        }

        // Определяем дату доставки.
        $deliveredAt = null;

        foreach (array_reverse($statuses) as $event) {
            $code = $event['code'] ?? null;
            $dateTime = $event['date_time'] ?? null;

            if (
                is_string($code)
                && in_array($code, $deliveredStatuses, true)
                && is_string($dateTime)
                && $dateTime !== ''
            ) {
                $deliveredAt = \Carbon\Carbon::parse($dateTime);
                break;
            }
        }

        return [
            'status' => $status,
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
            'tracking_number' => $order['cdek_number']
                ?? $order['entity']['cdek_number']
                ?? null,
            'statuses' => $statuses,
        ];
    }
}

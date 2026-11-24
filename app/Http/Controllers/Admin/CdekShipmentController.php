<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Cdek\CdekShipmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use RuntimeException;
use Throwable;

class CdekShipmentController extends Controller
{
    /**
     * Создаёт отправление СДЭК для заказа.
     */
    public function store(
        Request $request,
        Order $order,
        CdekShipmentService $shipmentService,
    ): JsonResponse {
        $validated = $request->validate([
            'tariff_code' => ['required', 'integer', 'min:1'],
            'tariff_name' => ['required', 'string', 'max:255'],
            'delivery_cost' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'delivery_mode' => ['required', 'in:pvz,address'],

            // Данные отправителя.
            'sender.name' => ['required', 'string', 'max:255'],
            'sender.company' => ['required', 'string', 'max:255'],
            'sender.phone' => ['required', 'string', 'max:30'],
            'sender.email' => ['nullable', 'email', 'max:255'],
            'sender.city' => ['required', 'string', 'max:150'],
            'sender.city_code' => ['nullable', 'integer', 'min:1'],
            'sender.cityCode' => ['nullable', 'integer', 'min:1'],
            'sender.address' => ['nullable', 'string', 'max:1000'],
            'sender.shipment_point' => ['nullable', 'string', 'max:64'],
            'sender.from_location.code' => ['nullable', 'integer', 'min:1'],
            'sender.from_location.address' => ['nullable', 'string', 'max:1000'],

            // Данные получателя.
            'recipient.name' => ['required', 'string', 'max:255'],
            'recipient.phone' => ['required', 'string', 'max:30'],
            'recipient.email' => ['nullable', 'email', 'max:255'],
            'recipient.country' => ['nullable', 'string', 'max:100'],
            'recipient.city' => ['required', 'string', 'max:150'],
            'recipient.postal_code' => ['nullable', 'string', 'max:32'],
            'recipient.city_code' => ['nullable', 'integer', 'min:1'],
            'recipient.cityCode' => ['nullable', 'integer', 'min:1'],
            'recipient.address' => ['nullable', 'string', 'max:1000'],
            'recipient.delivery_point' => ['nullable', 'string', 'max:64'],
            'recipient.to_location.code' => ['nullable', 'integer', 'min:1'],
            'recipient.to_location.address' => ['nullable', 'string', 'max:1000'],

            // Грузовые места.
            'packages' => ['required', 'array', 'min:1'],
            'packages.*.number' => ['required', 'string', 'max:36'],
            'packages.*.weight' => ['required', 'integer', 'min:1'],
            'packages.*.length' => ['required', 'integer', 'min:1'],
            'packages.*.width' => ['required', 'integer', 'min:1'],
            'packages.*.height' => ['required', 'integer', 'min:1'],
            'packages.*.comment' => ['required', 'string', 'max:255'],

            'comment' => ['nullable', 'string', 'max:255'],
        ]);

        $sender = $validated['sender'];
        $recipient = $validated['recipient'];
        $packages = $validated['packages'];

        /*
         * Для ПВЗ передаём коды пунктов.
         * Для адресной доставки передаём код города и полный адрес.
         */
        if ($validated['delivery_mode'] === 'pvz') {
            $fromLocation = null;
            $toLocation = null;

            $shipmentPoint = $sender['shipment_point'] ?? null;
            $deliveryPoint = $recipient['delivery_point'] ?? null;
        } else {
            $fromLocation = $sender['from_location'] ?? [
                'code' => $sender['city_code']
                    ?? $sender['cityCode']
                    ?? null,
                'address' => $sender['address'] ?? null,
            ];

            $toLocation = $recipient['to_location'] ?? [
                'code' => $recipient['city_code']
                    ?? $recipient['cityCode']
                    ?? null,
                'address' => $recipient['address'] ?? null,
            ];

            $shipmentPoint = null;
            $deliveryPoint = null;
        }

        // Проверяем направление отправления.
        $this->validateDeliveryDestination(
            $fromLocation,
            $shipmentPoint,
            'sender',
        );

        // Проверяем направление получения.
        $this->validateDeliveryDestination(
            $toLocation,
            $deliveryPoint,
            'recipient',
        );

        /*
         * Компания обязательна для отправителя.
         * У получателя поле company не требуется.
         */
        $senderContact = $this->buildContact(
            contact: $sender,
            includeCompany: true,
        );

        $recipientContact = $this->buildContact(
            contact: $recipient,
        );

        $firstPackage = $packages[0];

        /*
         * Создаём локальную запись до обращения к СДЭК.
         *
         * Блокировка заказа защищает от параллельного создания
         * нескольких отправлений для одного заказа.
         */
        $shipment = DB::transaction(function () use ($order, $validated, $sender, $recipient, $firstPackage, ) {
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOrder->shipment()->exists()) {
                throw ValidationException::withMessages([
                    'shipment' => 'Для этого заказа отправление уже создано.',
                ]);
            }

            return $lockedOrder->shipment()->create([
                'provider' => 'cdek',
                'status' => ShipmentStatus::Preparing,

                // Получатель.
                'recipient_name' => $recipient['name'],
                'phone' => $recipient['phone'],
                'country' => $recipient['country'] ?? 'Россия',
                'city' => $recipient['city'],

                'postal_code' => $recipient['postal_code'] ?? null,

                'address' => $recipient['address']
                    ?? $recipient['to_location']['address']
                    ?? null,

                // Коды городов.
                'from_city_code' => $sender['city_code']
                    ?? $sender['cityCode']
                    ?? $sender['from_location']['code']
                    ?? null,

                'to_city_code' => $recipient['city_code']
                    ?? $recipient['cityCode']
                    ?? $recipient['to_location']['code']
                    ?? null,

                'from_city' => $sender['city'],
                'to_city' => $recipient['city'],

                // Способ и тариф доставки.
                'delivery_mode' => $validated['delivery_mode'],
                'tariff_code' => $validated['tariff_code'],
                'tariff_name' => $validated['tariff_name'],

                // Пункт выдачи.
                'pickup_point_code' => $validated['delivery_mode'] === 'pvz'
                    ? ($recipient['delivery_point'] ?? null)
                    : null,

                'pickup_point_address' => $validated['delivery_mode'] === 'pvz'
                    ? ($recipient['address'] ?? null)
                    : null,

                // Параметры посылки.
                'weight' => $firstPackage['weight'],
                'length' => $firstPackage['length'],
                'width' => $firstPackage['width'],
                'height' => $firstPackage['height'],

                // Стоимость.
                'delivery_cost' => $validated['delivery_cost'],
                'currency' => $validated['currency'] ?? 'RUB',

                // Исходные данные для синхронизации.
                'shipping_data' => [
                    'sender' => $sender,
                    'recipient' => $recipient,
                    'packages' => $validated['packages'],
                    'comment' => $validated['comment'] ?? null,
                    'delivery' => [
                        'mode' => $validated['delivery_mode'],
                        'tariff_code' => $validated['tariff_code'],
                        'tariff_name' => $validated['tariff_name'],
                        'cost' => $validated['delivery_cost'],
                        'currency' => $validated['currency'] ?? 'RUB',
                    ],
                ],
            ]);
        });

        try {
            // Отправляем запрос на создание отправления в СДЭК.
            $response = $shipmentService->create(
                tariffCode: $validated['tariff_code'],
                sender: $senderContact,
                recipient: $recipientContact,
                packages: $packages,
                fromLocation: $fromLocation,
                toLocation: $toLocation,
                shipmentPoint: $shipmentPoint,
                deliveryPoint: $deliveryPoint,
                comment: $validated['comment'] ?? null,
            );

            $entity = $response['entity'] ?? [];
            $requests = $response['requests'] ?? [];

            // UUID отправления и UUID запроса регистрации — разные значения.
            $shipmentUuid = $entity['uuid'] ?? null;
            $requestUuid = $requests[0]['request_uuid'] ?? null;

            if (!$shipmentUuid) {
                throw new RuntimeException(
                    'СДЭК не вернул UUID созданного отправления.',
                );
            }

            // Сохраняем ответ СДЭК и идентификаторы.
            $shipment->update([
                'provider_order_id' => $shipmentUuid,
                'tracking_number' => $entity['cdek_number'] ?? null,

                'shipping_data' => array_merge(
                    $shipment->shipping_data ?? [],
                    [
                        'response' => $response,
                        'shipment_uuid' => $shipmentUuid,
                        'request_uuid' => $requestUuid,
                    ],
                ),
            ]);

            return response()->json([
                'message' => 'Запрос на создание отправления отправлен в СДЭК.',
                'shipment' => $shipment->fresh(),
            ], 201);
        } catch (Throwable $exception) {
            /*
             * Не удаляем локальную запись автоматически.
             * При сетевой ошибке нельзя гарантировать, что СДЭК
             * не успел принять запрос и создать отправление.
             */
            report($exception);

            throw $exception;
        }
    }

    /**
     * Проверяет, что указано ровно одно направление:
     * адресная доставка или пункт СДЭК.
     */
    private function validateDeliveryDestination(
        ?array $location,
        ?string $point,
        string $field,
    ): void {
        $hasLocation = filled($location);
        $hasPoint = filled($point);

        if ($hasLocation === $hasPoint) {
            throw ValidationException::withMessages([
                $field => 'Укажите либо адрес, либо код пункта СДЭК.',
            ]);
        }

        if (
            $hasLocation
            && (
                empty($location['code'])
                || empty($location['address'])
            )
        ) {
            throw ValidationException::withMessages([
                $field => 'Для адресной доставки необходимо указать код города и адрес.',
            ]);
        }
    }

    /**
     * Приводит контакт к формату API СДЭК.
     *
     * Компания передаётся только для отправителя.
     */
    private function buildContact(
        array $contact,
        bool $includeCompany = false,
    ): array {
        $result = [
            'name' => $contact['name'],
            'phones' => [
                [
                    'number' => $contact['phone'],
                ],
            ],
        ];

        if ($includeCompany && filled($contact['company'] ?? null)) {
            $result['company'] = $contact['company'];
        }

        if (filled($contact['email'] ?? null)) {
            $result['email'] = $contact['email'];
        }

        return $result;
    }

    /**
     * Синхронизирует статус отправления с данными СДЭК.
     */
    public function sync(
        Order $order,
        CdekShipmentService $shipmentService,
    ): JsonResponse {
        $shipment = $order->shipment;

        if (!$shipment || $shipment->provider !== 'cdek') {
            throw ValidationException::withMessages([
                'shipment' => 'Отправление СДЭК для этого заказа не найдено.',
            ]);
        }

        if (!$shipment->provider_order_id) {
            throw ValidationException::withMessages([
                'shipment' => 'У отправления отсутствует UUID СДЭК.',
            ]);
        }

        // Получаем актуальную информацию из API СДЭК.
        $response = $shipmentService->get(
            $shipment->provider_order_id,
        );

        $summary = $shipmentService->getStatusSummary($response);

        $shippingData = $shipment->shipping_data ?? [];

        $latestStatus = $summary['statuses'] !== []
            ? $summary['statuses'][array_key_last($summary['statuses'])]
            : null;

        $shippingData['status_sync'] = [
            'synced_at' => now()->toIso8601String(),
            'statuses' => $summary['statuses'],
            'latest_status' => $latestStatus,
        ];
        $updates = [
            'shipping_data' => $shippingData,
        ];

        // Неизвестный статус не должен перезаписывать известный.
        if ($summary['status'] !== null) {
            $updates['status'] = $summary['status'];
        }

        if ($summary['tracking_number']) {
            $updates['tracking_number'] = $summary['tracking_number'];
        }

        if ($summary['shipped_at']) {
            $updates['shipped_at'] = Carbon::parse(
                $summary['shipped_at'],
            );
        }

        if ($summary['delivered_at']) {
            $updates['delivered_at'] = Carbon::parse(
                $summary['delivered_at'],
            );
        }

        $shipment->update($updates);

        return response()->json([
            'message' => 'Статус отправления синхронизирован.',
            'shipment' => $shipment->fresh(),
        ]);
    }
}

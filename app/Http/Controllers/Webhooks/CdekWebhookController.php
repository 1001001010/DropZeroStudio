<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\OrderShipment;
use App\Services\Cdek\CdekShipmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CdekWebhookController extends Controller
{
    /**
     * Человекочитаемые названия событий СДЭК.
     *
     * @var array<string, string>
     */
    private const STATUS_TITLES = [
        'CREATED' => 'Заказ создан в СДЭК',
        'ACCEPTED' => 'Заказ принят СДЭК',
        'RECEIVED_AT_SHIPMENT_WAREHOUSE' => 'Отправление принято на склад',
        'READY_FOR_SHIPMENT_IN_SENDER_CITY' => 'Отправление готово к отправке',
        'TAKEN_BY_TRANSPORTER_FROM_SENDER_CITY' => 'Отправление передано перевозчику',
        'PASSED_TO_CARRIER_AT_SENDING_OFFICE' => 'Отправление передано перевозчику',
        'SENT_TO_TRANSIT_CITY' => 'Отправление отправлено в транзитный город',
        'SENT_TO_RECIPIENT_CITY' => 'Отправление направлено в город получателя',
        'ACCEPTED_IN_RECIPIENT_CITY' => 'Отправление прибыло в город получателя',
        'ACCEPTED_AT_PICK_UP_POINT' => 'Отправление поступило в пункт выдачи',
        'TAKEN_BY_COURIER' => 'Отправление передано курьеру',
        'ISSUED_FOR_DELIVERY' => 'Отправление выдано на доставку',
        'DELIVERED' => 'Отправление доставлено',
        'POSTOMAT_RECEIVED' => 'Отправление получено из постамата',
        'RETURNED' => 'Отправление возвращено',
    ];

    /**
     * Обрабатывает уведомление об изменении статуса отправления.
     */
    public function __invoke(
        Request $request,
        CdekShipmentService $cdek,
    ): JsonResponse {
        // Проверяем секрет уведомления.
        $secret = (string) config('services.cdek.webhook_secret');
        $token = (string) $request->query('token', '');

        abort_unless(
            $secret !== '' && hash_equals($secret, $token),
            403,
        );

        $data = $request->validate([
            'type' => ['required', 'string'],
            'uuid' => ['required', 'string', 'max:64'],
            'attributes' => ['required', 'array'],
            'attributes.code' => ['required', 'string', 'max:128'],
            'attributes.status_date_time' => ['nullable', 'date'],
        ]);

        // Пока обрабатываем только события изменения статуса.
        if ($data['type'] !== 'ORDER_STATUS') {
            return response()->json(['ok' => true]);
        }

        $shipment = OrderShipment::query()
            ->where('provider', 'cdek')
            ->where('provider_order_id', $data['uuid'])
            ->first();

        if (!$shipment) {
            Log::warning('CDEK webhook: отправление не найдено.', [
                'uuid' => $data['uuid'],
            ]);

            return response()->json(['ok' => true]);
        }

        // Запрашиваем полную актуальную информацию у СДЭК.
        $order = $cdek->get($data['uuid']);
        $summary = $cdek->getStatusSummary($order);

        $attributes = $data['attributes'];
        $eventCode = $attributes['code'];

        // Уникальный ключ конкретного события СДЭК.
        $eventKey = hash('sha256', implode('|', [
            $data['uuid'],
            $eventCode,
            $attributes['status_date_time'] ?? '',
            (string) ($attributes['is_return'] ?? false),
            (string) ($attributes['is_reverse'] ?? false),
            (string) ($attributes['is_client_return'] ?? false),
        ]));

        DB::transaction(function () use ($shipment, $data, $order, $summary, $attributes, $eventCode, $eventKey, ): void {
            $shipment = OrderShipment::query()
                ->lockForUpdate()
                ->findOrFail($shipment->id);

            // Обновляем сведения об отправлении.
            $updates = [
                'shipping_data' => array_merge(
                    $shipment->shipping_data ?? [],
                    [
                        'cdek_order' => $order,
                        'last_webhook' => $data,
                    ],
                ),
            ];

            foreach ([
                'status',
                'tracking_number',
                'shipped_at',
                'delivered_at',
            ] as $field) {
                if (isset($summary[$field])) {
                    $updates[$field] = $summary[$field];
                }
            }

            $shipment->update($updates);

            // Формируем комментарий к событию.
            $commentParts = [
                "Код события СДЭК: {$eventCode}",
            ];

            if (!empty($attributes['city'])) {
                $commentParts[] = "Город: {$attributes['city']}";
            }

            if (!empty($attributes['status_code'])) {
                $commentParts[] = "Код статуса: {$attributes['status_code']}";
            }

            // Записываем событие только один раз.
            DB::table('order_status_histories')->insertOrIgnore([
                'order_id' => $shipment->order_id,
                'event_type' => 'shipment',
                'event_key' => $eventKey,
                'title' => self::STATUS_TITLES[$eventCode]
                    ?? 'Обновлён статус отправления',
                'old_status' => null,
                'new_status' => null,
                'comment' => implode('. ', $commentParts),
                'changed_by' => null,
                'created_at' => !empty($attributes['status_date_time'])
                    ? Carbon::parse($attributes['status_date_time'])
                    : now(),
            ]);
        });

        return response()->json(['ok' => true]);
    }
}

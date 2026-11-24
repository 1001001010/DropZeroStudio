<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\OrderShipment;
use App\Services\Cdek\CdekShipmentService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncCdekShipments extends Command
{
    /**
     * Имя команды Artisan.
     */
    protected $signature = 'cdek:sync-shipments';

    /**
     * Описание команды.
     */
    protected $description = 'Синхронизация статусов отправлений СДЭК';

    public function handle(CdekShipmentService $shipmentService): int
    {
        $shipments = OrderShipment::query()
            ->where('provider', 'cdek')
            ->whereNotNull('provider_order_id')
            ->whereIn('status', [
                'preparing',
                'in_transit',
            ])
            ->get();

        $this->info("Найдено отправлений: {$shipments->count()}");

        foreach ($shipments as $shipment) {
            try {
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

                $this->info(
                    "Отправление #{$shipment->id}: синхронизировано.",
                );
            } catch (Throwable $exception) {
                Log::error('Ошибка синхронизации отправления СДЭК.', [
                    'shipment_id' => $shipment->id,
                    'provider_order_id' => $shipment->provider_order_id,
                    'error' => $exception->getMessage(),
                ]);

                $this->error(
                    "Отправление #{$shipment->id}: {$exception->getMessage()}",
                );
            }
        }

        return self::SUCCESS;
    }
}
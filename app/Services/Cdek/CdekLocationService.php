<?php

namespace App\Services\Cdek;

use Illuminate\Support\Collection;
use InvalidArgumentException;

/**
 * Сервис для работы с географическими данными СДЭК.
 *
 * Позволяет искать города, получать информацию о городе
 * и находить пункты выдачи заказов.
 */
class CdekLocationService
{
    /**
     * HTTP-клиент для взаимодействия с API СДЭК.
     */
    public function __construct(
        private readonly CdekClient $client,
    ) {
    }

    /**
     * Поиск городов по названию.
     *
     * @param string $city Название или часть названия города.
     * @param string|null $countryCode ISO-код страны (RU, BY, KZ и т.д.).
     * @param int $size Максимальное количество результатов.
     *
     * @return array
     */
    public function searchCities(
        string $city,
        ?string $countryCode = 'RU',
        int $size = 10,
    ): array {
        $city = trim($city);

        if ($city === '') {
            throw new InvalidArgumentException(
                'Название города не может быть пустым.',
            );
        }

        if ($size < 1 || $size > 1000) {
            throw new InvalidArgumentException(
                'Количество результатов должно быть от 1 до 1000.',
            );
        }

        $params = [
            'city' => $city,
            'size' => $size,
        ];

        if ($countryCode !== null && $countryCode !== '') {
            $params['country_code'] = strtoupper($countryCode);
        }

        $response = $this->client->get(
            'location/cities',
            $params,
        );

        return collect($response)
            ->map(fn(array $city) => $this->formatCity($city))
            ->values()
            ->all();
    }

    /**
     * Получение города по коду СДЭК.
     *
     * @param int $cityCode Код города СДЭК.
     *
     * @return array|null
     */
    public function getCity(int $cityCode): ?array
    {
        if ($cityCode <= 0) {
            throw new InvalidArgumentException(
                'Код города должен быть положительным числом.',
            );
        }

        $response = $this->client->get(
            'location/cities',
            [
                'code' => $cityCode,
            ],
        );

        $city = collect($response)->first();

        return $city ? $this->formatCity($city) : null;
    }

    /**
     * Поиск пунктов выдачи заказов в городе.
     *
     * @param int $cityCode Код города СДЭК.
     * @param string|null $type Тип пункта: PVZ, POSTAMAT или ALL.
     *
     * @return array
     */
    public function searchPickupPoints(
        int $cityCode,
        ?string $type = 'ALL',
    ): array {
        if ($cityCode <= 0) {
            throw new InvalidArgumentException(
                'Код города должен быть положительным числом.',
            );
        }

        $params = [
            'city_code' => $cityCode,
        ];

        if ($type !== null && strtoupper($type) !== 'ALL') {
            $params['type'] = strtoupper($type);
        }

        $response = $this->client->get(
            'deliverypoints',
            $params,
        );

        return collect($response)
            ->map(fn(array $point) => $this->formatPickupPoint($point))
            ->values()
            ->all();
    }

    /**
     * Приведение ответа API города к единому формату.
     *
     * Это позволяет не зависеть от структуры ответа СДЭК
     * в остальной части приложения.
     *
     * @param array $city Ответ API.
     *
     * @return array
     */
    private function formatCity(array $city): array
    {
        return [
            'code' => $city['code'] ?? null,
            'city_uuid' => $city['city_uuid'] ?? null,
            'city' => $city['city'] ?? null,
            'country_code' => $city['country_code'] ?? null,
            'country' => $city['country'] ?? null,
            'region' => $city['region'] ?? null,
            'region_code' => $city['region_code'] ?? null,
            'sub_region' => $city['sub_region'] ?? null,
            'fias_guid' => $city['fias_guid'] ?? null,
            'longitude' => $city['longitude'] ?? null,
            'latitude' => $city['latitude'] ?? null,
            'time_zone' => $city['time_zone'] ?? null,
        ];
    }

    /**
     * Приведение ответа API пункта выдачи к единому формату.
     *
     * @param array $point Ответ API.
     *
     * @return array
     */
    private function formatPickupPoint(array $point): array
    {
        $location = $point['location'] ?? [];

        return [
            'code' => $point['code'] ?? null,
            'name' => $point['name'] ?? null,
            'type' => $point['type'] ?? null,
            'address' => $location['address'] ?? null,
            'city' => $location['city'] ?? null,
            'region' => $location['region'] ?? null,
            'country' => $location['country'] ?? null,
            'postal_code' => $location['postal_code'] ?? null,
            'latitude' => $location['latitude'] ?? null,
            'longitude' => $location['longitude'] ?? null,
            'work_time' => $point['work_time'] ?? null,
            'phones' => $point['phones'] ?? [],
            'note' => $point['note'] ?? null,
            'email' => $point['email'] ?? null,
            'office_image' => $point['office_image'] ?? null,
            'address_comment' => $point['address_comment'] ?? null,
        ];
    }
}

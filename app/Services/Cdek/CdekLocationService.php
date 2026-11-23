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
            'size' => 1000,
            'page' => 0,
        ];

        if ($type !== null && strtoupper($type) !== 'ALL') {
            $params['type'] = strtoupper($type);
        }

        $response = $this->client->get(
            'deliverypoints',
            $params,
        );

        $response = $this->client->get('deliverypoints', $params);

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
            // Основная информация
            'code' => $point['code'] ?? null,
            'uuid' => $point['uuid'] ?? null,
            'name' => $point['name'] ?? null,
            'type' => $point['type'] ?? null,
            'status' => $point['status'] ?? null,
            'owner_code' => $point['owner_code'] ?? null,

            // Адрес
            'address' => $location['address'] ?? null,
            'address_full' => $location['address_full'] ?? null,
            'address_comment' => $point['address_comment'] ?? null,
            'city' => $location['city'] ?? null,
            'region' => $location['region'] ?? null,
            'country' => $location['country_code'] ?? null,
            'postal_code' => $location['postal_code'] ?? null,

            // Координаты
            'latitude' => $location['latitude'] ?? null,
            'longitude' => $location['longitude'] ?? null,

            // Расположение
            'nearest_station' => $point['nearest_station'] ?? null,
            'nearest_metro_station' => $point['nearest_metro_station'] ?? null,

            // Контакты и график
            'work_time' => $point['work_time'] ?? null,
            'work_time_list' => $point['work_time_list'] ?? [],
            'work_time_exception_list' => $point['work_time_exception_list'] ?? [],
            'phones' => $point['phones'] ?? [],
            'email' => $point['email'] ?? null,
            'site' => $point['site'] ?? null,

            // Дополнительная информация
            'note' => $point['note'] ?? null,
            'office_images' => array_values(array_filter(
                array_map(
                    function (array $image): ?string {
                        $url = $image['url'] ?? null;

                        if (!is_string($url)) {
                            return null;
                        }

                        $path = parse_url($url, PHP_URL_PATH);

                        $uuid = basename(
                            is_string($path) ? $path : ''
                        );

                        if (!preg_match('/\A[a-f0-9-]{36}\z/i', $uuid)) {
                            return null;
                        }

                        return route('admin.cdek.office-image', [
                            'uuid' => $uuid,
                        ]);
                    },
                    $point['office_image_list'] ?? [],
                ),
            )),

            // Возможности пункта выдачи
            'take_only' => $point['take_only'] ?? false,
            'is_handout' => $point['is_handout'] ?? false,
            'is_reception' => $point['is_reception'] ?? false,
            'is_dressing_room' => $point['is_dressing_room'] ?? false,
            'have_cashless' => $point['have_cashless'] ?? false,
            'have_cash' => $point['have_cash'] ?? false,
            'have_fast_payment_system' => $point['have_fast_payment_system'] ?? false,
            'allowed_cod' => $point['allowed_cod'] ?? false,

            // Ограничения по весу
            'weight_min' => $point['weight_min'] ?? null,
            'weight_max' => $point['weight_max'] ?? null,
        ];
    }
}

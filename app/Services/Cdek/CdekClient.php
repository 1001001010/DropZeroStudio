<?php

namespace App\Services\Cdek;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CdekClient
{
    private string $baseUrl;

    private string $clientId;

    private string $clientSecret;

    public function __construct()
    {
        $this->baseUrl = rtrim(
            (string) config('services.cdek.api_url'),
            '/'
        );

        $this->clientId = (string) config('services.cdek.client_id');
        $this->clientSecret = (string) config('services.cdek.client_secret');

        if (
            $this->baseUrl === ''
            || $this->clientId === ''
            || $this->clientSecret === ''
        ) {
            throw new RuntimeException(
                'CDEK API credentials are not configured.'
            );
        }
    }

    /**
     * Получает OAuth-токен или возвращает ранее сохранённый.
     *
     * Токен кэшируется немного меньше срока его действия,
     * чтобы не использовать уже истёкший токен.
     *
     * @throws ConnectionException
     */
    public function getAccessToken(): string
    {
        $cacheKey = 'cdek_access_token_' . hash(
            'sha256',
            $this->baseUrl . '|' . $this->clientId
        );

        $cachedToken = Cache::get($cacheKey);

        if (is_string($cachedToken) && $cachedToken !== '') {
            return $cachedToken;
        }

        $response = Http::asForm()
            ->acceptJson()
            ->timeout(15)
            ->post("{$this->baseUrl}/oauth/token", [
                'grant_type' => 'client_credentials',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                'CDEK authorization failed: '
                . ($response->json('message') ?? $response->body())
            );
        }

        $token = $response->json('access_token');
        $expiresIn = (int) $response->json('expires_in', 3600);

        if (!is_string($token) || $token === '') {
            throw new RuntimeException(
                'CDEK authorization response does not contain an access token.'
            );
        }

        Cache::put(
            $cacheKey,
            $token,
            now()->addSeconds(max(1, $expiresIn - 60))
        );

        return $token;
    }

    /**
     * Выполняет GET-запрос к API СДЭК.
     *
     * @throws ConnectionException
     */
    public function get(string $endpoint, array $query = []): array
    {
        return $this->request('GET', $endpoint, $query);
    }

    /**
     * Выполняет POST-запрос к API СДЭК.
     *
     * @throws ConnectionException
     */
    public function post(string $endpoint, array $payload = []): array
    {
        return $this->request('POST', $endpoint, $payload);
    }

    /**
     * Общий метод отправки запросов с авторизацией.
     *
     * @throws ConnectionException
     */
    private function request(
        string $method,
        string $endpoint,
        array $data = []
    ): array {
        $url = "{$this->baseUrl}/" . ltrim($endpoint, '/');

        $options = strtoupper($method) === 'GET'
            ? ['query' => $data]
            : ['json' => $data];

        $response = Http::acceptJson()
            ->withToken($this->getAccessToken())
            ->timeout(30)
            ->send(strtoupper($method), $url, $options);

        if ($response->failed()) {
            $message = $response->json('message') ?? $response->body();

            throw new RuntimeException(
                "CDEK API error ({$response->status()}): {$message}"
            );
        }

        $result = $response->json();

        if (!is_array($result)) {
            throw new RuntimeException(
                'CDEK API returned an invalid response.'
            );
        }

        return $result;
    }
}
<?php

namespace App\Http\Controllers\Admin\Cdek;

use App\Http\Controllers\Controller;
use App\Services\Cdek\CdekClient;
use Illuminate\Http\Response as HttpResponse;
use RuntimeException;

class CdekOfficeImageController extends Controller
{
    public function __construct(
        private readonly CdekClient $client
    ) {
    }

    /**
     * Возвращает фотографию ПВЗ СДЭК.
     */
    public function show(string $uuid): HttpResponse
    {
        $response = $this->client->getFile(
            "file-storage/web/object/office-photo/{$uuid}"
        );

        $contentType = $response->header(
            'Content-Type',
            'application/octet-stream'
        );

        // Не возвращаем браузеру неожиданные типы файлов.
        $mimeType = strtolower(
            trim(explode(';', $contentType)[0])
        );

        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ];

        if (!in_array($mimeType, $allowedMimeTypes, true)) {
            throw new RuntimeException(
                'CDEK returned an unsupported image format.'
            );
        }

        return response(
            $response->body(),
            200,
            [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=86400',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }
}

<?php

namespace App\Services\Skin;

use App\Models\Skin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class SkinService
{
    /**
     * Создаёт новый скин и сохраняет связанные с ним файлы.
     *
     * Если создание записи завершится ошибкой, загруженные файлы
     * будут удалены, чтобы не оставлять мусор в хранилище.
     *
     * @param array<string, mixed> $data
     *
     * @throws Throwable
     */
    public function create(array $data): Skin
    {
        $modelPath = null;
        $previewImage = null;

        try {
            return DB::transaction(function () use ($data, &$modelPath, &$previewImage, ): Skin {
                $modelPath = $this->storeFile(
                    $data['model_path'],
                    'skins/models',
                );

                $previewImage = $this->storeFile(
                    $data['preview_image'],
                    'skins/previews',
                );

                return Skin::create([
                    'name' => $data['name'],
                    'slug' => $data['slug'],
                    'description' => $data['description'] ?? null,
                    'model_path' => $modelPath,
                    'primary_color' => $data['primary_color'],
                    'secondary_color' => $data['secondary_color'],
                    'accent_color' => $data['accent_color'],
                    'preview_image' => $previewImage,
                    'is_active' => $data['is_active'],
                ]);
            });
        } catch (Throwable $exception) {
            // Откат транзакции БД не удаляет физические файлы.
            // Поэтому очищаем их вручную при возникновении ошибки.
            $this->deleteFile($modelPath);
            $this->deleteFile($previewImage);

            throw $exception;
        }
    }

    /**
     * Обновляет данные скина и при необходимости заменяет его файлы.
     *
     * Новые файлы сначала сохраняются, затем обновляется запись в БД.
     * Старые файлы удаляются только после успешного обновления.
     *
     * @param array<string, mixed> $data
     *
     * @throws Throwable
     */
    public function update(Skin $skin, array $data): Skin
    {
        $oldModelPath = $skin->model_path;
        $oldPreviewImage = $skin->preview_image;

        $newModelPath = null;
        $newPreviewImage = null;

        try {
            // Загружаем новую модель, только если пользователь её заменил.
            if (($data['model_path'] ?? null) instanceof UploadedFile) {
                $newModelPath = $this->storeFile(
                    $data['model_path'],
                    'skins/models',
                );

                $data['model_path'] = $newModelPath;
            } else {
                // Не передаём в update старый путь или пустое значение.
                unset($data['model_path']);
            }

            // Аналогично обрабатываем изображение предпросмотра.
            if (($data['preview_image'] ?? null) instanceof UploadedFile) {
                $newPreviewImage = $this->storeFile(
                    $data['preview_image'],
                    'skins/previews',
                );

                $data['preview_image'] = $newPreviewImage;
            } else {
                unset($data['preview_image']);
            }

            // Изменения записи выполняются в транзакции.
            DB::transaction(function () use ($skin, $data): void {
                $skin->update($data);
            });
        } catch (Throwable $exception) {
            // Если обновление не удалось, удаляем только новые файлы.
            // Старые файлы остаются нетронутыми.
            $this->deleteFile($newModelPath);
            $this->deleteFile($newPreviewImage);

            throw $exception;
        }

        // Удаляем предыдущие файлы только после успешного обновления БД.
        if ($newModelPath !== null) {
            $this->deleteFile($oldModelPath);
        }

        if ($newPreviewImage !== null) {
            $this->deleteFile($oldPreviewImage);
        }

        return $skin->refresh();
    }

    /**
     * Сохраняет загруженный файл на публичный диск.
     *
     * @throws RuntimeException
     */
    private function storeFile(
        UploadedFile $file,
        string $directory,
    ): string {
        $path = $file->store($directory, 'public');

        if (!is_string($path)) {
            throw new RuntimeException(
                "Не удалось сохранить файл в директорию {$directory}.",
            );
        }

        return $path;
    }

    /**
     * Удаляет файл с публичного диска.
     */
    private function deleteFile(?string $path): void
    {
        if ($path === null) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}

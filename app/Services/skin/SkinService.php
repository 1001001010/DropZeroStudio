<?php

namespace App\Services\skin;

use App\Models\Skin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SkinService
{
    /**
     * Create a new skin.
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
                $modelPath = $this->storeModel($data['model_path']);
                $previewImage = $this->storePreviewImage($data['preview_image']);

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
            $this->deleteFile($modelPath);
            $this->deleteFile($previewImage);

            throw $exception;
        }
    }

    /**
     * Store the 3D model.
     */
    private function storeModel(UploadedFile $file): string
    {
        return $file->store('skins/models', 'public');
    }

    /**
     * Store the skin preview image.
     */
    private function storePreviewImage(UploadedFile $file): string
    {
        return $file->store('skins/previews', 'public');
    }

    /**
     * Delete a stored file.
     */
    private function deleteFile(?string $path): void
    {
        if ($path !== null) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Update the specified skin.
     *
     * @param array<string, mixed> $data
     */
    public function update(
        Skin $skin,
        array $data,
    ): Skin {
        if (isset($data['model_path']) && $data['model_path'] instanceof UploadedFile) {
            $data['model_path'] = $this->replaceModel(
                $skin,
                $data['model_path'],
            );
        } else {
            unset($data['model_path']);
        }

        if (isset($data['preview_image']) && $data['preview_image'] instanceof UploadedFile) {
            $data['preview_image'] = $this->replacePreview(
                $skin,
                $data['preview_image'],
            );
        } else {
            unset($data['preview_image']);
        }

        $skin->update($data);

        return $skin->refresh();
    }

    /**
     * Replace the 3D model of the skin.
     */
    private function replaceModel(
        Skin $skin,
        UploadedFile $file,
    ): string {
        $path = $file->store('skins/models', 'public');

        if ($skin->model_path) {
            Storage::disk('public')->delete($skin->model_path);
        }

        return $path;
    }

    /**
     * Replace the preview image of the skin.
     */
    private function replacePreview(
        Skin $skin,
        UploadedFile $file,
    ): string {
        $path = $file->store('skins/previews', 'public');

        if ($skin->preview_image) {
            Storage::disk('public')->delete($skin->preview_image);
        }

        return $path;
    }
}

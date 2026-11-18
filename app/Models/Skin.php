<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Skin extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * Поля, доступные для массового заполнения.
     *
     * Файлы и основные характеристики скина сохраняются
     * через SkinService после проверки входных данных.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'model_path',
        'primary_color',
        'secondary_color',
        'accent_color',
        'preview_image',
        'is_active',
    ];

    /**
     * Преобразование атрибутов модели.
     *
     * is_active всегда возвращается как boolean,
     * независимо от того, как значение хранится в БД.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Коллекции, связанные с этим скином.
     *
     * Один скин может использоваться в нескольких Drops.
     */
    public function drops(): HasMany
    {
        return $this->hasMany(Drop::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LegalDocument extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'route',
        'current_version_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Все редакции документа
    public function versions(): HasMany
    {
        return $this->hasMany(LegalDocumentVersion::class, 'document_id');
    }

    // Текущая опубликованная редакция
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(
            LegalDocumentVersion::class,
            'current_version_id'
        );
    }
}
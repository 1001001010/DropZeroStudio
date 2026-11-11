<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LegalDocumentVersion extends Model
{
    protected $fillable = [
        'document_id',
        'version',
        'content',
        'content_hash',
        'created_by',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    // Документ, к которому относится редакция
    public function document(): BelongsTo
    {
        return $this->belongsTo(LegalDocument::class, 'document_id');
    }

    // Пользователь, создавший редакцию
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Согласия пользователей на эту редакцию
    public function consents(): HasMany
    {
        return $this->hasMany(UserConsent::class, 'document_version_id');
    }
}

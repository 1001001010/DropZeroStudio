<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserConsent extends Model
{
    protected $fillable = [
        'user_id',
        'document_version_id',
        'order_id',
        'registration_uuid',
        'source',
        'ip_address',
        'user_agent',
        'accepted_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    // Пользователь, принявший документ
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Конкретная редакция принятого документа
    public function documentVersion(): BelongsTo
    {
        return $this->belongsTo(
            LegalDocumentVersion::class,
            'document_version_id'
        );
    }
}

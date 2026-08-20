<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Toy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'drop_id',
        'user_id',
        'code',
        'secret_hash',
        'number',
        'status',
        'claimed_at',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'claimed_at' => 'datetime',
        ];
    }

    public function drop(): BelongsTo
    {
        return $this->belongsTo(Drop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

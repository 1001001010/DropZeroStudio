<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Drop extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'skin_id',
        'name',
        'edition_size',
        'price',
        'production_started_at',
        'production_completed_at',
        'sale_started_at',
        'sale_ended_at',
    ];

    protected function casts(): array
    {
        return [
            'edition_size' => 'integer',
            'price' => 'decimal:2',

            'production_started_at' => 'date',
            'production_completed_at' => 'date',

            'sale_started_at' => 'date',
            'sale_ended_at' => 'date',
        ];
    }

    public function skin(): BelongsTo
    {
        return $this->belongsTo(Skin::class);
    }

    public function toys(): HasMany
    {
        return $this->hasMany(Toy::class);
    }
}
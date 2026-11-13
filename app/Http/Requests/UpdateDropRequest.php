<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDropRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'skin_id' => [
                'required',
                'integer',
                Rule::exists('skins', 'id'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'edition_size' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],

            'production_started_at' => ['nullable', 'date_format:Y-m-d'],
            'production_completed_at' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:production_started_at'],
            'sale_started_at' => ['nullable', 'date_format:Y-m-d'],
            'sale_ended_at' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:sale_started_at'],
        ];
    }
}

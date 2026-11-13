<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDropRequest extends FormRequest
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

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'edition_size' => [
                'required',
                'integer',
                'min:1',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'production_started_at' => [
                'required',
                'date_format:Y-m-d',
            ],

            'production_completed_at' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:production_started_at',
            ],

            'sale_started_at' => [
                'required',
                'date_format:Y-m-d',
            ],

            'sale_ended_at' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:sale_started_at',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'skin_id.required' => 'Выберите скин.',
            'skin_id.exists' => 'Выбранный скин не существует.',
            'name.required' => 'Введите название дропа.',
            'edition_size.required' => 'Укажите размер тиража.',
            'edition_size.min' => 'Тираж должен быть не меньше 1.',
            'price.required' => 'Укажите цену.',
            'production_started_at.required' => 'Укажите начало производства.',
            'production_completed_at.required' => 'Укажите окончание производства.',
            'production_completed_at.after_or_equal' => 'Окончание производства не может быть раньше его начала.',
            'sale_started_at.required' => 'Укажите начало продаж.',
            'sale_ended_at.required' => 'Укажите окончание продаж.',
            'sale_ended_at.after_or_equal' => 'Окончание продаж не может быть раньше их начала.',
        ];
    }
}

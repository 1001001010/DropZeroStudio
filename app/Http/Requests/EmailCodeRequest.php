<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmailCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'toy_code' => [
                'required',
                'string',
            ],

            'email' => [
                'nullable',
                'email',
            ],

            'code' => [
                'required',
                'string',
                'digits:6',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'toy_code.required' => 'Введите код фигурки.',

            'email.email' => 'Введите корректный email.',

            'code.required' => 'Введите код подтверждения.',
            'code.digits' => 'Код должен состоять из 6 цифр.',
        ];
    }
}
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SecretVerifyRequest extends FormRequest
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
                'regex:/^[A-Z]{2}-\d{3}$/',
                'exists:toys,code',
            ],

            'email' => [
                'required',
                'email',
            ],

            'secret_key' => [
                'required',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'toy_code.required' => 'Введите код фигурки.',
            'email.required' => 'Введите email.',
            'email.email' => 'Введите корректный email.',
            'secret_key.required' => 'Введите секретный ключ.',
        ];
    }
}

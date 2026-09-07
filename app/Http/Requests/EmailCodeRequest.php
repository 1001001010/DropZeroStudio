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

            'email.email' => 'Введите корректный email.',

            'code.required' => 'Введите код подтверждения.',
            'code.digits' => 'Код должен состоять из 6 цифр.',
        ];
    }
}
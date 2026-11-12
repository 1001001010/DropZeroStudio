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
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'digits:6'],
            'personal_data_consent' => ['required', 'accepted'],
            'terms_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email не указан.',
            'email.email' => 'Введите корректный email.',

            'code.required' => 'Введите код подтверждения.',
            'code.digits' => 'Код должен состоять из 6 цифр.',

            'personal_data_consent.required' => 'Необходимо дать согласие на обработку персональных данных.',
            'personal_data_consent.accepted' => 'Необходимо дать согласие на обработку персональных данных.',

            'terms_accepted.required' => 'Необходимо принять пользовательское соглашение.',
            'terms_accepted.accepted' => 'Необходимо принять пользовательское соглашение.',
        ];
    }
}
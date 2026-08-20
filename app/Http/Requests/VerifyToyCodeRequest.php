<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyToyCodeRequest extends FormRequest
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
        ];
    }
}

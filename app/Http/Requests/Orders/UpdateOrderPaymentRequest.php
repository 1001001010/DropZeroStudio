<?php

namespace App\Http\Requests\Orders;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderPaymentRequest extends FormRequest
{
    /**
     * Определяет, разрешён ли запрос.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валидации обновления платежа.
     */
    public function rules(): array
    {
        return [
            'amount' => [
                'required',
                'numeric',
                'gt:0',
                'decimal:0,2',
            ],

            'receipt' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],

            'status' => [
                'required',
                Rule::in(array_column(PaymentStatus::cases(), 'value')),
            ],

            'method' => [
                'required',
                Rule::in(array_column(PaymentMethod::cases(), 'value')),
            ],

            'provider' => [
                'nullable',
                'string',
                'max:64',
            ],

            'transaction_id' => [
                'nullable',
                'string',
                'max:255',
            ],

            'paid_at' => [
                'nullable',
                'date',
            ],

            'metadata' => [
                'nullable',
                'array',
            ],
        ];
    }

    /**
     * Названия полей для сообщений об ошибках.
     */
    public function attributes(): array
    {
        return [
            'amount' => 'сумма платежа',
            'status' => 'статус платежа',
            'method' => 'способ оплаты',
            'provider' => 'платёжный провайдер',
            'transaction_id' => 'ID транзакции',
            'paid_at' => 'дата оплаты',
            'metadata' => 'дополнительные данные',
            'receipt' => 'подтверждающий документ',
        ];
    }

    /**
     * Подготавливает metadata перед валидацией.
     */
    protected function prepareForValidation(): void
    {
        $metadata = $this->input('metadata');

        if (!is_string($metadata)) {
            return;
        }

        if ($metadata === '') {
            $this->merge(['metadata' => null]);

            return;
        }

        $decoded = json_decode($metadata, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $this->merge(['metadata' => $decoded]);
        }
    }
}

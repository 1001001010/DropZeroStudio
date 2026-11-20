<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
{
    /**
     * Определяет, разрешено ли пользователю создавать заказ.
     *
     * Доступ дополнительно ограничивается middleware auth и admin.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валидации данных заказа.
     */
    public function rules(): array
    {
        return [
            // Информация о покупателе.
            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],

            'telegram_id' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'telegram_username' => [
                'nullable',
                'string',
                'max:64',
            ],

            'telegram_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:32',
            ],

            // Финансовые настройки.
            'currency' => [
                'required',
                'string',
                Rule::in(['RUB', 'EUR', 'USD']),
            ],

            'admin_note' => [
                'nullable',
                'string',
                'max:10000',
            ],

            // Позиции заказа.
            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.drop_id' => [
                'required',
                'integer',
                Rule::exists('drops', 'id')
                    ->whereNull('deleted_at'),
            ],

            'items.*.selection_mode' => [
                'required',
                Rule::in(['random', 'number', 'code']),
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'items.*.toy_number' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'items.*.toy_code' => [
                'nullable',
                'string',
                'max:64',
            ],
        ];
    }

    /**
     * Дополнительная проверка позиций заказа
     * в зависимости от выбранного способа поиска фигурки.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $items = $this->input('items', []);

            foreach ($items as $index => $item) {
                if (!is_array($item)) {
                    continue;
                }

                $mode = $item['selection_mode'] ?? null;

                // Выбор фигурки по номеру.
                if ($mode === 'number') {
                    if (
                        !isset($item['toy_number']) ||
                        $item['toy_number'] === ''
                    ) {
                        $validator->errors()->add(
                            "items.{$index}.toy_number",
                            'Укажите номер фигурки.'
                        );
                    }

                    if ((int) ($item['quantity'] ?? 0) !== 1) {
                        $validator->errors()->add(
                            "items.{$index}.quantity",
                            'Для выбора по номеру количество должно быть равно 1.'
                        );
                    }
                }

                // Выбор фигурки по уникальному коду.
                if ($mode === 'code') {
                    if (
                        !isset($item['toy_code']) ||
                        $item['toy_code'] === ''
                    ) {
                        $validator->errors()->add(
                            "items.{$index}.toy_code",
                            'Укажите уникальный код фигурки.'
                        );
                    }

                    if ((int) ($item['quantity'] ?? 0) !== 1) {
                        $validator->errors()->add(
                            "items.{$index}.quantity",
                            'Для выбора по коду количество должно быть равно 1.'
                        );
                    }
                }
            }
        });
    }

    /**
     * Пользовательские сообщения об ошибках.
     */
    public function messages(): array
    {
        return [
            'required' => 'Поле «:attribute» обязательно для заполнения.',
            'string' => 'Поле «:attribute» должно содержать текст.',
            'integer' => 'Поле «:attribute» должно быть целым числом.',

            'min.numeric' => 'Значение поля «:attribute» должно быть не меньше :min.',
            'min.string' => 'Поле «:attribute» должно содержать минимум :min символов.',
            'min.array' => 'Необходимо добавить хотя бы :min позицию.',

            'max.numeric' => 'Значение поля «:attribute» не должно превышать :max.',
            'max.string' => 'Поле «:attribute» не должно превышать :max символов.',

            'email' => 'Укажите корректный адрес электронной почты.',
            'url' => 'Укажите корректную ссылку.',
            'in' => 'Выбрано недопустимое значение поля «:attribute».',
            'exists' => 'Выбранный элемент в поле «:attribute» не существует или недоступен.',

            'items.required' => 'Добавьте хотя бы одну позицию в заказ.',
            'items.array' => 'Список товаров имеет неверный формат.',
            'items.min' => 'Добавьте хотя бы одну позицию в заказ.',
        ];
    }

    /**
     * Человекочитаемые названия полей.
     */
    public function attributes(): array
    {
        return [
            'customer_name' => 'имя покупателя',

            'telegram_id' => 'Telegram ID',
            'telegram_username' => 'имя пользователя Telegram',
            'telegram_url' => 'ссылка на Telegram',

            'email' => 'электронная почта',
            'phone' => 'номер телефона',

            'currency' => 'валюта заказа',
            'admin_note' => 'заметка администратора',

            'items' => 'позиции заказа',
            'items.*.drop_id' => 'коллекция',
            'items.*.selection_mode' => 'способ выбора фигурки',
            'items.*.quantity' => 'количество',
            'items.*.toy_number' => 'номер фигурки',
            'items.*.toy_code' => 'код фигурки',
        ];
    }
}

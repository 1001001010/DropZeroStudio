<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSkinRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('skins', 'slug')->ignore($this->route('skin')),
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'model_path' => [
                'sometimes',
                'nullable',
                'file',
                'mimes:glb,gltf,obj,fbx,blend',
                'max:102400',
            ],

            'primary_color' => [
                'sometimes',
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'secondary_color' => [
                'sometimes',
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'accent_color' => [
                'sometimes',
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'preview_image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpeg,png,webp',
                'max:10240',
            ],

            'is_active' => [
                'sometimes',
                'required',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Введите название скина.',
            'name.max' => 'Название не должно превышать 255 символов.',

            'slug.required' => 'Введите slug.',
            'slug.alpha_dash' => 'Slug может содержать только буквы, цифры, дефисы и подчёркивания.',
            'slug.unique' => 'Такой slug уже используется.',

            'description.max' => 'Описание не должно превышать 5000 символов.',

            'model_path.file' => 'Выбранный файл модели некорректен.',
            'model_path.mimes' => 'Модель должна иметь формат GLB, GLTF, OBJ, FBX или BLEND.',
            'model_path.max' => 'Размер модели не должен превышать 100 МБ.',

            'primary_color.regex' => 'Основной цвет должен быть в формате HEX.',
            'secondary_color.regex' => 'Дополнительный цвет должен быть в формате HEX.',
            'accent_color.regex' => 'Акцентный цвет должен быть в формате HEX.',

            'preview_image.image' => 'Файл должен быть изображением.',
            'preview_image.mimes' => 'Изображение должно быть в формате JPEG, PNG или WebP.',
            'preview_image.max' => 'Размер изображения не должен превышать 10 МБ.',

            'is_active.boolean' => 'Некорректное значение статуса.',
        ];
    }
}
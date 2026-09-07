<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSkinRequest extends FormRequest
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
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('skins', 'slug'),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'model_path' => [
                'required',
                'file',
                'extensions:glb,gltf,fbx,obj',
                'max:204800',
            ],

            'primary_color' => [
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'secondary_color' => [
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'accent_color' => [
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'preview_image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:10240',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Введите название скина.',
            'name.max' => 'Название не должно превышать 255 символов.',

            'slug.required' => 'Slug обязателен.',
            'slug.alpha_dash' => 'Slug может содержать только буквы, цифры, дефисы и подчёркивания.',
            'slug.unique' => 'Скин с таким slug уже существует.',

            'model_path.required' => 'Загрузите 3D-модель.',
            'model_path.file' => 'Файл модели имеет некорректный формат.',
            'model_path.mimes' => 'Допустимые форматы модели: GLB, GLTF, FBX, OBJ.',
            'model_path.max' => 'Размер 3D-модели не должен превышать 200 МБ.',

            'primary_color.required' => 'Укажите основной цвет.',
            'primary_color.regex' => 'Основной цвет должен быть в формате HEX.',

            'secondary_color.required' => 'Укажите вторичный цвет.',
            'secondary_color.regex' => 'Вторичный цвет должен быть в формате HEX.',

            'accent_color.required' => 'Укажите акцентный цвет.',
            'accent_color.regex' => 'Акцентный цвет должен быть в формате HEX.',

            'preview_image.required' => 'Загрузите изображение превью.',
            'preview_image.image' => 'Превью должно быть изображением.',
            'preview_image.mimes' => 'Допустимые форматы превью: JPEG, PNG, WEBP.',
            'preview_image.max' => 'Размер изображения не должен превышать 10 МБ.',

            'is_active.required' => 'Укажите статус скина.',
            'is_active.boolean' => 'Статус скина имеет некорректное значение.',
        ];
    }
}

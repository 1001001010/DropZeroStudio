
import { IMaskInput } from 'react-imask'
import { MapPin, UserRound } from 'lucide-react'

import { DeliveryCityField } from './delivery-city-field'
import { DeliveryPickupPointField } from './delivery-pickup-point-field'

import type {
    CdekCity,
    DeliveryLocationFormProps,
    DeliveryType,
} from '@/types/index'

/**
 * Подготавливает номер телефона перед вставкой в маску.
 *
 * Убирает российский код страны (+7 или 8),
 * если пользователь вставил номер целиком.
 *
 * Примеры:
 * +79351240044 → 9351240044
 * 89351240044  → 9351240044
 * 9351240044   → 9351240044
 */
function preparePhoneInput(value: string): string {
    const digits = value.replace(/\D/g, '')

    if (digits.length === 11 && /^[78]/.test(digits)) {
        return digits.slice(1)
    }

    return digits
}

/**
 * Форма отправителя или получателя.
 *
 * Позволяет указать контактные данные, город,
 * способ доставки и адрес либо пункт выдачи СДЭК.
 */
export function DeliveryLocationForm({
    title,
    form,
    onChange,
    isSender = false,
}: DeliveryLocationFormProps) {
    /**
     * Обработчик изменения способа доставки.
     */
    function handleDeliveryTypeChange(value: DeliveryType) {
        onChange('deliveryType', value)
    }

    /**
     * Обновляет город и его код СДЭК.
     *
     * При изменении города сбрасываем ранее выбранный ПВЗ.
     */
    const handleCityChange = (city: CdekCity | null, query: string) => {
        onChange('city', query)
        onChange('cityCode', city?.code ?? null)
        onChange('pickupPoint', null)
    }

    return (
        <div className="min-w-0 space-y-3">
            {/* Заголовок блока */}
            <div className="flex items-center gap-2">
                {isSender ? (
                    <MapPin className="size-4 text-muted-foreground" />
                ) : (
                    <UserRound className="size-4 text-muted-foreground" />
                )}

                <h3 className="text-sm font-medium">{title}</h3>
            </div>

            {/* Основные контактные данные */}
            <div className="grid grid-cols-2 gap-2">
                <FormField
                    label={isSender ? 'Имя отправителя' : 'ФИО получателя'}
                    value={form.name}
                    onChange={(value) => onChange('name', value)}
                    placeholder="Иван Иванов"
                    className="col-span-2"
                />

                {isSender && (
                    <FormField
                        label="Компания"
                        value={'company' in form ? form.company : ''}
                        onChange={(value) => onChange('company', value)}
                        placeholder="DropZeroStudio"
                        className="col-span-2"
                    />
                )}

                {/* Телефон с маской IMask */}
                <FormField
                    label="Телефон"
                    value={form.phone}
                    onChange={(value) => onChange('phone', value)}
                    placeholder="+7 (999) 999-99-99"
                    type="tel"
                    className="col-span-2"
                />

                {/* Город */}
                <DeliveryCityField
                    value={form.city}
                    cityCode={form.cityCode}
                    onChange={handleCityChange}
                />
            </div>

            {/* Способ доставки */}
            <DeliveryTypeSelector
                value={form.deliveryType}
                onChange={handleDeliveryTypeChange}
            />

            {/* Адресная доставка */}
            {form.deliveryType === 'address' && (
                <FormField
                    label="Адрес доставки"
                    value={form.address}
                    onChange={(value) => onChange('address', value)}
                    placeholder="Улица, дом, квартира"
                />
            )}

            {/* Доставка до пункта выдачи */}
            {form.deliveryType === 'pvz' && (
                <DeliveryPickupPointField
                    cityCode={form.cityCode}
                    value={form.pickupPoint?.code ?? ''}
                    onChange={(point) => {
                        onChange('pickupPoint', point)
                    }}
                />
            )}
        </div>
    )
}

/**
 * Переключатель способа доставки.
 */
function DeliveryTypeSelector({
    value,
    onChange,
}: {
    value: DeliveryType
    onChange: (value: DeliveryType) => void
}) {
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1">
            <button
                type="button"
                onClick={() => onChange('pvz')}
                className={`
                    rounded-md px-3 py-1.5 text-xs font-medium
                    transition-colors
                    ${value === 'pvz'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                `}
            >
                Пункт выдачи
            </button>

            <button
                type="button"
                onClick={() => onChange('address')}
                className={`
                    rounded-md px-3 py-1.5 text-xs font-medium
                    transition-colors
                    ${value === 'address'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                `}
            >
                До адреса
            </button>
        </div>
    )
}

/**
 * Универсальное текстовое поле.
 *
 * Для телефона используется IMaskInput,
 * для остальных значений — стандартный input.
 */
function FormField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    className = '',
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    className?: string
}) {
    const inputClassName = `
        h-9 w-full min-w-0 rounded-md border border-input
        bg-background px-3 text-sm shadow-sm outline-none
        transition-colors placeholder:text-muted-foreground
        focus-visible:border-ring focus-visible:ring-2
        focus-visible:ring-ring/30
    `

    return (
        <label className={`grid gap-1.5 ${className}`}>
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            {type === 'tel' ? (
                <IMaskInput
                    mask="+{7} (000) 000-00-00"
                    value={value}
                    prepare={preparePhoneInput}
                    onAccept={(nextValue) => {
                        onChange(String(nextValue))
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={placeholder}
                    lazy
                    className={inputClassName}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={inputClassName}
                />
            )}
        </label>
    )
}

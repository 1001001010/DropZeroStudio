import { MapPin, Search, UserRound } from 'lucide-react'
import { DeliveryCityField } from './delivery-city-field'
import type {
    DeliveryLocationFormProps,
    DeliveryType,
    CdekCity
} from '@/types/index'

/**
 * Форма отправителя или получателя.
 *
 * Позволяет указать город, способ доставки
 * и адрес либо пункт выдачи СДЭК.
 */
export function DeliveryLocationForm({
    title,
    form,
    onChange,
    isSender = false,
}: DeliveryLocationFormProps) {
    /**
     * Обработчик выбора способа доставки.
     */
    function handleDeliveryTypeChange(value: DeliveryType) {
        onChange('deliveryType', value)
    }

    // /**
    //  * Обработчик изменения кода города.
    //  */
    // function handleCityCodeChange(value: string) {
    //     onChange('cityCode', value === '' ? null : Number(value))
    // }

    /**
 * Обновляет город и его код СДЭК.
 *
 * При изменении города сбрасываем ранее выбранный ПВЗ.
 */
    function handleCityChange(city: CdekCity | null, query: string) {
        onChange('city', city?.city ?? query)
        onChange('cityCode', city?.code ?? null)
        onChange('pickupPoint', '')
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

                <h3 className="text-sm font-medium">
                    {title}
                </h3>
            </div>

            {/* Основные данные */}
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

                <FormField
                    label="Телефон"
                    value={form.phone}
                    onChange={(value) => onChange('phone', value)}
                    placeholder="+7 900 000-00-00"
                    type="tel"
                    className="col-span-2"
                />

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
                <PickupPointField
                    value={form.pickupPoint}
                    onChange={(value) => onChange('pickupPoint', value)}
                    city={form.city}
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
 * Поле поиска и выбора пункта выдачи.
 *
 * На данном этапе реализован ввод кода или адреса.
 * API-поиск подключим следующим этапом.
 */
function PickupPointField({
    value,
    onChange,
    city,
}: {
    value: string
    onChange: (value: string) => void
    city: string
}) {
    return (
        <div className="space-y-1.5">
            <label className="grid gap-1.5">
                <span className="text-xs text-muted-foreground">
                    Пункт выдачи СДЭК
                </span>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Код или адрес ПВЗ"
                        className="
                            h-9 w-full rounded-md border border-input
                            bg-background pl-9 pr-3 text-sm outline-none
                            transition-colors placeholder:text-muted-foreground
                            focus-visible:border-ring focus-visible:ring-2
                            focus-visible:ring-ring/30
                        "
                    />
                </div>
            </label>

            {city && (
                <p className="text-xs text-muted-foreground">
                    Поиск пунктов выдачи в городе {city}
                </p>
            )}
        </div>
    )
}

/**
 * Универсальное текстовое поле.
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
    return (
        <label className={`grid gap-1.5 ${className}`}>
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="
                    h-9 w-full min-w-0 rounded-md border border-input
                    bg-background px-3 text-sm shadow-sm outline-none
                    transition-colors placeholder:text-muted-foreground
                    focus-visible:border-ring focus-visible:ring-2
                    focus-visible:ring-ring/30
                "
            />
        </label>
    )
}

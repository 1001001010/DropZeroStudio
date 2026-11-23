import { Package } from 'lucide-react'

import type {
    DeliveryPackageFormProps,
    PackageForm,
} from '@/types/index'

/**
 * Форма параметров упаковки.
 */
export function DeliveryPackageForm({
    form,
    onChange,
}: DeliveryPackageFormProps) {
    /**
     * Обрабатывает изменение числового поля.
     */
    function handleNumberChange(
        key: keyof PackageForm,
        value: string,
    ) {
        onChange(key, value === '' ? '' : Number(value))
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />

                <h3 className="text-sm font-medium">
                    Параметры посылки
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <FormField
                    label="Вес, г"
                    value={String(form.weight)}
                    onChange={(value) => handleNumberChange('weight', value)}
                    type="number"
                    min="1"
                />

                <FormField
                    label="Длина, см"
                    value={String(form.length)}
                    onChange={(value) => handleNumberChange('length', value)}
                    type="number"
                    min="1"
                />

                <FormField
                    label="Ширина, см"
                    value={String(form.width)}
                    onChange={(value) => handleNumberChange('width', value)}
                    type="number"
                    min="1"
                />

                <FormField
                    label="Высота, см"
                    value={String(form.height)}
                    onChange={(value) => handleNumberChange('height', value)}
                    type="number"
                    min="1"
                />
            </div>

            <FormField
                label="Комментарий"
                value={form.comment}
                onChange={(value) => onChange('comment', value)}
                placeholder="Заказ #123"
            />
        </div>
    )
}

/**
 * Универсальное поле формы.
 */
function FormField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    min,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    min?: string
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <input
                type={type}
                value={value}
                min={min}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="
                    h-9 w-full rounded-md border border-input
                    bg-background px-3 text-sm shadow-sm outline-none
                    transition-colors placeholder:text-muted-foreground
                    focus-visible:border-ring focus-visible:ring-2
                    focus-visible:ring-ring/30
                "
            />
        </label>
    )
}

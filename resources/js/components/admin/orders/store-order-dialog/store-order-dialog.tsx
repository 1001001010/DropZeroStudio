
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from '@inertiajs/react'

import {
    ArrowRight,
    Check,
    CheckSquare,
    Hash,
    Loader2,
    Plus,
    ScanBarcode,
    ShoppingBag,
    Shuffle,
    Trash2,
    X,
} from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import {
    RadioGroup,
    RadioGroupItem,
} from '@/components/ui/radio-group'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import type {
    OrderDropOption,
    OrderItemSelectionMode,
    StoreOrderFormData,
    StoreOrderItemData,
} from '@/types/index.d'

interface StoreOrderDialogProps {
    drops?: OrderDropOption[]
}

/**
 * Создаёт пустую позицию заказа.
 */
function createOrderItem(): StoreOrderItemData {
    return {
        drop_id: '',
        selection_mode: 'random',
        quantity: '1',
        toy_number: '',
        toy_code: '',
    }
}

/**
 * Форматирует стоимость в валюте заказа.
 */
function formatPrice(value: number, currency = 'RUB'): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Форматирует номер телефона в формат +7 (XXX) XXX-XX-XX.
 */
const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '')

    // Убираем код страны, если пользователь ввёл его самостоятельно.
    const normalized = digits.startsWith('7')
        ? digits.slice(1)
        : digits.startsWith('8')
            ? digits.slice(1)
            : digits

    const phone = normalized.slice(0, 10)

    let formatted = '+7'

    if (phone.length > 0) {
        formatted += ` (${phone.slice(0, 3)}`
    }

    if (phone.length >= 3) {
        formatted += ')'
    }

    if (phone.length > 3) {
        formatted += ` ${phone.slice(3, 6)}`
    }

    if (phone.length > 6) {
        formatted += `-${phone.slice(6, 8)}`
    }

    if (phone.length > 8) {
        formatted += `-${phone.slice(8, 10)}`
    }

    return formatted
}

/**
 * Диалог ручного создания заказа.
 *
 * Поддерживает случайный подбор фигурок, выбор по номеру
 * и поиск конкретной фигурки по уникальному коду.
 */
export function StoreOrderDialog({
    drops = [],
}: StoreOrderDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<StoreOrderFormData>({
        customer_name: '',
        telegram_id: '',
        telegram_username: '',
        telegram_url: '',
        email: '',
        phone: '',
        currency: 'RUB',
        admin_note: '',
        items: [createOrderItem()],
    })

    /**
     * Рассчитывает стоимость всех позиций.
     */
    const subtotal = useMemo(() => {
        return data.items.reduce((total, item) => {
            const selectedDrop = drops.find(
                (drop) => drop.id.toString() === item.drop_id,
            )

            if (!selectedDrop) {
                return total
            }

            const quantity =
                item.selection_mode === 'random'
                    ? Math.max(0, Number(item.quantity) || 0)
                    : 1

            return total + selectedDrop.price * quantity
        }, 0)
    }, [data.items, drops])

    /**
     * Обновляет отдельное поле позиции.
     */
    const updateItem = <K extends keyof StoreOrderItemData>(
        index: number,
        field: K,
        value: StoreOrderItemData[K],
    ) => {
        const items = [...data.items]

        items[index] = {
            ...items[index],
            [field]: value,
        }

        setData('items', items)
    }

    /**
     * Добавляет новую позицию заказа.
     */
    const addItem = () => {
        setData('items', [
            ...data.items,
            createOrderItem(),
        ])
    }

    /**
     * Удаляет позицию заказа.
     */
    const removeItem = (index: number) => {
        if (data.items.length <= 1) {
            return
        }

        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        )
    }

    /**
     * Переключает способ выбора фигурки.
     */
    const updateSelectionMode = (
        index: number,
        mode: OrderItemSelectionMode,
    ) => {
        const items = [...data.items]

        items[index] = {
            ...items[index],
            selection_mode: mode,
            quantity: '1',
            toy_number: '',
            toy_code: '',
        }

        setData('items', items)
    }

    /**
     * Закрывает диалог и очищает форму.
     */
    const handleClose = () => {
        if (processing) {
            return
        }

        setIsOpen(false)
        reset()
    }

    /**
     * Отправляет форму на сервер.
     */
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        post(route('admin.orders.store'), {
            preserveScroll: true,

            onSuccess: () => {
                setIsOpen(false)
                reset()
            },
        })
    }

    /**
     * Проверяет обязательные поля перед отправкой.
     */
    const canSubmit =
        !processing &&
        data.customer_name.trim().length > 0 &&
        data.items.length > 0 &&
        data.items.every((item) => {
            if (!item.drop_id) {
                return false
            }

            if (item.selection_mode === 'random') {
                const quantity = Number(item.quantity)
                const selectedDrop = drops.find(
                    (drop) => drop.id.toString() === item.drop_id,
                )

                return (
                    Number.isInteger(quantity) &&
                    quantity > 0 &&
                    quantity <= (selectedDrop?.availableQuantity ?? 0)
                )
            }

            if (item.selection_mode === 'number') {
                return item.toy_number.trim().length > 0
            }

            return item.toy_code.trim().length > 0
        })

    /**
     * Общий обработчик изменения состояния диалога.
     */
    const handleOpenChange = (open: boolean) => {
        if (processing) {
            return
        }

        setIsOpen(open)

        if (!open) {
            reset()
        }
    }

    /**
 * Обрабатывает ввод номера телефона с автоматическим форматированием.
 */
    const handlePhoneChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setData('phone', formatPhoneNumber(event.target.value))
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-min">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Новый заказ
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-[1000px]">
                {/* Заголовок диалога */}
                <DialogHeader className="sticky top-0 z-20 border-b bg-background px-6 py-5 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <DialogTitle className="text-xl font-semibold tracking-tight">
                                Создание заказа
                            </DialogTitle>

                            <DialogDescription>
                                Добавьте покупателя и выберите фигурки для заказа.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 px-6 py-6"
                >
                    {/* Информация о покупателе */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold">
                                    Покупатель
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Контактные данные заказчика.
                                </p>
                            </div>

                            <Badge variant="outline">
                                Обязательно имя
                            </Badge>
                        </div>

                        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="customer-name">
                                    Имя покупателя
                                    <span className="ml-1 text-destructive">*</span>
                                </Label>

                                <Input
                                    id="customer-name"
                                    placeholder="Иван Иванов"
                                    value={data.customer_name}
                                    onChange={(event) =>
                                        setData('customer_name', event.target.value)
                                    }
                                    autoComplete="name"
                                    autoFocus
                                />

                                {errors.customer_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.customer_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer-phone">
                                    Телефон
                                </Label>

                                <Input
                                    id="skin-phone"
                                    type="tel"
                                    placeholder="+7 (___) ___-__-__"
                                    value={data.phone}
                                    onChange={handlePhoneChange}
                                    autoComplete="tel"
                                    maxLength={18}
                                />

                                {errors.phone && (
                                    <p className="text-xs text-destructive">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer-telegram-id">
                                    Telegram ID
                                </Label>

                                <Input
                                    id="customer-telegram-id"
                                    placeholder="123456789"
                                    value={data.telegram_id}
                                    onChange={(event) =>
                                        setData('telegram_id', event.target.value)
                                    }
                                />

                                {errors.telegram_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.telegram_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer-telegram">
                                    Telegram username
                                </Label>

                                <Input
                                    id="customer-telegram"
                                    placeholder="@username"
                                    value={data.telegram_username}
                                    onChange={(event) =>
                                        setData('telegram_username', event.target.value)
                                    }
                                />

                                {errors.telegram_username && (
                                    <p className="text-xs text-destructive">
                                        {errors.telegram_username}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="customer-email">
                                    Электронная почта
                                </Label>

                                <Input
                                    id="customer-email"
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    autoComplete="email"
                                />

                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Состав заказа */}
                    <section className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold">
                                    Состав заказа
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Выберите коллекцию и способ подбора фигурок.
                                </p>
                            </div>

                            <Badge variant="secondary" className="tabular-nums">
                                {data.items.length}{' '}
                                {data.items.length === 1 ? 'позиция' : 'позиций'}
                            </Badge>
                        </div>

                        {data.items.map((item, index) => {
                            const selectedDrop = drops.find(
                                (drop) => drop.id.toString() === item.drop_id,
                            )

                            const quantity =
                                item.selection_mode === 'random'
                                    ? Math.max(0, Number(item.quantity) || 0)
                                    : 1

                            const itemTotal =
                                (selectedDrop?.price ?? 0) * quantity

                            const selectionModes = [
                                {
                                    value: 'random',
                                    label: 'Случайная',
                                    description: 'Автоматический подбор',
                                    icon: Shuffle,
                                },
                                {
                                    value: 'number',
                                    label: 'По номеру',
                                    description: 'Конкретная фигурка',
                                    icon: Hash,
                                },
                                {
                                    value: 'code',
                                    label: 'По коду',
                                    description: 'Уникальный код',
                                    icon: ScanBarcode,
                                },
                            ] as const

                            return (
                                <div
                                    key={index}
                                    className="space-y-5 rounded-xl border bg-card p-4 sm:p-5"
                                >
                                    {/* Заголовок позиции */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Позиция заказа
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {selectedDrop?.name ?? 'Drop не выбран'}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length === 1}
                                            aria-label="Удалить позицию"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Выбор Drop */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`item-drop-${index}`}>
                                            Коллекция / Drop
                                        </Label>

                                        <Select
                                            value={item.drop_id}
                                            onValueChange={(value) =>
                                                updateItem(index, 'drop_id', value)
                                            }
                                        >
                                            <SelectTrigger id={`item-drop-${index}`}>
                                                <SelectValue placeholder="Выберите Drop" />
                                            </SelectTrigger>


                                            <SelectContent>
                                                {drops.map((drop) => (
                                                    <SelectItem
                                                        key={drop.id}
                                                        value={drop.id.toString()}
                                                        disabled={drop.availableQuantity <= 0}
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            {drop.skin.previewImage ? (
                                                                <img
                                                                    src={`/storage/${drop.skin.previewImage}`}
                                                                    alt={drop.skin.name}
                                                                    className="h-9 w-9 shrink-0 rounded-md border object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="h-9 w-9 shrink-0 rounded-md border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            drop.skin.primaryColor ?? '#050505',
                                                                    }}
                                                                />
                                                            )}

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium">
                                                                    {drop.name}
                                                                </p>

                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {drop.skin.name}
                                                                </p>
                                                            </div>

                                                            <div className="ml-auto shrink-0 text-right">
                                                                <p className="text-sm font-medium tabular-nums">
                                                                    {formatPrice(drop.price)}
                                                                </p>

                                                                <p className="text-xs text-muted-foreground">
                                                                    {drop.availableQuantity} шт.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>

                                        </Select>

                                        {drops.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {selectedDrop
                                                    ? `${selectedDrop.skin.name} · ${selectedDrop.availableQuantity} свободных`
                                                    : 'Drop не выбран'}
                                            </p>
                                        )}

                                        {selectedDrop && (
                                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
                                                <span className="text-xs text-muted-foreground">
                                                    Доступно:{' '}
                                                    <span className="font-semibold text-foreground">
                                                        {selectedDrop.availableQuantity} шт.
                                                    </span>
                                                </span>

                                                <span className="text-xs font-medium tabular-nums">
                                                    {formatPrice(selectedDrop.price)} / шт.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Режим выбора фигурки */}
                                    <div className="space-y-3">
                                        <Label>
                                            Способ выбора фигурки
                                        </Label>

                                        <RadioGroup
                                            value={item.selection_mode}
                                            onValueChange={(value) => {
                                                if (
                                                    value === 'random' ||
                                                    value === 'number' ||
                                                    value === 'code'
                                                ) {
                                                    updateSelectionMode(index, value)
                                                }
                                            }}
                                            className="grid gap-2 sm:grid-cols-3"
                                        >
                                            {selectionModes.map((mode) => {
                                                const Icon = mode.icon
                                                const isSelected =
                                                    item.selection_mode === mode.value

                                                return (
                                                    <Label
                                                        key={mode.value}
                                                        htmlFor={`selection-${mode.value}-${index}`}
                                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isSelected
                                                            ? 'border-primary bg-primary/5'
                                                            : 'hover:bg-muted/50'
                                                            }`}
                                                    >
                                                        <RadioGroupItem
                                                            id={`selection-${mode.value}-${index}`}
                                                            value={mode.value}
                                                            className="mt-0.5"
                                                        />

                                                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                            }`} />

                                                        <div className="min-w-0 space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {mode.label}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {mode.description}
                                                            </p>
                                                        </div>
                                                    </Label>
                                                )
                                            })}
                                        </RadioGroup>
                                    </div>

                                    {/* Параметры выбранного режима */}
                                    {item.selection_mode === 'random' && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`item-quantity-${index}`}>
                                                Количество фигурок
                                            </Label>

                                            <Input
                                                id={`item-quantity-${index}`}
                                                type="number"
                                                min="1"
                                                max={selectedDrop?.availableQuantity ?? undefined}
                                                step="1"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={!selectedDrop}
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Будут автоматически выбраны разные свободные фигурки из этого Drop.
                                            </p>

                                            {selectedDrop &&
                                                Number(item.quantity) > selectedDrop.availableQuantity && (
                                                    <p className="text-xs text-destructive">
                                                        В Drop недостаточно свободных фигурок.
                                                    </p>
                                                )}
                                        </div>
                                    )}

                                    {item.selection_mode === 'number' && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`item-number-${index}`}>
                                                Номер фигурки
                                            </Label>

                                            <Input
                                                id={`item-number-${index}`}
                                                placeholder="Например, 024"
                                                value={item.toy_number}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'toy_number',
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={!selectedDrop}
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Будет найдена конкретная свободная фигурка в выбранном Drop.
                                            </p>
                                        </div>
                                    )}

                                    {item.selection_mode === 'code' && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`item-code-${index}`}>
                                                Уникальный код фигурки
                                            </Label>

                                            <Input
                                                id={`item-code-${index}`}
                                                placeholder="XE-123"
                                                value={item.toy_code}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        'toy_code',
                                                        event.target.value.toUpperCase(),
                                                    )
                                                }
                                                disabled={!selectedDrop}
                                            />

                                            <p className="text-xs text-muted-foreground">
                                                Код должен принадлежать выбранному Drop и быть доступным.
                                            </p>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Стоимость позиции */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-muted-foreground">
                                                Стоимость позиции
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {quantity} × {formatPrice(selectedDrop?.price ?? 0)}
                                            </p>
                                        </div>

                                        <span className="font-semibold tabular-nums">
                                            {formatPrice(itemTotal)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={addItem}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить позицию
                        </Button>
                    </section>

                    <Separator />

                    {/* Внутренняя заметка администратора */}
                    <section className="space-y-3">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold">
                                Внутренняя заметка
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Видна только администраторам и не отображается покупателю.
                            </p>
                        </div>

                        <Textarea
                            id="order-admin-note"
                            placeholder="Особые договорённости, пожелания или дополнительная информация..."
                            className="min-h-[100px] resize-y"
                            value={data.admin_note}
                            onChange={(event) =>
                                setData('admin_note', event.target.value)
                            }
                        />

                        {errors.admin_note && (
                            <p className="text-xs text-destructive">
                                {errors.admin_note}
                            </p>
                        )}
                    </section>

                    <Separator />

                    {/* Итоговая стоимость */}
                    <section className="rounded-xl border bg-muted/20 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold">
                                    Итого к оплате
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    Стоимость всех фигурок в заказе
                                </p>
                            </div>

                            <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                    </section>

                    {/* Кнопки действий */}
                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Отмена
                        </Button>

                        <Button
                            type="submit"
                            disabled={!canSubmit}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Создание заказа...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Создать заказ
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

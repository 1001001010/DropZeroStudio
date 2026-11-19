
import { ImageOff, Package } from 'lucide-react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import type { OrderItem } from '@/types/index.d'

interface OrderItemsProps {
    /** Список товаров, входящих в заказ. */
    items: OrderItem[]

    /** Валюта заказа в формате ISO 4217. */
    currency: string
}

/**
 * Форматирует денежную сумму.
 *
 * @param value Сумма в основной единице валюты.
 * @param currency Код валюты ISO 4217.
 * @returns Локализованная денежная сумма.
 */
function formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Отображает состав заказа.
 *
 * @param items Товары, добавленные в заказ.
 * @param currency Валюта заказа.
 * @returns Карточка со списком товаров и общей стоимостью.
 */
export function OrderItems({
    items,
    currency,
}: OrderItemsProps) {
    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0,
    )

    const totalPrice = items.reduce(
        (total, item) => total + item.totalPrice,
        0,
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="size-4 text-muted-foreground" />
                        Состав заказа
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                        {items.length} поз. · {totalQuantity} шт.
                    </p>
                </div>

                <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(totalPrice, currency)}
                </span>
            </CardHeader>

            <CardContent>
                {items.length > 0 ? (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    {/* Изображение фигурки */}
                                    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.figureName}
                                                className="size-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <ImageOff className="size-6 text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* Информация о товаре */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="font-medium">
                                            {item.figureName}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {item.dropName}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Артикул позиции: #{item.id}
                                        </p>
                                    </div>

                                    {/* Количество и стоимость */}
                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(item.unitPrice, currency)} × {item.quantity}
                                        </p>

                                        <p className="font-semibold tabular-nums">
                                            {formatCurrency(item.totalPrice, currency)}
                                        </p>
                                    </div>
                                </div>

                                {index < items.length - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                        <Package className="size-7" />

                        <p className="text-sm font-medium">
                            В заказе нет товаров
                        </p>

                        <p className="text-xs">
                            Информация о составе заказа отсутствует.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


import {
    CalendarDays,
    CheckCircle2,
    Clock11Icon,
    Clock3,
    CreditCard,
    Package,
    XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import type { Order, OrderStatus } from '@/types/index.d'

interface OrderGeneralInfoProps {
    /** Полная информация о заказе. */
    order: Order
}

/**
 * Настройки отображения статусов заказа.
 */
const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        icon: typeof Clock3
    }
> = {
    pending: {
        label: 'Ожидает обработки',
        variant: 'outline',
        icon: Clock3,
    },
    accepted: {
        label: 'Принят',
        variant: 'secondary',
        icon: CheckCircle2,
    },
    shipped: {
        label: 'Отправлен',
        variant: 'default',
        icon: Package,
    },
    completed: {
        label: 'Завершён',
        variant: 'secondary',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Отменён',
        variant: 'destructive',
        icon: XCircle,
    },
    processing: {
        label: 'В обработке',
        variant: 'outline',
        icon: Clock11Icon,
    },
}

/**
 * Форматирует дату и время для административной панели.
 *
 * @param value Дата в формате ISO.
 * @returns Локализованная дата и время.
 */
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

/**
 * Форматирует денежную сумму.
 *
 * @param value Сумма в основной единице валюты.
 * @param currency Код валюты ISO 4217.
 * @returns Отформатированная денежная сумма.
 */
function formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Отображает общую информацию и финансовые показатели заказа.
 *
 * @param order Данные заказа.
 * @returns Карточка с основной информацией о заказе.
 */
export function OrderGeneralInfo({ order }: OrderGeneralInfoProps) {
    const status = ORDER_STATUS_CONFIG[order.status]
    const StatusIcon = status.icon
    const currency = order.payment?.currency ?? order.currency

    return (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            {/* Основная информация о заказе */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base">
                            Информация о заказе
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                            Основные сведения и текущее состояние заказа.
                        </p>
                    </div>

                    <Badge
                        variant={status.variant}
                        className="shrink-0 gap-1.5"
                    >
                        <StatusIcon className="size-3.5" />
                        {status.label}
                    </Badge>
                </CardHeader>

                <CardContent className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Номер заказа
                        </p>

                        <p className="text-lg font-semibold tracking-tight">
                            {order.number}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            ID заказа
                        </p>

                        <p className="font-medium tabular-nums">
                            #{order.id}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            Дата создания
                        </div>

                        <p className="text-sm font-medium">
                            {formatDate(order.created_at)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5" />
                            Последнее обновление
                        </div>

                        <p className="text-sm font-medium">
                            {formatDate(order.updated_at)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Финансовая информация */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="size-4 text-muted-foreground" />
                        Сумма заказа
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                            Товары
                        </span>

                        <span className="font-medium tabular-nums">
                            {formatCurrency(Number(order.subtotal), currency)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                            Доставка
                        </span>

                        <span className="font-medium tabular-nums">
                            {formatCurrency(Number(order.delivery_price), currency)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                            Скидка
                        </span>

                        <span className="font-medium tabular-nums">
                            −{formatCurrency(Number(order.discount), currency)}
                        </span>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">
                                Итого
                            </span>

                            <span className="text-xl font-semibold tabular-nums">
                                {formatCurrency(Number(order.total), currency)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

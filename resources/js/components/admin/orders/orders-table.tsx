import { useMemo, useState } from 'react'
import { Link } from '@inertiajs/react'
import { ArrowUpRight, Package } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { OrdersFilters } from '@/components/admin/orders/orders-filters'

import type {
    Order,
    OrderStatus,
    PaymentStatus,
    ShipmentStatus,
} from '@/types/index.d'

// =============================================================================
// Types
// =============================================================================

interface OrdersTableProps {
    /** Заказы, полученные с сервера. */
    orders: Order[]
}

interface StatusConfig {
    label: string
    className: string
}

// =============================================================================
// Constants
// =============================================================================

/** Визуальное представление статусов заказа. */
const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
    pending: {
        label: 'Ожидает обработки',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    },
    accepted: {
        label: 'Принят',
        className: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
    },
    processing: {
        label: 'В обработке',
        className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
    },
    shipped: {
        label: 'Отправлен',
        className: 'border-violet-500/30 bg-violet-500/10 text-violet-500',
    },
    completed: {
        label: 'Завершён',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    },
    cancelled: {
        label: 'Отменён',
        className: 'border-red-500/30 bg-red-500/10 text-red-500',
    },
}

/** Визуальное представление статусов оплаты. */
const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
    pending: {
        label: 'Ожидает оплаты',
        className: 'text-amber-500',
    },
    paid: {
        label: 'Оплачено',
        className: 'text-emerald-500',
    },
    failed: {
        label: 'Ошибка оплаты',
        className: 'text-red-500',
    },
    refunded: {
        label: 'Возвращено',
        className: 'text-muted-foreground',
    },
    partially_refunded: {
        label: 'Частичный возврат',
        className: 'text-blue-500',
    },
}

/** Визуальное представление статусов доставки. */
const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, StatusConfig> = {
    not_shipped: {
        label: 'Не отправлен',
        className: 'text-muted-foreground',
    },
    preparing: {
        label: 'Подготовка',
        className: 'text-amber-500',
    },
    in_transit: {
        label: 'В пути',
        className: 'text-blue-500',
    },
    delivered: {
        label: 'Доставлен',
        className: 'text-emerald-500',
    },
    returned: {
        label: 'Возвращён',
        className: 'text-red-500',
    },
}

// =============================================================================
// Helpers
// =============================================================================

/** Форматирует денежную сумму. */
function formatCurrency(
    value: number | string | null,
    currency = 'RUB',
): string {
    const amount = Number(value)

    if (value === null || !Number.isFinite(amount)) {
        return '—'
    }

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount)
}

/** Форматирует дату и время. */
function formatDate(value: string | null): string {
    if (!value) {
        return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

/** Нормализует строку для поиска. */
function normalizeSearchValue(value: string | null | undefined): string {
    return value?.toLocaleLowerCase('ru').trim() ?? ''
}

/** Проверяет, содержит ли заказ поисковый запрос. */
function matchesSearch(order: Order, query: string): boolean {
    const searchableValues = [
        order.number,
        order.customer_name,
        order.email,
        order.phone,
        order.telegram_username,
        order.telegram_id?.toString(),
        ...order.items.flatMap((item) => [
            item.product_name,
            item.drop_name,
            item.skin_name,
            item.product_code,
        ]),
    ]

    return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(query),
    )
}

/**
 * Возвращает статус самой последней записи.
 * Сортировка выполняется по дате создания, затем по ID.
 */
function getLatestStatus<S extends string>(
    records: Array<{
        id: number
        status: S
        created_at: string
    }>,
    fallback: S,
): S {
    if (records.length === 0) {
        return fallback
    }

    const latestRecord = [...records].sort((first, second) => {
        const dateDifference =
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime()

        return dateDifference || second.id - first.id
    })[0]

    return latestRecord.status
}

/** Определяет статус оплаты заказа. */
function getPaymentStatus(
    payments: Order['payments'],
): PaymentStatus {
    return getLatestStatus<PaymentStatus>(payments, 'pending')
}

/** Определяет статус доставки заказа. */
function getShipmentStatus(
    shipments: Order['shipments'],
): ShipmentStatus {
    return getLatestStatus<ShipmentStatus>(shipments, 'not_shipped')
}

/** Возвращает название позиции заказа для отображения. */
function getItemTitle(item: Order['items'][number]): string {
    return item.skin_name || item.product_name || item.drop_name || 'Фигурка'
}

// =============================================================================
// Main Component
// =============================================================================

/** Таблица заказов с поиском и фильтрацией по статусу. */
export function OrdersTable({ orders }: OrdersTableProps) {
    console.log(orders)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

    const filteredOrders = useMemo(() => {
        const normalizedSearch = normalizeSearchValue(search)

        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === 'all' || order.status === statusFilter

            const matchesQuery =
                normalizedSearch === '' ||
                matchesSearch(order, normalizedSearch)

            return matchesStatus && matchesQuery
        })
    }, [orders, search, statusFilter])

    const hasFilters = search.trim() !== '' || statusFilter !== 'all'

    const emptyStateDescription = hasFilters
        ? 'Попробуйте изменить параметры поиска или фильтрации'
        : 'Заказы появятся здесь после оформления покупок'

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Все заказы
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {filteredOrders.length} из {orders.length}
                        </p>
                    </div>

                    <OrdersFilters
                        search={search}
                        status={statusFilter}
                        onSearchChange={setSearch}
                        onStatusChange={setStatusFilter}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableHead className="h-11 min-w-40 pl-6">
                                    Заказ
                                </TableHead>

                                <TableHead className="h-11 min-w-48">
                                    Покупатель
                                </TableHead>

                                <TableHead className="h-11 min-w-52">
                                    Состав
                                </TableHead>

                                <TableHead className="h-11">
                                    Оплата
                                </TableHead>

                                <TableHead className="h-11">
                                    Доставка
                                </TableHead>

                                <TableHead className="h-11 text-right">
                                    Сумма
                                </TableHead>

                                <TableHead className="h-11">
                                    Статус
                                </TableHead>

                                <TableHead className="h-11 pr-6 text-right">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <OrderRow key={order.id} order={order} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-56">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                                                <Package className="size-5 text-muted-foreground" />
                                            </div>

                                            <p className="font-medium">
                                                {orders.length === 0
                                                    ? 'Заказов пока нет'
                                                    : 'Заказы не найдены'}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {emptyStateDescription}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

// =============================================================================
// Order Row
// =============================================================================

/** Отдельная строка таблицы заказов. */
function OrderRow({ order }: { order: Order }) {
    const orderStatus = ORDER_STATUS_CONFIG[order.status]

    const paymentStatus =
        PAYMENT_STATUS_CONFIG[getPaymentStatus(order.payments)]

    const shipmentStatus =
        SHIPMENT_STATUS_CONFIG[getShipmentStatus(order.shipments)]

    const itemCount = order.items.reduce(
        (total, item) => total + item.quantity,
        0,
    )

    const displayedItems = order.items.slice(0, 2)
    const remainingItems = order.items.length - displayedItems.length

    const dropNames = [
        ...new Set(
            order.items
                .map((item) => item.drop_name)
                .filter((name): name is string => Boolean(name)),
        ),
    ]

    const orderUrl = `/admin/orders/${order.id}`

    return (
        <TableRow className="group transition-colors hover:bg-muted/40">
            {/* Номер и дата заказа */}
            <TableCell className="py-4 pl-6">
                <div className="space-y-1">
                    <Link
                        href={orderUrl}
                        className="inline-flex items-center gap-1 font-medium transition-colors hover:text-primary"
                    >
                        #{order.number}

                        <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>

                    <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                    </p>
                </div>
            </TableCell>

            {/* Покупатель */}
            <TableCell>
                <div className="space-y-1">
                    <p className="font-medium">
                        {order.customer_name || 'Без имени'}
                    </p>

                    {order.telegram_username ? (
                        <p className="text-xs text-muted-foreground">
                            {order.telegram_username.startsWith('@')
                                ? order.telegram_username
                                : `@${order.telegram_username}`}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Telegram не указан
                        </p>
                    )}

                    {order.email && (
                        <p className="text-xs text-muted-foreground">
                            {order.email}
                        </p>
                    )}

                    {order.phone && (
                        <p className="text-xs text-muted-foreground">
                            {order.phone}
                        </p>
                    )}
                </div>
            </TableCell>

            {/* Состав заказа */}
            <TableCell>
                <div className="space-y-1">
                    {displayedItems.map((item) => (
                        <div key={item.id}>
                            <p className="text-sm font-medium">
                                {getItemTitle(item)}

                                <span className="ml-1 text-muted-foreground">
                                    × {item.quantity}
                                </span>
                            </p>

                            {item.drop_name && (
                                <p className="text-xs text-muted-foreground">
                                    {item.drop_name}
                                </p>
                            )}

                            {item.product_code && (
                                <p className="text-xs text-muted-foreground">
                                    Код: {item.product_code}
                                </p>
                            )}
                        </div>
                    ))}

                    {remainingItems > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Ещё {remainingItems} поз.
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Всего: {itemCount} шт.
                        {dropNames.length > 0 && ` · ${dropNames.join(', ')}`}
                    </p>
                </div>
            </TableCell>

            {/* Оплата */}
            <TableCell>
                <span className={`text-sm font-medium ${paymentStatus.className}`}>
                    {paymentStatus.label}
                </span>
            </TableCell>

            {/* Доставка */}
            <TableCell>
                <span className={`text-sm font-medium ${shipmentStatus.className}`}>
                    {shipmentStatus.label}
                </span>
            </TableCell>

            {/* Сумма */}
            <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(order.total, order.currency)}
            </TableCell>

            {/* Статус заказа */}
            <TableCell>
                <Badge
                    variant="outline"
                    className={orderStatus.className}
                >
                    {orderStatus.label}
                </Badge>
            </TableCell>

            {/* Переход к заказу */}
            <TableCell className="pr-6">
                <div className="flex justify-end">
                    <Link
                        href={orderUrl}
                        aria-label={`Открыть заказ ${order.number}`}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </TableCell>
        </TableRow>
    )
}

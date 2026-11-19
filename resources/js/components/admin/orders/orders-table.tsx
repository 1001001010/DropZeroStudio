
import {
    useMemo,
    useState,
} from 'react'

import {
    Link,
} from '@inertiajs/react'

import {
    ArrowUpRight,
    Package,
} from 'lucide-react'

import {
    Badge,
} from '@/components/ui/badge'

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

import {
    OrdersFilters,
} from '@/components/admin/orders/orders-filters'

import type {
    DeliveryStatus,
    Order,
    OrderStatus,
    PaymentStatus,
} from '@/types/index.d'

/**
 * Свойства таблицы заказов.
 */
interface OrdersTableProps {
    /** Список заказов для отображения. */
    orders: Order[]
}

/**
 * Конфигурация статусов заказов.
 */
const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    {
        label: string
        className: string
    }
> = {
    pending: {
        label: 'Ожидает обработки',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-500',
    },
    accepted: {
        label: 'Принят',
        className:
            'border-blue-500/30 bg-blue-500/10 text-blue-500',
    },
    shipped: {
        label: 'Отправлен',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-500',
    },
    completed: {
        label: 'Завершён',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    },
    cancelled: {
        label: 'Отменён',
        className:
            'border-red-500/30 bg-red-500/10 text-red-500',
    },
}

/**
 * Конфигурация статусов оплаты.
 */
const PAYMENT_STATUS_CONFIG: Record<
    PaymentStatus,
    {
        label: string
        className: string
    }
> = {
    pending: {
        label: 'Ожидает',
        className: 'text-amber-500',
    },
    paid: {
        label: 'Оплачено',
        className: 'text-emerald-500',
    },
    failed: {
        label: 'Ошибка',
        className: 'text-red-500',
    },
    refunded: {
        label: 'Возврат',
        className: 'text-muted-foreground',
    },
}

/**
 * Конфигурация статусов доставки.
 */
const DELIVERY_STATUS_CONFIG: Record<
    DeliveryStatus,
    {
        label: string
        className: string
    }
> = {
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

/**
 * Форматирует денежную сумму.
 *
 * @param value Сумма в рублях.
 * @returns Локализованная денежная сумма.
 */
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Форматирует дату оформления заказа.
 *
 * @param value Дата в формате ISO.
 * @returns Дата и время в локальном формате.
 */
function formatDate(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Некорректная дата'
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

/**
 * Проверяет, содержит ли заказ поисковый запрос.
 *
 * Поиск выполняется по номеру заказа, покупателю,
 * контактным данным, Telegram и названиям товаров.
 *
 * @param order Заказ для проверки.
 * @param query Поисковая строка.
 * @returns Результат поиска.
 */
function matchesSearch(
    order: Order,
    query: string,
): boolean {
    const searchableValues = [
        order.number,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.customer.telegramUsername,
        ...order.items.map((item) => item.figureName),
        ...order.items.map((item) => item.dropName),
    ]

    return searchableValues.some((value) =>
        value?.toLowerCase().includes(query),
    )
}

/**
 * Таблица заказов с поиском и фильтрацией.
 */
export function OrdersTable({
    orders,
}: OrdersTableProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<
        OrderStatus | 'all'
    >('all')

    /**
     * Фильтрация заказов по поиску и статусу.
     */
    const filteredOrders = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === 'all' ||
                order.status === statusFilter

            const matchesQuery =
                normalizedSearch === '' ||
                matchesSearch(order, normalizedSearch)

            return matchesStatus && matchesQuery
        })
    }, [orders, search, statusFilter])

    /**
     * Проверяет, применены ли фильтры.
     */
    const hasFilters =
        search.trim() !== '' ||
        statusFilter !== 'all'

    /**
     * Определяет текст пустого состояния.
     */
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

                                <TableHead className="h-11 min-w-40">
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
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                    />
                                )
                                )) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-56"
                                    >
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

/**
 * Отдельная строка таблицы заказов.
 */
function OrderRow({
    order,
}: {
    order: Order
}) {
    const orderStatus = ORDER_STATUS_CONFIG[order.status]
    const paymentStatus = PAYMENT_STATUS_CONFIG[order.payment.status]
    const deliveryStatus = DELIVERY_STATUS_CONFIG[order.delivery.status]

    /**
     * Общее количество товаров в заказе.
     */
    const itemCount = order.items.reduce(
        (total, item) => total + item.quantity,
        0,
    )

    /**
     * Первые две позиции заказа.
     */
    const displayedItems = order.items.slice(0, 2)

    /**
     * Количество скрытых позиций.
     */
    const remainingItems = order.items.length - displayedItems.length

    /**
     * Уникальные названия дропов.
     */
    const dropNames = [
        ...new Set(order.items.map((item) => item.dropName)),
    ]

    return (
        <TableRow className="group transition-colors hover:bg-muted/40">
            {/* Номер и дата заказа */}
            <TableCell className="py-4 pl-6">
                <div className="space-y-1">
                    <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-medium transition-colors hover:text-primary"
                    >
                        #{order.number}

                        <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>

                    <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                    </p>
                </div>
            </TableCell>

            {/* Покупатель */}
            <TableCell>
                <div className="space-y-1">
                    <p className="font-medium">
                        {order.customer.name}
                    </p>

                    {order.customer.telegramUsername ? (
                        <p className="text-xs text-muted-foreground">
                            @
                            {order.customer.telegramUsername.replace(
                                /^@/,
                                '',
                            )}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Telegram не указан
                        </p>
                    )}
                </div>
            </TableCell>

            {/* Состав заказа */}
            <TableCell>
                <div className="space-y-1">
                    {displayedItems.map((item) => (
                        <p
                            key={item.id}
                            className="text-sm"
                        >
                            {item.figureName}

                            <span className="ml-1 text-muted-foreground">
                                × {item.quantity}
                            </span>
                        </p>
                    ))}

                    {remainingItems > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Ещё {remainingItems} поз.
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        {itemCount} шт. · {dropNames.join(', ')}
                    </p>
                </div>
            </TableCell>

            {/* Оплата */}
            <TableCell>
                <span
                    className={`text-sm font-medium ${paymentStatus.className}`}
                >
                    {paymentStatus.label}
                </span>
            </TableCell>

            {/* Доставка */}
            <TableCell>
                <span
                    className={`text-sm font-medium ${deliveryStatus.className}`}
                >
                    {deliveryStatus.label}
                </span>
            </TableCell>

            {/* Сумма */}
            <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(order.total)}
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
                        href={`/admin/orders/${order.id}`}
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

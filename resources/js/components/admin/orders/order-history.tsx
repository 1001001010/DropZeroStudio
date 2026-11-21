
import { useMemo } from 'react'
import {
    ArrowRight,
    CircleDot,
    History,
    MessageSquareText,
    UserRound,
} from 'lucide-react'

import type { OrderHistoryEvent, OrderStatus } from '@/types/index.d'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

interface OrderHistoryProps {
    events: OrderHistoryEvent[]
}

/**
 * Названия статусов заказа.
 */
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Ожидает обработки',
    accepted: 'Принят',
    processing: 'Собирается',
    shipped: 'Отправлен',
    completed: 'Завершён',
    cancelled: 'Отменён',
}

/**
 * Цвета статусов заказа.
 */
const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
    pending:
        'border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    accepted:
        'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    processing:
        'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
    shipped:
        'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    completed:
        'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
    cancelled:
        'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
}

/**
 * Преобразует дату в корректный формат для JavaScript.
 *
 * MySQL может вернуть:
 * - 2026-11-20 11:19:35
 * - 2026-11-20T11:19:35
 * - 2026-11-20T11:19:35.000000Z
 *
 * Если timezone отсутствует, считаем дату UTC,
 * поскольку сервер проекта работает в UTC.
 */
function parseEventDate(value: string): Date | null {
    const normalizedValue = value
        .trim()
        .replace(' ', 'T')

    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
        normalizedValue,
    )

    const date = new Date(
        hasTimezone
            ? normalizedValue
            : `${normalizedValue}Z`,
    )

    return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Форматирует дату события.
 */
function formatEventDate(value: string): {
    date: string
    time: string
} {
    const parsedDate = parseEventDate(value)

    if (!parsedDate) {
        return {
            date: 'Некорректная дата',
            time: '',
        }
    }

    return {
        date: new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(parsedDate),

        time: new Intl.DateTimeFormat('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC',
        }).format(parsedDate),
    }
}

/**
 * Возвращает название статуса.
 */
function getStatusLabel(status: OrderStatus | null): string {
    if (!status) {
        return 'Заказ создан'
    }

    return ORDER_STATUS_LABELS[status] ?? status
}

/**
 * Возвращает стили статуса.
 */
function getStatusStyle(status: OrderStatus): string {
    return ORDER_STATUS_STYLES[status]
}

/**
 * Возвращает правильную форму слова «событие».
 */
function getEventWord(count: number): string {
    const lastTwoDigits = count % 100
    const lastDigit = count % 10

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'событий'
    }

    if (lastDigit === 1) {
        return 'событие'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'события'
    }

    return 'событий'
}

/**
 * История изменения статусов заказа.
 *
 * События отображаются в обратном хронологическом порядке:
 * сначала последнее изменение, затем предыдущие.
 */
export function OrderHistory({ events }: OrderHistoryProps) {
    const sortedEvents = useMemo(
        () =>
            [...events].sort((a, b) => {
                const dateA = parseEventDate(a.created_at)?.getTime() ?? 0
                const dateB = parseEventDate(b.created_at)?.getTime() ?? 0

                return dateB - dateA
            }),
        [events],
    )

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <History className="size-4 text-muted-foreground" />
                            История заказа
                        </CardTitle>

                        <CardDescription>
                            История изменения статусов и действий
                            с заказом.
                        </CardDescription>
                    </div>

                    <Badge
                        variant="secondary"
                        className="shrink-0 tabular-nums"
                    >
                        {events.length} {getEventWord(events.length)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                {sortedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                            <History className="size-5 text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium">
                            История пока пуста
                        </p>

                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                            Здесь будут отображаться изменения
                            статусов и действия с заказом.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {sortedEvents.map((event, index) => {
                            const formattedDate = formatEventDate(
                                event.created_at,
                            )

                            const isLatest = index === 0
                            const isLast = index === sortedEvents.length - 1

                            const actorName =
                                event.changer?.name ??
                                (event.changed_by
                                    ? `Администратор #${event.changed_by}`
                                    : 'Система')

                            return (
                                <div
                                    key={event.id}
                                    className="relative flex gap-4"
                                >
                                    {/* Линия временной шкалы */}
                                    {!isLast && (
                                        <div className="absolute left-[15px] top-9 bottom-0 w-px bg-border" />
                                    )}

                                    {/* Маркер события */}
                                    <div className="relative z-10 flex shrink-0 flex-col items-center">
                                        <div
                                            className={[
                                                'flex size-8 items-center justify-center rounded-full border',
                                                isLatest
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'border-border bg-muted text-muted-foreground',
                                            ].join(' ')}
                                        >
                                            <CircleDot className="size-4" />
                                        </div>
                                    </div>

                                    {/* Содержимое события */}
                                    <div
                                        className={[
                                            'min-w-0 flex-1',
                                            isLast ? 'pb-0' : 'pb-7',
                                        ].join(' ')}
                                    >
                                        <div
                                            className={[
                                                'rounded-xl border p-4 transition-colors',
                                                isLatest
                                                    ? 'border-primary/20 bg-primary/[0.03]'
                                                    : 'bg-card',
                                            ].join(' ')}
                                        >
                                            {/* Заголовок и время */}
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold">
                                                        {event.old_status
                                                            ? 'Изменение статуса'
                                                            : 'Заказ создан'}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {event.old_status && (
                                                            <Badge
                                                                variant="outline"
                                                                className={getStatusStyle(
                                                                    event.old_status,
                                                                )}
                                                            >
                                                                {getStatusLabel(
                                                                    event.old_status,
                                                                )}
                                                            </Badge>
                                                        )}

                                                        {event.old_status && (
                                                            <ArrowRight className="size-3.5 text-muted-foreground" />
                                                        )}

                                                        <Badge
                                                            variant="outline"
                                                            className={getStatusStyle(
                                                                event.new_status,
                                                            )}
                                                        >
                                                            {getStatusLabel(
                                                                event.new_status,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {isLatest && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Последнее изменение
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Комментарий */}
                                            {event.comment && (
                                                <div className="mt-4 flex gap-2.5 rounded-lg bg-muted/50 p-3">
                                                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <p className="text-sm leading-relaxed">
                                                        {event.comment}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Автор и дата */}
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3">
                                                <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                                    <UserRound className="size-4 shrink-0" />

                                                    <span className="truncate">
                                                        {actorName}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums text-muted-foreground">
                                                    <span>
                                                        {formattedDate.date}
                                                    </span>

                                                    {formattedDate.time && (
                                                        <>
                                                            <span className="text-border">
                                                                /
                                                            </span>

                                                            <span>
                                                                {formattedDate.time}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

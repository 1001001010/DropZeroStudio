
import { useMemo } from 'react'
import {
    CircleDot,
    History,
    UserRound,
} from 'lucide-react'

import type { OrderHistoryEvent } from '@/types/index.d'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

interface OrderHistoryProps {
    events: OrderHistoryEvent[]
}

/**
 * Форматирует дату события для отображения в истории заказа.
 */
function formatEventDate(value: string): {
    date: string
    time: string
} {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
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
        }).format(date),
        time: new Intl.DateTimeFormat('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date),
    }
}

/**
 * История событий заказа.
 *
 * Отображает события в обратном хронологическом порядке,
 * начиная с последнего изменения.
 */
export function OrderHistory({ events }: OrderHistoryProps) {
    const sortedEvents = useMemo(
        () =>
            [...events].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            ),
        [events],
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <History className="size-4 text-muted-foreground" />
                            История заказа
                        </CardTitle>

                        <CardDescription>
                            Все изменения и события, связанные с заказом.
                        </CardDescription>
                    </div>

                    <span className="shrink-0 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground">
                        {events.length} {getEventWord(events.length)}
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                {sortedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <History className="size-5 text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium">
                            История пока пуста
                        </p>

                        <p className="max-w-xs text-xs text-muted-foreground">
                            Здесь будут отображаться все изменения и события
                            заказа.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-6">
                        {sortedEvents.map((event, index) => {
                            const formattedDate = formatEventDate(
                                event.createdAt,
                            )

                            const isLatest = index === 0
                            const isLast = index === sortedEvents.length - 1

                            return (
                                <div
                                    key={event.id}
                                    className="relative flex gap-3"
                                >
                                    {/* Вертикальная линия временной шкалы */}
                                    {!isLast && (
                                        <div className="absolute left-[7px] top-5 h-[calc(100%+1.5rem)] w-px bg-border" />
                                    )}

                                    {/* Маркер события */}
                                    <div
                                        className={[
                                            'relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                                            isLatest
                                                ? 'border-primary bg-primary/10'
                                                : 'border-muted-foreground/30 bg-background',
                                        ].join(' ')}
                                    >
                                        <CircleDot
                                            className={[
                                                'size-2',
                                                isLatest
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground/50',
                                            ].join(' ')}
                                        />
                                    </div>

                                    {/* Информация о событии */}
                                    <div className="min-w-0 flex-1 space-y-2 pb-1">
                                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                            <p className="text-sm font-medium leading-5">
                                                {event.title}
                                            </p>

                                            <time
                                                dateTime={event.createdAt}
                                                className="shrink-0 text-xs tabular-nums text-muted-foreground"
                                            >
                                                {formattedDate.time}
                                            </time>
                                        </div>

                                        {event.description && (
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                {formattedDate.date}
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <UserRound className="size-3" />
                                                {event.actor ?? 'Система'}
                                            </span>
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

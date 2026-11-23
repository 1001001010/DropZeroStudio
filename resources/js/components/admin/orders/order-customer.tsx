
import {
    Copy,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    Send,
    UserRound,
} from 'lucide-react'

import { toast } from '@/components/ui/toast'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import type { Order } from '@/types'

interface OrderCustomerProps {
    /** Контактные данные покупателя. */
    order: Order

    /** Адрес доставки из заказа. */
    address?: string | null
}

/**
 * Копирует текст в буфер обмена и отображает результат операции.
 *
 * @param value Текст для копирования.
 * @param label Название копируемого значения.
 */
async function copyToClipboard(
    value: string,
    label: string,
): Promise<void> {
    try {
        await navigator.clipboard.writeText(value)

        toast.add({
            title: `${label} скопирован`,
            description: 'Данные успешно скопированы в буфер обмена.',
        })
    } catch {
        toast.add({
            title: 'Не удалось скопировать данные',
            description: 'Проверьте разрешения браузера на доступ к буферу обмена.',
        })
    }
}

/**
 * Отображает карточку покупателя и его контактные данные.
 *
 * @param order Данные заказа.
 * @param address Адрес доставки.
 */
export function OrderCustomer({
    order,
    address,
}: OrderCustomerProps) {
    const telegramUsername = order.telegram_username?.replace(/^@/, '')

    const telegramUrl = telegramUsername
        ? `https://t.me/${telegramUsername}`
        : null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="size-4 text-muted-foreground" />
                    Заказчик
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Имя покупателя */}
                <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserRound className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold">
                            {order.customer_name || 'Имя не указано'}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            ID покупателя: #{order.customer?.id ?? 'Не зарегистрирован'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Telegram */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Send className="size-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0 space-y-0.5">
                                <p className="text-xs text-muted-foreground">
                                    Telegram
                                </p>

                                <p className="truncate text-sm font-medium">
                                    {order.telegram_username || 'Не указан'}
                                </p>
                            </div>
                        </div>

                        {telegramUrl && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <a
                                    href={telegramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Открыть Telegram"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Mail className="size-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0 space-y-0.5">
                                <p className="text-xs text-muted-foreground">
                                    Email
                                </p>

                                <p className="truncate text-sm font-medium">
                                    {order.email || 'Не указан'}
                                </p>
                            </div>
                        </div>

                        {order.email && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <a
                                    href={`mailto:${order.email}`}
                                    aria-label="Написать на email"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Телефон */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Phone className="size-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0 space-y-0.5">
                                <p className="text-xs text-muted-foreground">
                                    Телефон
                                </p>

                                <p className="truncate text-sm font-medium">
                                    {order.phone || 'Не указан'}
                                </p>
                            </div>
                        </div>

                        {order.phone && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <a
                                    href={`tel:${order.phone}`}
                                    aria-label="Позвонить покупателю"
                                >
                                    <Phone className="size-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Адрес доставки */}
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                        <div className="min-w-0 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Адрес доставки
                            </p>

                            <p className="whitespace-pre-wrap break-words text-sm font-medium">
                                {address || 'Не указан'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Копирование контактных данных */}
                <div className="flex flex-wrap gap-2 border-t pt-4">
                    {order.telegram_username && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                copyToClipboard(
                                    `@${telegramUsername}`,
                                    'Telegram',
                                )
                            }
                        >
                            <Copy className="size-3.5" />
                            Telegram
                        </Button>
                    )}

                    {order.email && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                copyToClipboard(order.email!, 'Email')
                            }
                        >
                            <Copy className="size-3.5" />
                            Email
                        </Button>
                    )}

                    {order.phone && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                copyToClipboard(order.phone!, 'Телефон')
                            }
                        >
                            <Copy className="size-3.5" />
                            Телефон
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

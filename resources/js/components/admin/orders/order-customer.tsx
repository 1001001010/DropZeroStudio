
import {
    Copy,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    Send,
    UserRound,
} from 'lucide-react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import type { OrderCustomer } from '@/types/index.d'

interface OrderCustomerProps {
    /** Контактные данные покупателя. */
    customer: OrderCustomer

    /** Адрес доставки из заказа. */
    address?: string | null
}

/**
 * Копирует текст в буфер обмена и уведомляет пользователя о результате.
 *
 * @param value Текст для копирования.
 * @param label Название копируемого значения.
 * @returns Promise, завершающийся после выполнения операции.
 */
async function copyToClipboard(
    value: string,
    label: string,
): Promise<void> {
    try {
        await navigator.clipboard.writeText(value)
        toast.success(`${label} скопирован`)
    } catch {
        toast.error('Не удалось скопировать данные')
    }
}

/**
 * Отображает карточку покупателя и его контактные данные.
 *
 * @param customer Данные покупателя.
 * @param address Адрес доставки.
 * @returns Карточка с информацией о клиенте.
 */
export function OrderCustomer({
    customer,
    address,
}: OrderCustomerProps) {
    const telegramUrl = customer.telegramUsername
        ? `https://t.me/${encodeURIComponent(customer.telegramUsername)}`
        : null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="size-4 text-muted-foreground" />
                    Покупатель
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
                            {customer.name || 'Имя не указано'}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            ID покупателя: #{customer.id}
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
                                    {customer.telegramUsername
                                        ? `@${customer.telegramUsername}`
                                        : 'Не указан'}
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
                                    {customer.email || 'Не указан'}
                                </p>
                            </div>
                        </div>

                        {customer.email && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <a
                                    href={`mailto:${customer.email}`}
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
                                    {customer.phone || 'Не указан'}
                                </p>
                            </div>
                        </div>

                        {customer.phone && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <a
                                    href={`tel:${customer.phone}`}
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
                    {customer.telegramUsername && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(
                                `@${customer.telegramUsername}`,
                                'Telegram',
                            )}
                        >
                            <Copy className="size-3.5" />
                            Telegram
                        </Button>
                    )}

                    {customer.email && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(
                                customer.email!,
                                'Email',
                            )}
                        >
                            <Copy className="size-3.5" />
                            Email
                        </Button>
                    )}

                    {customer.phone && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(
                                customer.phone!,
                                'Телефон',
                            )}
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


import {
    CheckCircle2,
    Clock3,
    CreditCard,
    ExternalLink,
    FileJson,
    RefreshCcw,
    XCircle,
} from 'lucide-react'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

import type { PaymentStatus, OrderPayment } from '@/types/index.d'

interface OrderPaymentProps {
    /** Информация об оплате заказа. */
    payment: OrderPayment

    /** Итоговая сумма заказа. */
    total: number
}

/**
 * Настройки отображения статусов оплаты.
 */
const PAYMENT_STATUS_CONFIG: Record<
    PaymentStatus,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        icon: typeof CheckCircle2
    }
> = {
    pending: {
        label: 'Ожидает оплаты',
        variant: 'outline',
        icon: Clock3,
    },
    paid: {
        label: 'Оплачено',
        variant: 'secondary',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Ошибка оплаты',
        variant: 'destructive',
        icon: XCircle,
    },
    refunded: {
        label: 'Средства возвращены',
        variant: 'outline',
        icon: RefreshCcw,
    },
}

/**
 * Форматирует дату и время.
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
 * Копирует идентификатор транзакции в буфер обмена.
 *
 * @param transactionId Идентификатор транзакции.
 * @returns Promise после выполнения копирования.
 */
async function copyTransactionId(transactionId: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(transactionId)
        toast.success('ID транзакции скопирован')
    } catch {
        toast.error('Не удалось скопировать ID транзакции')
    }
}

/**
 * Отображает информацию об оплате заказа.
 *
 * @param payment Данные платёжной системы.
 * @param total Итоговая сумма заказа.
 * @returns Карточка с информацией о платеже и техническими данными.
 */
export function OrderPayment({
    payment,
    total,
}: OrderPaymentProps) {
    const status = PAYMENT_STATUS_CONFIG[payment.status]
    const StatusIcon = status.icon

    const formattedResponse = payment.rawResponse
        ? JSON.stringify(payment.rawResponse, null, 2)
        : null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="size-4 text-muted-foreground" />
                    Оплата
                </CardTitle>

                <Badge
                    variant={status.variant}
                    className="gap-1.5"
                >
                    <StatusIcon className="size-3.5" />
                    {status.label}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Основные сведения */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Сумма платежа
                        </p>

                        <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(total, payment.currency)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Способ оплаты
                        </p>

                        <p className="text-sm font-medium">
                            {payment.method || 'Не указан'}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Платёжная система
                        </p>

                        <p className="text-sm font-medium">
                            {payment.provider || 'Не указана'}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Дата оплаты
                        </p>

                        <p className="text-sm font-medium">
                            {payment.paidAt
                                ? formatDate(payment.paidAt)
                                : 'Нет данных'}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Идентификатор транзакции */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        ID транзакции
                    </p>

                    {payment.transactionId ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <code className="min-w-0 break-all rounded-md bg-muted px-3 py-2 text-xs">
                                {payment.transactionId}
                            </code>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                                onClick={() => copyTransactionId(payment.transactionId!)}
                                aria-label="Скопировать ID транзакции"
                            >
                                <FileJson className="size-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Транзакция ещё не создана.
                        </p>
                    )}
                </div>

                <Separator />

                {/* Исходный ответ платёжной системы */}
                <Collapsible>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Ответ платёжной системы
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Исходные данные API в формате JSON.
                            </p>
                        </div>

                        <CollapsibleTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <ExternalLink className="size-3.5" />
                                Показать данные
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="pt-3">
                        {formattedResponse ? (
                            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
                                {formattedResponse}
                            </pre>
                        ) : (
                            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                Данные от платёжной системы пока отсутствуют.
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    )
}

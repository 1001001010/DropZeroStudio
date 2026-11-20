
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

import type { PaymentStatus, OrderPayment as OrderPaymentType } from '@/types/index.d'

interface OrderPaymentProps {
    payment: OrderPaymentType | null
    total: number
    currency: string
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
    partially_refunded: {
        label: 'Средства частично возмещены',
        variant: 'outline',
        icon: RefreshCcw,
    },
}

/**
 * Форматирует дату и время.
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
 * Если платёж ещё не создан, показывает ожидающий статус
 * и сумму заказа без технических данных платежа.
 */
export function OrderPayment({
    payment,
    total,
    currency,
}: OrderPaymentProps) {
    // Если платёж отсутствует, используем статус ожидания оплаты.
    const status = payment
        ? PAYMENT_STATUS_CONFIG[payment.status]
        : PAYMENT_STATUS_CONFIG.pending

    const StatusIcon = status.icon

    // Технический ответ доступен только при наличии платежа.
    const formattedResponse = payment?.metadata
        ? JSON.stringify(payment.metadata, null, 2)
        : null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="size-4 text-muted-foreground" />
                    Оплата
                </CardTitle>

                <Badge variant={status.variant} className="gap-1.5">
                    <StatusIcon className="size-3.5" />
                    {status.label}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Основные сведения */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Сумма заказа
                        </p>

                        <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(total, currency)}
                        </p>
                    </div>

                    {payment && (
                        <>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Сумма платежа
                                </p>

                                <p className="text-lg font-semibold tabular-nums">
                                    {formatCurrency(
                                        Number(payment.amount),
                                        payment.currency,
                                    )}
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
                                    {payment.paid_at
                                        ? formatDate(payment.paid_at)
                                        : 'Нет данных'}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {!payment ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                        <Clock3 className="mx-auto mb-2 size-5 text-muted-foreground" />

                        <p className="text-sm font-medium">
                            Платёж ещё не создан
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Информация о платеже появится после его создания.
                        </p>
                    </div>
                ) : (
                    <>
                        <Separator />

                        {/* Идентификатор транзакции */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                ID транзакции
                            </p>

                            {payment.transaction_id ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <code className="min-w-0 break-all rounded-md bg-muted px-3 py-2 text-xs">
                                        {payment.transaction_id}
                                    </code>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-8 shrink-0"
                                        onClick={() =>
                                            copyTransactionId(payment.transaction_id!)
                                        }
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

                        {/* Исходные данные платёжной системы */}
                        <Collapsible>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Данные платежа
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Сохранённые технические данные в формате JSON.
                                    </p>
                                </div>

                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm">
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
                                        Технические данные пока отсутствуют.
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

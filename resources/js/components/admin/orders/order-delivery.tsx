
import {
    CheckCircle2,
    Clock3,
    Copy,
    ExternalLink,
    FileJson,
    MapPin,
    Package,
    Truck,
    UserRound,
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

import type { DeliveryStatus, OrderDelivery, Order } from '@/types/index.d'

interface OrderDeliveryProps {
    /** Информация о доставке заказа. */
    order: Order
}

/**
 * Настройки отображения статусов доставки.
 */
const DELIVERY_STATUS_CONFIG: Record<
    DeliveryStatus,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        icon: typeof Truck
    }
> = {
    not_shipped: {
        label: 'Не отправлен',
        variant: 'outline',
        icon: Package,
    },
    preparing: {
        label: 'Готовится к отправке',
        variant: 'secondary',
        icon: Clock3,
    },
    in_transit: {
        label: 'В пути',
        variant: 'default',
        icon: Truck,
    },
    delivered: {
        label: 'Доставлен',
        variant: 'secondary',
        icon: CheckCircle2,
    },
    returned: {
        label: 'Возвращён',
        variant: 'destructive',
        icon: XCircle,
    },
}

/**
 * Копирует значение в буфер обмена.
 *
 * @param value Значение для копирования.
 * @param label Название скопированного значения.
 * @returns Promise после выполнения операции.
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
 * Отображает информацию о доставке заказа.
 *
 * @param order Данные о заказе.
 * @returns Карточка с информацией об отправлении.
 */
export function OrderDelivery({ order }: OrderDeliveryProps) {
    // Если доставка отсутствует, используем статус по умолчанию.
    const status = order.delivery
        ? DELIVERY_STATUS_CONFIG[order.delivery.status]
        : DELIVERY_STATUS_CONFIG.not_shipped

    const StatusIcon = status.icon

    // Технические данные доступны только при наличии отправления.
    const formattedResponse = order.delivery?.OrderShipment.shipping_data
        ? JSON.stringify(order.delivery.OrderShipment.shipping_data, null, 2)
        : null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="size-4 text-muted-foreground" />
                    Доставка
                </CardTitle>

                <Badge variant={status.variant} className="gap-1.5">
                    <StatusIcon className="size-3.5" />
                    {status.label}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-5">
                {!order.delivery ? (
                    <div className="rounded-lg border border-dashed p-5 text-center">
                        <Package className="mx-auto mb-2 size-6 text-muted-foreground" />

                        <p className="text-sm font-medium">
                            Отправление ещё не создано
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Информация о доставке появится после оформления отправления.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Основная информация */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Служба доставки
                                </p>

                                <p className="text-sm font-medium">
                                    {order.delivery.provider || 'Не указана'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Трек-номер
                                </p>

                                {order.delivery.OrderShipment.tracking_number ? (
                                    <div className="flex items-center gap-2">
                                        <code className="break-all text-sm font-medium">
                                            {order.delivery.OrderShipment.tracking_number}
                                        </code>

                                        {order.delivery?.OrderShipment.tracking_number ? (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-7 shrink-0"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        order.delivery!.OrderShipment.tracking_number!,
                                                        'Трек-номер',
                                                    )
                                                }
                                                aria-label="Скопировать трек-номер"
                                            >
                                                <Copy className="size-3.5" />
                                            </Button>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Пока не присвоен
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Данные получателя */}
                        <div className="space-y-4">
                            <p className="text-sm font-medium">
                                Получатель
                            </p>

                            <div className="flex items-start gap-3">
                                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Имя получателя
                                    </p>

                                    <p className="text-sm font-medium">
                                        {order.delivery.OrderShipment.recipient_name || 'Не указано'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="min-w-0 space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Адрес доставки
                                    </p>

                                    <p className="whitespace-pre-wrap break-words text-sm font-medium">
                                        {order.delivery.address || 'Не указан'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Телефон получателя
                                    </p>

                                    {order.delivery.phone ? (
                                        <a
                                            href={`tel:${order.delivery.phone}`}
                                            className="text-sm font-medium transition-colors hover:text-primary"
                                        >
                                            {order.delivery.phone}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Не указан
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Технические данные службы доставки */}
                        <Collapsible>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        <FileJson className="size-4 text-muted-foreground" />
                                        Данные службы доставки
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Сохранённые технические данные в формате JSON.
                                    </p>
                                </div>

                                <CollapsibleTrigger asChild>
                                    <Button size="sm" variant="outline">
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

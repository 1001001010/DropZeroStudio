
import { useState } from 'react'

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Copy,
    ExternalLink,
    FileJson,
    MapPin,
    Package,
    Phone,
    Truck,
    UserRound,
    XCircle,
    type LucideIcon,
} from 'lucide-react'

import { toast } from '@/components/ui/toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

import type { ShipmentStatus } from '@/types'
import type { DeliveryShipmentInfoProps } from '@/types/index'

/**
 * Конфигурация отображения статусов отправления.
 */
const SHIPMENT_STATUS_CONFIG: Record<
    ShipmentStatus,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        icon: LucideIcon
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
 * Форматирует дату для отображения.
 *
 * @param value Дата в строковом формате.
 * @returns Отформатированная дата или сообщение об отсутствии данных.
 */
function formatDate(value: string | null): string {
    if (!value) {
        return 'Не указана'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Некорректная дата'
    }

    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

/**
 * Копирует значение в буфер обмена и отображает результат.
 *
 * @param value Значение для копирования.
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
 * Отдельное информационное поле отправления.
 */
function InfoField({
    label,
    value,
    icon: Icon,
    copyable = false,
}: {
    label: string
    value: string | null
    icon?: LucideIcon
    copyable?: boolean
}) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <div className="flex min-w-0 items-center gap-1.5">
                {Icon && (
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                )}

                <p className="min-w-0 break-words text-sm font-medium">
                    {value || 'Не указано'}
                </p>

                {copyable && value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => copyToClipboard(value, label)}
                        aria-label={`Скопировать: ${label}`}
                    >
                        <Copy className="size-3.5" />
                    </Button>
                )}
            </div>
        </div>
    )
}

/**
 * Отображает информацию о созданном отправлении СДЭК.
 *
 * @param shipment Данные отправления.
 */
export function DeliveryShipmentInfo({
    shipment,
}: DeliveryShipmentInfoProps) {
    const [technicalInfoOpen, setTechnicalInfoOpen] = useState(false)

    if (!shipment) {
        return null
    }

    const status = SHIPMENT_STATUS_CONFIG[shipment.status]
    const StatusIcon = status.icon

    const shippingData = shipment.shipping_data

    const formattedShippingData = shippingData
        ? JSON.stringify(shippingData, null, 2)
        : null

    const trackingUrl = shipment.tracking_number
        ? `https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(shipment.tracking_number)}`
        : null

    return (
        <section className="space-y-4 rounded-lg border bg-muted/20 p-3">
            {/* Заголовок и статус */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-background">
                        <Truck className="size-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-0.5">
                        <h3 className="text-sm font-medium">
                            Отправление СДЭК
                        </h3>

                        <p className="text-xs text-muted-foreground">
                            Информация о доставке заказа
                        </p>
                    </div>
                </div>

                <Badge
                    variant={status.variant}
                    className="gap-1.5"
                >
                    <StatusIcon className="size-3.5" />
                    {status.label}
                </Badge>
            </div>

            <Separator />

            {/* Трек-номер */}
            <div className="rounded-lg border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Трек-номер
                        </p>

                        <p className="break-all font-mono text-base font-semibold">
                            {shipment.tracking_number || 'Ещё не присвоен'}
                        </p>
                    </div>

                    {shipment.tracking_number && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                    copyToClipboard(
                                        shipment.tracking_number!,
                                        'Трек-номер',
                                    )
                                }
                                aria-label="Скопировать трек-номер"
                            >
                                <Copy className="size-4" />
                            </Button>

                            {trackingUrl && (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                >
                                    <a
                                        href={trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-3.5" />
                                        Отследить
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Основная информация */}
            <div className="grid gap-4 sm:grid-cols-2">
                <InfoField
                    label="ID отправления СДЭК"
                    value={shipment.provider_order_id}
                    icon={Package}
                    copyable
                />

                <InfoField
                    label="Получатель"
                    value={shipment.recipient_name}
                    icon={UserRound}
                />

                <InfoField
                    label="Телефон"
                    value={shipment.phone}
                    icon={Phone}
                    copyable
                />

                <InfoField
                    label="Страна"
                    value={shipment.country}
                    icon={MapPin}
                />

                <InfoField
                    label="Город"
                    value={shipment.city}
                    icon={MapPin}
                />

                <InfoField
                    label="Индекс"
                    value={shipment.postal_code}
                    icon={MapPin}
                    copyable
                />

                <InfoField
                    label="Адрес / ПВЗ"
                    value={shipment.address}
                    icon={MapPin}
                />
            </div>

            <Separator />

            {/* Даты отправления */}
            <div className="grid gap-3 sm:grid-cols-2">
                <InfoField
                    label="Дата отправки"
                    value={formatDate(shipment.shipped_at)}
                    icon={CalendarDays}
                />

                <InfoField
                    label="Дата доставки"
                    value={formatDate(shipment.delivered_at)}
                    icon={CalendarDays}
                />
            </div>

            {/* Техническая информация */}
            <Collapsible
                open={technicalInfoOpen}
                onOpenChange={setTechnicalInfoOpen}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileJson className="size-4 text-muted-foreground" />

                        <span className="text-sm font-medium">
                            Технические данные
                        </span>
                    </div>

                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                        >
                            {technicalInfoOpen
                                ? 'Скрыть'
                                : 'Показать JSON'}
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="pt-3">
                    {formattedShippingData ? (
                        <pre className="max-h-80 overflow-auto rounded-lg border bg-background p-3 text-xs leading-relaxed">
                            {formattedShippingData}
                        </pre>
                    ) : (
                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                            Технические данные отсутствуют.
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </section>
    )
}

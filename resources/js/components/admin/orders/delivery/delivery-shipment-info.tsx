
import {
    CalendarDays,
    Clock3,
    Copy,
    MapPin,
    Package,
    Truck,
    UserRound,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Separator } from '@/components/ui/separator'

import type { OrderShipment } from '@/types'

/**
 * Структура JSON-объекта.
 *
 * Используется для безопасного чтения вложенных данных
 * из ответа СДЭК и shipping_data.
 */
type JsonRecord = Record<string, unknown>

/**
 * Дополнительные поля отправления из миграций.
 *
 * Пока они могут отсутствовать в старых TypeScript-типах.
 * После обновления index.d.ts этот тип можно будет убрать.
 */
type ExtendedShipment = OrderShipment & {
    from_city_code?: number | null
    to_city_code?: number | null
    from_city?: string | null
    to_city?: string | null
    delivery_mode?: string | null
    tariff_code?: number | null
    tariff_name?: string | null
    pickup_point_code?: string | null
    pickup_point_address?: string | null
    weight?: number | null
    length?: number | null
    width?: number | null
    height?: number | null
    delivery_cost?: string | number | null
    currency?: string | null
    label_path?: string | null
}

/**
 * Преобразует неизвестное значение в объект.
 */
function asRecord(value: unknown): JsonRecord {
    if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    ) {
        return value as JsonRecord
    }

    return {}
}

/**
 * Возвращает строковое значение либо резервное значение.
 */
function getString(
    value: unknown,
    fallback = 'Не указано',
): string {
    if (
        typeof value === 'string' ||
        typeof value === 'number'
    ) {
        const result = String(value).trim()

        return result || fallback
    }

    return fallback
}

/**
 * Форматирует дату.
 */
function formatDate(value: string | null | undefined): string {
    if (!value) {
        return 'Не указано'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

/**
 * Форматирует денежное значение.
 */
function formatMoney(
    value: string | number | null | undefined,
    currency = 'RUB',
): string {
    if (value === null || value === undefined || value === '') {
        return 'Не указано'
    }

    const amount = Number(value)

    if (!Number.isFinite(amount)) {
        return String(value)
    }

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Форматирует статус отправления.
 */
function getStatusInfo(status: string) {
    const statuses: Record<
        string,
        { label: string; className: string }
    > = {
        not_shipped: {
            label: 'Не отправлено',
            className: 'bg-muted text-muted-foreground',
        },
        preparing: {
            label: 'Подготовка',
            className: 'bg-yellow-500/10 text-yellow-500',
        },
        in_transit: {
            label: 'В пути',
            className: 'bg-blue-500/10 text-blue-500',
        },
        delivered: {
            label: 'Доставлено',
            className: 'bg-green-500/10 text-green-500',
        },
        returned: {
            label: 'Возвращено',
            className: 'bg-red-500/10 text-red-500',
        },
    }

    return statuses[status] ?? {
        label: status || 'Неизвестно',
        className: 'bg-muted text-muted-foreground',
    }
}

/**
 * Универсальная строка с названием и значением.
 */
function InfoItem({
    label,
    value,
    copyable = false,
}: {
    label: string
    value: unknown
    copyable?: boolean
}) {
    const text = getString(value)

    return (
        <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 break-words text-sm font-medium">
                    {text}
                </p>

                {copyable && text !== 'Не указано' && (
                    <button
                        type="button"
                        title="Копировать"
                        onClick={() => {
                            void navigator.clipboard.writeText(text)
                        }}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Copy className="size-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * Секция с заголовком и сеткой параметров.
 */
function InfoSection({
    title,
    icon,
    children,
}: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                    {icon}
                </span>

                <h3 className="text-sm font-semibold">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </section>
    )
}

/**
 * Выводит информацию об отправлении СДЭК.
 *
 * Использует одновременно:
 * - структурированные поля OrderShipment;
 * - данные отправителя и получателя из shipping_data;
 * - сохранённый ответ API СДЭК.
 *
 * Отсутствующие значения отображаются как «Не указано».
 */
export function DeliveryShipmentInfo({
    shipment,
}: {
    shipment: OrderShipment
}) {
    const details = shipment as ExtendedShipment

    const shippingData = asRecord(shipment.shipping_data)

    const sender = asRecord(shippingData.sender)
    const recipient = asRecord(shippingData.recipient)
    const response = asRecord(shippingData.response)

    const entity = asRecord(response.entity)

    const requests = Array.isArray(response.requests)
        ? response.requests.map(asRecord)
        : []

    const packages = Array.isArray(shippingData.packages)
        ? shippingData.packages.map(asRecord)
        : []

    const firstPackage = packages[0] ?? {}

    const status = getStatusInfo(String(shipment.status))

    const shipmentUuid = getString(
        shipment.provider_order_id ?? shippingData.shipment_uuid,
    )

    const requestUuid = getString(
        shippingData.request_uuid ?? requests[0]?.request_uuid,
    )

    const trackingNumber = getString(shipment.tracking_number)

    const deliveryMode = details.delivery_mode === 'pvz'
        ? 'До пункта выдачи'
        : details.delivery_mode === 'address'
            ? 'До двери'
            : 'Не указано'

    const currency = details.currency ?? 'RUB'

    return (
        <Card className="overflow-hidden">
            {/* Заголовок отправления */}
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Truck className="size-5 text-muted-foreground" />

                            <CardTitle className="text-base">
                                Отправление СДЭК
                            </CardTitle>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Отправление №{shipment.id}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                        {status.label}
                    </span>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                        label="Номер отслеживания"
                        value={trackingNumber}
                        copyable
                    />

                    <InfoItem
                        label="UUID отправления"
                        value={shipmentUuid}
                        copyable
                    />

                    <InfoItem
                        label="UUID запроса"
                        value={requestUuid}
                        copyable
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Основная информация */}
                <InfoSection
                    title="Информация о доставке"
                    icon={<Package className="size-4" />}
                >
                    <InfoItem
                        label="Служба доставки"
                        value={shipment.provider?.toUpperCase()}
                    />

                    <InfoItem
                        label="Способ доставки"
                        value={deliveryMode}
                    />

                    <InfoItem
                        label="Название тарифа"
                        value={details.tariff_name}
                    />

                    <InfoItem
                        label="Код тарифа"
                        value={details.tariff_code}
                    />

                    <InfoItem
                        label="Стоимость доставки"
                        value={formatMoney(details.delivery_cost, currency)}
                    />

                    <InfoItem
                        label="Валюта"
                        value={currency}
                    />
                </InfoSection>

                <Separator />

                {/* Отправитель */}
                <InfoSection
                    title="Отправитель"
                    icon={<UserRound className="size-4" />}
                >
                    <InfoItem
                        label="ФИО"
                        value={sender.name}
                    />

                    <InfoItem
                        label="Компания"
                        value={sender.company}
                    />

                    <InfoItem
                        label="Телефон"
                        value={sender.phone}
                    />

                    <InfoItem
                        label="Город"
                        value={sender.city ?? details.from_city}
                    />

                    <InfoItem
                        label="Код города СДЭК"
                        value={sender.city_code ?? details.from_city_code}
                    />

                    <InfoItem
                        label="Код пункта отправления"
                        value={sender.shipment_point}
                        copyable
                    />

                    <InfoItem
                        label="Адрес пункта отправления"
                        value={
                            sender.address
                            ?? asRecord(sender.from_location).address
                        }
                    />
                </InfoSection>

                <Separator />

                {/* Получатель */}
                <InfoSection
                    title="Получатель"
                    icon={<MapPin className="size-4" />}
                >
                    <InfoItem
                        label="ФИО"
                        value={shipment.recipient_name || recipient.name}
                    />

                    <InfoItem
                        label="Телефон"
                        value={shipment.phone || recipient.phone}
                    />

                    <InfoItem
                        label="Город"
                        value={shipment.city || recipient.city || details.to_city}
                    />

                    <InfoItem
                        label="Код города СДЭК"
                        value={recipient.city_code ?? details.to_city_code}
                    />

                    <InfoItem
                        label="Почтовый индекс"
                        value={shipment.postal_code ?? recipient.postal_code}
                    />

                    <InfoItem
                        label="Адрес получателя"
                        value={shipment.address || recipient.address}
                    />

                    <InfoItem
                        label="Код пункта выдачи"
                        value={
                            shipment.pickup_point_code
                            ?? recipient.delivery_point
                        }
                        copyable
                    />

                    <InfoItem
                        label="Адрес пункта выдачи"
                        value={shipment.pickup_point_address}
                    />

                    <InfoItem
                        label="Страна"
                        value={shipment.country}
                    />
                </InfoSection>

                <Separator />

                {/* Посылка */}
                <InfoSection
                    title="Параметры посылки"
                    icon={<Package className="size-4" />}
                >
                    <InfoItem
                        label="Вес"
                        value={
                            details.weight ?? firstPackage.weight
                                ? `${details.weight ?? firstPackage.weight} г`
                                : null
                        }
                    />

                    <InfoItem
                        label="Длина"
                        value={
                            details.length ?? firstPackage.length
                                ? `${details.length ?? firstPackage.length} см`
                                : null
                        }
                    />

                    <InfoItem
                        label="Ширина"
                        value={
                            details.width ?? firstPackage.width
                                ? `${details.width ?? firstPackage.width} см`
                                : null
                        }
                    />

                    <InfoItem
                        label="Высота"
                        value={
                            details.height ?? firstPackage.height
                                ? `${details.height ?? firstPackage.height} см`
                                : null
                        }
                    />

                    <InfoItem
                        label="Количество мест"
                        value={packages.length || 1}
                    />

                    <InfoItem
                        label="Описание посылки"
                        value={firstPackage.comment}
                    />
                </InfoSection>

                <Separator />

                {/* Даты */}
                <InfoSection
                    title="История отправления"
                    icon={<CalendarDays className="size-4" />}
                >
                    <InfoItem
                        label="Создано в системе"
                        value={formatDate(shipment.created_at)}
                    />

                    <InfoItem
                        label="Передано в доставку"
                        value={formatDate(shipment.shipped_at)}
                    />

                    <InfoItem
                        label="Доставлено"
                        value={formatDate(shipment.delivered_at)}
                    />

                    <InfoItem
                        label="Последнее обновление"
                        value={formatDate(shipment.updated_at)}
                    />
                </InfoSection>

                {/* Ответ СДЭК */}
                <Separator />

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-muted-foreground" />

                        <h3 className="text-sm font-semibold">
                            Ответ СДЭК
                        </h3>
                    </div>

                    {requests.length > 0 ? (
                        <div className="space-y-3">
                            {requests.map((request, index) => (
                                <div
                                    key={String(request.request_uuid ?? index)}
                                    className="rounded-lg border p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium">
                                            Запрос {index + 1}
                                        </p>

                                        <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                            {getString(request.state)}
                                        </span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <InfoItem
                                            label="UUID запроса"
                                            value={request.request_uuid}
                                            copyable
                                        />

                                        <InfoItem
                                            label="Тип операции"
                                            value={request.type}
                                        />

                                        <InfoItem
                                            label="Дата запроса"
                                            value={formatDate(
                                                getString(request.date_time, ''),
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Информация о запросах СДЭК отсутствует.
                        </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoItem
                            label="UUID сущности СДЭК"
                            value={entity.uuid}
                            copyable
                        />

                        <InfoItem
                            label="UUID отправления в базе"
                            value={shipment.provider_order_id}
                            copyable
                        />
                    </div>
                </section>

                {/* Дополнительная информация */}
                {Boolean(shippingData.comment) && (
                    <>
                        <Separator />

                        <section className="space-y-2">
                            <h3 className="text-sm font-semibold">
                                Комментарий к отправлению
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                {getString(shippingData.comment)}
                            </p>
                        </section>
                    </>
                )}

                {/* Этикетка */}
                {details.label_path && (
                    <>
                        <Separator />

                        <InfoItem
                            label="Путь к этикетке"
                            value={details.label_path}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}

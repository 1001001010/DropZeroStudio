import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
    Check,
    ChevronDown,
    Clock3,
    ExternalLink,
    LoaderCircle,
    MapPin,
    Navigation,
    Package,
    Phone,
    Search,
    Shirt,
    Wallet,
} from 'lucide-react'

import type { CdekPickupPoint } from '@/types'

interface DeliveryPickupPointFieldProps {
    cityCode: number | null
    value: string
    onChange: (point: CdekPickupPoint | null) => void
}

/**
 * Поиск и выбор пункта выдачи СДЭК.
 *
 * Загружает ПВЗ выбранного города, позволяет найти пункт
 * по адресу или коду и показывает подробную информацию
 * о выбранном пункте.
 */
export function DeliveryPickupPointField({
    cityCode,
    value,
    onChange,
}: DeliveryPickupPointFieldProps) {
    const [points, setPoints] = useState<CdekPickupPoint[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    /**
     * Загружает пункты выдачи при выборе города.
     */
    useEffect(() => {
        if (!cityCode) {
            setPoints([])
            setQuery('')
            setOpen(false)

            return
        }

        const controller = new AbortController()

        async function loadPickupPoints() {
            setLoading(true)

            try {
                const response = await axios.get<{
                    data: CdekPickupPoint[]
                }>(route('admin.cdek.pickup-points'), {
                    params: {
                        city_code: cityCode,
                        type: 'ALL',
                    },
                    signal: controller.signal,
                })

                setPoints(response.data.data)
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setPoints([])
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadPickupPoints()

        return () => controller.abort()
    }, [cityCode])

    /**
     * Находит выбранный пункт по его коду.
     */
    const selectedPoint = useMemo(
        () => points.find((point) => point.code === value) ?? null,
        [points, value],
    )

    /**
     * Фильтрует загруженные ПВЗ по адресу и коду.
     */
    const filteredPoints = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        if (!normalizedQuery) {
            return points
        }

        return points.filter((point) => {
            const searchableText = [
                point.code,
                point.name,
                point.address,
                point.address_full,
                point.address_comment,
                point.postal_code,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchableText.includes(normalizedQuery)
        })
    }, [points, query])

    /**
     * Выбирает пункт выдачи.
     */
    const handleSelect = (point: CdekPickupPoint) => {
        onChange(point)
        setQuery('')
        setOpen(false)
    }

    /**
     * Сбрасывает выбранный пункт.
     */
    const handleClear = () => {
        onChange(null)
        setQuery('')
        setOpen(true)
    }

    if (!cityCode) {
        return (
            <p className="text-xs text-muted-foreground">
                Сначала выберите город.
            </p>
        )
    }

    return (
        <div className="relative min-w-0 space-y-2">
            <span className="text-xs text-muted-foreground">
                Пункт выдачи СДЭК
            </span>

            {/* Выбранный пункт */}
            {value ? (
                <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                    {selectedPoint ? (
                        <>
                            {/* Заголовок */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Check className="size-4 shrink-0 text-green-600" />

                                        <span className="text-sm font-medium">
                                            Пункт выбран
                                        </span>

                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {selectedPoint.code}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium">
                                        {selectedPoint.name || 'Пункт выдачи СДЭК'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                                >
                                    Изменить
                                </button>
                            </div>

                            {/* Адрес */}
                            <div className="flex gap-2">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="min-w-0 space-y-0.5">
                                    <p className="text-sm">
                                        {selectedPoint.address_full ||
                                            [selectedPoint.address, selectedPoint.city]
                                                .filter(Boolean)
                                                .join(', ') ||
                                            'Адрес не указан'}
                                    </p>

                                    {selectedPoint.postal_code && (
                                        <p className="text-xs text-muted-foreground">
                                            Индекс: {selectedPoint.postal_code}
                                        </p>
                                    )}

                                    {selectedPoint.address_comment && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedPoint.address_comment}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* График работы */}
                            {selectedPoint.work_time && (
                                <div className="flex gap-2">
                                    <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <div className="min-w-0">
                                        <p className="text-sm">
                                            {selectedPoint.work_time}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            График работы
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Телефоны */}
                            {selectedPoint.phones.length > 0 && (
                                <div className="flex gap-2">
                                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <div className="space-y-1">
                                        {selectedPoint.phones.map((phone, index) => (
                                            phone.number && (
                                                <a
                                                    key={`${phone.number}-${index}`}
                                                    href={`tel:${phone.number}`}
                                                    className="block text-sm hover:underline"
                                                >
                                                    {phone.number}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ближайшая станция */}
                            {(selectedPoint.nearest_station ||
                                selectedPoint.nearest_metro_station) && (
                                    <div className="flex gap-2">
                                        <Navigation className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div className="space-y-0.5 text-sm">
                                            {selectedPoint.nearest_station && (
                                                <p>
                                                    {selectedPoint.nearest_station}
                                                </p>
                                            )}

                                            {selectedPoint.nearest_metro_station && (
                                                <p className="text-xs text-muted-foreground">
                                                    Метро: {selectedPoint.nearest_metro_station}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Возможности пункта */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Возможности пункта
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {selectedPoint.is_handout && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Выдача заказов
                                        </span>
                                    )}

                                    {selectedPoint.is_reception && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Приём отправлений
                                        </span>
                                    )}

                                    {selectedPoint.is_dressing_room && (
                                        <span className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs">
                                            <Shirt className="size-3" />
                                            Примерочная
                                        </span>
                                    )}

                                    {selectedPoint.have_cash && (
                                        <span className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs">
                                            <Wallet className="size-3" />
                                            Наличные
                                        </span>
                                    )}

                                    {selectedPoint.have_cashless && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Безналичная оплата
                                        </span>
                                    )}

                                    {selectedPoint.have_fast_payment_system && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Система быстрых платежей
                                        </span>
                                    )}

                                    {selectedPoint.allowed_cod && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Наложенный платёж
                                        </span>
                                    )}

                                    {selectedPoint.take_only && (
                                        <span className="rounded-md border bg-background px-2 py-1 text-xs">
                                            Только выдача
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Дополнительная информация */}
                            {(selectedPoint.note || selectedPoint.email) && (
                                <div className="space-y-1 border-t pt-2">
                                    {selectedPoint.note && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedPoint.note}
                                        </p>
                                    )}

                                    {selectedPoint.email && (
                                        <a
                                            href={`mailto:${selectedPoint.email}`}
                                            className="block text-xs text-muted-foreground hover:text-foreground hover:underline"
                                        >
                                            {selectedPoint.email}
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Сайт */}
                            {selectedPoint.site && (
                                <a
                                    href={selectedPoint.site}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    Сайт пункта
                                    <ExternalLink className="size-3" />
                                </a>
                            )}

                            {/* Фотографии */}
                            {/* {selectedPoint.office_images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedPoint.office_images.map((image, index) => (
                                        <a
                                            key={`${image}-${index}`}
                                            href={image}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="overflow-hidden rounded-md border"
                                        >
                                            <img
                                                src={image}
                                                alt={`Фотография пункта ${selectedPoint.code}`}
                                                loading="lazy"
                                                className="h-28 w-full object-cover transition-transform hover:scale-105"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )} */}

                            {/* Координаты и ограничения */}
                            <div className="flex flex-wrap justify-between gap-2 border-t pt-2 text-[11px] text-muted-foreground">
                                {selectedPoint.latitude !== null &&
                                    selectedPoint.longitude !== null && (
                                        <span>
                                            {selectedPoint.latitude}, {selectedPoint.longitude}
                                        </span>
                                    )}

                                {(selectedPoint.weight_min !== null ||
                                    selectedPoint.weight_max !== null) && (
                                        <span>
                                            Вес:{' '}
                                            {selectedPoint.weight_min ?? '—'}–{selectedPoint.weight_max ?? '—'} кг
                                        </span>
                                    )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {loading ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Загружаем информацию о пункте...
                                </>
                            ) : (
                                <>
                                    <Package className="size-4" />
                                    Выбранный пункт: {value}
                                </>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="flex w-full items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        {open ? 'Скрыть список' : 'Выбрать другой пункт'}
                        <ChevronDown
                            className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            ) : (
                /* Поиск пункта */
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setOpen(true)
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Найти по адресу или коду"
                        autoComplete="off"
                        className="
                            h-9 w-full rounded-md border border-input
                            bg-background pl-9 pr-9 text-sm outline-none
                            placeholder:text-muted-foreground
                            focus-visible:border-ring focus-visible:ring-2
                            focus-visible:ring-ring/30
                        "
                    />

                    {loading && (
                        <LoaderCircle className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {/* Список ПВЗ */}
            {open && (
                <div className="relative z-50 max-h-72 overflow-y-auto rounded-md border bg-popover shadow-lg">
                    {loading && points.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Загружаем пункты выдачи...
                        </div>
                    ) : filteredPoints.length > 0 ? (
                        filteredPoints.map((point) => (
                            <button
                                key={point.code}
                                type="button"
                                onClick={() => handleSelect(point)}
                                className="
                                    flex w-full gap-3 border-b p-3 text-left
                                    last:border-0 hover:bg-accent
                                "
                            >
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <span className="min-w-0 flex-1 space-y-1">
                                    <span className="block text-sm font-medium">
                                        {point.address || point.name || point.code}
                                    </span>

                                    <span className="block text-xs text-muted-foreground">
                                        {point.name && `${point.name} · `}
                                        Код: {point.code}
                                    </span>

                                    {point.work_time && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock3 className="size-3" />
                                            {point.work_time}
                                        </span>
                                    )}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">
                            Пункты выдачи не найдены.
                        </p>
                    )}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {points.length > 0
                    ? `Доступно пунктов: ${points.length}`
                    : 'Выберите пункт выдачи из списка.'}
            </p>
        </div>
    )
}

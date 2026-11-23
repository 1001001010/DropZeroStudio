
import {
    Check,
    Clock3,
    LoaderCircle,
    RefreshCw,
    Truck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import type {
    DeliveryTariff,
    DeliveryTariffsProps,
} from '@/types/index'

/**
 * Форматирует стоимость доставки.
 */
function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(price)
}

/**
 * Формирует подпись со сроками доставки.
 */
function formatDeliveryTime(
    min: number | null,
    max: number | null,
): string {
    if (min === null && max === null) {
        return 'Срок не указан'
    }

    if (min === max && min !== null) {
        return `${min} дн.`
    }

    if (min !== null && max !== null) {
        return `${min}–${max} дн.`
    }

    if (min !== null) {
        return `От ${min} дн.`
    }

    return `До ${max} дн.`
}

/**
 * Карточка отдельного тарифа.
 */
function TariffCard({
    tariff,
    selected,
    onSelect,
}: {
    tariff: DeliveryTariff
    selected: boolean
    onSelect: (code: number) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(tariff.code)}
            aria-pressed={selected}
            className={`
                group flex w-full items-center justify-between gap-3
                rounded-lg border p-3 text-left transition-all
                hover:border-primary/50 hover:bg-muted/30
                ${selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-background'
                }
            `}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div
                    className={`
                        mt-0.5 flex size-8 shrink-0 items-center
                        justify-center rounded-lg
                        ${selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                    `}
                >
                    {selected ? (
                        <Check className="size-4" />
                    ) : (
                        <Truck className="size-4" />
                    )}
                </div>

                <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">
                        {tariff.name}
                    </p>

                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5 shrink-0" />

                        {formatDeliveryTime(
                            tariff.deliveryMin,
                            tariff.deliveryMax,
                        )}
                    </p>
                </div>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(tariff.price, tariff.currency)}
                </p>

                <p className="text-xs text-muted-foreground">
                    {selected ? 'Выбран' : 'Выбрать'}
                </p>
            </div>
        </button>
    )
}

/**
 * Блок расчёта и выбора тарифов СДЭК.
 */
export function DeliveryTariffs({
    tariffs,
    selectedTariff,
    loading,
    onCalculate,
    onSelect,
}: DeliveryTariffsProps) {
    const hasTariffs = tariffs.length > 0

    return (
        <section className="space-y-3">
            {/* Заголовок и кнопка расчёта */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium">
                        Тариф доставки
                    </h3>

                    <p className="text-xs text-muted-foreground">
                        Выберите подходящий способ доставки.
                    </p>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant={hasTariffs ? 'outline' : 'default'}
                    onClick={onCalculate}
                    disabled={loading}
                >
                    {loading ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                    ) : hasTariffs ? (
                        <RefreshCw className="size-3.5" />
                    ) : (
                        <Truck className="size-3.5" />
                    )}

                    {loading
                        ? 'Рассчитываем...'
                        : hasTariffs
                            ? 'Пересчитать'
                            : 'Рассчитать'}
                </Button>
            </div>

            {/* Список тарифов */}
            {hasTariffs ? (
                <div className="grid gap-2 sm:grid-cols-2">
                    {tariffs.map((tariff) => (
                        <TariffCard
                            key={tariff.code}
                            tariff={tariff}
                            selected={selectedTariff === tariff.code}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                    {loading ? (
                        <>
                            <LoaderCircle className="mx-auto mb-2 size-5 animate-spin text-muted-foreground" />

                            <p className="text-sm font-medium">
                                Получаем тарифы СДЭК
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Это может занять несколько секунд.
                            </p>
                        </>
                    ) : (
                        <>
                            <Truck className="mx-auto mb-2 size-5 text-muted-foreground" />

                            <p className="text-sm font-medium">
                                Тарифы ещё не рассчитаны
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Заполните данные отправителя, получателя
                                и посылки, затем выполните расчёт.
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Информация о выбранном тарифе */}
            {selectedTariff !== null && hasTariffs && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="size-3.5 text-primary" />

                    Тариф выбран. Можно переходить к оформлению отправления.
                </div>
            )}
        </section>
    )
}

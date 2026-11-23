
import {
    CheckCircle2,
    Clock3,
    Package,
    Wallet,
} from 'lucide-react'

import {
    Card,
    CardContent,
} from '@/components/ui/card'

import { OrdersStats as OrdersStatsType } from '@/types'

export function OrdersStats({
    total,
    active,
    completed,
    revenue,
}: OrdersStatsType) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Всего заказов"
                value={total}
                description={`${pluralize(
                    total,
                    'заказ',
                    'заказа',
                    'заказов',
                )} оформлено`}
                icon={
                    <Package className="size-5 text-muted-foreground" />
                }
            />

            <StatCard
                title="Активные"
                value={active}
                description={`${pluralize(
                    active,
                    'заказ',
                    'заказа',
                    'заказов',
                )} в обработке`}
                icon={
                    <Clock3 className="size-5 text-blue-500" />
                }
                iconWrapperClass="bg-blue-500/10"
            />

            <StatCard
                title="Завершённые"
                value={completed}
                description={`${pluralize(
                    completed,
                    'заказ',
                    'заказа',
                    'заказов',
                )} успешно выполнено`}
                icon={
                    <CheckCircle2 className="size-5 text-emerald-500" />
                }
                iconWrapperClass="bg-emerald-500/10"
            />

            <StatCard
                title="Выручка"
                value={formatCurrency(revenue)}
                description="Сумма оплаченных заказов"
                icon={
                    <Wallet className="size-5 text-red-500" />
                }
                iconWrapperClass="bg-red-500/10"
            />
        </div>
    )
}

type StatCardProps = {
    title: string
    value: string | number
    description: string
    icon: React.ReactNode
    iconWrapperClass?: string
}

function StatCard({
    title,
    value,
    description,
    icon,
    iconWrapperClass = 'bg-muted/40',
}: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {title}
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                            {value}
                        </p>
                    </div>

                    <div
                        className={`flex size-10 items-center justify-center rounded-xl border ${iconWrapperClass}`}
                    >
                        {icon}
                    </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

/**
 * Форматирует денежную сумму в валюту магазина.
 */
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Склоняет существительные в зависимости от количества.
 */
function pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
): string {
    const absoluteCount = Math.abs(count) % 100
    const lastDigit = absoluteCount % 10

    if (absoluteCount >= 11 && absoluteCount <= 19) {
        return `${count} ${many}`
    }

    if (lastDigit === 1) {
        return `${count} ${one}`
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} ${few}`
    }

    return `${count} ${many}`
}

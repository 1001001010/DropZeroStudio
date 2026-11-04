import {
    Layers,
    ShoppingBag,
    Package,
    Wallet,
} from 'lucide-react'

import {
    Card,
    CardContent,
} from '@/components/ui/card'

type DropStatsProps = {
    total: number
    active: number
    totalQuantity: number
    potentialRevenue: number
}

export function DropStats({
    total,
    active,
    totalQuantity,
    potentialRevenue,
}: DropStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Всего дропов"
                value={total}
                description="Создано дропов"
                icon={
                    <Layers className="size-5 text-muted-foreground" />
                }
            />

            <StatCard
                title="В продаже"
                value={active}
                description="Доступны для покупки"
                icon={
                    <ShoppingBag className="size-5 text-emerald-500" />
                }
                iconWrapperClass="bg-emerald-500/10"
            />

            <StatCard
                title="Общий тираж"
                value={totalQuantity.toLocaleString('ru-RU')}
                description="Произведено фигурок"
                icon={
                    <Package className="size-5 text-orange-500" />
                }
                iconWrapperClass="bg-orange-500/10"
            />

            <StatCard
                title="Потенциальная выручка"
                value={formatCurrency(potentialRevenue)}
                description="При продаже всего тиража"
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
                        className={`flex size - 10 items - center justify - center rounded - xl border ${iconWrapperClass} `}
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

function formatCurrency(value: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value)
}

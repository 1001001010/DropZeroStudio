import {
    Package,
    Factory,
    ShoppingBag,
    CircleUserRound,
} from 'lucide-react'

import {
    Card,
    CardContent,
} from '@/components/ui/card'

type ToyStatsProps = {
    total: number
    produced: number
    available: number
    sold: number
}

export function ToyStats({
    total,
    produced,
    available,
    sold,
}: ToyStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Всего игрушек"
                value={total.toLocaleString('ru-RU')}
                description="Всего экземпляров"
                icon={<Package className="size-5 text-muted-foreground" />}
            />

            <StatCard
                title="Изготовлено"
                value={produced.toLocaleString('ru-RU')}
                description="Прошли этап производства"
                icon={<Factory className="size-5 text-orange-500" />}
                iconWrapperClass="bg-orange-500/10"
            />

            <StatCard
                title="Доступно"
                value={available.toLocaleString('ru-RU')}
                description="Ожидают активации"
                icon={<ShoppingBag className="size-5 text-emerald-500" />}
                iconWrapperClass="bg-emerald-500/10"
            />

            <StatCard
                title="Продано"
                value={sold.toLocaleString('ru-RU')}
                description="Закреплены за владельцами"
                icon={<CircleUserRound className="size-5 text-violet-500" />}
                iconWrapperClass="bg-violet-500/10"
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

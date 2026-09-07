import {
    CheckCircle2,
    Package,
    Trash2,
    XCircle,
} from 'lucide-react'

import {
    Card,
    CardContent,
} from '@/components/ui/card'

import { SkinStats as SkinStatsType } from '@/types'

export function SkinStats({
    total,
    active,
    inactive,
    deleted,
}: SkinStatsType) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Всего скинов"
                value={total}
                description={`${pluralize(
                    total,
                    'скин',
                    'скина',
                    'скинов',
                )
                    } в каталоге`}
                icon={
                    <Package className="size-5 text-muted-foreground" />
                }
            />

            <StatCard
                title="Активные"
                value={active}
                description={`${pluralize(
                    active,
                    'скин',
                    'скина',
                    'скинов',
                )
                    } доступны в каталоге`}
                icon={
                    <CheckCircle2 className="size-5 text-emerald-500" />
                }
                iconWrapperClass="bg-emerald-500/10"
            />

            <StatCard
                title="Неактивные"
                value={inactive}
                description={`${pluralize(
                    inactive,
                    'скин',
                    'скина',
                    'скинов',
                )
                    } скрыты из каталога`}
                icon={
                    <XCircle className="size-5 text-orange-500" />
                }
                iconWrapperClass="bg-orange-500/10"
            />

            <StatCard
                title="Удалённые"
                value={deleted}
                description={`${pluralize(
                    deleted,
                    'скин',
                    'скина',
                    'скинов',
                )
                    } находятся в корзине`}
                icon={
                    <Trash2 className="size-5 text-red-500" />
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

function pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
): string {
    const absoluteCount = Math.abs(count) % 100
    const lastDigit = absoluteCount % 10

    if (
        absoluteCount >= 11 &&
        absoluteCount <= 19
    ) {
        return `${count} ${many} `
    }

    if (lastDigit === 1) {
        return `${count} ${one} `
    }

    if (
        lastDigit >= 2 &&
        lastDigit <= 4
    ) {
        return `${count} ${few} `
    }

    return `${count} ${many} `
}

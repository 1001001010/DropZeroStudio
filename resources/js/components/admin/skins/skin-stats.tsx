import {
    CheckCircle2,
    // CircleDollarSign,
    Package,
} from "lucide-react"

import {
    Card,
    CardContent,
} from "@/components/ui/card"

// import { formatPrice } from "@/lib/utils"

export function SkinStats({
    total,
    active,
    // totalEdition,
    // totalValue,
}: {
    total: number
    active: number
    totalEdition: number
    totalValue: number
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Всего скинов"
                value={total}
                description="скинов в каталоге"
                icon={
                    <Package className="size-5 text-muted-foreground" />
                }
            />

            <StatCard
                title="В продаже"
                value={active}
                description="Активные скины"
                icon={
                    <CheckCircle2 className="size-5 text-emerald-500" />
                }
                iconWrapperClass="bg-emerald-500/10"
            />

            {/* <StatCard
                title="Тираж"
                value={totalEdition.toLocaleString("ru-RU")}
                description="Всего экземпляров"
                icon={
                    <Package className="size-5 text-blue-500" />
                }
                iconWrapperClass="bg-blue-500/10"
            />

            <StatCard
                title="Стоимость тиражей"
                value={formatPrice(totalValue)}
                description="Потенциальная выручка"
                icon={
                    <CircleDollarSign className="size-5 text-violet-500" />
                }
                iconWrapperClass="bg-violet-500/10"
            /> */}
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
    iconWrapperClass = "bg-muted/40",
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


import { Head, usePage } from '@inertiajs/react'
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Box,
    ChartNoAxesCombined,
    CircleDollarSign,
    Clock3,
    Package,
    ShoppingBag,
    Sparkles,
    Users,
} from 'lucide-react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts'

import type { AdminDashboardProps } from '@/types'

import { AdminNav } from '@/components/admin/admin-nav'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import MainLayout from '@/layouts/MainLayout'

const revenueChartConfig = {
    revenue: {
        label: 'Выручка',
        color: '#AA141E',
    },
} satisfies ChartConfig

const dropsChartConfig = {
    revenue: {
        label: 'Выручка',
        color: '#AA141E',
    },
} satisfies ChartConfig

const statusChartConfig = {
    count: {
        label: 'Заказы',
        color: '#AA141E',
    },
} satisfies ChartConfig

const orderStatuses: Record<
    string,
    { label: string; className: string }
> = {
    pending: {
        label: 'Ожидает оплаты',
        className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500',
    },
    accepted: {
        label: 'Принят',
        className: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
    },
    processing: {
        label: 'В обработке',
        className: 'border-purple-500/20 bg-purple-500/10 text-purple-500',
    },
    shipped: {
        label: 'Отправлен',
        className: 'border-sky-500/20 bg-sky-500/10 text-sky-500',
    },
    completed: {
        label: 'Завершён',
        className: 'border-green-500/20 bg-green-500/10 text-green-500',
    },
    cancelled: {
        label: 'Отменён',
        className: 'border-red-500/20 bg-red-500/10 text-red-500',
    },
}

function formatCurrency(value: number | string, currency: string) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(Number(value) || 0)
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('ru-RU').format(value)
}

function formatDate(value: string | null) {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
    })
}

function getStatus(status: string) {
    return (
        orderStatuses[status] ?? {
            label: status,
            className: 'border-white/10 bg-white/5 text-muted-foreground',
        }
    )
}

function ChangeIndicator({ value }: { value: number }) {
    const positive = value >= 0
    const Icon = positive ? ArrowUpRight : ArrowDownRight

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-500'
                }`}
        >
            <Icon className="size-3.5" />
            {Math.abs(value).toFixed(1)}%
        </span>
    )
}

export default function AdminDashboard() {
    const {
        stats,
        sales,
        recentOrders,
        topDrops,
        currency,
        metrics,
    } = usePage<AdminDashboardProps>().props

    // Подготавливаем данные графиков.
    const revenueData = sales.map((item) => ({
        ...item,
        revenue: Number(item.value) || 0,
    }))

    const dropsData = topDrops.map((drop) => ({
        ...drop,
        revenue: Number(drop.revenue) || 0,
    }))

    // Распределение статусов среди последних заказов,
    // которые переданы контроллером.
    const statusData = Object.entries(
        recentOrders.reduce<Record<string, number>>((result, order) => {
            result[order.status] = (result[order.status] ?? 0) + 1
            return result
        }, {}),
    ).map(([status, count]) => ({
        status,
        name: getStatus(status).label,
        count,
    }))


    const totalRecentOrders = recentOrders.length

    const paidRecentOrders = recentOrders.filter(
        (order) => Boolean(order.paid_at),
    ).length

    const salesTotal = revenueData.reduce(
        (total, item) => total + item.revenue,
        0,
    )

    const dashboardStats = [
        {
            title: 'Общая выручка',
            value: formatCurrency(stats.revenue.total, currency),
            description: 'За всё время',
            change: null as number | null,
            icon: CircleDollarSign,
        },
        {
            title: 'Выручка за месяц',
            value: formatCurrency(stats.revenue.month, currency),
            description: 'К прошлому месяцу',
            change: stats.revenue.change,
            icon: ChartNoAxesCombined,
        },
        {
            title: 'Всего заказов',
            value: formatNumber(stats.orders.total),
            description: `${formatNumber(stats.orders.month)} за этот месяц`,
            change: stats.orders.change,
            icon: ShoppingBag,
        },
        {
            title: 'Пользователи',
            value: formatNumber(stats.users.total),
            description: 'Зарегистрировано аккаунтов',
            change: stats.users.change,
            icon: Users,
        },
    ]

    return (
        <MainLayout>
            <Head title="Обзор" />

            <main className="min-h-screen bg-background">
                <AdminNav />

                <div className="space-y-8 p-6 lg:p-8">
                    {/* Заголовок */}
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#AA141E]">
                                <Sparkles className="size-4" />
                                DropZeroStudio
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Обзор
                                </h1>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Аналитика и показатели вашего магазина.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="w-fit gap-2 border-white/10 bg-white/[0.03] px-3 py-1.5 text-muted-foreground"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Панель управления
                        </Badge>
                    </section>

                    {/* Основные показатели */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardStats.map((item) => {
                            const Icon = item.icon

                            return (
                                <Card
                                    key={item.title}
                                    className="relative overflow-hidden border-white/10 bg-card"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {item.title}
                                            </p>

                                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                                <Icon className="size-4 text-[#AA141E]" />
                                            </div>
                                        </div>

                                        <p className="mt-5 text-2xl font-semibold tracking-tight">
                                            {item.value}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            {item.change !== null && (
                                                <ChangeIndicator value={item.change} />
                                            )}

                                            <span className="text-xs text-muted-foreground">
                                                {item.description}
                                            </span>
                                        </div>

                                        <div className="pointer-events-none absolute -bottom-10 -right-8 size-28 rounded-full bg-[#AA141E]/[0.04] blur-2xl" />
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </section>

                    {/* Статистика фигурок */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="border-white/10">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <Package className="size-5 text-[#AA141E]" />
                                </div>

                                <div>
                                    <p className="text-2xl font-semibold">
                                        {formatNumber(stats.toys.total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Всего фигурок
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <Box className="size-5 text-emerald-500" />
                                </div>

                                <div>
                                    <p className="text-2xl font-semibold">
                                        {formatNumber(stats.toys.activated)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Активировано
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <Clock3 className="size-5 text-yellow-500" />
                                </div>

                                <div>
                                    <p className="text-2xl font-semibold">
                                        {formatNumber(stats.toys.notActivated)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Не активировано
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <Activity className="size-5 text-[#AA141E]" />
                                </div>

                                <div>
                                    <p className="text-2xl font-semibold">
                                        {metrics.activationRate}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Уровень активации
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* График выручки и финансовые показатели */}
                    <section className="grid gap-4 xl:grid-cols-3">
                        <Card className="border-white/10 xl:col-span-2">
                            <CardHeader>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Динамика выручки
                                        </CardTitle>

                                        <CardDescription className="mt-1">
                                            Оплаченные заказы за последние 7 дней
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="border-[#AA141E]/30 bg-[#AA141E]/10 text-[#d45b62]"
                                    >
                                        7 дней
                                    </Badge>
                                </div>

                                <div className="pt-3">
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {formatCurrency(salesTotal, currency)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Суммарная выручка за отображаемый период
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <ChartContainer
                                    config={revenueChartConfig}
                                    className="h-[260px] w-full"
                                >
                                    <AreaChart
                                        data={revenueData}
                                        margin={{
                                            left: 8,
                                            right: 8,
                                            top: 12,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="revenueGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#AA141E"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#AA141E"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            vertical={false}
                                            stroke="currentColor"
                                            strokeOpacity={0.08}
                                        />

                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={10}
                                            fontSize={12}
                                            stroke="currentColor"
                                            opacity={0.55}
                                        />

                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={8}
                                            fontSize={11}
                                            stroke="currentColor"
                                            opacity={0.55}
                                            tickFormatter={(value) =>
                                                new Intl.NumberFormat('ru-RU', {
                                                    notation: 'compact',
                                                }).format(value)
                                            }
                                        />

                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value: number | string) =>
                                                        formatCurrency(Number(value), currency)
                                                    }
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#AA141E"
                                            strokeWidth={2.5}
                                            fill="url(#revenueGradient)"
                                            dot={false}
                                            activeDot={{
                                                r: 5,
                                                fill: '#AA141E',
                                                stroke: 'var(--background)',
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </AreaChart>
                                </ChartContainer>

                                {revenueData.every((item) => item.revenue === 0) && (
                                    <p className="mt-3 text-center text-xs text-muted-foreground">
                                        За этот период продаж пока нет.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Финансовые показатели
                                </CardTitle>
                                <CardDescription>
                                    Сводная информация по магазину
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Средний чек
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {formatCurrency(
                                            metrics.averageOrder,
                                            currency,
                                        )}
                                    </p>
                                </div>

                                <Separator className="bg-white/10" />

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Выручка за месяц
                                    </p>
                                    <p className="mt-1 text-xl font-semibold">
                                        {formatCurrency(
                                            stats.revenue.month,
                                            currency,
                                        )}
                                    </p>
                                    <div className="mt-2">
                                        <ChangeIndicator value={stats.revenue.change} />
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Всего заказов
                                    </p>
                                    <p className="mt-1 text-xl font-semibold">
                                        {formatNumber(stats.orders.total)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatNumber(stats.orders.month)} за текущий месяц
                                    </p>
                                </div>

                                <Separator className="bg-white/10" />

                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            Активация фигурок
                                        </p>
                                        <span className="text-sm font-semibold">
                                            {metrics.activationRate}%
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-[#AA141E] transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(metrics.activationRate, 0),
                                                    100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Популярные дропы и статусы заказов */}
                    <section className="grid gap-4 xl:grid-cols-2">
                        <Card className="border-white/10">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Популярные дропы
                                </CardTitle>
                                <CardDescription>
                                    Топ-5 по выручке
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {dropsData.length > 0 ? (
                                    <div className="space-y-5">
                                        <ChartContainer
                                            config={dropsChartConfig}
                                            className="h-[220px] w-full"
                                        >
                                            <BarChart
                                                data={dropsData}
                                                layout="vertical"
                                                margin={{
                                                    left: 0,
                                                    right: 12,
                                                    top: 4,
                                                    bottom: 4,
                                                }}
                                            >
                                                <CartesianGrid
                                                    horizontal={false}
                                                    stroke="currentColor"
                                                    strokeOpacity={0.08}
                                                />

                                                <XAxis
                                                    type="number"
                                                    hide
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={110}
                                                    fontSize={11}
                                                    stroke="currentColor"
                                                    tick={{ fill: 'currentColor' }}
                                                    tickFormatter={(value) =>
                                                        String(value).length > 17
                                                            ? `${String(value).slice(0, 17)}…`
                                                            : value
                                                    }
                                                />

                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent />}
                                                />

                                                <Bar
                                                    dataKey="revenue"
                                                    fill="#AA141E"
                                                    radius={[0, 5, 5, 0]}
                                                    barSize={22}
                                                />
                                            </BarChart>
                                        </ChartContainer>

                                        <Separator className="bg-white/10" />

                                        {dropsData.map((drop, index) => (
                                            <div
                                                key={`${drop.name}-${index}`}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </span>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {drop.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Продано: {formatNumber(drop.sold)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="shrink-0 text-sm font-semibold">
                                                    {formatCurrency(drop.revenue, currency)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                                        <Box className="mb-3 size-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            Пока нет продаж
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Здесь появятся самые популярные дропы.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Статусы заказов
                                </CardTitle>
                                <CardDescription>
                                    Распределение последних {totalRecentOrders} заказов
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {statusData.length > 0 ? (
                                    <div className="space-y-5">
                                        <ChartContainer
                                            config={statusChartConfig}
                                            className="h-[220px] w-full"
                                        >
                                            <BarChart
                                                data={statusData}
                                                margin={{
                                                    left: -18,
                                                    right: 8,
                                                    top: 12,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="currentColor"
                                                    strokeOpacity={0.08}
                                                />

                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    fontSize={10}
                                                    stroke="currentColor"
                                                    tickFormatter={(value) =>
                                                        String(value).length > 11
                                                            ? `${String(value).slice(0, 11)}…`
                                                            : value
                                                    }
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    fontSize={11}
                                                    stroke="currentColor"
                                                />

                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent />
                                                    }
                                                />

                                                <Bar
                                                    dataKey="count"
                                                    fill="#AA141E"
                                                    radius={[5, 5, 0, 0]}
                                                    barSize={30}
                                                />
                                            </BarChart>
                                        </ChartContainer>

                                        <Separator className="bg-white/10" />

                                        <div className="space-y-3">
                                            {statusData.map((item) => (
                                                <div
                                                    key={item.status}
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-sm font-semibold">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                                        <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            Нет данных о заказах
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Статистика появится после оформления заказов.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Последние заказы */}
                    <section>
                        <Card className="border-white/10">
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Последние заказы
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Последние операции в магазине
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="border-white/10 bg-white/[0.03]"
                                    >
                                        {recentOrders.length} заказов
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {recentOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentOrders.map((order, index) => {
                                            const status = getStatus(order.status)

                                            return (
                                                <div key={order.id}>
                                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                        <div className="flex min-w-0 items-start gap-3">
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                                                                <ShoppingBag className="size-4 text-muted-foreground" />
                                                            </div>

                                                            <div className="min-w-0 space-y-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {order.number}
                                                                    </span>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className={status.className}
                                                                    >
                                                                        {status.label}
                                                                    </Badge>
                                                                </div>

                                                                <p className="truncate text-sm text-muted-foreground">
                                                                    {order.customer_name}
                                                                </p>

                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {order.items
                                                                        .map(
                                                                            (item) =>
                                                                                item.drop_name ||
                                                                                item.product_name,
                                                                        )
                                                                        .join(', ')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 sm:text-right">
                                                            <p className="font-semibold">
                                                                {formatCurrency(
                                                                    order.total,
                                                                    order.currency || currency,
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {order.paid_at
                                                                    ? `Оплачен ${formatDate(order.paid_at)}`
                                                                    : `Создан ${formatDate(order.created_at)}`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {index !== recentOrders.length - 1 && (
                                                        <Separator className="mt-4 bg-white/10" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                                        <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            Заказов пока нет
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Здесь будут отображаться последние заказы.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Нижняя сводка */}
                    <section className="grid gap-4 sm:grid-cols-3">
                        <Card className="border-white/10 bg-white/[0.015]">
                            <CardContent className="p-5">
                                <p className="text-xs text-muted-foreground">
                                    Оплачено среди последних заказов
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {formatNumber(paidRecentOrders)}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        / {formatNumber(totalRecentOrders)}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/[0.015]">
                            <CardContent className="p-5">
                                <p className="text-xs text-muted-foreground">
                                    Средний чек
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {formatCurrency(metrics.averageOrder, currency)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/[0.015]">
                            <CardContent className="p-5">
                                <p className="text-xs text-muted-foreground">
                                    Пользователей зарегистрировано
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {formatNumber(stats.users.total)}
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </MainLayout>
    )
}

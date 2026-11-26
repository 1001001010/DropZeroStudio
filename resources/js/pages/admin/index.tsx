
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
    Cell,
    Pie,
    PieChart,
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

/**
 * Единая монохромная палитра аналитики.
 * Оттенки серого используются для визуального разделения данных,
 * без дополнительных цветных акцентов.
 */
const chartColors = {
    white: '#FFFFFF',
    light: '#D4D4D4',
    medium: '#A3A3A3',
    muted: '#737373',
    dark: '#525252',
    darker: '#404040',
}

const revenueChartConfig = {
    revenue: {
        label: 'Выручка',
        color: chartColors.white,
    },
} satisfies ChartConfig

const dropsRevenueChartConfig = {
    revenue: {
        label: 'Выручка',
        color: chartColors.white,
    },
} satisfies ChartConfig

const dropsSoldChartConfig = {
    sold: {
        label: 'Продано',
        color: chartColors.white,
    },
} satisfies ChartConfig

const statusChartConfig = {
    count: {
        label: 'Заказы',
        color: chartColors.white,
    },
} satisfies ChartConfig

const toysChartConfig = {
    activated: {
        label: 'Активировано',
        color: chartColors.white,
    },
    notActivated: {
        label: 'Не активировано',
        color: chartColors.dark,
    },
} satisfies ChartConfig

const ordersChartConfig = {
    total: {
        label: 'Сумма заказа',
        color: chartColors.white,
    },
} satisfies ChartConfig

const orderStatuses: Record<string, { label: string }> = {
    pending: {
        label: 'Ожидает оплаты',
    },
    accepted: {
        label: 'Принят',
    },
    processing: {
        label: 'В обработке',
    },
    shipped: {
        label: 'Отправлен',
    },
    completed: {
        label: 'Завершён',
    },
    cancelled: {
        label: 'Отменён',
    },
}

const pieColors = [
    chartColors.white,
    chartColors.dark,
]

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
    return orderStatuses[status] ?? {
        label: status,
    }
}

/**
 * Индикатор изменения показателя.
 * Используем только белый и серый цвета.
 */
function ChangeIndicator({ value }: { value: number }) {
    const positive = value >= 0
    const Icon = positive ? ArrowUpRight : ArrowDownRight

    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
            <Icon className="size-3.5" />
            {Math.abs(value).toFixed(1)}%
        </span>
    )
}

function SectionHeading({
    title,
    description,
}: {
    title: string
    description?: string
}) {
    return (
        <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">
                {title}
            </h2>

            {description && (
                <p className="text-sm text-neutral-500">
                    {description}
                </p>
            )}
        </div>
    )
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType
    title: string
    description: string
}) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <Icon className="mb-3 size-8 text-neutral-600" />

            <p className="text-sm font-medium text-neutral-300">
                {title}
            </p>

            <p className="mt-1 max-w-xs text-xs text-neutral-500">
                {description}
            </p>
        </div>
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

    // Подготавливаем данные для графиков.
    const revenueData = sales.map((item) => ({
        ...item,
        revenue: Number(item.value) || 0,
    }))

    const dropsData = topDrops.map((drop) => ({
        ...drop,
        sold: Number(drop.sold) || 0,
        revenue: Number(drop.revenue) || 0,
    }))

    // Статистика статусов среди переданных последних заказов.
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

    // Соотношение активированных и неактивированных фигурок.
    const toysData = [
        {
            name: 'Активировано',
            value: stats.toys.activated,
        },
        {
            name: 'Не активировано',
            value: stats.toys.notActivated,
        },
    ].filter((item) => item.value > 0)

    // Данные последних заказов для отдельного графика.
    const ordersData = [...recentOrders]
        .reverse()
        .map((order) => ({
            number: order.number,
            total: Number(order.total) || 0,
        }))

    const totalRecentOrders = recentOrders.length

    const paidRecentOrders = recentOrders.filter(
        (order) => Boolean(order.paid_at),
    ).length

    const salesTotal = revenueData.reduce(
        (total, item) => total + item.revenue,
        0,
    )

    const totalDropsSold = dropsData.reduce(
        (total, drop) => total + drop.sold,
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

            <main className="min-h-screen bg-[#050505] text-white">
                <AdminNav />

                <div className="space-y-8 p-6 lg:p-8">

                    {/* Заголовок страницы */}
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    Обзор
                                </h1>

                                <p className="mt-2 text-sm text-neutral-500">
                                    Аналитика и показатели вашего магазина.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="w-fit gap-2 rounded-full border-white/10 bg-white/[0.03] px-3 py-1.5 text-neutral-400"
                        >
                            <span className="size-1.5 rounded-full bg-white" />
                            Панель управления
                        </Badge>
                    </section>

                    {/* Основные показатели */}
                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardStats.map((item) => {
                            const Icon = item.icon

                            return (
                                <Card
                                    key={item.title}
                                    className="relative overflow-hidden border-white/[0.08] bg-[#0A0A0A] shadow-none"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-neutral-500">
                                                {item.title}
                                            </p>

                                            <Icon className="size-4 text-neutral-400" />
                                        </div>

                                        <p className="mt-6 text-2xl font-semibold tracking-tight">
                                            {item.value}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            {item.change !== null && (
                                                <ChangeIndicator value={item.change} />
                                            )}

                                            <span className="text-xs text-neutral-500">
                                                {item.description}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </section>

                    {/* Статистика фигурок */}
                    <section className="space-y-4">
                        <SectionHeading
                            title="Коллекция"
                            description="Состояние выпущенных фигурок и их активация."
                        />

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <Package className="size-5 text-neutral-400" />

                                    <div>
                                        <p className="text-2xl font-semibold">
                                            {formatNumber(stats.toys.total)}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Всего фигурок
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <Box className="size-5 text-neutral-300" />

                                    <div>
                                        <p className="text-2xl font-semibold">
                                            {formatNumber(stats.toys.activated)}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Активировано
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <Clock3 className="size-5 text-neutral-500" />

                                    <div>
                                        <p className="text-2xl font-semibold">
                                            {formatNumber(stats.toys.notActivated)}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Не активировано
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <Activity className="size-5 text-neutral-300" />

                                    <div>
                                        <p className="text-2xl font-semibold">
                                            {metrics.activationRate}%
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Уровень активации
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Выручка */}
                    <section className="grid gap-3 xl:grid-cols-3">
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none xl:col-span-2">
                            <CardHeader>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base font-semibold">
                                            Динамика выручки
                                        </CardTitle>

                                        <CardDescription className="mt-1 text-neutral-500">
                                            Оплаченные заказы за последние 7 дней
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="border-white/10 bg-white/[0.03] text-neutral-400"
                                    >
                                        7 дней
                                    </Badge>
                                </div>

                                <div className="pt-4">
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {formatCurrency(salesTotal, currency)}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Выручка за отображаемый период
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {revenueData.length > 0 ? (
                                    <ChartContainer
                                        config={revenueChartConfig}
                                        className="h-[280px] w-full"
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
                                                        stopColor="#FFFFFF"
                                                        stopOpacity={0.25}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#FFFFFF"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                vertical={false}
                                                stroke="#FFFFFF"
                                                strokeOpacity={0.07}
                                            />

                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tickMargin={10}
                                                fontSize={11}
                                                stroke="#737373"
                                            />

                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tickMargin={8}
                                                fontSize={11}
                                                stroke="#737373"
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
                                                        formatter={(value) =>
                                                            formatCurrency(
                                                                Number(
                                                                    Array.isArray(value)
                                                                        ? value[0]
                                                                        : value,
                                                                ),
                                                                currency,
                                                            )
                                                        }
                                                    />
                                                }
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#FFFFFF"
                                                strokeWidth={2}
                                                fill="url(#revenueGradient)"
                                                dot={false}
                                                activeDot={{
                                                    r: 5,
                                                    fill: '#FFFFFF',
                                                    stroke: '#050505',
                                                    strokeWidth: 2,
                                                }}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <EmptyState
                                        icon={ChartNoAxesCombined}
                                        title="Нет данных о выручке"
                                        description="График появится после первых оплаченных заказов."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Финансовая сводка */}
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Финансовые показатели
                                </CardTitle>

                                <CardDescription className="text-neutral-500">
                                    Сводная информация магазина
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Средний чек
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {formatCurrency(metrics.averageOrder, currency)}
                                    </p>
                                </div>

                                <Separator className="bg-white/[0.08]" />

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Выручка за месяц
                                    </p>

                                    <p className="mt-2 text-xl font-semibold">
                                        {formatCurrency(stats.revenue.month, currency)}
                                    </p>

                                    <div className="mt-2">
                                        <ChangeIndicator value={stats.revenue.change} />
                                    </div>
                                </div>

                                <Separator className="bg-white/[0.08]" />

                                <div>
                                    <p className="text-xs text-neutral-500">
                                        Всего заказов
                                    </p>

                                    <p className="mt-2 text-xl font-semibold">
                                        {formatNumber(stats.orders.total)}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        {formatNumber(stats.orders.month)} за текущий месяц
                                    </p>
                                </div>

                                <Separator className="bg-white/[0.08]" />

                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500">
                                            Активация фигурок
                                        </p>

                                        <span className="text-sm font-semibold">
                                            {metrics.activationRate}%
                                        </span>
                                    </div>

                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-white transition-all"
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

                    {/* Аналитика дропов */}
                    <section className="space-y-4">
                        <SectionHeading
                            title="Аналитика дропов"
                            description="Сравнение продаж и выручки по коллекциям."
                        />

                        <div className="grid gap-3 xl:grid-cols-2">

                            {/* Выручка по дропам */}
                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Выручка по дропам
                                    </CardTitle>

                                    <CardDescription className="text-neutral-500">
                                        Топ-5 коллекций по выручке
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {dropsData.length > 0 ? (
                                        <ChartContainer
                                            config={dropsRevenueChartConfig}
                                            className="h-[280px] w-full"
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
                                                    stroke="#FFFFFF"
                                                    strokeOpacity={0.07}
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
                                                    stroke="#737373"
                                                    tickFormatter={(value) =>
                                                        String(value).length > 17
                                                            ? `${String(value).slice(0, 17)}…`
                                                            : String(value)
                                                    }
                                                />

                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            formatter={(value) =>
                                                                formatCurrency(
                                                                    Number(
                                                                        Array.isArray(value)
                                                                            ? value[0]
                                                                            : value,
                                                                    ),
                                                                    currency,
                                                                )
                                                            }
                                                        />
                                                    }
                                                />

                                                <Bar
                                                    dataKey="revenue"
                                                    fill="#FFFFFF"
                                                    radius={[0, 4, 4, 0]}
                                                    barSize={24}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    ) : (
                                        <EmptyState
                                            icon={Box}
                                            title="Пока нет продаж"
                                            description="Здесь появится сравнение выручки по дропам."
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Количество продаж по дропам */}
                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Продажи по дропам
                                    </CardTitle>

                                    <CardDescription className="text-neutral-500">
                                        Количество проданных фигурок
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {dropsData.length > 0 ? (
                                        <ChartContainer
                                            config={dropsSoldChartConfig}
                                            className="h-[280px] w-full"
                                        >
                                            <BarChart
                                                data={dropsData}
                                                margin={{
                                                    left: -18,
                                                    right: 8,
                                                    top: 12,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="#FFFFFF"
                                                    strokeOpacity={0.07}
                                                />

                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    fontSize={10}
                                                    stroke="#737373"
                                                    tickFormatter={(value) =>
                                                        String(value).length > 10
                                                            ? `${String(value).slice(0, 10)}…`
                                                            : String(value)
                                                    }
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    fontSize={11}
                                                    stroke="#737373"
                                                />

                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent />}
                                                />

                                                <Bar
                                                    dataKey="sold"
                                                    fill="#FFFFFF"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={32}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    ) : (
                                        <EmptyState
                                            icon={Package}
                                            title="Нет данных о продажах"
                                            description="Количество продаж появится после оформления заказов."
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Таблица популярных дропов */}
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Рейтинг коллекций
                                </CardTitle>

                                <CardDescription className="text-neutral-500">
                                    Сводная статистика по популярным дропам
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {dropsData.length > 0 ? (
                                    <div className="space-y-4">
                                        {dropsData.map((drop, index) => {
                                            const maxSold = Math.max(
                                                ...dropsData.map((item) => item.sold),
                                                1,
                                            )

                                            return (
                                                <div
                                                    key={`${drop.name}-${index}`}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-xs text-neutral-400">
                                                                {index + 1}
                                                            </span>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium">
                                                                    {drop.name}
                                                                </p>

                                                                <p className="text-xs text-neutral-500">
                                                                    Продано: {formatNumber(drop.sold)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="shrink-0 text-sm font-semibold">
                                                            {formatCurrency(drop.revenue, currency)}
                                                        </p>
                                                    </div>

                                                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
                                                        <div
                                                            className="h-full rounded-full bg-white"
                                                            style={{
                                                                width: `${(drop.sold / maxSold) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Package}
                                        title="Нет данных"
                                        description="Рейтинг появится после первых продаж."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Статистика фигурок и заказов */}
                    <section className="space-y-4">
                        <SectionHeading
                            title="Распределение"
                            description="Состав коллекции и состояние заказов."
                        />

                        <div className="grid gap-3 xl:grid-cols-2">

                            {/* Активация фигурок */}
                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Активация фигурок
                                    </CardTitle>

                                    <CardDescription className="text-neutral-500">
                                        Доля активированных фигурок от общего количества
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {toysData.length > 0 ? (
                                        <div className="grid items-center gap-4 sm:grid-cols-2">
                                            <ChartContainer
                                                config={toysChartConfig}
                                                className="mx-auto h-[220px] w-full max-w-[260px]"
                                            >
                                                <PieChart>
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent />}
                                                    />

                                                    <Pie
                                                        data={toysData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={62}
                                                        outerRadius={88}
                                                        paddingAngle={3}
                                                        stroke="none"
                                                    >
                                                        {toysData.map((item, index) => (
                                                            <Cell
                                                                key={item.name}
                                                                fill={pieColors[index]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>

                                            <div className="space-y-5">
                                                {toysData.map((item, index) => (
                                                    <div
                                                        key={item.name}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="size-2.5 rounded-sm"
                                                                style={{
                                                                    backgroundColor: pieColors[index],
                                                                }}
                                                            />

                                                            <span className="text-sm text-neutral-400">
                                                                {item.name}
                                                            </span>
                                                        </div>

                                                        <span className="text-sm font-semibold">
                                                            {formatNumber(item.value)}
                                                        </span>
                                                    </div>
                                                ))}

                                                <Separator className="bg-white/[0.08]" />

                                                <div>
                                                    <p className="text-xs text-neutral-500">
                                                        Всего фигурок
                                                    </p>

                                                    <p className="mt-1 text-2xl font-semibold">
                                                        {formatNumber(stats.toys.total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Box}
                                            title="Нет фигурок"
                                            description="Статистика активации появится после добавления фигурок."
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Статусы заказов */}
                            <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Статусы заказов
                                    </CardTitle>

                                    <CardDescription className="text-neutral-500">
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
                                                        stroke="#FFFFFF"
                                                        strokeOpacity={0.07}
                                                    />

                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        fontSize={10}
                                                        stroke="#737373"
                                                        tickFormatter={(value) =>
                                                            String(value).length > 11
                                                                ? `${String(value).slice(0, 11)}…`
                                                                : String(value)
                                                        }
                                                    />

                                                    <YAxis
                                                        allowDecimals={false}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        fontSize={11}
                                                        stroke="#737373"
                                                    />

                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent />}
                                                    />

                                                    <Bar
                                                        dataKey="count"
                                                        fill="#FFFFFF"
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={30}
                                                    />
                                                </BarChart>
                                            </ChartContainer>

                                            <Separator className="bg-white/[0.08]" />

                                            <div className="space-y-3">
                                                {statusData.map((item) => (
                                                    <div
                                                        key={item.status}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <span className="text-sm text-neutral-400">
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
                                        <EmptyState
                                            icon={ShoppingBag}
                                            title="Нет заказов"
                                            description="Статистика появится после оформления заказов."
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Суммы последних заказов */}
                    <section>
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Суммы последних заказов
                                </CardTitle>

                                <CardDescription className="text-neutral-500">
                                    Сравнение стоимости последних {ordersData.length} заказов
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {ordersData.length > 0 ? (
                                    <ChartContainer
                                        config={ordersChartConfig}
                                        className="h-[260px] w-full"
                                    >
                                        <BarChart
                                            data={ordersData}
                                            margin={{
                                                left: 8,
                                                right: 8,
                                                top: 12,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                stroke="#FFFFFF"
                                                strokeOpacity={0.07}
                                            />

                                            <XAxis
                                                dataKey="number"
                                                axisLine={false}
                                                tickLine={false}
                                                tickMargin={10}
                                                fontSize={10}
                                                stroke="#737373"
                                                tickFormatter={(value) =>
                                                    String(value).length > 10
                                                        ? `${String(value).slice(0, 10)}…`
                                                        : String(value)
                                                }
                                            />

                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tickMargin={8}
                                                fontSize={11}
                                                stroke="#737373"
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
                                                        formatter={(value) =>
                                                            formatCurrency(
                                                                Number(
                                                                    Array.isArray(value)
                                                                        ? value[0]
                                                                        : value,
                                                                ),
                                                                currency,
                                                            )
                                                        }
                                                    />
                                                }
                                            />

                                            <Bar
                                                dataKey="total"
                                                fill="#FFFFFF"
                                                radius={[4, 4, 0, 0]}
                                                barSize={32}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <EmptyState
                                        icon={ShoppingBag}
                                        title="Нет заказов"
                                        description="График появится после оформления заказов."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Последние заказы */}
                    <section>
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            Последние заказы
                                        </CardTitle>

                                        <CardDescription className="mt-1 text-neutral-500">
                                            Последние операции в магазине
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="border-white/10 bg-white/[0.03] text-neutral-400"
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
                                                                <ShoppingBag className="size-4 text-neutral-400" />
                                                            </div>

                                                            <div className="min-w-0 space-y-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {order.number}
                                                                    </span>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-white/10 bg-white/[0.03] text-neutral-400"
                                                                    >
                                                                        {status.label}
                                                                    </Badge>
                                                                </div>

                                                                <p className="truncate text-sm text-neutral-400">
                                                                    {order.customer_name}
                                                                </p>

                                                                <p className="truncate text-xs text-neutral-500">
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

                                                            <p className="mt-1 text-xs text-neutral-500">
                                                                {order.paid_at
                                                                    ? `Оплачен ${formatDate(order.paid_at)}`
                                                                    : `Создан ${formatDate(order.created_at)}`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {index !== recentOrders.length - 1 && (
                                                        <Separator className="mt-4 bg-white/[0.08]" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={ShoppingBag}
                                        title="Заказов пока нет"
                                        description="Здесь будут отображаться последние заказы."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Итоговая сводка */}
                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardContent className="p-5">
                                <p className="text-xs text-neutral-500">
                                    Оплачено среди последних заказов
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatNumber(paidRecentOrders)}

                                    <span className="ml-2 text-sm font-normal text-neutral-500">
                                        / {formatNumber(totalRecentOrders)}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardContent className="p-5">
                                <p className="text-xs text-neutral-500">
                                    Продано фигурок в топ-дропах
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatNumber(totalDropsSold)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardContent className="p-5">
                                <p className="text-xs text-neutral-500">
                                    Средний чек
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatCurrency(metrics.averageOrder, currency)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/[0.08] bg-[#0A0A0A] shadow-none">
                            <CardContent className="p-5">
                                <p className="text-xs text-neutral-500">
                                    Пользователей зарегистрировано
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatNumber(stats.users.total)}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    <footer className="border-t border-white/[0.08] pt-5">
                        <p className="text-xs text-neutral-600">
                            DropZeroStudio · Панель аналитики
                        </p>
                    </footer>
                </div>
            </main>
        </MainLayout>
    )
}

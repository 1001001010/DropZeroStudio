"use client"

import {
    ArrowDownRight,
    ArrowUpRight,
    Box,
    CreditCard,
    DollarSign,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
} from "lucide-react"
import { AdminNav } from '@/components/admin/admin-nav'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const stats = [
    {
        title: "Всего игрушек",
        value: "3 000",
        change: "+12%",
        description: "за последний месяц",
        icon: Package,
        positive: true,
    },
    {
        title: "Пользователи",
        value: "1 284",
        change: "+8.2%",
        description: "за последний месяц",
        icon: Users,
        positive: true,
    },
    {
        title: "Продано",
        value: "890",
        change: "+14.5%",
        description: "за последний месяц",
        icon: ShoppingBag,
        positive: true,
    },
    {
        title: "Выручка",
        value: "$35 555",
        change: "+18.2%",
        description: "за последний месяц",
        icon: DollarSign,
        positive: true,
    },
]

const recentOrders = [
    {
        id: "#DZ-1024",
        user: "alex@example.com",
        toy: "Crimson Sentinel",
        amount: "$39.99",
        status: "Оплачен",
        statusType: "success",
        initials: "AL",
    },
    {
        id: "#DZ-1023",
        user: "max@example.com",
        toy: "Shadow Walker",
        amount: "$49.99",
        status: "Оплачен",
        statusType: "success",
        initials: "MX",
    },
    {
        id: "#DZ-1022",
        user: "john@example.com",
        toy: "Red Phantom",
        amount: "$34.99",
        status: "Ожидает",
        statusType: "pending",
        initials: "JO",
    },
    {
        id: "#DZ-1021",
        user: "anna@example.com",
        toy: "Crimson Sentinel",
        amount: "$39.99",
        status: "Оплачен",
        statusType: "success",
        initials: "AN",
    },
    {
        id: "#DZ-1020",
        user: "mike@example.com",
        toy: "Iron Guardian",
        amount: "$59.99",
        status: "Оплачен",
        statusType: "success",
        initials: "MI",
    },
]

const sales = [
    { day: "Пн", value: 35 },
    { day: "Вт", value: 55 },
    { day: "Ср", value: 42 },
    { day: "Чт", value: 75 },
    { day: "Пт", value: 60 },
    { day: "Сб", value: 88 },
    { day: "Вс", value: 70 },
]

const topProducts = [
    {
        name: "Crimson Sentinel",
        sold: 184,
        revenue: "$7 358",
    },
    {
        name: "Shadow Walker",
        sold: 142,
        revenue: "$7 098",
    },
    {
        name: "Red Phantom",
        sold: 126,
        revenue: "$4 408",
    },
    {
        name: "Iron Guardian",
        sold: 98,
        revenue: "$5 879",
    },
]

export default function Dashboard() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <AdminNav />
            <div className="space-y-8 p-6 lg:p-8">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Главная
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Обзор магазина и активности DropZero.
                        </p>
                    </div>

                    <Button variant="outline" className="w-fit">
                        <TrendingUp className="mr-2 size-4" />
                        Отчёт за месяц
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon

                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardDescription>
                                        {stat.title}
                                    </CardDescription>

                                    <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                                        <Icon className="size-4 text-muted-foreground" />
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="text-2xl font-semibold tracking-tight">
                                        {stat.value}
                                    </div>

                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                        {stat.positive ? (
                                            <ArrowUpRight className="size-3 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="size-3 text-red-500" />
                                        )}

                                        <span
                                            className={
                                                stat.positive
                                                    ? "font-medium text-green-500"
                                                    : "font-medium text-red-500"
                                            }
                                        >
                                            {stat.change}
                                        </span>

                                        <span className="text-muted-foreground">
                                            {stat.description}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Sales + Revenue */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Sales */}
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Продажи</CardTitle>

                            <CardDescription>
                                Количество продаж за последние 7 дней
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex h-[280px] items-end gap-3">
                                {sales.map((item) => (
                                    <div
                                        key={item.day}
                                        className="flex h-full flex-1 flex-col justify-end gap-3"
                                    >
                                        <div className="relative flex h-full items-end">
                                            <div
                                                className="w-full rounded-md bg-primary transition-opacity hover:opacity-80"
                                                style={{
                                                    height: `${item.value}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="text-center text-xs text-muted-foreground">
                                            {item.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Выручка</CardTitle>

                            <CardDescription>
                                За текущий месяц
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-semibold tracking-tight">
                                        $35 555
                                    </div>

                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                        <ArrowUpRight className="size-3 text-green-500" />

                                        <span className="font-medium text-green-500">
                                            +18.2%
                                        </span>

                                        <span className="text-muted-foreground">
                                            к прошлому месяцу
                                        </span>
                                    </div>
                                </div>

                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                    <CreditCard className="size-5 text-primary" />
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Продажи
                                    </span>

                                    <span className="font-medium">
                                        $28 420
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: "80%" }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Остальное
                                    </span>

                                    <span className="font-medium">
                                        $7 135
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary/40"
                                        style={{ width: "20%" }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders + Top Products */}
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Orders */}
                    <Card className="min-w-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Последние заказы</CardTitle>

                                <CardDescription className="mt-1">
                                    Последние операции магазина
                                </CardDescription>
                            </div>

                            <Button variant="ghost" size="sm">
                                Все заказы
                                <ArrowUpRight className="ml-1 size-3" />
                            </Button>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Пользователь
                                            </TableHead>

                                            <TableHead>
                                                Игрушка
                                            </TableHead>

                                            <TableHead>
                                                Сумма
                                            </TableHead>

                                            <TableHead>
                                                Статус
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {recentOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-8">
                                                            <AvatarFallback className="text-[10px]">
                                                                {order.initials}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium">
                                                                {order.user}
                                                            </div>

                                                            <div className="text-xs text-muted-foreground">
                                                                {order.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                            <Box className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <span className="text-sm">
                                                            {order.toy}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="font-medium">
                                                    {order.amount}
                                                </TableCell>

                                                <TableCell>
                                                    {order.statusType ===
                                                        "success" ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-green-500/10 text-green-500 hover:bg-green-500/10"
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10"
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Популярные игрушки
                            </CardTitle>

                            <CardDescription>
                                Лидеры продаж за месяц
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {topProducts.map((product, index) => (
                                <div
                                    key={product.name}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-xs font-semibold">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {product.name}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {product.sold} продаж
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {product.revenue}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            выручка
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional metrics */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Средний чек
                            </CardDescription>

                            <CardTitle className="text-2xl">
                                $39.95
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-1 text-xs">
                                <ArrowUpRight className="size-3 text-green-500" />

                                <span className="font-medium text-green-500">
                                    +5.4%
                                </span>

                                <span className="text-muted-foreground">
                                    за месяц
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Конверсия
                            </CardDescription>

                            <CardTitle className="text-2xl">
                                7.84%
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-1 text-xs">
                                <ArrowUpRight className="size-3 text-green-500" />

                                <span className="font-medium text-green-500">
                                    +1.2%
                                </span>

                                <span className="text-muted-foreground">
                                    за месяц
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Возвраты
                            </CardDescription>

                            <CardTitle className="text-2xl">
                                2.14%
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-1 text-xs">
                                <ArrowDownRight className="size-3 text-red-500" />

                                <span className="font-medium text-red-500">
                                    -0.8%
                                </span>

                                <span className="text-muted-foreground">
                                    за месяц
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}

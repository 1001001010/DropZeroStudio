"use client"

import { useMemo, useState } from "react"
import {
    CalendarDays,
    Check,
    CircleDollarSign,
    Edit,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    Trash2,
} from "lucide-react"

import { AdminNav } from "@/components/admin/admin-nav"

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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"



type Drop = {
    id: number
    name: string
    skin: string
    skinId: number
    editionSize: number
    price: number
    productionStartedAt: string | null
    productionCompletedAt: string | null
    saleStartedAt: string | null
    saleEndedAt: string | null
}


const initialDrops: Drop[] = [
    {
        id: 1,
        name: "Crimson Sentinel",
        skin: "Crimson",
        skinId: 1,
        editionSize: 500,
        price: 39.99,
        productionStartedAt: "2026-01-15",
        productionCompletedAt: "2026-03-20",
        saleStartedAt: "2026-04-01",
        saleEndedAt: null,
    },
    {
        id: 2,
        name: "Shadow Walker",
        skin: "Shadow",
        skinId: 2,
        editionSize: 750,
        price: 49.99,
        productionStartedAt: "2026-02-01",
        productionCompletedAt: "2026-04-10",
        saleStartedAt: "2026-05-01",
        saleEndedAt: null,
    },
    {
        id: 3,
        name: "Red Phantom",
        skin: "Phantom",
        skinId: 3,
        editionSize: 300,
        price: 34.99,
        productionStartedAt: "2026-03-10",
        productionCompletedAt: "2026-05-05",
        saleStartedAt: "2026-05-20",
        saleEndedAt: "2026-08-01",
    },
    {
        id: 4,
        name: "Iron Guardian",
        skin: "Iron",
        skinId: 4,
        editionSize: 1000,
        price: 59.99,
        productionStartedAt: null,
        productionCompletedAt: null,
        saleStartedAt: null,
        saleEndedAt: null,
    },
]


const skins = [
    {
        id: 1,
        name: "Crimson",
    },
    {
        id: 2,
        name: "Shadow",
    },
    {
        id: 3,
        name: "Phantom",
    },
    {
        id: 4,
        name: "Iron",
    },
]


function formatPrice(price: number) {
    return `$${price.toFixed(2)} `
}


function formatDate(date: string | null) {
    if (!date) {
        return "—"
    }

    return new Date(date).toLocaleDateString("ru-RU")
}


function getStatus(drop: Drop) {
    const now = new Date()

    if (
        drop.saleEndedAt &&
        new Date(drop.saleEndedAt) < now
    ) {
        return {
            label: "Завершена",
            type: "ended",
        }
    }

    if (
        drop.saleStartedAt &&
        new Date(drop.saleStartedAt) <= now
    ) {
        return {
            label: "В продаже",
            type: "active",
        }
    }

    if (
        drop.productionStartedAt &&
        !drop.productionCompletedAt
    ) {
        return {
            label: "Производство",
            type: "production",
        }
    }

    if (
        drop.productionCompletedAt &&
        !drop.saleStartedAt
    ) {
        return {
            label: "Готова",
            type: "ready",
        }
    }

    return {
        label: "Запланирована",
        type: "planned",
    }
}


export default function CollectionsPage() {
    const [drops, setDrops] = useState<Drop[]>(initialDrops)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDrop, setEditingDrop] = useState<Drop | null>(null)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [dropToDelete, setDropToDelete] = useState<Drop | null>(null)

    const [form, setForm] = useState({
        name: "",
        skinId: "",
        editionSize: "",
        price: "",
        productionStartedAt: "",
        productionCompletedAt: "",
        saleStartedAt: "",
        saleEndedAt: "",
    })


    const filteredDrops = useMemo(() => {
        return drops.filter((drop) => {
            const matchesSearch =
                drop.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                drop.skin
                    .toLowerCase()
                    .includes(search.toLowerCase())

            const status = getStatus(drop)

            const matchesStatus =
                statusFilter === "all" ||
                status.type === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [drops, search, statusFilter])


    const totalEdition = drops.reduce(
        (sum, drop) => sum + drop.editionSize,
        0
    )

    const activeDrops = drops.filter(
        (drop) => getStatus(drop).type === "active"
    ).length

    const totalValue = drops.reduce(
        (sum, drop) => sum + drop.editionSize * drop.price,
        0
    )


    function resetForm() {
        setForm({
            name: "",
            skinId: "",
            editionSize: "",
            price: "",
            productionStartedAt: "",
            productionCompletedAt: "",
            saleStartedAt: "",
            saleEndedAt: "",
        })
    }


    function openCreateDialog() {
        setEditingDrop(null)
        resetForm()
        setDialogOpen(true)
    }


    function openEditDialog(drop: Drop) {
        setEditingDrop(drop)

        setForm({
            name: drop.name,
            skinId: String(drop.skinId),
            editionSize: String(drop.editionSize),
            price: String(drop.price),
            productionStartedAt: drop.productionStartedAt ?? "",
            productionCompletedAt: drop.productionCompletedAt ?? "",
            saleStartedAt: drop.saleStartedAt ?? "",
            saleEndedAt: drop.saleEndedAt ?? "",
        })

        setDialogOpen(true)
    }


    function handleSubmit() {
        if (
            !form.name ||
            !form.skinId ||
            !form.editionSize ||
            !form.price
        ) {
            return
        }

        const selectedSkin = skins.find(
            (skin) => skin.id === Number(form.skinId)
        )

        if (!selectedSkin) {
            return
        }

        const data: Drop = {
            id: editingDrop?.id ?? Date.now(),
            name: form.name,
            skin: selectedSkin.name,
            skinId: selectedSkin.id,
            editionSize: Number(form.editionSize),
            price: Number(form.price),
            productionStartedAt:
                form.productionStartedAt || null,
            productionCompletedAt:
                form.productionCompletedAt || null,
            saleStartedAt:
                form.saleStartedAt || null,
            saleEndedAt:
                form.saleEndedAt || null,
        }

        if (editingDrop) {
            setDrops((current) =>
                current.map((drop) =>
                    drop.id === editingDrop.id
                        ? data
                        : drop
                )
            )
        } else {
            setDrops((current) => [data, ...current])
        }

        setDialogOpen(false)
        resetForm()
        setEditingDrop(null)
    }


    function openDeleteDialog(drop: Drop) {
        setDropToDelete(drop)
        setDeleteDialogOpen(true)
    }


    function handleDelete() {
        if (!dropToDelete) {
            return
        }

        setDrops((current) =>
            current.filter(
                (drop) => drop.id !== dropToDelete.id
            )
        )

        setDeleteDialogOpen(false)
        setDropToDelete(null)
    }


    return (
        <main className="min-h-screen bg-background text-foreground">
            <AdminNav />

            <div className="space-y-8 p-6 lg:p-8">

                {/* Header */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Коллекции
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Управление коллекциями и тиражами DropZero.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateDialog}
                        className="w-fit"
                    >
                        <Plus className="mr-2 size-4" />
                        Добавить коллекцию
                    </Button>
                </div>


                {/* Statistics */}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardDescription>
                                Всего коллекций
                            </CardDescription>

                            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                                <Package className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight">
                                {drops.length}
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                зарегистрировано в системе
                            </p>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardDescription>
                                В продаже
                            </CardDescription>

                            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                                <Check className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight">
                                {activeDrops}
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                активных коллекций
                            </p>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardDescription>
                                Общий тираж
                            </CardDescription>

                            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                                <Package className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight">
                                {totalEdition.toLocaleString("ru-RU")}
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                экземпляров
                            </p>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardDescription>
                                Стоимость тиражей
                            </CardDescription>

                            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                                <CircleDollarSign className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight">
                                ${totalValue.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                потенциальная выручка
                            </p>
                        </CardContent>
                    </Card>

                </div>


                {/* Main table */}

                <Card>

                    <CardHeader className="gap-4">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div>
                                <CardTitle>
                                    Все коллекции
                                </CardTitle>

                                <CardDescription className="mt-1">
                                    Список всех коллекций магазина.
                                </CardDescription>
                            </div>

                            <Button
                                onClick={openCreateDialog}
                                variant="outline"
                                size="sm"
                                className="w-fit"
                            >
                                <Plus className="mr-2 size-4" />
                                Добавить
                            </Button>

                        </div>


                        {/* Filters */}

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Поиск коллекции..."
                                    className="pl-9"
                                />
                            </div>


                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[190px]">
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        Все статусы
                                    </SelectItem>

                                    <SelectItem value="active">
                                        В продаже
                                    </SelectItem>

                                    <SelectItem value="production">
                                        Производство
                                    </SelectItem>

                                    <SelectItem value="ready">
                                        Готова
                                    </SelectItem>

                                    <SelectItem value="planned">
                                        Запланирована
                                    </SelectItem>

                                    <SelectItem value="ended">
                                        Завершена
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                        </div>

                    </CardHeader>


                    <CardContent>

                        <div className="overflow-x-auto">

                            <Table>

                                <TableHeader>
                                    <TableRow>

                                        <TableHead>
                                            Коллекция
                                        </TableHead>

                                        <TableHead>
                                            Скин
                                        </TableHead>

                                        <TableHead>
                                            Тираж
                                        </TableHead>

                                        <TableHead>
                                            Цена
                                        </TableHead>

                                        <TableHead>
                                            Продажи
                                        </TableHead>

                                        <TableHead>
                                            Статус
                                        </TableHead>

                                        <TableHead className="w-[60px]" />

                                    </TableRow>
                                </TableHeader>


                                <TableBody>

                                    {filteredDrops.map((drop) => {
                                        const status = getStatus(drop)

                                        return (
                                            <TableRow key={drop.id}>

                                                {/* Name */}

                                                <TableCell>

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                                                            <Package className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-medium">
                                                                {drop.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                ID #{drop.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </TableCell>


                                                {/* Skin */}

                                                <TableCell>

                                                    <div className="text-sm">
                                                        {drop.skin}
                                                    </div>

                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Skin #{drop.skinId}
                                                    </div>

                                                </TableCell>


                                                {/* Edition */}

                                                <TableCell>

                                                    <div className="text-sm font-medium">
                                                        {drop.editionSize.toLocaleString("ru-RU")}
                                                    </div>

                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        экземпляров
                                                    </div>

                                                </TableCell>


                                                {/* Price */}

                                                <TableCell>
                                                    <span className="text-sm font-medium">
                                                        {formatPrice(drop.price)}
                                                    </span>
                                                </TableCell>


                                                {/* Sale dates */}

                                                <TableCell>

                                                    <div className="flex items-center gap-2 text-sm">

                                                        <CalendarDays className="size-4 text-muted-foreground" />

                                                        <div>

                                                            <p>
                                                                {formatDate(drop.saleStartedAt)}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {drop.saleEndedAt
                                                                    ? `до ${formatDate(drop.saleEndedAt)} `
                                                                    : "без даты окончания"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </TableCell>


                                                {/* Status */}

                                                <TableCell>

                                                    {status.type === "active" && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-green-500/10 text-green-500 hover:bg-green-500/10"
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    )}

                                                    {status.type === "production" && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10"
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    )}

                                                    {status.type === "ready" && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-primary/10 text-primary hover:bg-primary/10"
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    )}

                                                    {status.type === "planned" && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10"
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    )}

                                                    {status.type === "ended" && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-muted text-muted-foreground hover:bg-muted"
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    )}

                                                </TableCell>


                                                {/* Actions */}

                                                <TableCell>

                                                    <DropdownMenu>

                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end">

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEditDialog(drop)
                                                                }
                                                            >
                                                                <Edit className="mr-2 size-4" />
                                                                Редактировать
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    openDeleteDialog(drop)
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 size-4" />
                                                                Удалить
                                                            </DropdownMenuItem>

                                                        </DropdownMenuContent>

                                                    </DropdownMenu>

                                                </TableCell>

                                            </TableRow>
                                        )
                                    })}


                                    {filteredDrops.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-32 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">

                                                    <Package className="mb-3 size-8 text-muted-foreground" />

                                                    <p className="text-sm font-medium">
                                                        Коллекции не найдены
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Попробуйте изменить параметры поиска.
                                                    </p>

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                </TableBody>

                            </Table>

                        </div>

                    </CardContent>

                </Card>

            </div>


            {/* Create / Edit dialog */}

            <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            >

                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">

                    <DialogHeader>

                        <DialogTitle>
                            {editingDrop
                                ? "Редактирование коллекции"
                                : "Добавление коллекции"
                            }
                        </DialogTitle>

                        <DialogDescription>
                            {editingDrop
                                ? "Измените данные коллекции."
                                : "Заполните данные для новой коллекции."
                            }
                        </DialogDescription>

                    </DialogHeader>


                    <div className="space-y-6 py-4">

                        {/* Basic information */}

                        <div className="space-y-4">

                            <div>
                                <h3 className="text-sm font-medium">
                                    Основная информация
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Название, скин и размер коллекции.
                                </p>
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Название
                                </label>

                                <Input
                                    placeholder="Например, Crimson Sentinel"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </div>


                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Скин
                                </label>

                                <Select
                                    value={form.skinId}
                                    onValueChange={(value) =>
                                        setForm({
                                            ...form,
                                            skinId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите скин" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        {skins.map((skin) => (
                                            <SelectItem
                                                key={skin.id}
                                                value={String(skin.id)}
                                            >
                                                {skin.name}
                                            </SelectItem>
                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Размер тиража
                                    </label>

                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="500"
                                        value={form.editionSize}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                editionSize:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Цена
                                    </label>

                                    <div className="relative">

                                        <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="39.99"
                                            className="pl-9"
                                            value={form.price}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    price:
                                                        event.target.value,
                                                })
                                            }
                                        />

                                    </div>
                                </div>

                            </div>

                        </div>


                        {/* Production */}

                        <div className="space-y-4 border-t pt-5">

                            <div>
                                <h3 className="text-sm font-medium">
                                    Производство
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Период производства коллекции.
                                </p>
                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Начало производства
                                    </label>

                                    <Input
                                        type="date"
                                        value={form.productionStartedAt}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                productionStartedAt:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Завершение производства
                                    </label>

                                    <Input
                                        type="date"
                                        value={form.productionCompletedAt}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                productionCompletedAt:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>

                            </div>

                        </div>


                        {/* Sale */}

                        <div className="space-y-4 border-t pt-5">

                            <div>
                                <h3 className="text-sm font-medium">
                                    Продажа
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Период доступности коллекции для покупки.
                                </p>
                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Начало продаж
                                    </label>

                                    <Input
                                        type="date"
                                        value={form.saleStartedAt}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                saleStartedAt:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Завершение продаж
                                    </label>

                                    <Input
                                        type="date"
                                        value={form.saleEndedAt}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                saleEndedAt:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>

                            </div>

                        </div>

                    </div>


                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Отмена
                        </Button>

                        <Button onClick={handleSubmit}>
                            {editingDrop
                                ? "Сохранить изменения"
                                : "Создать коллекцию"
                            }
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>


            {/* Delete dialog */}

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >

                <DialogContent className="sm:max-w-[425px]">

                    <DialogHeader>

                        <DialogTitle>
                            Удалить коллекцию?
                        </DialogTitle>

                        <DialogDescription>
                            Вы действительно хотите удалить коллекцию{" "}
                            <span className="font-medium text-foreground">
                                «{dropToDelete?.name}»
                            </span>
                            ? Это действие нельзя будет отменить.
                        </DialogDescription>

                    </DialogHeader>


                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialogOpen(false)
                            }
                        >
                            Отмена
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Удалить
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </main>
    )
}

"use client"

import { useMemo, useState } from "react"
import {
    CheckCircle2,
    CircleUserRound,
    Edit3,
    Hash,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    ShoppingBag,
    Trash2,
    UserRound,
    XCircle,
} from "lucide-react"

import { AdminNav } from "@/components/admin/admin-nav"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


type ToyStatus = "produced" | "available" | "sold"

type Toy = {
    id: number
    dropId: number
    dropName: string
    userId: number | null
    userName: string | null
    code: string
    secretHash: string
    number: number
    status: ToyStatus
    claimedAt: string | null
}

type ToyForm = {
    dropId: string
    number: string
    code: string
    status: ToyStatus
}


// -----------------------------------------------------------------------------
// Моковые коллекции
// Потом заменить данными из Laravel
// -----------------------------------------------------------------------------

const drops = [
    {
        id: 1,
        name: "Crimson Sentinel",
    },
    {
        id: 2,
        name: "Shadow Walker",
    },
    {
        id: 3,
        name: "Red Phantom",
    },
    {
        id: 4,
        name: "Iron Guardian",
    },
]


// -----------------------------------------------------------------------------
// Моковые игрушки
// -----------------------------------------------------------------------------

const initialToys: Toy[] = [
    {
        id: 1,
        dropId: 1,
        dropName: "Crimson Sentinel",
        userId: null,
        userName: null,
        code: "CRS-0001-X7K9",
        secretHash: "hashed-secret",
        number: 1,
        status: "available",
        claimedAt: null,
    },
    {
        id: 2,
        dropId: 1,
        dropName: "Crimson Sentinel",
        userId: 25,
        userName: "Alex",
        code: "CRS-0002-P4M2",
        secretHash: "hashed-secret",
        number: 2,
        status: "sold",
        claimedAt: "2026-05-12 14:32",
    },
    {
        id: 3,
        dropId: 2,
        dropName: "Shadow Walker",
        userId: null,
        userName: null,
        code: "SHW-0001-K8L3",
        secretHash: "hashed-secret",
        number: 1,
        status: "produced",
        claimedAt: null,
    },
    {
        id: 4,
        dropId: 2,
        dropName: "Shadow Walker",
        userId: null,
        userName: null,
        code: "SHW-0002-N5Q1",
        secretHash: "hashed-secret",
        number: 2,
        status: "available",
        claimedAt: null,
    },
    {
        id: 5,
        dropId: 3,
        dropName: "Red Phantom",
        userId: 31,
        userName: "Dmitry",
        code: "RPH-0001-A9F2",
        secretHash: "hashed-secret",
        number: 1,
        status: "sold",
        claimedAt: "2026-06-03 18:15",
    },
    {
        id: 6,
        dropId: 4,
        dropName: "Iron Guardian",
        userId: null,
        userName: null,
        code: "IRG-0001-B2T7",
        secretHash: "hashed-secret",
        number: 1,
        status: "produced",
        claimedAt: null,
    },
]


const emptyForm: ToyForm = {
    dropId: "",
    number: "",
    code: "",
    status: "produced",
}


// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatDate(date: string | null) {
    if (!date) {
        return "—"
    }

    return new Date(date.replace(" ", "T")).toLocaleDateString("ru-RU")
}


function formatDateTime(date: string | null) {
    if (!date) {
        return "—"
    }

    return new Date(date.replace(" ", "T")).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}


function StatusBadge({
    status,
}: {
    status: ToyStatus
}) {
    switch (status) {
        case "available":
            return (
                <Badge className="gap-1.5 border-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Доступна
                </Badge>
            )

        case "sold":
            return (
                <Badge className="gap-1.5 border-0 bg-violet-500/10 text-violet-500 hover:bg-violet-500/10">
                    <span className="size-1.5 rounded-full bg-violet-500" />
                    Продана
                </Badge>
            )

        default:
            return (
                <Badge className="gap-1.5 border-0 bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Изготовлена
                </Badge>
            )
    }
}


// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ToysPage() {
    const [toys, setToys] = useState<Toy[]>(initialToys)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [form, setForm] = useState<ToyForm>(emptyForm)
    const [editingToy, setEditingToy] = useState<Toy | null>(null)

    const [formOpen, setFormOpen] = useState(false)

    const [deleteToy, setDeleteToy] = useState<Toy | null>(null)


    // -------------------------------------------------------------------------
    // Filtering
    // -------------------------------------------------------------------------

    const filteredToys = useMemo(() => {
        return toys.filter((toy) => {
            const query = search.toLowerCase().trim()

            const matchesSearch =
                !query ||
                toy.code.toLowerCase().includes(query) ||
                toy.dropName.toLowerCase().includes(query) ||
                toy.userName?.toLowerCase().includes(query)

            const matchesStatus =
                statusFilter === "all" ||
                toy.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [toys, search, statusFilter])


    // -------------------------------------------------------------------------
    // Statistics
    // -------------------------------------------------------------------------

    const producedCount = toys.filter(
        (toy) => toy.status === "produced"
    ).length

    const availableCount = toys.filter(
        (toy) => toy.status === "available"
    ).length

    const soldCount = toys.filter(
        (toy) => toy.status === "sold"
    ).length


    // -------------------------------------------------------------------------
    // Form
    // -------------------------------------------------------------------------

    function updateForm(
        field: keyof ToyForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }


    function openCreate() {
        setEditingToy(null)

        setForm({
            ...emptyForm,
        })

        setFormOpen(true)
    }


    function openEdit(toy: Toy) {
        setEditingToy(toy)

        setForm({
            dropId: String(toy.dropId),
            number: String(toy.number),
            code: toy.code,
            status: toy.status,
        })

        setFormOpen(true)
    }


    function saveToy() {
        if (
            !form.dropId ||
            !form.number ||
            !form.code.trim()
        ) {
            return
        }

        const selectedDrop = drops.find(
            (drop) => drop.id === Number(form.dropId)
        )

        if (!selectedDrop) {
            return
        }


        const data: Toy = {
            id: editingToy?.id ?? Date.now(),

            dropId: selectedDrop.id,

            dropName: selectedDrop.name,

            userId: editingToy?.userId ?? null,

            userName: editingToy?.userName ?? null,

            code: form.code.trim(),

            secretHash:
                editingToy?.secretHash ?? "hashed-secret",

            number: Number(form.number),

            status: form.status,

            claimedAt: editingToy?.claimedAt ?? null,
        }


        if (editingToy) {
            setToys((current) =>
                current.map((toy) =>
                    toy.id === editingToy.id
                        ? data
                        : toy
                )
            )
        } else {
            setToys((current) => [
                data,
                ...current,
            ])
        }


        setFormOpen(false)
        setEditingToy(null)
        setForm(emptyForm)
    }


    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    function confirmDelete() {
        if (!deleteToy) {
            return
        }

        setToys((current) =>
            current.filter(
                (toy) => toy.id !== deleteToy.id
            )
        )

        setDeleteToy(null)
    }


    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <main className="min-h-screen bg-background">

            <AdminNav />

            <div className="space-y-8 p-6 lg:p-8">

                {/* Header */}

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                    <div>

                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">

                            <Package className="size-4" />

                            Каталог

                            <span>/</span>

                            Игрушки

                        </div>


                        <h1 className="text-3xl font-semibold tracking-tight">
                            Игрушки
                        </h1>


                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Управляйте экземплярами коллекций,
                            их статусами, кодами и владельцами.
                        </p>

                    </div>


                    <Button
                        onClick={openCreate}
                        className="h-10"
                    >
                        <Plus className="mr-2 size-4" />
                        Добавить игрушку
                    </Button>

                </div>


                {/* Statistics */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    {/* Total */}

                    <Card className="overflow-hidden">

                        <CardContent className="p-5">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm text-muted-foreground">
                                        Всего игрушек
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                                        {toys.length}
                                    </p>

                                </div>


                                <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">

                                    <Package className="size-5 text-muted-foreground" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-muted-foreground">
                                Все экземпляры в каталоге
                            </p>

                        </CardContent>

                    </Card>


                    {/* Produced */}

                    <Card className="overflow-hidden">

                        <CardContent className="p-5">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm text-muted-foreground">
                                        Изготовлено
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                                        {producedCount}
                                    </p>

                                </div>


                                <div className="flex size-10 items-center justify-center rounded-xl border bg-amber-500/10">

                                    <Package className="size-5 text-amber-500" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-muted-foreground">
                                Ожидают поступления в продажу
                            </p>

                        </CardContent>

                    </Card>


                    {/* Available */}

                    <Card className="overflow-hidden">

                        <CardContent className="p-5">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm text-muted-foreground">
                                        Доступны
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                                        {availableCount}
                                    </p>

                                </div>


                                <div className="flex size-10 items-center justify-center rounded-xl border bg-emerald-500/10">

                                    <CheckCircle2 className="size-5 text-emerald-500" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-muted-foreground">
                                Доступны для покупки
                            </p>

                        </CardContent>

                    </Card>


                    {/* Sold */}

                    <Card className="overflow-hidden">

                        <CardContent className="p-5">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm text-muted-foreground">
                                        Продано
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                                        {soldCount}
                                    </p>

                                </div>


                                <div className="flex size-10 items-center justify-center rounded-xl border bg-violet-500/10">

                                    <ShoppingBag className="size-5 text-violet-500" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-muted-foreground">
                                Игрушки у покупателей
                            </p>

                        </CardContent>

                    </Card>

                </div>


                {/* Table */}

                <Card className="overflow-hidden">

                    <CardHeader className="border-b bg-muted/20 px-6 py-5">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                                <CardTitle className="text-lg">
                                    Все игрушки
                                </CardTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {filteredToys.length} из {toys.length} игрушек
                                </p>

                            </div>


                            <div className="flex flex-col gap-3 sm:flex-row">

                                {/* Search */}

                                <div className="relative">

                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Поиск по коду..."
                                        className="h-9 w-full pl-9 sm:w-[250px]"
                                    />


                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        >
                                            <XCircle className="size-4" />
                                        </button>
                                    )}

                                </div>


                                {/* Status */}

                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >

                                    <SelectTrigger className="h-9 w-full sm:w-[170px]">

                                        <SelectValue />

                                    </SelectTrigger>


                                    <SelectContent>

                                        <SelectItem value="all">
                                            Все статусы
                                        </SelectItem>

                                        <SelectItem value="produced">
                                            Изготовлена
                                        </SelectItem>

                                        <SelectItem value="available">
                                            Доступна
                                        </SelectItem>

                                        <SelectItem value="sold">
                                            Продана
                                        </SelectItem>

                                    </SelectContent>

                                </Select>

                            </div>

                        </div>

                    </CardHeader>


                    <CardContent className="p-0">

                        <div className="overflow-x-auto">

                            <Table>

                                <TableHeader>

                                    <TableRow className="bg-muted/20 hover:bg-muted/20">

                                        <TableHead className="h-11 pl-6">
                                            Игрушка
                                        </TableHead>

                                        <TableHead className="h-11">
                                            Коллекция
                                        </TableHead>

                                        <TableHead className="h-11">
                                            Код
                                        </TableHead>

                                        <TableHead className="h-11">
                                            Владелец
                                        </TableHead>

                                        <TableHead className="h-11">
                                            Статус
                                        </TableHead>

                                        <TableHead className="h-11">
                                            Получение
                                        </TableHead>

                                        <TableHead className="h-11 w-[60px] pr-6" />

                                    </TableRow>

                                </TableHeader>


                                <TableBody>

                                    {filteredToys.map((toy) => (

                                        <TableRow
                                            key={toy.id}
                                            className="group"
                                        >

                                            {/* Toy */}

                                            <TableCell className="py-4 pl-6">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground transition-colors group-hover:bg-muted">

                                                        <Hash className="size-5" />

                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="font-medium">
                                                            №{toy.number}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            ID #{toy.id}
                                                        </p>

                                                    </div>

                                                </div>

                                            </TableCell>


                                            {/* Drop */}

                                            <TableCell>

                                                <div>

                                                    <p className="font-medium">
                                                        {toy.dropName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Drop #{toy.dropId}
                                                    </p>

                                                </div>

                                            </TableCell>


                                            {/* Code */}

                                            <TableCell>

                                                <div className="flex items-center gap-2">

                                                    <code className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                                        {toy.code}
                                                    </code>

                                                </div>

                                            </TableCell>


                                            {/* Owner */}

                                            <TableCell>

                                                {toy.userName ? (

                                                    <div className="flex items-center gap-2">

                                                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">

                                                            <CircleUserRound className="size-4 text-muted-foreground" />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-medium">
                                                                {toy.userName}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                ID #{toy.userId}
                                                            </p>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <div className="flex items-center gap-2 text-muted-foreground">

                                                        <UserRound className="size-4" />

                                                        <span className="text-sm">
                                                            Нет владельца
                                                        </span>

                                                    </div>

                                                )}

                                            </TableCell>


                                            {/* Status */}

                                            <TableCell>

                                                <StatusBadge
                                                    status={toy.status}
                                                />

                                            </TableCell>


                                            {/* Claimed */}

                                            <TableCell>

                                                <div>

                                                    <p className="text-sm">
                                                        {formatDate(toy.claimedAt)}
                                                    </p>

                                                    {toy.claimedAt && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {formatDateTime(toy.claimedAt).split(", ")[1]}
                                                        </p>
                                                    )}

                                                </div>

                                            </TableCell>


                                            {/* Actions */}

                                            <TableCell className="pr-6">

                                                <DropdownMenu>

                                                    <DropdownMenuTrigger asChild>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>

                                                    </DropdownMenuTrigger>


                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-44"
                                                    >

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(toy)
                                                            }
                                                        >

                                                            <Edit3 className="mr-2 size-4" />

                                                            Редактировать

                                                        </DropdownMenuItem>


                                                        <DropdownMenuSeparator />


                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setDeleteToy(toy)
                                                            }
                                                        >

                                                            <Trash2 className="mr-2 size-4" />

                                                            Удалить

                                                        </DropdownMenuItem>

                                                    </DropdownMenuContent>

                                                </DropdownMenu>

                                            </TableCell>

                                        </TableRow>

                                    ))}


                                    {filteredToys.length === 0 && (

                                        <TableRow>

                                            <TableCell
                                                colSpan={7}
                                                className="h-48"
                                            >

                                                <div className="flex flex-col items-center justify-center text-center">

                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">

                                                        <Search className="size-5 text-muted-foreground" />

                                                    </div>


                                                    <p className="font-medium">
                                                        Ничего не найдено
                                                    </p>


                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Измените параметры поиска или фильтра.
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


            {/* Create / Edit */}

            <Dialog
                open={formOpen}
                onOpenChange={setFormOpen}
            >

                <DialogContent className="sm:max-w-[560px]">

                    <DialogHeader>

                        <DialogTitle className="text-xl">

                            {editingToy
                                ? "Редактировать игрушку"
                                : "Новая игрушка"
                            }

                        </DialogTitle>


                        <DialogDescription>

                            {editingToy
                                ? "Измените необходимые параметры игрушки."
                                : "Добавьте новый экземпляр коллекции."
                            }

                        </DialogDescription>

                    </DialogHeader>


                    <div className="space-y-6 py-3">

                        {/* Collection */}

                        <section className="space-y-4">

                            <div>

                                <h3 className="text-sm font-semibold">
                                    Основная информация
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Коллекция и номер экземпляра.
                                </p>

                            </div>


                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Коллекция
                                </label>


                                <Select
                                    value={form.dropId}
                                    onValueChange={(value) =>
                                        updateForm("dropId", value)
                                    }
                                >

                                    <SelectTrigger>

                                        <SelectValue placeholder="Выберите коллекцию" />

                                    </SelectTrigger>


                                    <SelectContent>

                                        {drops.map((drop) => (

                                            <SelectItem
                                                key={drop.id}
                                                value={String(drop.id)}
                                            >
                                                {drop.name}
                                            </SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">

                                    <label className="text-sm font-medium">
                                        Номер экземпляра
                                    </label>


                                    <Input
                                        type="number"
                                        min="1"
                                        value={form.number}
                                        onChange={(event) =>
                                            updateForm(
                                                "number",
                                                event.target.value
                                            )
                                        }
                                        placeholder="1"
                                    />

                                </div>


                                <div className="space-y-2">

                                    <label className="text-sm font-medium">
                                        Статус
                                    </label>


                                    <Select
                                        value={form.status}
                                        onValueChange={(value) =>
                                            updateForm(
                                                "status",
                                                value as ToyStatus
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>


                                        <SelectContent>

                                            <SelectItem value="produced">
                                                Изготовлена
                                            </SelectItem>

                                            <SelectItem value="available">
                                                Доступна
                                            </SelectItem>

                                            <SelectItem value="sold">
                                                Продана
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>

                            </div>

                        </section>


                        {/* Code */}

                        <section className="space-y-4 border-t pt-6">

                            <div>

                                <h3 className="text-sm font-semibold">
                                    Идентификация
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Уникальный код игрушки.
                                </p>

                            </div>


                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Код
                                </label>


                                <div className="relative">

                                    <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={form.code}
                                        onChange={(event) =>
                                            updateForm(
                                                "code",
                                                event.target.value
                                            )
                                        }
                                        placeholder="CRS-0001-X7K9"
                                        className="pl-9"
                                    />

                                </div>


                                <p className="text-xs text-muted-foreground">
                                    Код должен быть уникальным.
                                </p>

                            </div>

                        </section>


                        {/* Owner */}

                        {editingToy?.userName && (

                            <section className="space-y-4 border-t pt-6">

                                <div>

                                    <h3 className="text-sm font-semibold">
                                        Владелец
                                    </h3>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Информация о текущем владельце.
                                    </p>

                                </div>


                                <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">

                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">

                                        <CircleUserRound className="size-5 text-muted-foreground" />

                                    </div>


                                    <div>

                                        <p className="text-sm font-medium">
                                            {editingToy.userName}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Пользователь #{editingToy.userId}
                                        </p>

                                    </div>

                                </div>

                            </section>

                        )}

                    </div>


                    <DialogFooter className="gap-2 sm:gap-0">

                        <Button
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                        >
                            Отмена
                        </Button>


                        <Button onClick={saveToy}>

                            {editingToy
                                ? "Сохранить изменения"
                                : "Создать игрушку"
                            }

                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>


            {/* Delete */}

            <Dialog
                open={!!deleteToy}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteToy(null)
                    }
                }}
            >

                <DialogContent className="sm:max-w-[430px]">

                    <DialogHeader>

                        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10">

                            <Trash2 className="size-5 text-destructive" />

                        </div>


                        <DialogTitle>
                            Удалить игрушку?
                        </DialogTitle>


                        <DialogDescription className="leading-6">

                            Вы действительно хотите удалить{" "}

                            <span className="font-medium text-foreground">
                                «{deleteToy?.code}»
                            </span>

                            ? Все данные игрушки будут удалены.

                        </DialogDescription>

                    </DialogHeader>


                    <DialogFooter className="mt-2">

                        <Button
                            variant="outline"
                            onClick={() => setDeleteToy(null)}
                        >
                            Отмена
                        </Button>


                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
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


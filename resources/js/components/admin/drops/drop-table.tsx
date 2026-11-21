import { useMemo, useState } from 'react'

import {
    MoreHorizontal,
    Package,
    // Trash2,
    CalendarDays,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { EditDropDialog } from '@/components/admin/drops/update-drop-dialog'
import type { Skin } from '@/types'
import {
    DropdownMenu,
    DropdownMenuSeparator,
    // DropdownMenuContent,
    // DropdownMenuItem,
    // DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import type { Drop } from '@/types/index'
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu'

type DropTableProps = {
    drops: Drop[]
    skins: Skin[]
}

export function DropTable({ drops, skins }: DropTableProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredDrops = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()
        const now = new Date()

        return drops.filter((drop) => {
            const isDeleted = Boolean(drop.deleted_at)

            const matchesSearch =
                normalizedSearch === '' ||
                drop.name.toLowerCase().includes(normalizedSearch) ||
                (drop.skin?.name ?? '')
                    .toLowerCase()
                    .includes(normalizedSearch)

            if (!matchesSearch) return false

            const status = getDropStatus(drop, now)

            switch (statusFilter) {
                case 'active':
                    return status === 'active'

                case 'upcoming':
                    return status === 'upcoming'

                case 'completed':
                    return status === 'completed'

                case 'deleted':
                    return isDeleted

                case 'all':
                default:
                    return true
            }
        })
    }, [drops, search, statusFilter])

    const hasFilters =
        search.trim() !== '' || statusFilter !== 'all'

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Все дропы
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {filteredDrops.length} из {drops.length}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Поиск дропа..."
                            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
                        >
                            <option value="all">Все дропы</option>
                            <option value="active">В продаже</option>
                            <option value="upcoming">Ожидаются</option>
                            <option value="completed">Завершённые</option>
                            <option value="deleted">Удалённые</option>
                        </select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableHead className="h-11 pl-6">
                                    Дроп
                                </TableHead>

                                <TableHead className="h-11">
                                    Скин
                                </TableHead>

                                <TableHead className="h-11">
                                    Тираж
                                </TableHead>

                                <TableHead className="h-11">
                                    Цена
                                </TableHead>

                                <TableHead className="h-11">
                                    Период шитья
                                </TableHead>

                                <TableHead className="h-11">
                                    Период продаж
                                </TableHead>

                                <TableHead className="h-11">
                                    Статус
                                </TableHead>

                                <TableHead className="h-11">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredDrops.length > 0 ? (
                                filteredDrops.map((drop) => (
                                    <DropRow
                                        key={drop.id}
                                        drop={drop}
                                        skins={skins}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-56"
                                    >
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                                                <Package className="size-5 text-muted-foreground" />
                                            </div>

                                            <p className="font-medium">
                                                Дропы не найдены
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {hasFilters
                                                    ? 'Попробуйте изменить параметры поиска или фильтра'
                                                    : 'Создайте свой первый дроп'}
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
    )
}

function DropRow({
    drop,
    skins,
}: {
    drop: Drop
    skins: Skin[]
}) {
    const isDeleted = Boolean(drop.deleted_at)
    const status = getDropStatus(drop)

    const formatDate = (date: string | null) => {
        if (!date) return 'Не указана'

        return new Date(date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <TableRow
            className={`group transition-colors ${isDeleted
                ? 'bg-destructive/[0.03] hover:bg-destructive/[0.06]'
                : 'hover:bg-muted/40'
                }`}
        >
            {/* Дроп */}
            <TableCell className="py-4 pl-6">
                <div className="flex items-center gap-3">
                    {/* <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Package className="size-5 text-muted-foreground" />
                    </div> */}

                    <div className="min-w-0">
                        <p className={`truncate font-medium ${isDeleted ? 'text-muted-foreground' : ''
                            }`}>
                            {drop.name || 'Без названия'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            DROP #{drop.id}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Скин */}
            <TableCell>
                <div className="flex items-center gap-3">
                    {drop.skin?.preview_image ? (
                        <img
                            src={`/storage/${drop.skin.preview_image}`}
                            alt={drop.skin.name}
                            className="size-9 rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
                            <Package className="size-4 text-muted-foreground" />
                        </div>
                    )}

                    <span className="font-medium">
                        {drop.skin?.name ?? 'Неизвестный скин'}
                    </span>
                </div>
            </TableCell>

            {/* Тираж */}
            <TableCell>
                <span className="font-medium tabular-nums">
                    {new Intl.NumberFormat('ru-RU').format(drop.edition_size)} шт.
                </span>
            </TableCell>

            {/* Цена */}
            <TableCell>
                <span className="font-medium tabular-nums">
                    {formatCurrency(Number(drop.price))}
                </span>
            </TableCell>

            {/* Период шитья */}
            <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground" />

                        <span>
                            {formatDate(drop.production_started_at)}
                        </span>
                    </div>

                    <span className="pl-5 text-muted-foreground">
                        до {formatDate(drop.production_completed_at)}
                    </span>
                </div>
            </TableCell>

            {/* Период продаж */}
            <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground" />

                        <span>
                            {formatDate(drop.sale_started_at)}
                        </span>
                    </div>

                    <span className="pl-5 text-muted-foreground">
                        до {formatDate(drop.sale_ended_at)}
                    </span>
                </div>
            </TableCell>

            {/* Статус */}
            <TableCell>
                <DropStatusBadge status={status} />
            </TableCell>

            {/* Действия */}
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

                    <DropdownMenuContent align="end" className="w-52">
                        {!isDeleted && (
                            <>
                                <EditDropDialog
                                    drop={drop}
                                    skins={skins}
                                />

                                <DropdownMenuSeparator />

                                {/* Здесь позже подключим удаление */}
                            </>
                        )}

                        {isDeleted && (
                            <>
                                {/* Здесь позже подключим восстановление */}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow >
    )
}

type DropStatus = 'active' | 'upcoming' | 'completed' | 'draft' | 'deleted'

function getDropStatus(
    drop: Drop,
    now = new Date(),
): DropStatus {
    if (drop.deleted_at) return 'deleted'

    if (!drop.sale_started_at) return 'draft'

    const start = new Date(`${drop.sale_started_at}T00:00:00`)

    if (start > now) return 'upcoming'

    if (drop.sale_ended_at) {
        const end = new Date(`${drop.sale_ended_at}T23:59:59`)

        if (end < now) return 'completed'
    }

    return 'active'
}

function DropStatusBadge({
    status,
}: {
    status: DropStatus
}) {
    const variants: Record<
        DropStatus,
        { label: string; className: string }
    > = {
        active: {
            label: 'В продаже',
            className: 'bg-emerald-500/10 text-emerald-500',
        },
        upcoming: {
            label: 'Ожидается',
            className: 'bg-blue-500/10 text-blue-500',
        },
        completed: {
            label: 'Завершён',
            className: 'bg-orange-500/10 text-orange-500',
        },
        draft: {
            label: 'Не запущен',
            className: 'bg-muted text-muted-foreground',
        },
        deleted: {
            label: 'Удалён',
            className: 'bg-destructive/10 text-destructive',
        },
    }

    const variant = variants[status]

    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${variant.className}`}
        >
            {variant.label}
        </span>
    )
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value)
}

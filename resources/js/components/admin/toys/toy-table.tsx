
import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import {
    ChevronLeft,
    ChevronRight,
    Package,
    Search,
    Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { ToyRow } from '@/components/admin/toys/toy-row'

import type {
    Toy,
    ToyDrop,
    ToyFilters,
    PaginatedToys,
} from '@/components/admin/toys/types'

type ToyTableProps = {
    toys: PaginatedToys
    drops: ToyDrop[]
    filters: ToyFilters
    deletedCount: number
}

export function ToyTable({
    toys,
    drops,
    filters,
    deletedCount,
}: ToyTableProps) {
    const [search, setSearch] = useState(filters.search ?? '')
    const [selectedToy, setSelectedToy] = useState<Toy | null>(null)
    const [processing, setProcessing] = useState(false)

    const deletedView = filters.status === 'deleted'

    // Синхронизация поиска с фильтрами сервера
    useEffect(() => {
        setSearch(filters.search ?? '')
    }, [filters.search])

    // Поиск с задержкой 400 мс
    useEffect(() => {
        const currentSearch = filters.search ?? ''

        if (search.trim() === currentSearch.trim()) return

        const timeout = setTimeout(() => {
            applyFilters({}, search)
        }, 400)

        return () => clearTimeout(timeout)
    }, [search])

    // Применение фильтров
    function applyFilters(
        overrides: Partial<ToyFilters> = {},
        searchValue = search,
    ) {
        const status = overrides.status ?? filters.status ?? 'all'
        const dropId = overrides.drop_id ?? filters.drop_id ?? 'all'

        router.get(
            route('admin.toys.index'),
            {
                search: searchValue.trim() || undefined,
                status,
                drop_id: dropId === 'all' ? undefined : dropId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        )
    }

    // Удаление игрушки
    function handleDelete() {
        if (!selectedToy || processing) return

        setProcessing(true)

        router.delete(
            route('admin.toys.destroy', selectedToy.id),
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false)
                    setSelectedToy(null)
                },
            },
        )
    }

    // Восстановление игрушки
    function handleRestore(toy: Toy) {
        router.post(
            route('admin.toys.restore', toy.id),
            {},
            {
                preserveScroll: true,
            },
        )
    }

    return (
        <>
            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/20 px-6 py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {deletedView ? 'Удалённые игрушки' : 'Все игрушки'}
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {toys.total} записей
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Поиск игрушки..."
                                    className="h-9 pl-9 sm:w-56"
                                />
                            </div>

                            <Select
                                value={String(filters.drop_id ?? 'all')}
                                onValueChange={(value) =>
                                    applyFilters({ drop_id: value })
                                }
                            >
                                <SelectTrigger className="h-9 w-full sm:w-44">
                                    <SelectValue placeholder="Все дропы" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        Все дропы
                                    </SelectItem>

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

                            {!deletedView && (
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        applyFilters({ status: value })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full sm:w-40">
                                        <SelectValue placeholder="Все статусы" />
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
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="text-xs text-muted-foreground">
                            {deletedView
                                ? 'Корзина удалённых экземпляров'
                                : 'Управление экземплярами коллекций'}
                        </div>

                        <Button
                            variant={deletedView ? 'secondary' : 'outline'}
                            size="sm"
                            className="h-8 shrink-0"
                            onClick={() =>
                                applyFilters({
                                    status: deletedView ? 'all' : 'deleted',
                                })
                            }
                        >
                            {deletedView ? (
                                'Все игрушки'
                            ) : (
                                <>
                                    <Trash2 className="mr-2 size-3.5" />
                                    Корзина ({deletedCount})
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                    <TableHead className="h-11 pl-6">
                                        ID
                                    </TableHead>

                                    <TableHead className="h-11">
                                        Игрушка
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

                                    <TableHead className="h-11 pr-6 text-right">
                                        Действия
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {toys.data.length > 0 ? (
                                    toys.data.map((toy) => (
                                        <ToyRow
                                            key={toy.id}
                                            toy={toy}
                                            deletedView={deletedView}
                                            onDelete={setSelectedToy}
                                            onRestore={handleRestore}
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
                                                    Игрушки не найдены
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Попробуйте изменить параметры
                                                    поиска или фильтра.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}

                    <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {toys.total > 0 ? (
                                <>
                                    Показано{' '}
                                    <span className="font-medium text-foreground">
                                        {toys.from}–{toys.to}
                                    </span>{' '}
                                    из{' '}
                                    <span className="font-medium text-foreground">
                                        {toys.total}
                                    </span>
                                </>
                            ) : (
                                'Нет записей'
                            )}
                        </p>

                        <div className="flex items-center gap-1">
                            {toys.links.map((link, index) => {
                                const isPrevious = index === 0
                                const isNext = index === toys.links.length - 1

                                return (
                                    <Button
                                        key={`${index}-${link.label}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={
                                            isPrevious || isNext
                                                ? 'size-8 p-0'
                                                : 'h-8 min-w-8 px-2'
                                        }
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                })
                                            }
                                        }}
                                    >
                                        {isPrevious ? (
                                            <ChevronLeft className="size-4" />
                                        ) : isNext ? (
                                            <ChevronRight className="size-4" />
                                        ) : (
                                            <span>
                                                {link.label
                                                    .replace('&laquo;', '«')
                                                    .replace('&raquo;', '»')}
                                            </span>
                                        )}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete dialog */}

            <Dialog
                open={!!selectedToy}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setSelectedToy(null)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Переместить игрушку в корзину?
                        </DialogTitle>

                        <DialogDescription>
                            Игрушка{' '}
                            <span className="font-medium text-foreground">
                                {selectedToy?.code}
                            </span>{' '}
                            будет перемещена в удалённые. Её можно будет
                            восстановить позже.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={processing}
                            onClick={() => setSelectedToy(null)}
                        >
                            Отмена
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={processing}
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 size-4" />
                            {processing ? 'Удаление...' : 'В корзину'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

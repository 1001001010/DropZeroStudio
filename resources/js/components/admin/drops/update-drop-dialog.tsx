
'use client'

import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { format, parse } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
    CalendarDays,
    Check,
    Loader2,
    Package,
    Pencil,
    X,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import type { Drop, Skin } from '@/types'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'

type Props = {
    drop: Drop
    skins: Skin[]
}

type DropFormData = {
    skin_id: string
    name: string
    edition_size: string
    price: string
    production_started_at: string | null
    production_completed_at: string | null
    sale_started_at: string | null
    sale_ended_at: string | null
}

function normalizeDate(value: string | null | undefined): string {
    if (!value) return ''

    // Laravel может прислать ISO: 2026-10-01T00:00:00.000000Z
    // Нам нужна только дата: 2026-10-01
    return value.slice(0, 10)
}

function parseDate(value: string | null | undefined): Date | undefined {
    const normalized = normalizeDate(value)

    if (!normalized) return undefined

    const parsed = parse(normalized, 'yyyy-MM-dd', new Date())

    return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function formatDate(value: Date | undefined): string {
    return value ? format(value, 'yyyy-MM-dd') : ''
}

function displayDate(value: string | null | undefined): string {
    const normalized = normalizeDate(value)

    if (!normalized) return 'Не выбрано'

    const date = parseDate(normalized)

    return date
        ? format(date, 'dd MMMM yyyy', { locale: ru })
        : 'Не выбрано'
}

function getStatus(drop: Drop) {
    if (!drop.sale_started_at) {
        return {
            label: 'Не запущен',
            className: 'text-muted-foreground bg-muted',
        }
    }

    const now = new Date()
    const start = parseDate(drop.sale_started_at)
    const end = parseDate(drop.sale_ended_at)

    if (start && start > now) {
        return {
            label: 'Ожидается',
            className: 'text-blue-500 bg-blue-500/10',
        }
    }

    if (end) {
        end.setHours(23, 59, 59, 999)

        if (end < now) {
            return {
                label: 'Завершён',
                className: 'text-orange-500 bg-orange-500/10',
            }
        }
    }

    return {
        label: 'В продаже',
        className: 'text-emerald-500 bg-emerald-500/10',
    }
}

export function EditDropDialog({ drop, skins = [] }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const [productionRange, setProductionRange] =
        useState<DateRange | undefined>()

    const [saleRange, setSaleRange] =
        useState<DateRange | undefined>()

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm<DropFormData>({
        skin_id: String(drop.skin_id),
        name: drop.name ?? '',
        edition_size: String(drop.edition_size ?? ''),
        price: String(drop.price ?? ''),
        production_started_at: normalizeDate(drop.production_started_at) || null,
        production_completed_at: normalizeDate(drop.production_completed_at) || null,
        sale_started_at: normalizeDate(drop.sale_started_at) || null,
        sale_ended_at: normalizeDate(drop.sale_ended_at) || null,
    })

    useEffect(() => {
        if (!isOpen) return

        setData({
            skin_id: String(drop.skin_id),
            name: drop.name ?? '',
            edition_size: String(drop.edition_size ?? ''),
            price: String(drop.price ?? ''),
            production_started_at: normalizeDate(drop.production_started_at) || null,
            production_completed_at: normalizeDate(drop.production_completed_at) || null,
            sale_started_at: normalizeDate(drop.sale_started_at) || null,
            sale_ended_at: normalizeDate(drop.sale_ended_at) || null,
        })

        setProductionRange({
            from: parseDate(drop.production_started_at),
            to: parseDate(drop.production_completed_at),
        })

        setSaleRange({
            from: parseDate(drop.sale_started_at),
            to: parseDate(drop.sale_ended_at),
        })
    }, [isOpen, drop])

    const handleProductionChange = (range: DateRange | undefined) => {
        setProductionRange(range)

        setData('production_started_at', formatDate(range?.from) || null)
        setData('production_completed_at', formatDate(range?.to) || null)
    }

    const handleSaleChange = (range: DateRange | undefined) => {
        setSaleRange(range)

        setData('sale_started_at', formatDate(range?.from) || null)
        setData('sale_ended_at', formatDate(range?.to) || null)
    }

    const handleOpenChange = (open: boolean) => {
        if (processing) return
        setIsOpen(open)
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        put(route('admin.drops.update', drop.id), {
            onSuccess: () => {
                setIsOpen(false)
            },
        })
    }

    const status = getStatus(drop)

    return (
        <>
            <DropdownMenuItem
                onSelect={(event) => {
                    event.preventDefault()
                    setIsOpen(true)
                }}
            >
                <Pencil className="mr-2 size-4" />
                Редактировать
            </DropdownMenuItem>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[760px]">
                    <DialogHeader className="border-b px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Package className="size-5 text-primary" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-lg">
                                    Редактирование дропа
                                </DialogTitle>

                                <DialogDescription className="mt-1">
                                    Изменение «{drop.name}» · DROP #{drop.id}
                                </DialogDescription>
                            </div>

                            <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${status.className}`}>
                                {status.label}
                            </span>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 px-6 py-6">
                            {/* Основная информация */}
                            <section className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Основная информация
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Скин, название и параметры тиража.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Скин</Label>

                                    <Select
                                        value={data.skin_id}
                                        onValueChange={(value) =>
                                            setData('skin_id', value)
                                        }
                                        disabled={processing}
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

                                    {errors.skin_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.skin_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`edit-drop-name-${drop.id}`}>
                                        Название дропа
                                    </Label>

                                    <Input
                                        id={`edit-drop-name-${drop.id}`}
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        disabled={processing}
                                    />

                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Размер тиража</Label>

                                        <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.edition_size}
                                            onChange={(event) =>
                                                setData('edition_size', event.target.value)
                                            }
                                            disabled={processing}
                                        />

                                        {errors.edition_size && (
                                            <p className="text-xs text-destructive">
                                                {errors.edition_size}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Цена</Label>

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(event) =>
                                                setData('price', event.target.value)
                                            }
                                            disabled={processing}
                                        />

                                        {errors.price && (
                                            <p className="text-xs text-destructive">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-border" />

                            {/* Производство */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                        <CalendarDays className="size-4 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Производство
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Период изготовления фигурок.
                                        </p>
                                    </div>
                                </div>

                                <Calendar
                                    mode="range"
                                    locale={ru}
                                    selected={productionRange}
                                    onSelect={handleProductionChange}
                                    defaultMonth={productionRange?.from}
                                    numberOfMonths={2}
                                    className="w-full rounded-lg border"
                                    disabled={processing}
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Начало производства
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {displayDate(data.production_started_at)}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Окончание производства
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {displayDate(data.production_completed_at)}
                                        </p>
                                    </div>
                                </div>

                                {(errors.production_started_at || errors.production_completed_at) && (
                                    <p className="text-xs text-destructive">
                                        {errors.production_started_at || errors.production_completed_at}
                                    </p>
                                )}
                            </section>

                            <div className="h-px bg-border" />

                            {/* Продажи */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                        <CalendarDays className="size-4 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Продажи
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Период доступности дропа для покупки.
                                        </p>
                                    </div>
                                </div>

                                <Calendar
                                    mode="range"
                                    locale={ru}
                                    selected={saleRange}
                                    onSelect={handleSaleChange}
                                    defaultMonth={saleRange?.from}
                                    numberOfMonths={2}
                                    className="w-full rounded-lg border"
                                    disabled={processing}
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Начало продаж
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {displayDate(data.sale_started_at)}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Окончание продаж
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {displayDate(data.sale_ended_at)}
                                        </p>
                                    </div>
                                </div>

                                {(errors.sale_started_at || errors.sale_ended_at) && (
                                    <p className="text-xs text-destructive">
                                        {errors.sale_started_at || errors.sale_ended_at}
                                    </p>
                                )}
                            </section>

                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="text-sm font-medium">
                                    Статус дропа обновляется автоматически
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Он зависит от дат начала и окончания продаж.
                                    Чтобы изменить статус, поменяйте период продаж.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={processing}
                            >
                                <X className="mr-2 size-4" />
                                Отмена
                            </Button>

                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 size-4" />
                                        Сохранить изменения
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

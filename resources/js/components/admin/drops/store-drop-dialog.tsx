'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import {
    Check,
    Loader2,
    PackagePlus,
    X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

type Skin = {
    id: number
    name: string
}

type DropFormData = {
    skin_id: string
    name: string
    edition_size: string
    price: string
    production_started_at: string
    production_completed_at: string
    sale_started_at: string
    sale_ended_at: string
}

type StoreDropDialogProps = {
    skins: Skin[]
}

const initialData: DropFormData = {
    skin_id: '',
    name: '',
    edition_size: '',
    price: '',
    production_started_at: '',
    production_completed_at: '',
    sale_started_at: '',
    sale_ended_at: '',
}

export default function StoreDropDialog({
    skins,
}: StoreDropDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<DropFormData>(initialData)

    const resetDropForm = () => {
        reset()
        setDateRangeProduction(undefined)
        setDateRangeSale(undefined)
    }

    // Закрытие и очистка формы.
    const handleClose = () => {
        if (processing) return

        setIsOpen(false)
        resetDropForm()
    }

    const handleProductionRangeChange = (range: DateRange | undefined) => {
        setDateRangeProduction(range)

        setData('production_started_at', range?.from
            ? format(range.from, 'yyyy-MM-dd')
            : ''
        )

        setData('production_completed_at', range?.to
            ? format(range.to, 'yyyy-MM-dd')
            : ''
        )
    }

    const handleSaleRangeChange = (range: DateRange | undefined) => {
        setDateRangeSale(range)

        setData('sale_started_at', range?.from
            ? format(range.from, 'yyyy-MM-dd')
            : ''
        )

        setData('sale_ended_at', range?.to
            ? format(range.to, 'yyyy-MM-dd')
            : ''
        )
    }

    // Отправка формы.
    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        post(route('admin.drops.store'), {
            onSuccess: () => {
                setIsOpen(false)
                reset()
            },
        })
    }

    // Изменение состояния диалога.
    const handleOpenChange = (open: boolean) => {
        if (processing) return

        setIsOpen(open)

        if (!open) {
            resetDropForm()
        }
    }

    const canSubmit = Boolean(
        data.skin_id &&
        data.name.trim() &&
        data.edition_size &&
        data.price !== '' &&
        data.production_started_at &&
        data.production_completed_at &&
        data.sale_started_at &&
        data.sale_ended_at
    )

    const [dateRangeProduction, setDateRangeProduction] =
        useState<DateRange | undefined>()

    const [dateRangeSale, setDateRangeSale] =
        useState<DateRange | undefined>()

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                >
                    <PackagePlus data-icon="inline-start" />
                    Новый дроп
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[680px]">
                <DialogHeader>
                    <DialogTitle>
                        Создание нового дропа
                    </DialogTitle>

                    <DialogDescription>
                        Укажите скин, тираж, цену и даты
                        производства и продаж.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6"
                >
                    {/* Основная информация */}
                    <section className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Основная информация
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Выберите скин и задайте параметры тиража.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Скин */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="drop-skin">
                                    Скин
                                </Label>

                                <Select
                                    value={data.skin_id}
                                    onValueChange={(value) =>
                                        setData('skin_id', value)
                                    }
                                >
                                    <SelectTrigger id="drop-skin">
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
                                    <p className="text-sm text-destructive">
                                        {errors.skin_id}
                                    </p>
                                )}
                            </div>

                            {/* Название */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="drop-name">
                                    Название дропа
                                </Label>

                                <Input
                                    id="drop-name"
                                    placeholder="Например, Cyber Samurai — Limited Drop"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    autoComplete="off"
                                />

                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Размер тиража */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edition-size">
                                    Размер тиража
                                </Label>

                                <Input
                                    id="edition-size"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="100"
                                    value={data.edition_size}
                                    onChange={(event) =>
                                        setData('edition_size', event.target.value)
                                    }
                                />

                                {errors.edition_size && (
                                    <p className="text-sm text-destructive">
                                        {errors.edition_size}
                                    </p>
                                )}
                            </div>

                            {/* Цена */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="drop-price">
                                    Цена
                                </Label>

                                <Input
                                    id="drop-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="149.00"
                                    value={data.price}
                                    onChange={(event) =>
                                        setData('price', event.target.value)
                                    }
                                />

                                {errors.price && (
                                    <p className="text-sm text-destructive">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Производство */}
                    <section className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Производство
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Укажите сроки производства фигурок.
                            </p>
                        </div>

                        <Calendar
                            mode="range"
                            defaultMonth={new Date()}
                            selected={dateRangeProduction}
                            onSelect={handleProductionRangeChange}
                            numberOfMonths={2}
                            className="w-full rounded-lg border"
                        />
                    </section>

                    {/* Продажи */}
                    <section className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Продажи
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Укажите период доступности дропа для покупки.
                            </p>
                        </div>

                        <Calendar
                            mode="range"
                            defaultMonth={new Date()}
                            selected={dateRangeSale}
                            onSelect={handleSaleRangeChange}
                            numberOfMonths={2}
                            className="w-full rounded-lg border"
                        />
                    </section>

                    {/* Кнопки */}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            <X data-icon="inline-start" />
                            Отмена
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing || !canSubmit}
                        >
                            {processing ? (
                                <>
                                    <Loader2
                                        className="animate-spin"
                                        data-icon="inline-start"
                                    />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Check data-icon="inline-start" />
                                    Создать дроп
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState } from 'react'
import { Check, ShoppingCart, Shield, Star, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/countdown-timer'

type PreorderPanelProps = {
    dropName: string
    price: string
    slots: number
    taken: number
    releaseDate: string
}

export function PreorderPanel({
    dropName,
    price,
    slots,
    taken,
    releaseDate,
}: PreorderPanelProps) {
    const [reserved, setReserved] = useState(false)

    const percent = Math.round((taken / slots) * 100)
    const left = slots - taken

    const guarantees = [
        { icon: Shield, label: 'Гарантия доставки' },
        { icon: Star, label: 'Лимитированный тираж' },
        { icon: FileCheck, label: 'Сертификат подлинности' },
    ]

    return (
        <section className="border border-border bg-card">
            <div className="flex flex-col gap-10 p-6 md:p-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse bg-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                            Следующий дроп
                        </span>
                    </div>
                    <h2 className="text-3xl font-semibold uppercase leading-none tracking-tight md:text-4xl">
                        {dropName}
                    </h2>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                            До релиза
                        </span>
                        <CountdownTimer targetDate={releaseDate} />
                    </div>

                    <div className="flex w-full max-w-sm flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                                    Слоты предзаказа
                                </span>
                                <span className="font-mono text-xs tabular-nums text-foreground">
                                    {taken}/{slots}
                                </span>
                            </div>

                            <div
                                className="h-1.5 w-full bg-muted"
                                role="progressbar"
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="Заполнение предзаказа"
                            >
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                Осталось {left} слотов
                            </span>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                                    Цена
                                </span>
                                <span className="font-mono text-2xl leading-none text-foreground">
                                    {price}
                                </span>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => setReserved(!reserved)}
                                variant={reserved ? 'secondary' : 'default'}
                                className="h-12 flex-1 gap-2 rounded-none font-mono text-[11px] uppercase tracking-[0.2em]"
                            >
                                {reserved ? (
                                    <>
                                        <Check className="h-4 w-4 text-primary" />
                                        Забронировано
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        Предзаказ
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-px border-t border-border pt-6">
                    {guarantees.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-2 pr-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                        >
                            <item.icon className="h-3.5 w-3.5 text-primary" />
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

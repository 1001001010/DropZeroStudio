'use client'

import { useEffect, useState } from 'react'

type CountdownTimerProps = {
    targetDate: string
}

function diff(target: number) {
    const total = Math.max(0, target - Date.now())
    return {
        days: Math.floor(total / 86_400_000),
        hours: Math.floor((total / 3_600_000) % 24),
        minutes: Math.floor((total / 60_000) % 60),
        seconds: Math.floor((total / 1000) % 60),
    }
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
    const target = new Date(targetDate).getTime()
    const [time, setTime] = useState(() => diff(target))

    useEffect(() => {
        const id = setInterval(() => setTime(diff(target)), 1000)
        return () => clearInterval(id)
    }, [target])

    const units = [
        { label: 'дней', value: time.days },
        { label: 'часов', value: time.hours },
        { label: 'минут', value: time.minutes },
        { label: 'секунд', value: time.seconds },
    ]

    return (
        <div className="flex items-stretch gap-px bg-border">
            {units.map((unit) => (
                <div
                    key={unit.label}
                    className="flex min-w-[72px] flex-col items-center gap-1 bg-card px-3 py-3"
                >
                    <span className="font-mono text-2xl tabular-nums leading-none text-foreground">
                        {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {unit.label}
                    </span>
                </div>
            ))}
        </div>
    )
}

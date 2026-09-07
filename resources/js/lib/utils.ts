import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Drop, DropStatus } from "@/types/index"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price)
}

export function formatDate(date: string | null) {
    if (!date) {
        return "—"
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
        return "—"
    }

    return new Intl.DateTimeFormat("ru-RU").format(parsedDate)
}

export function getStatus(drop: Drop): DropStatus {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    if (
        drop.sale_ended_at &&
        new Date(`${drop.sale_ended_at}T00:00:00`) < today
    ) {
        return "ended"
    }

    if (
        drop.sale_started_at &&
        new Date(`${drop.sale_started_at}T00:00:00`) <= today
    ) {
        return "active"
    }

    if (
        drop.production_started_at &&
        !drop.production_completed_at
    ) {
        return "production"
    }

    if (
        drop.production_completed_at &&
        !drop.sale_started_at
    ) {
        return "ready"
    }

    return "planned"
}

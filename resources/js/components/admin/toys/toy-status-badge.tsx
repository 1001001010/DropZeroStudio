import type { ToyStatus } from '@/components/admin/toys/types'

type Props = {
    status: ToyStatus
}

const variants: Record<
    ToyStatus,
    { label: string; className: string }
> = {
    produced: {
        label: 'Изготовлена',
        className: 'bg-orange-500/10 text-orange-500',
    },
    available: {
        label: 'Доступна',
        className: 'bg-emerald-500/10 text-emerald-500',
    },
    sold: {
        label: 'Продана',
        className: 'bg-violet-500/10 text-violet-500',
    },
}

export function ToyStatusBadge({ status }: Props) {
    const variant = variants[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${variant.className}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {variant.label}
        </span>
    )
}

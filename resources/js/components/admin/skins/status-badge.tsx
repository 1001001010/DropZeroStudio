import { Badge } from "@/components/ui/badge"

const statuses = {
    active: {
        label: "Активна",
        className:
            "border-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10",
        dot: "bg-emerald-500",
    },

    inactive: {
        label: "Неактивна",
        className:
            "border-0 bg-muted text-muted-foreground hover:bg-muted",
        dot: "bg-muted-foreground",
    },
}


export function StatusBadge({
    isActive,
}: {
    isActive: boolean
}) {

    const current = isActive
        ? statuses.active
        : statuses.inactive

    return (
        <Badge
            className={`gap-1.5 ${current.className}`}
        >
            <span
                className={`size-1.5 rounded-full ${current.dot}`}
            />

            {current.label}
        </Badge>
    )
}

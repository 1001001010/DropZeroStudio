import {
    Search,
    XCircle,
} from 'lucide-react'

import { Input } from '@/components/ui/input'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type Props = {
    search: string
    status: string
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
}

export function SkinsFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Поиск скина..."
                    className="h-9 w-full pl-9 pr-9 sm:w-[250px]"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <XCircle className="size-4" />
                    </button>
                )}
            </div>

            <Select
                value={status}
                onValueChange={onStatusChange}
            >
                <SelectTrigger className="h-9 w-full sm:w-[175px]">
                    <SelectValue placeholder="Статус" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="all">
                        Все скины
                    </SelectItem>

                    <SelectItem value="active">
                        Активные
                    </SelectItem>

                    <SelectItem value="inactive">
                        Неактивные
                    </SelectItem>

                    <SelectItem value="deleted">
                        Удалённые
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

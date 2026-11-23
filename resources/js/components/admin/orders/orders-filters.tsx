
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

import type { OrderStatus } from '@/types'

/**
 * Свойства фильтров заказов.
 */
interface OrdersFiltersProps {
    search: string
    status: OrderStatus | 'all'
    onSearchChange: (value: string) => void
    onStatusChange: (value: OrderStatus | 'all') => void
}

/**
 * Фильтры таблицы заказов.
 */
export function OrdersFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: OrdersFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            {/* Поиск */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Поиск заказа..."
                    className="h-9 w-full pl-9 pr-9 sm:w-[250px]"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        aria-label="Очистить поиск"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <XCircle className="size-4" />
                    </button>
                )}
            </div>

            {/* Фильтр по статусу */}
            <Select
                value={status}
                onValueChange={onStatusChange}
            >
                <SelectTrigger className="h-9 w-full sm:w-[190px]">
                    <SelectValue placeholder="Статус заказа" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="all">
                        Все заказы
                    </SelectItem>

                    <SelectItem value="pending">
                        Ожидают обработки
                    </SelectItem>

                    <SelectItem value="accepted">
                        Приняты
                    </SelectItem>

                    <SelectItem value="shipped">
                        Отправлены
                    </SelectItem>

                    <SelectItem value="completed">
                        Завершённые
                    </SelectItem>

                    <SelectItem value="cancelled">
                        Отменённые
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

import { MoreHorizontal, CircleUserRound, Package, Trash2, ArchiveRestore } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    TableCell,
    TableRow,
} from '@/components/ui/table'

import { ToyStatusBadge } from '@/components/admin/toys/toy-status-badge'

import type { Toy } from '@/components/admin/toys/types'

type ToyRowProps = {
    toy: Toy
    deletedView: boolean
    onDelete: (toy: Toy) => void
    onRestore: (toy: Toy) => void
}

function formatDate(date: string | null) {
    if (!date) return '—'

    const parsed = new Date(date.replace(' ', 'T'))

    if (Number.isNaN(parsed.getTime())) return '—'

    return parsed.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function ToyRow({
    toy,
    deletedView,
    onDelete,
    onRestore,
}: ToyRowProps) {
    return (
        <TableRow
            className={`group transition-colors ${deletedView
                    ? 'bg-destructive/[0.03] hover:bg-destructive/[0.06]'
                    : 'hover:bg-muted/40'
                }`}
        >
            <TableCell className="py-4 pl-6">
                <span className="font-mono text-xs text-muted-foreground">
                    #{toy.id}
                </span>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Package className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-medium">
                            {toy.dropName}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {toy.skinName || `Экземпляр №${toy.number}`}
                        </p>
                    </div>
                </div>
            </TableCell>

            <TableCell>
                <code className="rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium">
                    {toy.code}
                </code>
            </TableCell>

            <TableCell>
                {toy.userId ? (
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                            <CircleUserRound className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                            <p className="max-w-36 truncate text-sm font-medium">
                                {toy.userName || `Пользователь #${toy.userId}`}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                ID: {toy.userId}
                            </p>
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        Не назначен
                    </span>
                )}
            </TableCell>

            <TableCell>
                {deletedView ? (
                    <span className="inline-flex rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                        Удалена
                    </span>
                ) : (
                    <ToyStatusBadge status={toy.status} />
                )}
            </TableCell>

            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {formatDate(toy.claimedAt)}
                </span>
            </TableCell>

            <TableCell className="pr-6 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-60 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        {deletedView ? (
                            <DropdownMenuItem
                                onSelect={() => onRestore(toy)}
                            >
                                <ArchiveRestore className="mr-2 size-4" />
                                Восстановить
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => onDelete(toy)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                В корзину
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

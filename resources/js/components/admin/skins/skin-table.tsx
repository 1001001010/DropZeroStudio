import {
    MoreHorizontal,
    Package,
    Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { StatusBadge } from '@/components/admin/skins/status-badge'
import { SkinsFilters } from '@/components/admin/skins/skin-filters'
import { DeleteSkinDialog } from '@/components/admin/skins/delete-skin-dialog'
import { RestoreSkinDialog } from '@/components/admin/skins/restore-skin-dialog'
import { EditSkinDialog } from '@/components/admin/skins/update-skin-dialog'

import type { Skin } from '@/types/index'

export function SkinTable({
    skins,
}: {
    skins: Skin[]
}) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Проверяем, есть ли дропы у скинов
    const hasDrops = skins.some(
        (skin) => skin.drop && skin.drop.length > 0,
    )

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Все скины
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {skins.length} скинов
                        </p>
                    </div>

                    <SkinsFilters
                        search={search}
                        status={statusFilter}
                        onSearchChange={setSearch}
                        onStatusChange={setStatusFilter}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableHead className="h-11 pl-6">
                                    Скин
                                </TableHead>

                                <TableHead className="h-11">
                                    Описание
                                </TableHead>

                                <TableHead className="h-11">
                                    Цветовая палитра
                                </TableHead>

                                <TableHead className="h-11">
                                    Статус
                                </TableHead>

                                <TableHead className="h-11">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {skins.length > 0 ? (
                                skins.map((skin) => (
                                    <SkinRow
                                        key={skin.id}
                                        skin={skin}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-56"
                                    >
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                                                <Package className="size-5 text-muted-foreground" />
                                            </div>

                                            <p className="font-medium">
                                                Нет доступных скинов
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {hasDrops
                                                    ? 'Все скины были удалены или отфильтрованы'
                                                    : 'Добавьте первый скин'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function SkinRow({
    skin,
}: {
    skin: Skin
}) {
    const isDeleted = Boolean(skin.deleted_at)

    return (
        <TableRow
            className={`
                group transition-colors
                ${isDeleted
                    ? 'bg-destructive/[0.03] hover:bg-destructive/[0.06]'
                    : 'hover:bg-muted/40'
                }
            `}
        >
            {/* Скин */}
            <TableCell className="py-4 pl-6">
                <div className="flex items-center gap-3">
                    <div
                        className={`
                            flex size-11 shrink-0 items-center justify-center
                            overflow-hidden rounded-xl border
                            ${isDeleted
                                ? 'border-destructive/20 bg-destructive/5'
                                : 'bg-muted/40'
                            }
                        `}
                    >
                        {skin.preview_image ? (
                            <img
                                src={`/storage/${skin.preview_image}`}
                                alt={skin.name}
                                className={`
                                    size-full object-cover
                                    ${isDeleted ? 'grayscale opacity-60' : ''}
                                `}
                            />
                        ) : (
                            <Package
                                className={`
                                    size-5
                                    ${isDeleted
                                        ? 'text-destructive/50'
                                        : 'text-muted-foreground'
                                    }
                                `}
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p
                                className={`
                                    truncate font-medium
                                    ${isDeleted
                                        ? 'text-muted-foreground'
                                        : ''
                                    }
                                `}
                            >
                                {skin.name || 'Без названия'}
                            </p>

                            {isDeleted && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                    <Trash2 className="size-3" />
                                    В корзине
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {skin.slug || 'Скин без названия'} · ID #{skin.id}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Описание */}
            <TableCell>
                <p
                    className={`
                        max-w-[300px] truncate font-medium
                        ${isDeleted
                            ? 'text-muted-foreground'
                            : ''
                        }
                    `}
                >
                    {skin.description || '—'}
                </p>
            </TableCell>

            {/* Цвета */}
            <TableCell>
                <div
                    className={
                        isDeleted
                            ? 'flex items-center opacity-50 grayscale'
                            : 'flex items-center'
                    }
                >
                    {/* Основной */}
                    <div
                        className="relative z-30 size-8 shrink-0 rounded-full border-2 border-background ring-1 ring-border shadow-sm transition-all duration-200 hover:z-40 hover:scale-110"
                        style={{
                            backgroundColor:
                                skin.primary_color || '#ffffff',
                        }}
                        title={`Основной: ${skin.primary_color ?? '—'
                            }`}
                    />

                    {/* Вторичный */}
                    <div
                        className="relative z-20 -ml-2 size-8 shrink-0 rounded-full border-2 border-background ring-1 ring-border shadow-sm transition-all duration-200 hover:z-40 hover:scale-110"
                        style={{
                            backgroundColor:
                                skin.secondary_color || '#ffffff',
                        }}
                        title={`Вторичный: ${skin.secondary_color ?? '—'
                            }`}
                    />

                    {/* Акцентный */}
                    <div
                        className="relative z-10 -ml-2 size-8 shrink-0 rounded-full border-2 border-background ring-1 ring-border shadow-sm transition-all duration-200 hover:z-40 hover:scale-110"
                        style={{
                            backgroundColor:
                                skin.accent_color || '#ffffff',
                        }}
                        title={`Акцентный: ${skin.accent_color ?? '—'
                            }`}
                    />
                </div>
            </TableCell>

            {/* Статус */}
            <TableCell>
                {isDeleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                        <Trash2 className="size-3.5" />
                        Удалён
                    </span>
                ) : (
                    <StatusBadge isActive={skin.is_active} />
                )}
            </TableCell>

            {/* Действия */}
            <TableCell className="pr-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`
                                size-8 opacity-60
                                transition-opacity
                                hover:opacity-100
                                group-hover:opacity-100
                                ${isDeleted
                                    ? 'text-destructive hover:text-destructive'
                                    : ''
                                }
                            `}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-48"
                    >
                        {isDeleted ? (
                            <RestoreSkinDialog skin={skin} />
                        ) : (
                            <>
                                <EditSkinDialog skin={skin} />

                                <DropdownMenuSeparator />

                                <DeleteSkinDialog skin={skin} />
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

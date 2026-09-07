'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from '@inertiajs/react'
import {
    Check,
    FileBox,
    Image as ImageIcon,
    Loader2,
    Pencil,
    Upload,
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
} from '@/components/ui/dialog'
import {
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { Skin } from '@/types'

export function EditSkinDialog({
    skin,
}: {
    skin: Skin
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<{
        _method: string
        name: string
        slug: string
        description: string
        model_path: File | null
        primary_color: string
        secondary_color: string
        accent_color: string
        preview_image: File | null
        is_active: boolean
    }>({
        _method: 'post',
        name: skin.name ?? '',
        slug: skin.slug ?? '',
        description: skin.description ?? '',
        model_path: null,
        primary_color: skin.primary_color ?? '#000000',
        secondary_color: skin.secondary_color ?? '#ffffff',
        accent_color: skin.accent_color ?? '#6366f1',
        preview_image: null,
        is_active: Boolean(skin.is_active),
    })

    /**
     * Генерирует slug из названия скина.
     */
    const generateSlug = (value: string): string => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9а-яё-]/gi, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    /**
     * Синхронизирует форму с текущим скином
     * при открытии диалога.
     */
    useEffect(() => {
        if (!isOpen) {
            return
        }

        setData('name', skin.name ?? '')
        setData('slug', skin.slug ?? '')
        setData('description', skin.description ?? '')
        setData('model_path', null)
        setData(
            'primary_color',
            skin.primary_color ?? '#000000',
        )
        setData(
            'secondary_color',
            skin.secondary_color ?? '#ffffff',
        )
        setData(
            'accent_color',
            skin.accent_color ?? '#6366f1',
        )
        setData('preview_image', null)
        setData('is_active', Boolean(skin.is_active))
        setData('_method', 'post')

        setPreviewUrl(null)
    }, [isOpen, skin])

    /**
     * Обрабатывает изменение названия.
     */
    const handleNameChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value

        setData('name', value)
        setData('slug', generateSlug(value))
    }

    /**
     * Обрабатывает выбор нового изображения.
     */
    const handlePreviewChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0] ?? null

        setData('preview_image', file)

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }

        if (file) {
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            setPreviewUrl(null)
        }
    }

    /**
     * Обрабатывает выбор новой 3D-модели.
     */
    const handleModelChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0] ?? null

        setData('model_path', file)
    }

    /**
     * Закрывает диалог.
     */
    const handleOpenChange = (open: boolean) => {
        if (processing) {
            return
        }

        setIsOpen(open)

        if (!open && previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }

    /**
     * Отправляет форму редактирования.
     */
    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        post(
            route('admin.skins.update', skin.id),
            {
                forceFormData: true,

                onSuccess: () => {
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                    }

                    setPreviewUrl(null)
                    setIsOpen(false)
                },
            },
        )
    }

    const existingPreviewUrl = skin.preview_image
        ? `/storage/${skin.preview_image}`
        : null

    const currentPreviewUrl =
        previewUrl ?? existingPreviewUrl

    const currentModelName = skin.model_path
        ? skin.model_path.split('/').pop()
        : null

    return (
        <>
            <DropdownMenuItem
                onSelect={(event) => {
                    event.preventDefault()
                    setIsOpen(true)
                }}
            >
                <Pencil className="mr-2 size-4" />
                Редактировать
            </DropdownMenuItem>

            <Dialog
                open={isOpen}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[760px]">
                    {/* Header */}
                    <DialogHeader className="border-b px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Pencil className="size-5 text-primary" />
                            </div>

                            <div className="min-w-0">
                                <DialogTitle className="text-lg">
                                    Редактирование скина
                                </DialogTitle>

                                <DialogDescription className="mt-1 truncate">
                                    Изменение «{skin.name}»
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 px-6 py-6">
                            {/* Preview + basic information */}
                            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                                {/* Preview */}
                                <div className="space-y-3">
                                    <Label>
                                        Превью
                                    </Label>

                                    <div className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted/30">
                                        {currentPreviewUrl ? (
                                            <>
                                                <img
                                                    src={
                                                        currentPreviewUrl
                                                    }
                                                    alt={
                                                        data.name
                                                    }
                                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {data.name ||
                                                            'Без названия'}
                                                    </p>
                                                </div>

                                                {previewUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        className="absolute right-2 top-2 size-8 shadow-md"
                                                        onClick={() => {
                                                            URL.revokeObjectURL(
                                                                previewUrl,
                                                            )

                                                            setPreviewUrl(
                                                                null,
                                                            )

                                                            setData(
                                                                'preview_image',
                                                                null,
                                                            )
                                                        }}
                                                        disabled={
                                                            processing
                                                        }
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                                                    <ImageIcon className="size-6" />
                                                </div>

                                                <span className="text-xs">
                                                    Нет изображения
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <label
                                        htmlFor={`edit-preview-${skin.id}`}
                                        className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <Upload className="size-4" />

                                        Заменить изображение

                                        <Input
                                            id={`edit-preview-${skin.id}`}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handlePreviewChange
                                            }
                                            disabled={processing}
                                            className="hidden"
                                        />
                                    </label>

                                    {errors.preview_image && (
                                        <p className="text-xs text-destructive">
                                            {
                                                errors.preview_image
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Basic information */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Основная информация
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Название и идентификатор
                                            раскраски.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`edit-name-${skin.id}`}
                                        >
                                            Название
                                        </Label>

                                        <Input
                                            id={`edit-name-${skin.id}`}
                                            value={data.name}
                                            onChange={
                                                handleNameChange
                                            }
                                            placeholder="Например: Crimson Storm"
                                            disabled={
                                                processing
                                            }
                                        />

                                        {errors.name && (
                                            <p className="text-xs text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`edit-slug-${skin.id}`}
                                        >
                                            Slug
                                        </Label>

                                        <Input
                                            id={`edit-slug-${skin.id}`}
                                            value={data.slug}
                                            onChange={(event) =>
                                                setData(
                                                    'slug',
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            placeholder="crimson-storm"
                                            disabled={
                                                processing
                                            }
                                        />

                                        {errors.slug && (
                                            <p className="text-xs text-destructive">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`edit-description-${skin.id}`}
                                        >
                                            Описание
                                        </Label>

                                        <Textarea
                                            id={`edit-description-${skin.id}`}
                                            value={
                                                data.description
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'description',
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            placeholder="Краткое описание раскраски..."
                                            rows={3}
                                            disabled={
                                                processing
                                            }
                                            className="resize-none"
                                        />

                                        {errors.description && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    errors.description
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border" />

                            {/* Files */}
                            <section className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Файлы модели
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Оставь поле пустым, если текущий
                                        файл менять не нужно.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {/* Current model */}
                                    <div className="rounded-xl border bg-muted/20 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
                                                <FileBox className="size-5 text-muted-foreground" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Текущая 3D-модель
                                                </p>

                                                <p className="mt-1 truncate text-sm font-medium">
                                                    {currentModelName ??
                                                        'Файл отсутствует'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New model */}
                                    <label
                                        htmlFor={`edit-model-${skin.id}`}
                                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Upload className="size-5 text-primary" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {data.model_path
                                                    ? 'Новый файл'
                                                    : 'Заменить модель'}
                                            </p>

                                            <p className="mt-1 truncate text-sm font-medium">
                                                {data.model_path
                                                    ? data.model_path
                                                        .name
                                                    : 'Выберите файл'}
                                            </p>
                                        </div>

                                        <Input
                                            id={`edit-model-${skin.id}`}
                                            type="file"
                                            accept=".glb,.gltf,.obj,.fbx,.blend"
                                            onChange={
                                                handleModelChange
                                            }
                                            disabled={
                                                processing
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {errors.model_path && (
                                    <p className="text-xs text-destructive">
                                        {errors.model_path}
                                    </p>
                                )}

                                {data.model_path && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'model_path',
                                                null,
                                            )
                                        }
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <X className="size-3.5" />

                                        Отменить замену модели
                                    </button>
                                )}
                            </section>

                            {/* Colors */}
                            <section className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Цветовая схема
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Цвета, используемые в оформлении
                                        раскраски.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[
                                        {
                                            key: 'primary_color' as const,
                                            label: 'Основной',
                                        },
                                        {
                                            key: 'secondary_color' as const,
                                            label: 'Дополнительный',
                                        },
                                        {
                                            key: 'accent_color' as const,
                                            label: 'Акцентный',
                                        },
                                    ].map((color) => (
                                        <div
                                            key={color.key}
                                            className="rounded-xl border bg-muted/20 p-3"
                                        >
                                            <Label
                                                htmlFor={`edit-${color.key}-${skin.id}`}
                                                className="mb-2 block text-xs"
                                            >
                                                {color.label}
                                            </Label>

                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`edit-${color.key}-${skin.id}`}
                                                    type="color"
                                                    value={
                                                        data[
                                                        color
                                                            .key
                                                        ]
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        setData(
                                                            color.key,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                    className="size-10 w-10 shrink-0 cursor-pointer rounded-lg p-1"
                                                />

                                                <Input
                                                    value={
                                                        data[
                                                        color
                                                            .key
                                                        ]
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        setData(
                                                            color.key,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                    className="font-mono text-xs uppercase"
                                                />
                                            </div>

                                            {errors[
                                                color.key
                                            ] && (
                                                    <p className="mt-2 text-xs text-destructive">
                                                        {
                                                            errors[
                                                            color
                                                                .key
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Status */}
                            <section>
                                <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex size-10 items-center justify-center rounded-lg ${data.is_active
                                                ? 'bg-emerald-500/10'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <span
                                                className={`size-2.5 rounded-full ${data.is_active
                                                    ? 'bg-emerald-500'
                                                    : 'bg-muted-foreground'
                                                    }`}
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`edit-active-${skin.id}`}
                                                className="cursor-pointer text-sm font-medium"
                                            >
                                                Скин активен
                                            </Label>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {data.is_active
                                                    ? 'Раскраска доступна в каталоге'
                                                    : 'Раскраска скрыта из каталога'}
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        id={`edit-active-${skin.id}`}
                                        checked={
                                            data.is_active
                                        }
                                        onCheckedChange={(
                                            checked,
                                        ) =>
                                            setData(
                                                'is_active',
                                                checked,
                                            )
                                        }
                                        disabled={processing}
                                    />
                                </div>

                                {errors.is_active && (
                                    <p className="mt-2 text-xs text-destructive">
                                        {errors.is_active}
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    handleOpenChange(
                                        false,
                                    )
                                }
                                disabled={processing}
                            >
                                Отмена
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 size-4" />
                                        Сохранить изменения
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

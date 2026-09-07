'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

import {
    Box,
    Check,
    FileBox,
    Image as ImageIcon,
    Loader2,
    X,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { useForm } from '@inertiajs/react'

export default function StoreSkinDialog() {
    const [isOpen, setIsOpen] = useState(false)

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<{
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
        name: '',
        slug: '',
        description: '',
        model_path: null,
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#6366f1',
        preview_image: null,
        is_active: true,
    })

    /**
     * Генерация slug из названия.
     */
    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9а-яё-]/gi, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    /**
     * Изменение названия с автоматической генерацией slug.
     */
    const handleNameChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const name = event.target.value

        setData('name', name)
        setData('slug', generateSlug(name))
    }

    /**
     * Выбор изображения превью.
     */
    const handlePreviewImageChange = (
        event: React.ChangeEvent<HTMLInputElement>,
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
     * Удаление выбранного изображения.
     */
    const removePreviewImage = () => {
        setData('preview_image', null)

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }

        setPreviewUrl(null)
    }

    /**
     * Очистка формы.
     */
    const handleClose = () => {
        if (processing) {
            return
        }

        setIsOpen(false)
        reset()

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }

        setPreviewUrl(null)
    }

    /**
     * Отправка формы.
     */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        post(route('admin.skins.store'), {
            forceFormData: true,

            onSuccess: () => {
                setIsOpen(false)
                reset()

                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                }

                setPreviewUrl(null)
            },
        })
    }

    /**
     * Освобождаем URL изображения при размонтировании компонента.
     */
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!processing) {
                    setIsOpen(open)

                    if (!open) {
                        reset()

                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl)
                        }

                        setPreviewUrl(null)
                    }
                }
            }}
        >
            <DialogTrigger asChild>
                <Button className="w-min" variant="outline">
                    <Box className="mr-2 h-4 w-4" />
                    Добавить скин
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Создание нового скина
                    </DialogTitle>

                    <DialogDescription>
                        Заполните информацию о скине, загрузите модель и
                        изображение для превью.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Основная информация */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Основная информация
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Название и идентификатор скина.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="skin-name">
                                    Название
                                </Label>

                                <Input
                                    id="skin-name"
                                    placeholder="Например, Cyber Samurai"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    autoComplete="off"
                                    autoFocus
                                />

                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label htmlFor="skin-slug">
                                    Slug
                                </Label>

                                <Input
                                    id="skin-slug"
                                    placeholder="cyber-samurai"
                                    value={data.slug}
                                    onChange={(event) =>
                                        setData(
                                            'slug',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="off"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Создаётся автоматически из названия.
                                </p>

                                {errors.slug && (
                                    <p className="text-sm text-destructive">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="skin-description">
                                Описание
                            </Label>

                            <Textarea
                                id="skin-description"
                                placeholder="Расскажите о дизайне и особенностях скина..."
                                value={data.description}
                                onChange={(event) =>
                                    setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="min-h-[100px] resize-none"
                            />

                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Файлы */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Файлы
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Загрузите 3D-модель и изображение
                                превью.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* 3D Model */}
                            <div className="space-y-2">
                                <Label>
                                    3D-модель
                                </Label>

                                <label
                                    htmlFor="model-file"
                                    className="group flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition hover:border-primary/50 hover:bg-muted/40"
                                >
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                                        <FileBox className="h-6 w-6 text-muted-foreground transition group-hover:text-primary" />
                                    </div>

                                    {data.model_path ? (
                                        <>
                                            <span className="max-w-full truncate text-sm font-medium">
                                                {data.model_path.name}
                                            </span>

                                            <span className="mt-1 text-xs text-muted-foreground">
                                                Файл выбран
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium">
                                                Загрузить модель
                                            </span>

                                            <span className="mt-1 text-xs text-muted-foreground">
                                                GLB, GLTF, FBX, OBJ
                                            </span>
                                        </>
                                    )}

                                    <Input
                                        id="model-file"
                                        type="file"
                                        className="hidden"
                                        accept=".glb,.gltf,.fbx,.obj"
                                        onChange={(event) =>
                                            setData(
                                                'model_path',
                                                event.target.files?.[0] ??
                                                null,
                                            )
                                        }
                                    />
                                </label>

                                {errors.model_path && (
                                    <p className="text-sm text-destructive">
                                        {errors.model_path}
                                    </p>
                                )}
                            </div>

                            {/* Preview Image */}
                            <div className="space-y-2">
                                <Label>
                                    Изображение превью
                                </Label>

                                {previewUrl ? (
                                    <div className="relative overflow-hidden rounded-xl border bg-muted/20">
                                        <img
                                            src={previewUrl}
                                            alt="Предпросмотр"
                                            className="h-[150px] w-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={removePreviewImage}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition hover:bg-background"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <div className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-2">
                                            <p className="truncate text-xs font-medium">
                                                {data.preview_image?.name}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="preview-file"
                                        className="group flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition hover:border-primary/50 hover:bg-muted/40"
                                    >
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground transition group-hover:text-primary" />
                                        </div>

                                        <span className="text-sm font-medium">
                                            Загрузить превью
                                        </span>

                                        <span className="mt-1 text-xs text-muted-foreground">
                                            PNG, JPG, WEBP
                                        </span>

                                        <Input
                                            id="preview-file"
                                            type="file"
                                            className="hidden"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={
                                                handlePreviewImageChange
                                            }
                                        />
                                    </label>
                                )}

                                {errors.preview_image && (
                                    <p className="text-sm text-destructive">
                                        {errors.preview_image}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Цвета */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Цветовая палитра
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Основные цвета, используемые в дизайне
                                скина.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {/* Primary */}
                            <div className="space-y-2">
                                <Label htmlFor="primary-color">
                                    Основной
                                </Label>

                                <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                    <input
                                        id="primary-color"
                                        type="color"
                                        value={data.primary_color}
                                        onChange={(event) =>
                                            setData(
                                                'primary_color',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
                                    />

                                    <Input
                                        value={data.primary_color}
                                        onChange={(event) =>
                                            setData(
                                                'primary_color',
                                                event.target.value,
                                            )
                                        }
                                        className="border-0 px-1 shadow-none focus-visible:ring-0"
                                        placeholder="#000000"
                                    />
                                </div>

                                {errors.primary_color && (
                                    <p className="text-sm text-destructive">
                                        {errors.primary_color}
                                    </p>
                                )}
                            </div>

                            {/* Secondary */}
                            <div className="space-y-2">
                                <Label htmlFor="secondary-color">
                                    Вторичный
                                </Label>

                                <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                    <input
                                        id="secondary-color"
                                        type="color"
                                        value={data.secondary_color}
                                        onChange={(event) =>
                                            setData(
                                                'secondary_color',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
                                    />

                                    <Input
                                        value={data.secondary_color}
                                        onChange={(event) =>
                                            setData(
                                                'secondary_color',
                                                event.target.value,
                                            )
                                        }
                                        className="border-0 px-1 shadow-none focus-visible:ring-0"
                                        placeholder="#ffffff"
                                    />
                                </div>

                                {errors.secondary_color && (
                                    <p className="text-sm text-destructive">
                                        {errors.secondary_color}
                                    </p>
                                )}
                            </div>

                            {/* Accent */}
                            <div className="space-y-2">
                                <Label htmlFor="accent-color">
                                    Акцентный
                                </Label>

                                <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                    <input
                                        id="accent-color"
                                        type="color"
                                        value={data.accent_color}
                                        onChange={(event) =>
                                            setData(
                                                'accent_color',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
                                    />

                                    <Input
                                        value={data.accent_color}
                                        onChange={(event) =>
                                            setData(
                                                'accent_color',
                                                event.target.value,
                                            )
                                        }
                                        className="border-0 px-1 shadow-none focus-visible:ring-0"
                                        placeholder="#6366f1"
                                    />
                                </div>

                                {errors.accent_color && (
                                    <p className="text-sm text-destructive">
                                        {errors.accent_color}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="skin-active"
                                className="cursor-pointer"
                            >
                                Активный скин
                            </Label>

                            <p className="text-xs text-muted-foreground">
                                Активные скины доступны для использования
                                на сайте.
                            </p>
                        </div>

                        <Switch
                            id="skin-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked)
                            }
                        />
                    </div>

                    {errors.is_active && (
                        <p className="text-sm text-destructive">
                            {errors.is_active}
                        </p>
                    )}

                    {/* Footer */}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Отмена
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.name.trim() ||
                                !data.slug.trim() ||
                                !data.model_path ||
                                !data.preview_image
                            }
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Создать скин
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

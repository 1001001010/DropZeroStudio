
import { useEffect, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import {
    FileText,
    ShieldCheck,
    FileCheck,
    ScrollText,
    Save,
    Send,
    CheckCircle2,
    Circle,
    ChevronRight,
    ExternalLink,
    History,
    Eye,
    Pencil,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AdminNav } from '@/components/admin/admin-nav'
import { LegalDocumentLayout } from '@/components/admin/legal/legal-document-layout'

// Типы юридических документов и их редакций.
type LegalVersion = {
    id: number
    version: string
    status: 'draft' | 'published'
    content: string
    content_hash: string | null
    published_at: string | null
    created_at: string
}

type LegalDocument = {
    id: number
    title: string
    slug: string
    route: string
    is_active: boolean
    current_version: LegalVersion | null
    versions: LegalVersion[]
}

type Props = {
    documents: LegalDocument[]
    selectedDocument: LegalDocument | null
}

type EditorTab = 'edit' | 'preview'

// Иконки для разных типов юридических документов.
const documentIcons: Record<string, typeof FileText> = {
    privacy: ShieldCheck,
    'personal-data-consent': FileCheck,
    terms: ScrollText,
    offer: FileText,
}

export default function Index({
    documents,
    selectedDocument,
}: Props) {
    // Выбранный документ.
    const [activeDocumentId, setActiveDocumentId] = useState<number | null>(
        selectedDocument?.id ?? documents[0]?.id ?? null,
    )

    // Открытая редакция выбранного документа.
    const [activeVersionId, setActiveVersionId] = useState<number | null>(
        selectedDocument?.versions?.find(
            (version) => version.status === 'draft',
        )?.id ?? selectedDocument?.current_version?.id ?? null,
    )

    // Активная вкладка редактора.
    const [editorTab, setEditorTab] = useState<EditorTab>('edit')

    const activeDocument =
        documents.find((document) => document.id === activeDocumentId) ?? null

    const activeVersion =
        activeDocument?.versions.find(
            (version) => version.id === activeVersionId,
        ) ?? null

    const draftVersion =
        activeDocument?.versions.find(
            (version) => version.status === 'draft',
        ) ?? null

    const currentVersion = activeDocument?.current_version ?? null

    // Форма содержимого документа.
    const {
        data,
        setData,
        put,
        processing,
    } = useForm({
        content: activeVersion?.content ?? '',
    })

    const isDraft = activeVersion?.status === 'draft'

    const hasChanges =
        activeVersion !== null &&
        data.content !== activeVersion.content

    // Переключение документа.
    // Открываем его черновик или текущую опубликованную редакцию.
    useEffect(() => {
        if (!activeDocument) {
            setActiveVersionId(null)
            setData('content', '')
            setEditorTab('edit')
            return
        }

        const draft = activeDocument.versions.find(
            (version) => version.status === 'draft',
        )

        const version = draft ?? activeDocument.current_version

        setActiveVersionId(version?.id ?? null)
        setData('content', version?.content ?? '')
        setEditorTab('edit')
    }, [activeDocumentId])

    // Иконка текущего документа.
    const Icon = activeDocument
        ? documentIcons[activeDocument.slug] ?? FileText
        : FileText

    // Переключение документа с проверкой несохранённых изменений.
    const selectDocument = (document: LegalDocument) => {
        if (document.id === activeDocumentId) return

        if (hasChanges) {
            const confirmed = window.confirm(
                'У тебя есть несохранённые изменения. Переключиться без сохранения?',
            )

            if (!confirmed) return
        }

        setActiveDocumentId(document.id)
    }

    // Открытие редакции из истории.
    const openVersion = (version: LegalVersion) => {
        if (version.id === activeVersionId) return

        if (hasChanges) {
            const confirmed = window.confirm(
                'У тебя есть несохранённые изменения. Открыть другую редакцию?',
            )

            if (!confirmed) return
        }

        setActiveVersionId(version.id)
        setData('content', version.content)
        setEditorTab('edit')
    }

    // Сохранение черновика.
    const saveDraft = () => {
        if (
            !activeDocument ||
            !activeVersion ||
            !isDraft ||
            !hasChanges ||
            processing
        ) {
            return
        }

        put(
            route('admin.legal.versions.update', {
                document: activeDocument.id,
                version: activeVersion.id,
            }),
            {
                preserveScroll: true,
            },
        )
    }

    // Публикация черновика.
    const publishVersion = () => {
        if (
            !activeDocument ||
            !activeVersion ||
            !isDraft ||
            hasChanges ||
            processing
        ) {
            return
        }

        const confirmed = window.confirm(
            'Опубликовать эту редакцию? Предыдущая опубликованная версия останется в истории.',
        )

        if (!confirmed) return

        router.post(
            route('admin.legal.versions.publish', {
                document: activeDocument.id,
                version: activeVersion.id,
            }),
            {},
            {
                preserveScroll: true,
            },
        )
    }

    // Создание новой редакции.
    const createDraft = () => {
        if (!activeDocument) return

        if (hasChanges) {
            const confirmed = window.confirm(
                'У тебя есть несохранённые изменения. Создать новую редакцию?',
            )

            if (!confirmed) return
        }

        const documentId = activeDocument.id

        router.post(
            route('admin.legal.versions.store', {
                document: documentId,
            }),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    // Обновляем только список документов.
                    router.reload({
                        only: ['documents'],

                        onSuccess: (page) => {
                            const props = page.props as unknown as Props

                            const updatedDocument = props.documents.find(
                                (document) => document.id === documentId,
                            )

                            if (!updatedDocument) return

                            const draft = updatedDocument.versions.find(
                                (version) => version.status === 'draft',
                            )

                            if (!draft) return

                            // Открываем только что созданный черновик.
                            setActiveDocumentId(documentId)
                            setActiveVersionId(draft.id)
                            setData('content', draft.content)
                            setEditorTab('edit')
                        },
                    })
                },
            },
        )
    }

    // Если документов нет.
    if (!activeDocument) {
        return (
            <>
                <AdminNav />
                <Head title="Юридические документы" />

                <div className="p-6">
                    <p className="text-sm text-muted-foreground">
                        Юридические документы не найдены.
                    </p>
                </div>
            </>
        )
    }

    return (
        <>
            <AdminNav />
            <Head title="Юридические документы" />

            <div className="space-y-6 p-6">
                {/* Заголовок */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Главная</span>
                        <ChevronRight className="size-4" />
                        <span className="text-foreground">
                            Юридические документы
                        </span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Юридические документы
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Управление содержимым, редакциями и публикацией документов.
                        </p>
                    </div>
                </div>

                {/* Основная область */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                    {/* Список документов */}
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Документы
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">
                                Выберите документ для редактирования.
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-1">
                            {documents.map((document) => {
                                const DocumentIcon =
                                    documentIcons[document.slug] ?? FileText

                                const isSelected =
                                    activeDocumentId === document.id

                                const documentDraft =
                                    document.versions.some(
                                        (version) =>
                                            version.status === 'draft',
                                    )

                                return (
                                    <button
                                        key={document.id}
                                        type="button"
                                        onClick={() => selectDocument(document)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${isSelected
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                                            <DocumentIcon className="size-4 text-muted-foreground" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {document.title}
                                            </p>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {document.current_version
                                                    ? `Версия ${document.current_version.version}`
                                                    : 'Не опубликован'}
                                            </p>
                                        </div>

                                        {documentDraft && (
                                            <span
                                                className="size-2 shrink-0 rounded-full bg-amber-500"
                                                title="Есть черновик"
                                            />
                                        )}

                                        {document.current_version && (
                                            <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                                        )}
                                    </button>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* Рабочая область */}
                    <div className="min-w-0 space-y-6">
                        {/* Информация о документе */}
                        <Card>
                            <CardContent className="space-y-5 p-6">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                                            <Icon className="size-5 text-muted-foreground" />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-lg font-semibold">
                                                {activeDocument.title}
                                            </h2>

                                            <a
                                                href={activeDocument.route}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {activeDocument.route}
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {isDraft
                                                ? 'Черновик'
                                                : activeVersion
                                                    ? 'Опубликовано'
                                                    : 'Нет редакции'}
                                        </Badge>

                                        {!isDraft && (
                                            <Button
                                                size="sm"
                                                onClick={
                                                    draftVersion
                                                        ? () => openVersion(draftVersion)
                                                        : createDraft
                                                }
                                            >
                                                {draftVersion
                                                    ? 'Открыть черновик'
                                                    : 'Создать черновик'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Текущая опубликованная версия
                                        </p>

                                        <p className="text-sm font-medium">
                                            {currentVersion
                                                ? `v${currentVersion.version}`
                                                : 'Нет опубликованной версии'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Открытая редакция
                                        </p>

                                        <p className="text-sm font-medium">
                                            {activeVersion
                                                ? `v${activeVersion.version}`
                                                : 'Черновик не создан'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Содержимое документа */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div>
                                        <CardTitle className="text-base">
                                            Содержимое документа
                                        </CardTitle>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Изменения сохраняются в черновике до публикации.
                                        </p>
                                    </div>

                                    {hasChanges && (
                                        <Badge variant="secondary">
                                            Есть несохранённые изменения
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {activeVersion ? (
                                    <>
                                        {/* Вкладки */}
                                        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
                                            <button
                                                type="button"
                                                onClick={() => setEditorTab('edit')}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${editorTab === 'edit'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <Pencil className="size-4" />
                                                Редактирование
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setEditorTab('preview')}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${editorTab === 'preview'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <Eye className="size-4" />
                                                Предпросмотр
                                            </button>
                                        </div>

                                        {/* Редактирование */}
                                        {editorTab === 'edit' && (
                                            <div className="space-y-3">
                                                <Textarea
                                                    value={data.content}
                                                    onChange={(event) =>
                                                        setData(
                                                            'content',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={`---
title: "Название документа"
eyebrow: "ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ"
description: "Описание документа"

important_title: "Важная информация"
important_text: "Текст информационного блока"

contact_title: "Остались вопросы?"
contact_text: "Текст контактного блока"
contact_email: "dropzerostudio@gmail.com"

seo_title: "Название для поисковых систем"
seo_description: "SEO описание"
seo_keywords: "ключевые слова"
robots: "index, follow"
---

## Общие положения
<!-- description: Краткое описание раздела -->

### 1.1. Первый подраздел

Текст подраздела...

## Термины
<!-- description: Основные понятия документа -->

### 2.1. Первый термин

Текст термина...
`}
                                                    disabled={!isDraft || processing}
                                                    className="min-h-[650px] resize-y font-mono text-sm leading-6"
                                                />

                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        ## — раздел, ### — подраздел.
                                                        Описание раздела задаётся
                                                        комментарием description.
                                                    </p>

                                                    <Badge variant="outline">
                                                        Markdown
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        {/* Предпросмотр */}
                                        {editorTab === 'preview' && (
                                            <div className="overflow-hidden rounded-xl border bg-[#050505]">
                                                <div className="max-h-[850px] overflow-y-auto">
                                                    <LegalDocumentLayout
                                                        title={activeDocument.title}
                                                        route={activeDocument.route}
                                                        content={data.content}
                                                        version={activeVersion.version}
                                                        publishedAt={activeVersion.published_at}
                                                        preview={isDraft}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Действия */}
                                        <div className="flex flex-col-reverse justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                                            <p className="text-xs text-muted-foreground">
                                                {isDraft
                                                    ? 'Сохранение не публикует документ.'
                                                    : 'Опубликованная редакция доступна только для просмотра.'}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={saveDraft}
                                                    disabled={
                                                        processing ||
                                                        !hasChanges ||
                                                        !isDraft
                                                    }
                                                >
                                                    <Save className="mr-2 size-4" />
                                                    Сохранить черновик
                                                </Button>

                                                <Button
                                                    onClick={publishVersion}
                                                    disabled={
                                                        processing ||
                                                        !isDraft ||
                                                        hasChanges
                                                    }
                                                >
                                                    <Send className="mr-2 size-4" />
                                                    Опубликовать
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
                                        <FileText className="mb-3 size-8 text-muted-foreground" />

                                        <p className="font-medium">
                                            Нет редакции для просмотра
                                        </p>

                                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                            Создайте черновик, чтобы добавить содержимое документа.
                                        </p>

                                        <Button
                                            className="mt-4"
                                            onClick={
                                                draftVersion
                                                    ? () => openVersion(draftVersion)
                                                    : createDraft
                                            }
                                        >
                                            {draftVersion
                                                ? 'Открыть черновик'
                                                : 'Создать черновик'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* История редакций */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <History className="size-4 text-muted-foreground" />

                                    <CardTitle className="text-base">
                                        История редакций
                                    </CardTitle>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Нажмите на редакцию, чтобы открыть её содержимое.
                                </p>
                            </CardHeader>

                            <CardContent>
                                {activeDocument.versions.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeDocument.versions.map(
                                            (version, index) => {
                                                const isActive =
                                                    activeVersionId === version.id

                                                return (
                                                    <button
                                                        key={version.id}
                                                        type="button"
                                                        onClick={() =>
                                                            openVersion(version)
                                                        }
                                                        className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${isActive
                                                            ? 'border-[#AA141E] bg-[#AA141E]/5'
                                                            : 'border-transparent hover:border-border hover:bg-muted/50'
                                                            }`}
                                                    >
                                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted/30">
                                                            {version.status ===
                                                                'published' ? (
                                                                <CheckCircle2 className="size-4 text-muted-foreground" />
                                                            ) : (
                                                                <Circle className="size-4 text-muted-foreground" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-medium">
                                                                    Версия{' '}
                                                                    {version.version}
                                                                </p>

                                                                <Badge
                                                                    variant={
                                                                        version.status ===
                                                                            'published'
                                                                            ? 'secondary'
                                                                            : 'outline'
                                                                    }
                                                                >
                                                                    {version.status ===
                                                                        'published'
                                                                        ? 'Опубликована'
                                                                        : 'Черновик'}
                                                                </Badge>

                                                                {isActive && (
                                                                    <Badge variant="outline">
                                                                        Открыта
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {version.published_at
                                                                    ? `Опубликована ${new Date(
                                                                        version.published_at,
                                                                    ).toLocaleString(
                                                                        'ru-RU',
                                                                    )}`
                                                                    : `Создана ${new Date(
                                                                        version.created_at,
                                                                    ).toLocaleString(
                                                                        'ru-RU',
                                                                    )}`}
                                                            </p>

                                                            {version.content_hash && (
                                                                <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                                                                    SHA-256:{' '}
                                                                    {version.content_hash}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {index === 0 && (
                                                            <Badge variant="outline">
                                                                Последняя
                                                            </Badge>
                                                        )}
                                                    </button>
                                                )
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        История редакций пока пуста.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}


import { useState } from 'react'
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    LockKeyhole,
} from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface CharacterLoreBookProps {
    characterName: string
}

interface LoreChapter {
    title: string
    subtitle: string
    content: string[]
}

interface CharacterLore {
    title: string
    subtitle: string
    chapters: LoreChapter[]
}

// Демонстрационные истории персонажей.
const loreArchive: Record<string, CharacterLore> = {
    lyucix: {
        title: 'The Chronicles of LYUCIX',
        subtitle: 'Архив падшего света',
        chapters: [
            {
                title: 'Начало',
                subtitle: 'Глава I · Происхождение',
                content: [
                    'У каждой легенды есть начало. Но не каждое начало предназначено для того, чтобы его помнили.',
                    'Когда-то он принадлежал миру, в котором всё имело своё место. Но даже совершенство может стать клеткой для того, кто стремится увидеть больше.',
                    'Так началась история LYUCIX — персонажа, чьё имя стало символом собственного пути и непокорности.',
                ],
            },
            {
                title: 'Падение',
                subtitle: 'Глава II · Переломный момент',
                content: [
                    'Падение — это не всегда конец. Иногда это единственный способ начать собственную историю.',
                    'Оставшись без прежнего места в мире, LYUCIX получил нечто гораздо более ценное — возможность самому выбирать направление своего пути.',
                ],
            },
            {
                title: 'Символика',
                subtitle: 'Глава III · Знаки',
                content: [
                    'Образ LYUCIX объединяет противоречия: свет и тьму, порядок и свободу, силу и одиночество.',
                    'Каждая деталь персонажа — часть его визуальной истории. Его образ не предлагает готовых ответов, а оставляет пространство для собственного прочтения.',
                ],
            },
        ],
    },

    mikhael: {
        title: 'The Chronicles of MIKHAEL',
        subtitle: 'Архив небесного стража',
        chapters: [
            {
                title: 'Начало',
                subtitle: 'Глава I · Происхождение',
                content: [
                    'Не всякая сила нуждается в признании. Иногда её предназначение — стоять на страже того, что другие не способны защитить.',
                    'MIKHAEL — образ защитника, воплощающий решимость, верность своему пути и готовность встретить неизвестность.',
                ],
            },
            {
                title: 'Страж',
                subtitle: 'Глава II · Предназначение',
                content: [
                    'Его история — не история поиска славы. Это история ответственности и выбора.',
                    'За внешней уверенностью скрывается персонаж, для которого верность собственным принципам важнее любой награды.',
                ],
            },
            {
                title: 'Символика',
                subtitle: 'Глава III · Знаки',
                content: [
                    'Образ MIKHAEL построен на контрасте света, силы и спокойствия.',
                    'Его детали отражают идею защиты и внутренней стойкости. Каждый элемент становится частью единого визуального повествования.',
                ],
            },
        ],
    },
}

const defaultLore: CharacterLore = {
    title: 'Character Chronicles',
    subtitle: 'Архив персонажа',
    chapters: [
        {
            title: 'Начало',
            subtitle: 'Глава I · Происхождение',
            content: [
                'У каждого персонажа есть история. Эта глава — начало знакомства с его миром.',
                'Здесь появится история происхождения, первые события и обстоятельства, которые сформировали его образ.',
            ],
        },
        {
            title: 'Легенда',
            subtitle: 'Глава II · История',
            content: [
                'У каждого образа есть собственная легенда, скрытые смыслы и детали, которые предстоит открыть.',
            ],
        },
        {
            title: 'Символика',
            subtitle: 'Глава III · Знаки',
            content: [
                'Здесь будут собраны символы, визуальные детали и идеи, лежащие в основе дизайна персонажа.',
            ],
        },
    ],
}

export function CharacterLoreBook({
    characterName,
}: CharacterLoreBookProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeChapter, setActiveChapter] = useState(0)

    const normalizedName = characterName.toLowerCase()

    const loreKey = Object.keys(loreArchive).find((key) =>
        normalizedName.includes(key),
    )

    const lore = loreKey ? loreArchive[loreKey] : defaultLore
    const chapter = lore.chapters[activeChapter]

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)

        if (!open) {
            setActiveChapter(0)
        }
    }

    return (
        <section className="w-full border-t border-white/[0.08] pt-6">
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                {/* Обложка книги на странице персонажа */}
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="group relative flex w-full items-center gap-4 overflow-hidden border border-[#492126] bg-[#100B0C] p-4 text-left transition-colors duration-300 hover:border-primary/70 hover:bg-[#160D0F]"
                    >
                        <div
                            className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl"
                            aria-hidden="true"
                        />

                        <div className="relative flex size-14 shrink-0 items-center justify-center border border-primary/30 bg-[#1B1012] text-primary transition-transform duration-300 group-hover:scale-105">
                            <BookOpen className="size-6" />
                        </div>

                        <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary">
                                Character archive
                            </span>

                            <span className="text-sm font-semibold uppercase tracking-wide text-white">
                                {lore.title}
                            </span>

                            <span className="text-xs text-white/40">
                                {lore.subtitle}
                            </span>
                        </div>

                        <div className="relative flex shrink-0 flex-col items-center gap-1.5 text-white/40 transition-colors group-hover:text-primary">
                            <LockKeyhole className="size-4" />

                            <span className="font-mono text-[8px] uppercase tracking-wider">
                                Open
                            </span>
                        </div>
                    </button>
                </DialogTrigger>

                {/* Диалоговое окно с раскрытой книгой */}
                <DialogContent className="max-h-[90dvh] w-[calc(100%-24px)] max-w-[900px] overflow-y-auto border border-[#493A2D] bg-[#100B0C] p-3 text-white shadow-2xl shadow-black/60 sm:p-5">
                    <DialogTitle className="sr-only">
                        {lore.title}
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        История и главы персонажа {characterName}
                    </DialogDescription>

                    {/* Заголовок архива */}
                    <div className="flex items-center justify-between gap-4 px-2 pb-4 pt-1 sm:px-3">
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                                DropZeroStudio · Character archive
                            </span>

                            <span className="truncate text-xs font-medium uppercase tracking-wider text-white/70">
                                {lore.title}
                            </span>
                        </div>
                    </div>
                    {/* Навигация по главам */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
                        {/* Список глав */}
                        <div className="flex flex-wrap gap-2">
                            {lore.chapters.map((item, index) => (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() => setActiveChapter(index)}
                                    aria-pressed={activeChapter === index}
                                    className={`border px-3 py-2 font-mono text-[9px] uppercase tracking-wider transition-colors ${activeChapter === index
                                        ? 'border-primary/50 bg-primary/10 text-primary'
                                        : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/70'
                                        }`}
                                >
                                    Chapter 0{index + 1}
                                </button>
                            ))}
                        </div>

                        {/* Стрелки переключения */}
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveChapter((current) =>
                                        Math.max(0, current - 1),
                                    )
                                }
                                disabled={activeChapter === 0}
                                aria-label="Предыдущая глава"
                                className="flex size-9 items-center justify-center border border-white/10 text-white/60 transition-colors hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                            >
                                <ChevronLeft className="size-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveChapter((current) =>
                                        Math.min(
                                            lore.chapters.length - 1,
                                            current + 1,
                                        ),
                                    )
                                }
                                disabled={activeChapter === lore.chapters.length - 1}
                                aria-label="Следующая глава"
                                className="flex size-9 items-center justify-center border border-white/10 text-white/60 transition-colors hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Разворот книги */}
                    <div
                        key={`${lore.title}-${activeChapter}`}
                        className="grid h-[600px] grid-cols-1 overflow-hidden rounded-sm border border-[#C7B79C] bg-[#E8DDC9] text-[#30251D] shadow-inner md:grid-cols-2"
                    >
                        {/* Левая страница */}
                        <div className="relative flex flex-col justify-between border-b border-[#C7B79C] bg-[#E8DDC9] p-6 sm:p-9 md:border-b-0 md:border-r md:border-[#C7B79C]">
                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-[#B7A58B]/20 to-transparent md:block"
                                aria-hidden="true"
                            />

                            <div className="relative flex flex-col gap-3">
                                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8B292E]">
                                    {lore.subtitle}
                                </span>

                                <div className="h-px w-12 bg-[#8B292E]/60" />
                            </div>

                            <div className="relative my-12 flex flex-col items-center text-center">
                                <BookOpen className="mb-7 size-12 text-[#8B292E]/70" />

                                <h2 className="font-serif text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl">
                                    {lore.title}
                                </h2>

                                <p className="mt-4 max-w-[240px] font-serif text-sm italic leading-relaxed text-[#756453]">
                                    История, скрытая за образом персонажа.
                                </p>

                                <div className="mt-8 h-px w-20 bg-[#8B292E]/50" />
                            </div>

                            <div className="relative flex items-end justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-[#8D7C68]">
                                <span>DropZeroStudio</span>
                                <span>Archive · 001</span>
                            </div>
                        </div>

                        {/* Правая страница */}
                        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F0E7D7] p-6 sm:p-9">
                            <div className="mb-8 flex flex-col gap-3">
                                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8B292E]">
                                    {chapter.subtitle}
                                </span>

                                <h3 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                                    {chapter.title}
                                </h3>

                                <div className="h-px w-12 bg-[#8B292E]/60" />
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                                <div className="flex flex-col gap-5">
                                    {chapter.content.map((paragraph, index) => (
                                        <p
                                            key={index}
                                            className={`font-serif text-sm leading-[2] ${index === 0
                                                ? 'text-[#493A2D]'
                                                : 'text-[#756453]'
                                                }`}
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t border-[#C7B79C] pt-4 font-mono text-[9px] uppercase tracking-wider text-[#8D7C68]">
                                <span>
                                    {String(activeChapter + 1).padStart(2, '0')}
                                </span>

                                <span>
                                    {String(lore.chapters.length).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}

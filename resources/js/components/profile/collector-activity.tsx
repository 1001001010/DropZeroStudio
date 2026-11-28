
import {
    Award,
    Check,
    Fingerprint,
    LockKeyhole,
    Package,
    Sparkles,
    type LucideIcon,
} from 'lucide-react'

import type { CollectorHistoryEvent } from '@/types'

interface CollectorActivityProps {
    history: CollectorHistoryEvent[]
}

const achievements = [
    {
        title: 'Первый контакт',
        description:
            'В твоей коллекции появился первый персонаж DropZeroStudio.',
        icon: Sparkles,
        unlocked: true,
        date: '14 сентября 2026',
    },
    {
        title: 'Подтверждённый владелец',
        description:
            'Ты успешно активировал фигурку и подтвердил её подлинность.',
        icon: Fingerprint,
        unlocked: true,
        date: '14 сентября 2026',
    },
    {
        title: 'Начало коллекции',
        description: 'Собери три фигурки, чтобы открыть это достижение.',
        icon: Award,
        unlocked: false,
        date: null,
    },
]

// Соответствие строковых идентификаторов иконкам Lucide.
const historyIcons: Record<string, LucideIcon> = {
    fingerprint: Fingerprint,
    package: Package,
}

// Настройки десктопной временной шкалы.
const TIMELINE = {
    pointsPerRow: 4,
    rowHeight: 300,
    svgWidth: 1000,
    horizontalPadding: 170,
    edgePadding: 30,
    cornerRadius: 20,
    lineY: 45,
} as const

export function CollectorActivity({
    history,
}: CollectorActivityProps) {
    const unlockedCount = achievements.filter(
        (achievement) => achievement.unlocked,
    ).length

    // Количество рядов зависит от количества событий.
    const rowCount = Math.max(
        1,
        Math.ceil(history.length / TIMELINE.pointsPerRow),
    )

    const timelineHeight = rowCount * TIMELINE.rowHeight

    // Расстояние между точками внутри одного ряда.
    const horizontalGap =
        (TIMELINE.svgWidth - TIMELINE.horizontalPadding * 2) /
        (TIMELINE.pointsPerRow - 1)

    // Рассчитываем координаты событий на временной шкале.
    const linePoints = history.map((_, index) => {
        const row = Math.floor(index / TIMELINE.pointsPerRow)
        const column = index % TIMELINE.pointsPerRow
        const isLeftToRight = row % 2 === 0

        return {
            x: isLeftToRight
                ? TIMELINE.horizontalPadding + column * horizontalGap
                : TIMELINE.svgWidth -
                TIMELINE.horizontalPadding -
                column * horizontalGap,
            y: row * TIMELINE.rowHeight + TIMELINE.lineY,
            row,
        }
    })

    // Строим непрерывную линию с закруглёнными поворотами.
    const linePath = linePoints
        .map((point, index) => {
            if (index === 0) {
                return `M ${point.x} ${point.y}`
            }

            const previous = linePoints[index - 1]

            // Внутри одного ряда линия идёт горизонтально.
            if (point.row === previous.row) {
                return `L ${point.x} ${point.y}`
            }

            const isRightSide =
                previous.x > TIMELINE.svgWidth / 2

            const edgeX = isRightSide
                ? TIMELINE.svgWidth - TIMELINE.edgePadding
                : TIMELINE.edgePadding

            const direction = isRightSide ? -1 : 1
            const radius = TIMELINE.cornerRadius

            // Поворот линии по внешнему краю временной шкалы.
            return [
                `L ${edgeX - direction * radius} ${previous.y}`,
                `Q ${edgeX} ${previous.y} ${edgeX} ${previous.y + radius}`,
                `L ${edgeX} ${point.y - radius}`,
                `Q ${edgeX} ${point.y} ${edgeX - direction * radius} ${point.y}`,
                `L ${point.x} ${point.y}`,
            ].join(' ')
        })
        .join(' ')

    return (
        <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] text-white">
            {/* Декоративный фоновый акцент */}
            <div
                className="pointer-events-none absolute -right-40 top-20 size-[420px] rounded-full bg-primary/[0.06] blur-[120px]"
                aria-hidden="true"
            />

            <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-20 px-5 py-16 md:gap-24 md:px-16 md:py-24">
                {/* Достижения */}
                <div className="flex flex-col gap-9">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                                Collector achievements
                            </span>

                            <h2 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">
                                Достижения
                            </h2>

                            <p className="max-w-md text-sm leading-relaxed text-white/40">
                                Особые отметки твоего пути в мире
                                DropZeroStudio.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                            <div className="flex size-9 items-center justify-center border border-primary/20 bg-primary/[0.08] text-primary">
                                <Award className="size-4" />
                            </div>

                            <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                                    Открыто достижений
                                </span>

                                <span className="font-mono text-sm text-white">
                                    <span className="text-primary">
                                        {String(unlockedCount).padStart(2, '0')}
                                    </span>

                                    <span className="text-white/25">
                                        {' / '}
                                        {String(achievements.length).padStart(2, '0')}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Карточки достижений */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {achievements.map((achievement, index) => {
                            const Icon = achievement.icon

                            return (
                                <article
                                    key={achievement.title}
                                    className={`group relative flex min-h-[230px] flex-col justify-between overflow-hidden border p-5 transition-all duration-300 ${achievement.unlocked
                                        ? 'border-white/[0.1] bg-white/[0.025] hover:border-primary/35 hover:bg-white/[0.04]'
                                        : 'border-white/[0.06] bg-white/[0.01]'
                                        }`}
                                >
                                    {/* Номер достижения */}
                                    <div className="absolute right-5 top-4 font-mono text-[10px] tracking-widest text-white/15">
                                        0{index + 1}
                                    </div>

                                    {achievement.unlocked && (
                                        <div
                                            className="pointer-events-none absolute -bottom-16 -right-12 size-40 rounded-full bg-primary/[0.08] blur-[55px] transition-opacity duration-300 group-hover:bg-primary/[0.14]"
                                            aria-hidden="true"
                                        />
                                    )}

                                    <div className="relative flex items-start justify-between">
                                        <div
                                            className={`flex size-12 items-center justify-center border transition-colors ${achievement.unlocked
                                                ? 'border-primary/25 bg-primary/[0.08] text-primary'
                                                : 'border-white/[0.08] bg-white/[0.02] text-white/20'
                                                }`}
                                        >
                                            <Icon className="size-5" />
                                        </div>

                                        {achievement.unlocked ? (
                                            <span className="flex items-center gap-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
                                                <Check className="size-3" />
                                                Получено
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
                                                <LockKeyhole className="size-3" />
                                                Закрыто
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative mt-10 flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <h3
                                                className={`text-sm font-semibold uppercase tracking-wide ${achievement.unlocked
                                                    ? 'text-white'
                                                    : 'text-white/35'
                                                    }`}
                                            >
                                                {achievement.title}
                                            </h3>

                                            <p className="max-w-[280px] text-xs leading-[1.8] text-white/40">
                                                {achievement.description}
                                            </p>
                                        </div>

                                        <div className="mt-1 flex min-h-4 items-center">
                                            {achievement.date && (
                                                <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">
                                                    Получено · {achievement.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>

                {/* История коллекции */}
                <div className="flex flex-col gap-10">
                    {/* Заголовок */}
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div className="flex flex-col gap-4">
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                                Collection history
                            </span>

                            <h2 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">
                                История коллекции
                            </h2>

                            <p className="max-w-sm text-sm leading-[1.8] text-white/40">
                                Хронология важных событий, связанных с твоими
                                фигурками и историей коллекционирования.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-primary/60" />

                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
                                {String(history.length).padStart(2, '0')} событий
                            </span>
                        </div>
                    </div>

                    {/* Пустая история */}
                    {history.length === 0 ? (
                        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 border border-white/[0.08] bg-white/[0.015] px-5 text-center">
                            <div className="flex size-12 items-center justify-center border border-white/[0.08] bg-white/[0.02] text-white/30">
                                <Package className="size-5" />
                            </div>

                            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                                Пока нет событий
                            </h3>

                            <p className="max-w-sm text-xs leading-relaxed text-white/35">
                                Здесь будут появляться события, связанные с
                                активацией твоих фигурок.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Мобильная вертикальная история */}
                            <div className="relative flex flex-col lg:hidden">
                                <div
                                    className="absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent"
                                    aria-hidden="true"
                                />

                                {history.map((event, index) => {
                                    const Icon =
                                        historyIcons[event.icon] ?? Fingerprint

                                    const isLast = index === history.length - 1

                                    return (
                                        <article
                                            key={event.id}
                                            className="group relative flex gap-5 pb-8 last:pb-0"
                                        >
                                            <div className="relative z-10 flex size-10 shrink-0 items-center justify-center border border-primary/25 bg-[#100809] text-primary">
                                                <Icon className="size-4" />
                                            </div>

                                            <div
                                                className={`min-w-0 flex-1 pb-7 ${!isLast
                                                    ? 'border-b border-white/[0.07]'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                                        Event{' '}
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>

                                                    <span className="font-mono text-[10px] text-white/30">
                                                        {event.date} / {event.time}
                                                    </span>
                                                </div>

                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                                                    {event.title}
                                                </h3>

                                                <p className="mt-2 max-w-lg text-xs leading-[1.8] text-white/40">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>

                            {/* Десктопная горизонтальная история-змейка */}
                            <div className="relative hidden lg:block">
                                <div
                                    className="relative w-full"
                                    style={{
                                        height: `${timelineHeight}px`,
                                    }}
                                >
                                    {/* Непрерывная линия временной шкалы */}
                                    <svg
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
                                        viewBox={`0 0 ${TIMELINE.svgWidth} ${timelineHeight}`}
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d={linePath}
                                            fill="none"
                                            stroke="#AA141E"
                                            strokeOpacity="0.75"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>

                                    {/* Карточки событий и точки */}
                                    {history.map((event, index) => {
                                        const Icon =
                                            historyIcons[event.icon] ?? Fingerprint

                                        const point = linePoints[index]

                                        return (
                                            <article
                                                key={event.id}
                                                className="group absolute z-10"
                                                style={{
                                                    left: `${(point.x / TIMELINE.svgWidth) * 100}%`,
                                                    top: `${point.y}px`,
                                                    width: 'min(220px, 20%)',
                                                    transform: 'translateX(-50%)',
                                                }}
                                            >
                                                {/* Точка на линии */}
                                                <div className="absolute left-1/2 top-0 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-primary/30 bg-[#100809] text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/[0.12]">
                                                    <Icon className="size-4" />
                                                </div>

                                                {/* Карточка события */}
                                                <div className="mt-8 border border-white/[0.08] bg-[#080808] p-4 transition-colors duration-300 group-hover:border-primary/30">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                                            Event{' '}
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>

                                                        <span className="font-mono text-[9px] text-white/30">
                                                            {event.time}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                                                        {event.title}
                                                    </h3>

                                                    <p className="mt-2 text-[11px] leading-[1.8] text-white/40">
                                                        {event.description}
                                                    </p>

                                                    <div className="mt-3 border-t border-white/[0.06] pt-3">
                                                        <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">
                                                            {event.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

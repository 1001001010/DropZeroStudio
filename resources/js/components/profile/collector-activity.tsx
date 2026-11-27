
import {
    Award,
    Check,
    Fingerprint,
    LockKeyhole,
    Package,
    Sparkles,
} from 'lucide-react'

const achievements = [
    {
        title: 'Первый контакт',
        description: 'В твоей коллекции появился первый персонаж DropZeroStudio.',
        icon: Sparkles,
        unlocked: true,
        date: '14 сентября 2026',
    },
    {
        title: 'Подтверждённый владелец',
        description: 'Ты успешно активировал фигурку и подтвердил её подлинность.',
        icon: Fingerprint,
        unlocked: true,
        date: '14 сентября 2026',
    },
    {
        title: 'Начало коллекции',
        description: 'Собери три фигурки, чтобы получить это достижение.',
        icon: Award,
        unlocked: false,
        date: null,
    },
]

const history = [
    {
        title: 'Фигурка приобретена',
        description: 'LYUCIX добавлен в твою коллекцию.',
        date: '12 сентября 2026',
        time: '15:42',
        icon: Package,
    },
    {
        title: 'Фигурка активирована',
        description: 'Подлинность подтверждена. Фигурка привязана к твоему аккаунту.',
        date: '14 сентября 2026',
        time: '11:28',
        icon: Fingerprint,
    },
]

export function CollectorActivity() {
    const unlockedCount = achievements.filter(
        (achievement) => achievement.unlocked,
    ).length

    return (
        <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] text-white">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-16 px-5 py-16 md:px-16 md:py-24">

                {/* Достижения */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-col gap-3">
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                                Collector achievements
                            </span>

                            <h2 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">
                                Достижения
                            </h2>

                            <p className="max-w-md text-sm leading-relaxed text-white/45">
                                Особые отметки твоего пути в мире DropZeroStudio.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2">
                            <Award className="size-4 text-primary" />

                            <span className="font-mono text-xs text-white/70">
                                {unlockedCount} / {achievements.length}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon

                            return (
                                <article
                                    key={achievement.title}
                                    className={`group relative flex min-h-[190px] flex-col justify-between overflow-hidden border p-5 transition-colors ${achievement.unlocked
                                        ? 'border-white/10 bg-white/[0.025] hover:border-primary/40'
                                        : 'border-white/[0.06] bg-white/[0.01]'
                                        }`}
                                >
                                    {achievement.unlocked && (
                                        <div
                                            className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl"
                                            aria-hidden="true"
                                        />
                                    )}

                                    <div className="relative flex items-start justify-between">
                                        <div
                                            className={`flex size-11 items-center justify-center border ${achievement.unlocked
                                                ? 'border-primary/30 bg-primary/10 text-primary'
                                                : 'border-white/10 bg-white/[0.03] text-white/25'
                                                }`}
                                        >
                                            <Icon className="size-5" />
                                        </div>

                                        {achievement.unlocked ? (
                                            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                                <Check className="size-3" />
                                                Получено
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                                                <LockKeyhole className="size-3" />
                                                Закрыто
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative mt-8 flex flex-col gap-2">
                                        <h3
                                            className={`text-sm font-semibold uppercase tracking-wide ${achievement.unlocked
                                                ? 'text-white'
                                                : 'text-white/40'
                                                }`}
                                        >
                                            {achievement.title}
                                        </h3>

                                        <p className="text-xs leading-relaxed text-white/40">
                                            {achievement.description}
                                        </p>

                                        {achievement.date && (
                                            <span className="mt-2 font-mono text-[9px] uppercase tracking-wider text-white/25">
                                                {achievement.date}
                                            </span>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>

                {/* История активности */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div className="flex flex-col gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                            Collection history
                        </span>

                        <h2 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">
                            История коллекции
                        </h2>

                        <p className="max-w-sm text-sm leading-relaxed text-white/45">
                            Здесь сохраняются важные события, связанные с твоими фигурками.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute bottom-8 left-[19px] top-8 w-px bg-gradient-to-b from-primary/60 via-white/15 to-transparent" />

                        <div className="flex flex-col gap-8">
                            {history.map((event, index) => {
                                const Icon = event.icon

                                return (
                                    <article
                                        key={event.title}
                                        className="relative flex gap-5"
                                    >
                                        <div className="relative z-10 flex size-10 shrink-0 items-center justify-center border border-primary/30 bg-[#100809] text-primary">
                                            <Icon className="size-4" />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col gap-3 border-b border-white/[0.08] pb-8">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                                    Event 0{index + 1}
                                                </span>

                                                <span className="font-mono text-[10px] text-white/35">
                                                    {event.date} · {event.time}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                                                    {event.title}
                                                </h3>

                                                <p className="text-xs leading-relaxed text-white/45">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

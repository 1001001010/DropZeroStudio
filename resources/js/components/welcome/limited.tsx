
import { Reveal } from '@/components/reveal'

// Данные демонстрационного сертификата.
// Перед подключением реальных выпусков значения следует получать с сервера.
const edition = {
    number: '001',
    total: '500',
} as const

export function Limited() {
    return (
        <section
            id="limited"
            aria-labelledby="limited-title"
            className="relative scroll-mt-20 py-28"
        >
            <div className="mx-auto max-w-7xl px-6">
                <Reveal>
                    {/* Сертификат с визуальным оформлением коллекционной серии */}
                    <div className="relative isolate overflow-hidden rounded-3xl bg-paper px-8 py-14 text-paper-foreground sm:px-14 sm:py-20">
                        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-paper-foreground/20 px-4 py-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="h-1.5 w-1.5 rounded-full bg-primary"
                                    />

                                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-foreground/70">
                                        Ограниченный выпуск
                                    </span>
                                </div>

                                <h2
                                    id="limited-title"
                                    className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
                                >
                                    Каждая фигурка получает уникальный номер и сертификат
                                    подлинности.
                                </h2>
                            </div>

                            {/* Серийный номер — ключевая деталь сертификата */}
                            <div className="shrink-0 border-t border-paper-foreground/20 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                                <p className="font-mono text-xs uppercase tracking-widest text-paper-foreground/60">
                                    Серийный номер
                                </p>

                                <p className="mt-2 font-mono text-6xl font-medium tabular-nums sm:text-7xl">
                                    {edition.number}
                                    <span className="text-paper-foreground/40">
                                        /{edition.total}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Декоративная монограмма бренда */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-10 -top-16 select-none text-[12rem] font-bold leading-none tracking-tighter text-paper-foreground/[0.04]"
                        >
                            DZ
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

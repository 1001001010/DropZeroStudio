
import { Reveal } from '@/components/reveal'
import type { SpecsProps } from '@/types'

const specifications = [
    { label: 'Материал', value: 'Премиальный плюш' },
    { label: 'Глаза', value: 'Ручная вышивка' },
    { label: 'Наполнитель', value: 'Гипоаллергенный' },
    { label: 'Детализация', value: 'Вышитые элементы' },
    { label: 'Комплектация', value: 'Паспорт фигурки с Secret Key' },
    { label: 'Идентификация', value: 'Уникальный код фигурки' },
    { label: 'Упаковка', value: 'Премиальная коллекционная' },
] as const

export function Specs({ stats }: SpecsProps) {
    return (
        <section
            id="specs"
            aria-labelledby="specs-title"
            className="relative scroll-mt-20 border-t border-border py-28"
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr]">
                    <Reveal>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                            / Спецификация
                        </p>

                        <h2
                            id="specs-title"
                            className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
                        >
                            Технический паспорт фигурки.
                        </h2>

                        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
                            Каждая фигурка поставляется в премиальной упаковке,
                            созданной специально для коллекционеров.
                        </p>
                    </Reveal>

                    {/* Характеристики в формате технического паспорта */}
                    <Reveal delay={120}>
                        <dl className="border-t border-border">
                            {specifications.map((spec, index) => (
                                <div
                                    key={spec.label}
                                    className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-border py-5 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </span>

                                    <dt className="min-w-0 text-base text-muted-foreground sm:text-lg">
                                        {spec.label}
                                    </dt>

                                    <dd className="col-start-2 min-w-0 break-words text-left text-base font-medium sm:col-start-3 sm:text-right sm:text-lg">
                                        {spec.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>

                {/* Статистика коллекции */}
                <Reveal delay={80}>
                    <dl className="mt-16 flex flex-col divide-y divide-border rounded-2xl border border-border sm:flex-row sm:divide-x sm:divide-y-0">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex min-w-0 flex-1 items-baseline justify-between gap-4 px-7 py-6"
                            >
                                <dt className="min-w-0 break-words font-mono text-sm uppercase tracking-widest text-muted-foreground">
                                    {stat.label}
                                </dt>

                                <dd className="shrink-0 font-mono text-3xl tabular-nums">
                                    {stat.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>
            </div>
        </section>
    )
}

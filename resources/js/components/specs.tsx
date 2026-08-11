import { Reveal } from '@/components/reveal'

const specifications = [
    { label: 'Высота', value: '20 см' },
    { label: 'Материал', value: 'Премиальный плюш' },
    { label: 'Аксессуары', value: 'Металлический кулон' },
    { label: 'Глаза', value: 'Ручная вышивка' },
    { label: 'Наполнитель', value: 'Гипоаллергенный' },
]

const stats = [
    { value: '50K+', label: 'Коллекционеров' },
    { value: '12', label: 'Дизайнов' },
    { value: '4.9', label: 'Средняя оценка' },
]

export function Specs() {
    return (
        <section id="specs" className="relative border-t border-border py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr]">
                    <Reveal>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                            / Спецификация
                        </p>
                        <h2 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Технический паспорт фигурки.
                        </h2>
                        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
                            Каждая фигурка поставляется в премиальной упаковке, созданной
                            специально для коллекционеров.
                        </p>
                    </Reveal>

                    {/* spec sheet as a drafting table */}
                    <Reveal delay={120}>
                        <dl className="border-t border-border">
                            {specifications.map((spec, i) => (
                                <div
                                    key={spec.label}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-border py-5 pr-1"
                                >
                                    <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                        {String(i + 1).padStart(2, '0')}
                                    </dt>
                                    <dt className="text-lg text-muted-foreground">{spec.label}</dt>
                                    <dd className="text-right text-lg font-medium">{spec.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>

                {/* stats ledger — no oversized number cards */}
                <Reveal delay={80}>
                    <div className="mt-16 flex flex-col divide-y divide-border rounded-2xl border border-border sm:flex-row sm:divide-x sm:divide-y-0">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className="flex flex-1 items-baseline justify-between gap-4 px-7 py-6"
                            >
                                <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                                    {s.label}
                                </span>
                                <span className="font-mono text-3xl tabular-nums">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

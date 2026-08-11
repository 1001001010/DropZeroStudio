import { Award, Package, Star } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const features = [
    {
        icon: Star,
        title: 'Уникальный номер',
        text: 'Каждая фигурка получает собственный номер и становится частью ограниченной серии.',
    },
    {
        icon: Award,
        title: 'Сертификат',
        text: 'В комплект входит официальный сертификат подлинности вашей коллекционной фигурки.',
    },
    {
        icon: Package,
        title: 'Премиальная упаковка',
        text: 'Фигурка поставляется в специально разработанной коллекционной упаковке.',
    },
]

export function Philosophy() {
    return (
        <section id="philosophy" className="relative border-t border-border py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                    <Reveal>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                            / Философия
                        </p>
                        <h2 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Каждая фигурка DROPZERO STUDIO создаётся вручную из премиальных
                            материалов.
                        </h2>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {['Ручная обработка', 'Для коллекционеров'].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </Reveal>

                    <ul className="flex flex-col divide-y divide-border border-y border-border">
                        {features.map((f, i) => (
                            <Reveal as="li" key={f.title} delay={i * 90}>
                                <div className="flex items-start gap-6 py-7">
                                    <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                                        <f.icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-medium">{f.title}</h3>
                                        <p className="mt-1.5 max-w-md leading-relaxed text-muted-foreground">
                                            {f.text}
                                        </p>
                                    </div>
                                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                                        0{i + 1}
                                    </span>
                                </div>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}

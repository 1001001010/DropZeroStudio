
import { Award, Package, Star } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import type { PhilosophyFeature } from '@/types'

// Данные преимуществ отделены от представления компонента.
const features: PhilosophyFeature[] = [
    {
        icon: Star,
        title: 'Уникальный номер',
        description:
            'Каждая фигурка получает собственный номер и становится частью ограниченной серии.',
    },
    {
        icon: Award,
        title: 'Сертификат',
        description:
            'В комплект входит официальный сертификат подлинности вашей коллекционной фигурки.',
    },
    {
        icon: Package,
        title: 'Премиальная упаковка',
        description:
            'Фигурка поставляется в специально разработанной коллекционной упаковке.',
    },
]

const labels = ['Ручная работа', 'Для коллекционеров'] as const

export function Philosophy() {
    return (
        <section
            id="philosophy"
            aria-labelledby="philosophy-title"
            className="relative scroll-mt-20 border-t border-border py-28"
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                    {/* Вводная часть секции */}
                    <Reveal>
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                                / Философия
                            </p>

                            <h2
                                id="philosophy-title"
                                className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
                            >
                                Каждая фигурка DROPZERO{' '}
                                <span className="text-red-600">
                                    STUDIO
                                </span>{' '}
                                создаётся вручную из премиальных материалов.
                            </h2>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {labels.map((label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Преимущества коллекции */}
                    <ul className="flex flex-col divide-y divide-border border-y border-border">
                        {features.map((feature, index) => {
                            const Icon = feature.icon

                            return (
                                <Reveal
                                    as="li"
                                    key={feature.title}
                                    delay={index * 90}
                                >
                                    <div className="flex items-start gap-6 py-7">
                                        <span
                                            aria-hidden="true"
                                            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-primary"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>

                                        <div className="min-w-0">
                                            <h3 className="text-xl font-medium">
                                                {feature.title}
                                            </h3>

                                            <p className="mt-1.5 max-w-md leading-relaxed text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <span
                                            aria-hidden="true"
                                            className="ml-auto shrink-0 font-mono text-xs text-muted-foreground"
                                        >
                                            0{index + 1}
                                        </span>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </section>
    )
}

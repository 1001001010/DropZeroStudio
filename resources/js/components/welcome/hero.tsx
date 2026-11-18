
import { ArrowUpRight } from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'

const Figure3D = lazy(() =>
    import('@/components/figure-3d').then(({ Figure3D }) => ({
        default: Figure3D,
    })),
)

// Путь к публичной 3D-модели.
const HERO_MODEL_PATH =
    'skins/models/Model.glb'

const heroDetails = [
    {
        label: 'Материал',
        value: 'Плюш',
    },
    {
        label: 'Статус',
        value: 'Лимитированный выпуск',
    },
    {
        label: 'Паспорт подлинности',
        value: 'В наличии',
    },
] as const

/**
 * Клиентская загрузка 3D-сцены.
 * Не допускает её рендеринга до монтирования React-компонента.
 */
function HeroScene() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <HeroSceneFallback />
    }

    return (
        <Suspense fallback={<HeroSceneFallback />}>
            <Figure3D modelPath={HERO_MODEL_PATH} />
        </Suspense>
    )
}

/**
 * Заглушка сохраняет визуальную композицию,
 * пока загружается 3D-модель.
 */
function HeroSceneFallback() {
    return (
        <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center"
        >
            <div className="h-48 w-48 rounded-full bg-primary/10 blur-[100px]" />
        </div>
    )
}

function HeroDetails() {
    return (
        <dl className="mt-14 grid max-w-md grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-3">
            {heroDetails.map(({ label, value }, index) => (
                <div
                    key={label}
                    className={index > 0 ? 'border-l border-border pl-6' : ''}
                >
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {label}
                    </dt>

                    <dd className="mt-1 font-mono text-sm leading-relaxed sm:text-base">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}

function HeroContent() {
    return (
        <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5">
                <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                />

                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Лимитированная коллекционная серия
                </span>
            </div>

            <h1 className="mt-6 text-balance text-6xl font-bold leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
                DROP
                <span className="text-primary">ZERO</span>
            </h1>

            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
                Коллекционные фигурки, созданные для тех, кто ценит
                уникальность, детали и редкость.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                    href="#collection"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    Смотреть коллекцию

                    <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </a>

                <a
                    href="#philosophy"
                    className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
                >
                    Философия бренда
                </a>
            </div>

            <HeroDetails />
        </div>
    )
}

export function Hero() {
    return (
        <section
            id="home"
            aria-labelledby="hero-title"
            className="relative flex min-h-screen scroll-mt-20 items-center overflow-hidden pt-16"
        >
            {/* Основное декоративное освещение. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[160px]"
            />

            {/* Фоновый логотип. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-[-4%] select-none text-center text-[26vw] font-bold leading-none tracking-tighter text-foreground/[0.03]"
            >
                DROPZERO
            </span>

            <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[1.05fr_1fr]">
                <HeroContent />

                <div className="order-1 h-[46vh] min-h-[340px] w-full lg:order-2 lg:h-[76vh]">
                    <HeroScene />
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-7xl justify-end px-6">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Вращайте фигурку жестом или мышью
                </span>
            </div>
        </section>
    )
}

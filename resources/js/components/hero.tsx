import { Link } from '@inertiajs/react'
import { ArrowUpRight } from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'

const Figure3D = lazy(() =>
    import('@/components/figure-3d').then((m) => ({ default: m.Figure3D })),
)

function Figure3DClient() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null
    return (
        <Suspense fallback={null}>
            <Figure3D />
        </Suspense>
    )
}

export function Hero() {
    return (
        <section
            id="home"
            className="relative flex min-h-screen items-center overflow-hidden pt-16"
        >
            {/* single hero light source */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[160px]"
            />
            {/* oversized wordmark watermark */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[-4%] text-center text-[26vw] font-bold leading-none tracking-tighter text-foreground/[0.03] select-none"
            >
                DROPZERO
            </span>

            <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[1.05fr_1fr]">
                {/* copy */}
                <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            Лимитированная коллекционная серия
                        </span>
                    </div>

                    <h1 className="mt-6 text-balance text-6xl font-bold leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
                        DROP
                        <span className="text-primary">ZERO</span>
                    </h1>

                    <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
                        Коллекционные фигурки, созданные для тех, кто ценит уникальность,
                        детали и редкость.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                        >
                            Смотреть коллекцию
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                        <a
                            href="#philosophy"
                            className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
                        >
                            Философия бренда
                        </a>
                    </div>

                    <dl className="mt-14 flex max-w-md items-stretch gap-6 border-t border-border pt-6">
                        <div>
                            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                                Серия
                            </dt>
                            <dd className="mt-1 font-mono text-xl">001 — 666</dd>
                        </div>
                        <div className="border-l border-border pl-6">
                            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                                Высота
                            </dt>
                            <dd className="mt-1 font-mono text-xl">20 см</dd>
                        </div>
                        <div className="border-l border-border pl-6">
                            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                                Сертификат
                            </dt>
                            <dd className="mt-1 font-mono text-xl">Да</dd>
                        </div>
                    </dl>
                </div>

                {/* 3D hero */}
                <div className="order-1 h-[46vh] min-h-[340px] w-full lg:order-2 lg:h-[76vh]">
                    <Figure3DClient />
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-7xl justify-between px-6">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Shadow — 001
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Перетащите, чтобы вращать
                </span>
            </div>
        </section>
    )
}

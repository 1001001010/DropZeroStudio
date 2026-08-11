import { Reveal } from '@/components/reveal'

export function Limited() {
    return (
        <section id="limited" className="relative py-28">
            <div className="mx-auto max-w-7xl px-6">
                <Reveal>
                    {/* certificate — the bone/paper material */}
                    <div className="relative overflow-hidden rounded-3xl bg-paper px-8 py-14 text-paper-foreground sm:px-14 sm:py-20">
                        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-paper-foreground/20 px-4 py-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-foreground/70">
                                        Ограниченный выпуск
                                    </span>
                                </div>
                                <h2 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                                    Каждая фигурка получает уникальный номер и сертификат
                                    подлинности.
                                </h2>
                            </div>

                            {/* the serial — signature detail */}
                            <div className="shrink-0 border-t border-paper-foreground/20 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                                <p className="font-mono text-xs uppercase tracking-widest text-paper-foreground/60">
                                    Серийный номер
                                </p>
                                <p className="mt-2 font-mono text-6xl font-medium tabular-nums sm:text-7xl">
                                    001
                                    <span className="text-paper-foreground/40">/666</span>
                                </p>
                            </div>
                        </div>

                        {/* faint watermark seal */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-16 text-[12rem] font-bold leading-none tracking-tighter text-paper-foreground/[0.04] select-none"
                        >
                            DZ
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

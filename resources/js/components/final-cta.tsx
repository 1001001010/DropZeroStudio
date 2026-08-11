import { Link } from '@inertiajs/react'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function FinalCta() {
    return (
        <section
            id="contact"
            className="relative overflow-hidden border-t border-border py-32"
        >
            {/* the second (and final) strong light source */}
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-[-40%] left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-primary/12 blur-[150px]"
            />

            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                <Reveal>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                        Join the collection
                    </p>
                    <h2 className="mt-6 text-balance text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
                        Присоединяйся к коллекционерам со всего мира и получи свою фигурку.
                    </h2>
                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                        >
                            Купить фигурку
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export function Footer() {
    return (
        <footer className="border-t border-border py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium tracking-[0.28em]">
                        DROPZERO STUDIO
                    </span>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Оригинальная коллекционная фигурка
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                    © {new Date().getFullYear()} DROPZERO
                </p>
            </div>
        </footer>
    )
}

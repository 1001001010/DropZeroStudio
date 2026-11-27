
import { Link } from '@inertiajs/react'
import { ArrowUpRight } from 'lucide-react'

import { Reveal } from '@/components/reveal'

export function FinalCta() {
    return (
        <section
            id="contact"
            aria-labelledby="final-cta-title"
            className="relative scroll-mt-20 overflow-hidden border-t border-border py-32"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-40%] left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-primary/12 blur-[150px]"
            />

            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                <Reveal>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                        Присоединяйся к сообществу коллекционеров
                    </p>

                    <h2
                        id="final-cta-title"
                        className="mt-6 text-balance text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl"
                    >
                        Присоединяйся к коллекционерам со всего мира и получи
                        свою фигурку.
                    </h2>

                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none"
                        >
                            Купить фигурку

                            <ArrowUpRight
                                aria-hidden="true"
                                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                            />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr] lg:gap-16">
                    {/* Бренд и описание */}
                    <div className="flex flex-col items-start">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                            aria-label="DropZeroStudio — главная"
                        >
                            <span
                                aria-hidden="true"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground"
                            >
                                DZ
                            </span>

                            <span className="text-sm font-semibold tracking-[0.25em]">
                                DROPZERO STUDIO
                            </span>
                        </Link>

                        <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Мир коллекционных фигурок, созданных с вниманием к
                            каждой детали. Каждый персонаж — отдельная история.
                        </p>

                        <div className="mt-8 flex items-center gap-2">
                            <span
                                aria-hidden="true"
                                className="relative flex h-2 w-2"
                            >
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                            </span>

                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                Собери свою историю
                            </span>
                        </div>
                    </div>

                    {/* Навигация по сайту */}
                    <div>
                        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Навигация
                        </h2>

                        <nav
                            aria-label="Навигация по сайту"
                            className="mt-6 flex flex-col items-start gap-4"
                        >
                            <Link
                                href="/"
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Главная
                            </Link>

                            <Link
                                href="/login"
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Личный кабинет
                            </Link>
                        </nav>
                    </div>

                    {/* Юридическая информация */}
                    <div>
                        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Правовая информация
                        </h2>

                        <nav
                            aria-label="Юридические документы"
                            className="mt-6 flex flex-col items-start gap-4"
                        >
                            <Link
                                href={route('legal.privacy')}
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Политика конфиденциальности
                            </Link>

                            <Link
                                href={route('legal.personal-data-consent')}
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Согласие на обработку персональных данных
                            </Link>

                            <Link
                                href={route('legal.terms')}
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Пользовательское соглашение
                            </Link>

                            <Link
                                href={route('legal.offer')}
                                className="text-sm transition-colors hover:text-primary focus-visible:text-primary"
                            >
                                Публичная оферта
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Нижняя панель */}
                <div className="flex flex-col gap-4 border-t border-border py-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        © {currentYear} DROPZERO STUDIO. Все права защищены.
                    </p>

                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Создано для коллекционеров
                    </p>
                </div>
            </div>
        </footer>
    )
}

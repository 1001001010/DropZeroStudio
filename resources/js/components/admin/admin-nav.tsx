import {
    ArrowLeft,
    DoorOpenIcon,
    Palette,
    Package,
    ShoppingBag,
    BookOpen,
} from 'lucide-react'

import { router, Link, usePage } from '@inertiajs/react'

import type { SharedData } from '@/types'

export function AdminNav() {
    const { auth } = usePage<SharedData>().props

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
            <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5">

                {/* Левая часть */}
                <div className="justify-self-start">
                    <a
                        href={route('home')}
                        className="group flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />

                        <span className="hidden sm:inline">
                            На главную
                        </span>
                    </a>
                </div>

                {/* Центральная навигация */}
                {auth.user?.is_admin && (
                    <div className="flex items-center gap-1">

                        <Link
                            href="/admin/orders"
                            className="group flex min-h-10 items-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ShoppingBag className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

                            <span className="hidden sm:inline">
                                Заказы
                            </span>
                        </Link>

                        <Link
                            href={route('admin.toys.index')}
                            className="group flex min-h-10 items-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Package className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

                            <span className="hidden sm:inline">
                                Игрушки
                            </span>
                        </Link>

                        <Link
                            href={route('admin.drops.index')}
                            className="group flex min-h-10 items-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <BookOpen className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

                            <span className="hidden sm:inline">
                                Дроп
                            </span>
                        </Link>

                        <Link
                            href={route('admin.skins.index')}
                            className="group flex min-h-10 items-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Palette className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

                            <span className="hidden sm:inline">
                                Скины
                            </span>
                        </Link>

                    </div>
                )}

                {/* Правая часть */}
                <div className="justify-self-end">
                    {auth.user?.is_admin && (
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="group flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <DoorOpenIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />

                            <span className="hidden sm:inline">
                                Выход
                            </span>
                        </button>
                    )}
                </div>

            </div>
        </nav>
    )
}

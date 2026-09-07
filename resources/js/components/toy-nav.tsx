import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'
import type { SharedData } from '@/types'

export function ToyNav() {
    const { auth } = usePage<SharedData>().props

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <a
                    href="/"
                    className="group flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

                    <span className="hidden sm:inline">
                        Назад
                    </span>
                </a>

                <div className="flex items-center gap-2">
                    <span
                        className="h-1.5 w-1.5 bg-primary"
                        aria-hidden="true"
                    />

                    <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-foreground">
                        Dropzero
                    </span>
                </div>

                {auth.user?.is_admin && (
                    <Link
                        href="/admin"
                        className="group flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ShieldCheck className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />

                        <span className="hidden sm:inline">
                            Админка
                        </span>
                    </Link>
                )}
            </div>
        </nav>
    )
}

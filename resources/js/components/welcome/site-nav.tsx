
import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'

import { cn } from '@/lib/utils'

const navigationLinks = [
    { href: '#philosophy', label: 'Философия' },
    { href: '#limited', label: 'Серия' },
    { href: '#collection', label: 'Коллекция' },
    { href: '#specs', label: 'Спецификация' },
] as const

const SCROLL_THRESHOLD = 24

export function SiteNav() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD)
        }

        // Синхронизируем состояние при монтировании.
        handleScroll()

        window.addEventListener('scroll', handleScroll, {
            passive: true,
        })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
                isScrolled
                    ? 'border-border/70 bg-background/80 backdrop-blur-xl'
                    : 'border-transparent bg-transparent',
            )}
        >
            <nav
                aria-label="Основная навигация"
                className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
            >
                <Link
                    href="/"
                    aria-label="DropZeroStudio — главная страница"
                    className="flex items-center gap-2"
                >
                    <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-primary"
                    />

                    <span className="text-sm font-medium tracking-[0.28em]">
                        DROPZERO
                        <span className="text-red-600">STUDIO</span>
                    </span>
                </Link>

                <ul className="hidden items-center gap-8 md:flex">
                    {navigationLinks.map(({ href, label }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                <Link
                    href="/login"
                    className="rounded-full border border-border px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
                >
                    Личный кабинет
                </Link>
            </nav>
        </header>
    )
}

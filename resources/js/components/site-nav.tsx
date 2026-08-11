import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
    { href: '#philosophy', label: 'Философия' },
    { href: '#limited', label: 'Серия' },
    { href: '#collection', label: 'Коллекция' },
    { href: '#specs', label: 'Спецификация' },
]

export function SiteNav() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
                scrolled
                    ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl'
                    : 'border-b border-transparent',
            )}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium tracking-[0.28em]">DROPZERO</span>
                </Link>

                <ul className="hidden items-center gap-8 md:flex">
                    {links.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {l.label}
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

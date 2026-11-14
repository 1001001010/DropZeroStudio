
import { useEffect, type ReactNode } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { toast } from 'sonner'

import { Toaster } from '@/components/ui/sonner'
import type { MainLayoutPageProps } from '@/types/index.d'

interface MainLayoutProps {
    children: ReactNode
}

/**
 * Основная навигация сайта.
 *
 * Конфигурация вынесена за пределы компонента,
 * чтобы не создавать массив при каждом рендере.
 */
const navigationItems = [
    { label: 'Главная', href: '/' },
    { label: 'Магазин', href: '/shop' },
    { label: 'Коллекции', href: '/collections' },
    { label: 'О нас', href: '/about' },
] as const

/**
 * Ссылки в нижней части сайта.
 */
const footerItems = [
    { label: 'Конфиденциальность', href: '/privacy' },
    { label: 'Условия', href: '/terms' },
    { label: 'Контакты', href: '/contacts' },
] as const

/**
 * Проверяет, соответствует ли текущий URL пункту навигации.
 */
function isActiveLink(currentUrl: string, href: string): boolean {
    const currentPath = currentUrl.split('?')[0].replace(/\/$/, '') || '/'
    const targetPath = href.replace(/\/$/, '') || '/'

    if (targetPath === '/') {
        return currentPath === '/'
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { flash, url } = usePage<MainLayoutPageProps>().props
    const currentYear = new Date().getFullYear()

    /**
     * Показываем уведомления, переданные Laravel через flash-сессию.
     */
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success)
        }

        if (flash?.error) {
            toast.error(flash.error)
        }
    }, [flash?.success, flash?.error])

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Основная шапка сайта */}
            <header
                className="
                    fixed
                    inset-x-0
                    top-0
                    z-50
                    border-b
                    border-white/10
                    bg-[#050505]/80
                    backdrop-blur-xl
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        h-16
                        max-w-6xl
                        items-center
                        justify-between
                        px-5
                        lg:px-6
                    "
                >
                    {/* Логотип */}
                    <Link
                        href="/"
                        aria-label="DropZeroStudio — главная"
                        className="
                            shrink-0
                            text-lg
                            font-black
                            tracking-tight
                        "
                    >
                        DropZero
                        <span className="text-[#AA141E]">
                            Studio
                        </span>
                    </Link>

                    {/* Навигация */}
                    <nav
                        aria-label="Основная навигация"
                        className="
                            hidden
                            items-center
                            gap-6
                            lg:flex
                            xl:gap-8
                        "
                    >
                        {navigationItems.map((item) => {
                            const isActive = isActiveLink(url, item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`
                                        whitespace-nowrap
                                        text-sm
                                        transition-colors
                                        ${isActive
                                            ? 'text-white'
                                            : 'text-white/50 hover:text-white'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Переход в личный кабинет */}
                    <Link
                        href="/account"
                        className="
                            shrink-0
                            rounded-full
                            border
                            border-white/10
                            bg-white/[0.04]
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white/70
                            transition-all
                            hover:border-[#AA141E]/50
                            hover:bg-[#AA141E]/10
                            hover:text-white
                            xl:px-4
                            xl:text-sm
                        "
                    >
                        Личный кабинет
                    </Link>
                </div>
            </header>

            {/* Основное содержимое страницы */}
            <main className="min-h-screen pt-16">
                {children}
            </main>

            {/* Подвал сайта */}
            <footer className="border-t border-white/10 bg-[#050505]">
                <div
                    className="
                        mx-auto
                        max-w-6xl
                        px-5
                        py-12
                        lg:px-6
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-8
                            md:flex-row
                            md:items-center
                            md:justify-between
                        "
                    >
                        {/* Информация о бренде */}
                        <div>
                            <Link
                                href="/"
                                className="text-lg font-black"
                            >
                                DropZero
                                <span className="text-[#AA141E]">
                                    Studio
                                </span>
                            </Link>

                            <p
                                className="
                                    mt-2
                                    max-w-sm
                                    text-sm
                                    leading-relaxed
                                    text-white/40
                                "
                            >
                                Создаём вещи, которые хочется
                                коллекционировать.
                            </p>
                        </div>

                        {/* Полезные ссылки */}
                        <nav
                            aria-label="Дополнительная навигация"
                            className="
                                flex
                                flex-wrap
                                gap-x-6
                                gap-y-3
                                text-sm
                                text-white/40
                            "
                        >
                            {footerItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="
                                        transition-colors
                                        hover:text-white
                                    "
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Копирайт */}
                    <div
                        className="
                            mt-8
                            border-t
                            border-white/10
                            pt-6
                            text-xs
                            text-white/30
                        "
                    >
                        © {currentYear} DropZeroStudio.
                        Все права защищены.
                    </div>
                </div>
            </footer>

            {/* Глобальные уведомления */}
            <Toaster />
        </div>
    )
}

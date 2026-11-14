
import { Link } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'

export function AuthHeader() {
    return (
        <header className="flex w-full items-center justify-between">
            {/* Возвращение на главную страницу */}
            <Link
                href="/"
                className="
                    group inline-flex items-center gap-2
                    text-sm text-white/45
                    transition-colors duration-200
                    hover:text-white
                "
            >
                <ArrowLeft
                    size={16}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                />

                <span>На главную</span>
            </Link>

            {/* Логотип проекта */}
            <Link
                href="/"
                aria-label="DropZeroStudio — главная страница"
                className="
                    text-sm font-bold tracking-[0.2em]
                    text-white transition-colors
                    hover:text-[#AA141E]
                "
            >
                DROPZERO<span className="text-[#AA141E]">STUDIO</span>
            </Link>
        </header>
    )
}

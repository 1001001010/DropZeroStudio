import type { ReactNode } from "react";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({
    children,
}: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-[#050505] text-white">

            {/* HEADER */}

            <header
                className="
                    fixed
                    top-0
                    left-0
                    right-0
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

                    {/* LOGO */}

                    <a
                        href="/"
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
                    </a>


                    {/* NAVIGATION */}

                    <nav
                        className="
                            hidden
                            items-center
                            gap-6
                            lg:flex
                            xl:gap-8
                        "
                    >
                        <a
                            href="/"
                            className="
                                whitespace-nowrap
                                text-sm
                                text-white/50
                                transition-colors
                                hover:text-white
                            "
                        >
                            Главная
                        </a>

                        <a
                            href="/shop"
                            className="
                                whitespace-nowrap
                                text-sm
                                text-white/50
                                transition-colors
                                hover:text-white
                            "
                        >
                            Магазин
                        </a>

                        <a
                            href="/collections"
                            className="
                                whitespace-nowrap
                                text-sm
                                text-white/50
                                transition-colors
                                hover:text-white
                            "
                        >
                            Коллекции
                        </a>

                        <a
                            href="/about"
                            className="
                                whitespace-nowrap
                                text-sm
                                text-white/50
                                transition-colors
                                hover:text-white
                            "
                        >
                            О нас
                        </a>
                    </nav>


                    {/* ACCOUNT */}

                    <a
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
                    </a>

                </div>
            </header>


            {/* PAGE CONTENT */}

            <main className="pt-16">
                {children}
            </main>


            {/* FOOTER */}

            <footer
                className="
                    border-t
                    border-white/10
                    bg-[#050505]
                "
            >
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

                        {/* BRAND */}

                        <div>
                            <div
                                className="
                                    text-lg
                                    font-black
                                "
                            >
                                DropZero
                                <span className="text-[#AA141E]">
                                    Studio
                                </span>
                            </div>

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


                        {/* LINKS */}

                        <div
                            className="
                                flex
                                flex-wrap
                                gap-x-6
                                gap-y-3
                                text-sm
                                text-white/40
                            "
                        >
                            <a
                                href="/privacy"
                                className="
                                    transition-colors
                                    hover:text-white
                                "
                            >
                                Конфиденциальность
                            </a>

                            <a
                                href="/terms"
                                className="
                                    transition-colors
                                    hover:text-white
                                "
                            >
                                Условия
                            </a>

                            <a
                                href="/contacts"
                                className="
                                    transition-colors
                                    hover:text-white
                                "
                            >
                                Контакты
                            </a>
                        </div>

                    </div>


                    {/* COPYRIGHT */}

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
                        © {new Date().getFullYear()} DropZeroStudio.
                        Все права защищены.
                    </div>

                </div>
            </footer>

        </div>
    );
}

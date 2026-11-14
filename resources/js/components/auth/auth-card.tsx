
import type { AuthCardProps } from '@/types/index.d'

export function AuthCard({
    title,
    description,
    children,
    className = '',
}: AuthCardProps) {
    return (
        <section
            className={`
                w-full max-w-md
                rounded-2xl
                border border-white/10
                bg-[#0A0A0A]
                p-6 sm:p-8
                shadow-2xl shadow-black/30
                ${className}
            `}
        >
            {/* Заголовок и описание карточки */}
            {(title || description) && (
                <div className="mb-8 space-y-2 text-center">
                    {title && (
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            {title}
                        </h1>
                    )}

                    {description && (
                        <p className="text-sm leading-relaxed text-white/45">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* Основное содержимое карточки */}
            {children}
        </section>
    )
}

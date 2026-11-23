
import { useEffect, type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'

import { Toaster } from '@/components/ui/sonner'
import type { MainLayoutPageProps } from '@/types'

interface MainLayoutProps {
    children: ReactNode
}

/**
 * Основной layout приложения.
 *
 * Не задаёт глобальных стилей, размеров, отступов или оформления.
 * Используется только для отображения содержимого страницы
 * и глобальных уведомлений Laravel.
 */
export default function MainLayout({ children }: MainLayoutProps) {
    const { flash } = usePage<MainLayoutPageProps>().props

    /**
     * Обрабатываем flash-уведомления, переданные Laravel.
     */
    useEffect(() => {
        if (flash?.success) {
            // Уведомление об успешном выполнении действия.
        }

        if (flash?.error) {
            // Уведомление об ошибке.
        }
    }, [flash?.success, flash?.error])

    return (
        <>
            {children}

            <Toaster />
        </>
    )
}


import '../css/app.css'

import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { hydrateRoot } from 'react-dom/client'
import { route as routeFn } from 'ziggy-js'

import CookieConsent from '@/components/cookie-consent'
import { initializeTheme } from '@/hooks/use-appearance'

/**
 * Глобальная типизация Ziggy.
 *
 * Позволяет использовать route() в компонентах
 * без необходимости импортировать функцию каждый раз.
 */
declare global {
    const route: typeof routeFn
}

/**
 * Инициализируем тему до первого рендера приложения,
 * чтобы избежать визуального переключения темы.
 */
initializeTheme()

/**
 * Создаёт React-приложение на основе Inertia.
 */
createInertiaApp({
    /**
     * Формирует заголовок страницы.
     */
    title: (title) => title,

    /**
     * Находит и загружает соответствующий компонент страницы.
     */
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),

    /**
     * Подключает React-приложение к DOM.
     *
     * Используем hydrateRoot, поскольку HTML уже подготовлен
     * сервером Laravel/Inertia.
     */
    setup({ el, App, props }) {
        hydrateRoot(
            el,
            <>
                <App {...props} />
                <CookieConsent />
            </>,
        )
    },

    /**
     * Настройки индикатора загрузки Inertia.
     */
    progress: {
        color: '#AA141E',
    },
})

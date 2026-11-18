
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { hydrateRoot } from 'react-dom/client'
import { route as routeFn } from 'ziggy-js'

import CookieConsent from '@/components/cookie-consent'
import { initializeTheme } from '@/hooks/use-appearance'

declare global {
    const route: typeof routeFn
}

const appName = import.meta.env.VITE_APP_NAME || 'DropZeroStudio'

// Инициализируем тему до гидратации приложения.
initializeTheme()

createInertiaApp({
    title: (title) =>
        title ? `${title} | ${appName}` : appName,

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),

    setup({ el, App, props }) {
        hydrateRoot(
            el,
            <>
                <App {...props} />
                <CookieConsent />
            </>,
        )
    },

    progress: {
        color: '#AA141E',
    },
})

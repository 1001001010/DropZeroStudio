
import { useEffect, useState } from 'react'

export type Appearance = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'appearance'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/**
 * Возвращает сохранённую тему.
 * Не допускает использования некорректных значений из localStorage.
 */
function getStoredAppearance(): Appearance {
    const appearance = localStorage.getItem(STORAGE_KEY)

    if (
        appearance === 'light' ||
        appearance === 'dark' ||
        appearance === 'system'
    ) {
        return appearance
    }

    return 'system'
}

/**
 * Определяет, должна ли использоваться тёмная тема.
 */
function resolveTheme(appearance: Appearance): boolean {
    if (appearance === 'dark') return true
    if (appearance === 'light') return false

    return window.matchMedia(MEDIA_QUERY).matches
}

/**
 * Применяет выбранную тему к корневому HTML-элементу.
 */
function applyTheme(appearance: Appearance): void {
    document.documentElement.classList.toggle(
        'dark',
        resolveTheme(appearance),
    )
}

/**
 * Инициализирует тему до запуска React.
 */
export function initializeTheme(): void {
    applyTheme(getStoredAppearance())
}

/**
 * Хук управления темой приложения.
 */
export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(
        () => getStoredAppearance(),
    )

    /**
     * Сохраняет и применяет выбранную тему.
     */
    const updateAppearance = (mode: Appearance): void => {
        setAppearance(mode)
        localStorage.setItem(STORAGE_KEY, mode)
        applyTheme(mode)
    }

    /**
     * Синхронизирует тему с настройками системы,
     * если пользователь выбрал режим system.
     */
    useEffect(() => {
        const mediaQuery = window.matchMedia(MEDIA_QUERY)

        const handleSystemThemeChange = (): void => {
            if (getStoredAppearance() === 'system') {
                applyTheme('system')
            }
        }

        mediaQuery.addEventListener('change', handleSystemThemeChange)

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange)
        }
    }, [])

    return {
        appearance,
        updateAppearance,
    }
}

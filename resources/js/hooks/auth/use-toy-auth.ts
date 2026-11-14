
import { useState } from 'react'

import type { AuthMode, ToyCode } from '@/types/index.d'

/**
 * Проверяет, что значение является обычным объектом.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

/**
 * Проверяет поддерживаемый сценарий авторизации.
 */
function isAuthMode(value: unknown): value is AuthMode {
    return value === 'registration' || value === 'login'
}

/**
 * Извлекает сообщение об ошибке из ответа сервера.
 */
function getErrorMessage(payload: unknown): string | null {
    if (!isRecord(payload)) {
        return null
    }

    return typeof payload.message === 'string'
        ? payload.message
        : null
}

/**
 * Получает CSRF-токен из meta-тега страницы.
 */
function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    )?.content ?? ''
}

export function useToyAuth() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    /**
     * Отправляет код фигурки на сервер.
     *
     * Возвращает сценарий авторизации, если сервер подтвердил код.
     * При ошибке возвращает null и сохраняет сообщение для интерфейса.
     */
    async function sendCode(code: ToyCode): Promise<AuthMode | null> {
        setIsLoading(true)
        setError('')

        try {
            const csrfToken = getCsrfToken()

            if (!csrfToken) {
                setError('Не удалось получить токен безопасности. Обновите страницу.')
                return null
            }

            const response = await fetch('/auth/send-code', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    toy_code: code,
                }),
            })

            const payload: unknown = await response
                .json()
                .catch(() => null)

            if (!response.ok) {
                setError(
                    getErrorMessage(payload) ??
                    'Не удалось проверить код. Попробуйте ещё раз.',
                )

                return null
            }

            // Проверяем структуру ответа перед использованием данных.
            if (
                !isRecord(payload) ||
                payload.success !== true ||
                !isAuthMode(payload.mode)
            ) {
                setError('Сервер вернул некорректный ответ.')
                return null
            }

            return payload.mode
        } catch {
            setError('Не удалось подключиться к серверу.')
            return null
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        sendCode,
        setError,
    }
}

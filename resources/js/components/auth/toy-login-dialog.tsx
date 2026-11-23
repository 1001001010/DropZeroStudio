
import { useEffect, useState } from 'react'
import {
    Mail,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { EmailCodeInput } from '@/components/auth/email-code-input'
import { useEmailCode } from '@/hooks/auth/use-email-code'

import type { ToyLoginDialogProps } from '@/types'

/**
 * Получает CSRF-токен Laravel из meta-тега страницы.
 */
function getCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    )
}

/**
 * Безопасно извлекает сообщение об ошибке из ответа API.
 */
function getErrorMessage(
    data: unknown,
    fallback: string,
): string {
    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
    ) {
        return data.message
    }

    return fallback
}

export function ToyLoginDialog({
    open,
    onOpenChange,
    toyCode,
    onComplete,
}: ToyLoginDialogProps) {
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Используем общую логику шестизначного кода и таймера.
    const emailCode = useEmailCode({
        enabled: open,
    })

    /**
     * Сбрасываем состояние при открытии и закрытии диалога.
     */
    useEffect(() => {
        if (open) {
            emailCode.resetCode()
            setError('')
            setIsLoading(false)
            return
        }

        setError('')
        setIsLoading(false)

        // resetCode намеренно вызывается только при изменении open.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    /**
     * Подтверждает вход с помощью шестизначного email-кода.
     */
    async function handleVerify() {
        if (!emailCode.isComplete) {
            setError('Введите код полностью')
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('/auth/login/confirm', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    toy_code: toyCode,
                    code: emailCode.codeValue,
                }),
            })

            const data: unknown = await response.json().catch(() => null)

            if (!response.ok) {
                setError(
                    getErrorMessage(
                        data,
                        'Неверный код подтверждения',
                    ),
                )

                return
            }

            onComplete?.()
            onOpenChange(false)
        } catch {
            setError(
                'Не удалось проверить код. Попробуйте ещё раз.',
            )
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Повторно отправляет код подтверждения на email владельца.
     */
    async function handleResend() {
        if (emailCode.seconds > 0 || isLoading) {
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    toy_code: toyCode,
                }),
            })

            const data: unknown = await response.json().catch(() => null)

            if (!response.ok) {
                setError(
                    getErrorMessage(
                        data,
                        'Не удалось отправить код',
                    ),
                )

                return
            }

            // Очищаем предыдущий код и запускаем таймер заново.
            emailCode.resetCode()
        } catch {
            setError(
                'Не удалось отправить код. Попробуйте ещё раз.',
            )
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Обновляет введённую цифру и очищает предыдущую ошибку.
     */
    function handleCodeChange(index: number, value: string) {
        emailCode.handleChange(index, value)
        setError('')
    }

    /**
     * Обрабатывает вставку полного кода из буфера обмена.
     */
    function handleCodePaste(
        event: React.ClipboardEvent<HTMLInputElement>,
    ) {
        emailCode.handlePaste(event)
        setError('')
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent
                className="
                    w-[calc(100%-2rem)]
                    max-w-md
                    overflow-hidden
                    rounded-xl
                    border-border
                    bg-card
                    p-0
                    shadow-2xl
                "
            >
                {/* Верхняя декоративная линия */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

                <div className="px-6 pb-6 pt-6 sm:px-7">
                    <DialogHeader className="space-y-4 text-left">
                        <div className="flex items-center justify-between">
                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    font-mono
                                    text-[0.65rem]
                                    uppercase
                                    tracking-[0.25em]
                                    text-muted-foreground
                                "
                            >
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-primary
                                    "
                                />

                                DROPZERO STUDIO
                            </div>

                            <span
                                className="
                                    font-mono
                                    text-[0.65rem]
                                    uppercase
                                    tracking-widest
                                    text-muted-foreground/60
                                "
                            >
                                {toyCode}
                            </span>
                        </div>

                        <div>
                            <DialogTitle
                                className="
                                    font-mono
                                    text-xl
                                    font-medium
                                    tracking-tight
                                "
                            >
                                Вход владельца
                            </DialogTitle>

                            <DialogDescription
                                className="
                                    mt-2
                                    text-sm
                                    leading-relaxed
                                    text-muted-foreground
                                "
                            >
                                Код подтверждения отправлен
                                на email владельца фигурки.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Индикатор этапов */}
                    <div className="my-6 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-primary" />
                        <div className="h-1 flex-1 rounded-full bg-primary" />
                    </div>

                    <div className="space-y-6">
                        {/* Иконка подтверждения */}
                        <div className="flex justify-center">
                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-primary/20
                                    bg-primary/5
                                    text-primary
                                    shadow-[0_0_30px_rgba(170,20,30,0.12)]
                                "
                            >
                                <Mail className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Шестизначный код */}
                        <EmailCodeInput
                            code={emailCode.code}
                            disabled={isLoading}
                            setInputRef={emailCode.setInputRef}
                            onChange={handleCodeChange}
                            onKeyDown={emailCode.handleKeyDown}
                            onPaste={handleCodePaste}
                        />

                        {/* Сообщение об ошибке */}
                        {error && (
                            <p
                                role="alert"
                                className="
                                    text-center
                                    font-mono
                                    text-xs
                                    text-destructive
                                "
                            >
                                {error}
                            </p>
                        )}

                        {/* Таймер и повторная отправка */}
                        <div className="text-center">
                            {emailCode.seconds > 0 ? (
                                <p
                                    className="
                                        font-mono
                                        text-xs
                                        text-muted-foreground
                                    "
                                >
                                    Код действителен{' '}
                                    <span className="text-foreground">
                                        {emailCode.formattedTime}
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        font-mono
                                        text-xs
                                        text-muted-foreground
                                        transition-colors
                                        hover:text-foreground
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />

                                    Отправить код повторно
                                </button>
                            )}
                        </div>

                        {/* Подтверждение входа */}
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={!emailCode.isComplete || isLoading}
                            className="
                                flex
                                h-12
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-md
                                bg-primary
                                font-semibold
                                tracking-wide
                                text-primary-foreground
                                transition-all
                                duration-300
                                hover:opacity-90
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            {isLoading ? (
                                <>
                                    <span
                                        className="
                                            h-4
                                            w-4
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-primary-foreground/30
                                            border-t-primary-foreground
                                        "
                                    />

                                    Проверка...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />

                                    Войти
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

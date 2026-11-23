
import { useEffect, useState } from 'react'
import {
    ArrowRight,
    KeyRound,
    Mail,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react'
import { Link } from '@inertiajs/react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import { EmailCodeInput } from '@/components/auth/email-code-input'
import { useEmailCode } from '@/hooks/auth/use-email-code'

import type { RegistrationDialogProps } from '@/types'

/**
 * Возвращает CSRF-токен Laravel из meta-тега страницы.
 */
function getCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    )
}

/**
 * Маскирует email, чтобы не показывать адрес полностью
 * на экране подтверждения.
 */
function maskEmail(email: string): string {
    const [name, domain] = email.split('@')

    if (!name || !domain) {
        return email
    }

    const visible = name.slice(0, Math.min(2, name.length))
    const hidden = '*'.repeat(Math.max(2, name.length - visible.length))

    return `${visible}${hidden}@${domain}`
}

export function RegistrationDialog({
    open,
    onOpenChange,
    toyCode,
    onComplete,
}: RegistrationDialogProps) {
    const [step, setStep] = useState<1 | 2>(1)

    const [email, setEmail] = useState('')
    const [secretKey, setSecretKey] = useState('')

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [personalDataConsent, setPersonalDataConsent] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Общая логика OTP-ввода и таймера вынесена в отдельный хук.
    const emailCode = useEmailCode({
        enabled: open && step === 2,
    })

    /**
     * Сбрасываем состояние регистрации после закрытия диалога.
     */
    useEffect(() => {
        if (open) {
            return
        }

        setStep(1)
        setEmail('')
        setSecretKey('')
        setError('')
        setIsLoading(false)
        setPersonalDataConsent(false)
        setTermsAccepted(false)
        emailCode.resetCode()
    }, [open])

    /**
     * Первый шаг: проверка email, секретного ключа и согласий.
     */
    async function handleContinue() {
        setError('')

        const normalizedEmail = email.trim()

        if (!normalizedEmail) {
            setError('Введите email')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError('Введите корректный email')
            return
        }

        if (!secretKey.trim()) {
            setError('Введите секретный ключ')
            return
        }

        if (!personalDataConsent || !termsAccepted) {
            setError('Необходимо принять оба обязательных документа.')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/auth/registration/verify', {
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
                    email: normalizedEmail,
                    secret_key: secretKey,
                }),
            })

            const data: unknown = await response.json().catch(() => null)

            if (!response.ok) {
                const message =
                    typeof data === 'object' &&
                        data !== null &&
                        'message' in data &&
                        typeof data.message === 'string'
                        ? data.message
                        : 'Произошла ошибка'

                setError(message)
                return
            }

            // Небольшая пауза сохраняет плавность перехода между шагами.
            await new Promise((resolve) => window.setTimeout(resolve, 700))

            setEmail(normalizedEmail)
            emailCode.resetCode()
            setStep(2)
        } catch {
            setError('Не удалось отправить код. Попробуйте ещё раз.')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Подтверждение email с помощью шестизначного кода.
     */
    async function handleVerify() {
        if (!emailCode.isComplete) {
            setError('Введите код полностью')
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('/auth/registration/confirm', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    email,
                    code: emailCode.codeValue,
                    personal_data_consent: personalDataConsent,
                    terms_accepted: termsAccepted,
                }),
            })

            const data: unknown = await response.json().catch(() => null)

            if (!response.ok) {
                const message =
                    typeof data === 'object' &&
                        data !== null &&
                        'message' in data &&
                        typeof data.message === 'string'
                        ? data.message
                        : 'Неверный код подтверждения'

                setError(message)
                return
            }

            onComplete?.()
            onOpenChange(false)
        } catch {
            setError('Не удалось проверить код. Попробуйте ещё раз.')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Повторная отправка кода.
     *
     * Пока серверный маршрут для регистрации не определён,
     * здесь сохранена прежняя временная имитация отправки.
     */
    async function handleResend() {
        if (emailCode.seconds > 0 || isLoading) {
            return
        }

        setError('')
        setIsLoading(true)

        try {
            await new Promise((resolve) => window.setTimeout(resolve, 700))

            emailCode.resetCode()
        } catch {
            setError('Не удалось отправить код')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Обновляет OTP-код и очищает предыдущую ошибку.
     */
    function handleCodeChange(index: number, value: string) {
        emailCode.handleChange(index, value)
        setError('')
    }

    /**
     * Вставляет OTP-код и очищает предыдущую ошибку.
     */
    function handleCodePaste(
        event: React.ClipboardEvent<HTMLInputElement>,
    ) {
        emailCode.handlePaste(event)
        setError('')
    }

    /**
     * Возвращает пользователя к вводу email и секретного ключа.
     */
    function handleBack() {
        setStep(1)
        setError('')
        emailCode.resetCode()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(170,20,30,0.8)]" />

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
                            <DialogTitle className="font-mono text-xl font-medium tracking-tight">
                                {step === 1
                                    ? 'Регистрация владельца'
                                    : 'Подтвердите email'}
                            </DialogTitle>

                            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step === 1
                                    ? 'Введите данные для активации коллекционной фигурки.'
                                    : `Код подтверждения отправлен на ${maskEmail(email)}`}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Индикатор шагов */}
                    <div className="my-6 flex items-center gap-2">
                        <div
                            className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-border'
                                }`}
                        />

                        <div
                            className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'
                                }`}
                        />
                    </div>

                    {/* Первый шаг: данные владельца */}
                    {step === 1 && (
                        <div className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="registration-email"
                                    className="
                                        font-mono
                                        text-[0.65rem]
                                        uppercase
                                        tracking-[0.2em]
                                        text-muted-foreground
                                    "
                                >
                                    Email
                                </Label>

                                <div className="relative">
                                    <Mail
                                        className="
                                            absolute
                                            left-3
                                            top-1/2
                                            h-4
                                            w-4
                                            -translate-y-1/2
                                            text-muted-foreground
                                        "
                                    />

                                    <Input
                                        id="registration-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value)
                                            setError('')
                                        }}
                                        className="
                                            h-12
                                            border-border
                                            bg-background
                                            pl-10
                                            font-mono
                                            text-sm
                                            transition-all
                                            focus:border-primary
                                            focus:ring-primary/20
                                        "
                                    />
                                </div>
                            </div>

                            {/* Secret Key */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="registration-secret"
                                    className="
                                        font-mono
                                        text-[0.65rem]
                                        uppercase
                                        tracking-[0.2em]
                                        text-muted-foreground
                                    "
                                >
                                    Secret Key
                                </Label>

                                <div className="relative">
                                    <KeyRound
                                        className="
                                            absolute
                                            left-3
                                            top-1/2
                                            h-4
                                            w-4
                                            -translate-y-1/2
                                            text-muted-foreground
                                        "
                                    />

                                    <Input
                                        id="registration-secret"
                                        type="password"
                                        autoComplete="off"
                                        placeholder="Введите секретный ключ"
                                        value={secretKey}
                                        onChange={(event) => {
                                            setSecretKey(event.target.value)
                                            setError('')
                                        }}
                                        className="
                                            h-12
                                            border-border
                                            bg-background
                                            pl-10
                                            font-mono
                                            text-sm
                                            transition-all
                                            focus:border-primary
                                            focus:ring-primary/20
                                        "
                                    />
                                </div>

                                <p className="font-mono text-[0.65rem] leading-relaxed text-muted-foreground/60">
                                    Секретный ключ подтверждает право
                                    владения фигуркой.
                                </p>
                            </div>

                            {/* Ошибка первого шага */}
                            {error && (
                                <p
                                    role="alert"
                                    className="
                                        rounded-md
                                        border
                                        border-destructive/20
                                        bg-destructive/5
                                        px-3
                                        py-2
                                        font-mono
                                        text-xs
                                        text-destructive
                                    "
                                >
                                    {error}
                                </p>
                            )}

                            {/* Обязательные согласия */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="personal-data-consent"
                                        checked={personalDataConsent}
                                        onCheckedChange={(checked) => {
                                            setPersonalDataConsent(
                                                checked === true,
                                            )
                                            setError('')
                                        }}
                                    />

                                    <Label
                                        htmlFor="personal-data-consent"
                                        className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
                                    >
                                        Я даю согласие на обработку
                                        персональных данных в соответствии с{' '}
                                        <Link
                                            href="/legal/personal-data-consent"
                                            target="_blank"
                                            className="text-foreground underline underline-offset-4 hover:text-[#AA141E]"
                                        >
                                            Согласием на обработку персональных
                                            данных
                                        </Link>
                                        .
                                    </Label>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms-accepted"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => {
                                            setTermsAccepted(checked === true)
                                            setError('')
                                        }}
                                    />

                                    <Label
                                        htmlFor="terms-accepted"
                                        className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
                                    >
                                        Я принимаю условия{' '}
                                        <Link
                                            href="/legal/terms"
                                            target="_blank"
                                            className="text-foreground underline underline-offset-4 hover:text-[#AA141E]"
                                        >
                                            Пользовательского соглашения
                                        </Link>
                                        .
                                    </Label>
                                </div>

                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Ознакомьтесь также с{' '}
                                    <Link
                                        href="/legal/privacy"
                                        target="_blank"
                                        className="text-foreground underline underline-offset-4 hover:text-[#AA141E]"
                                    >
                                        Политикой конфиденциальности
                                    </Link>
                                    .
                                </p>
                            </div>

                            {/* Переход к подтверждению email */}
                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={
                                    isLoading ||
                                    !personalDataConsent ||
                                    !termsAccepted
                                }
                                className="
                                    group
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
                                        Продолжить

                                        <ArrowRight
                                            className="
                                                h-4
                                                w-4
                                                transition-transform
                                                group-hover:translate-x-1
                                            "
                                        />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60" />

                                <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/60">
                                    Защищённая активация
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Второй шаг: подтверждение email */}
                    {step === 2 && (
                        <div className="space-y-6">
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

                            {/* Шестизначный код подтверждения */}
                            <EmailCodeInput
                                code={emailCode.code}
                                disabled={isLoading}
                                setInputRef={emailCode.setInputRef}
                                onChange={handleCodeChange}
                                onKeyDown={emailCode.handleKeyDown}
                                onPaste={handleCodePaste}
                            />

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
                                    <p className="font-mono text-xs text-muted-foreground">
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

                            {/* Подтверждение регистрации */}
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

                                        Подтвердить
                                    </>
                                )}
                            </button>

                            {/* Возврат к предыдущему шагу */}
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={isLoading}
                                className="
                                    block
                                    w-full
                                    font-mono
                                    text-[0.65rem]
                                    uppercase
                                    tracking-wider
                                    text-muted-foreground
                                    transition-colors
                                    hover:text-foreground
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                ← Изменить email или secret key
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

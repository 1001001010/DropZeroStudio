"use client"

import { useEffect, useRef, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, KeyRound, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react"

type RegistrationDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: string
    onComplete?: () => void
}

export function RegistrationDialog({
    open,
    onOpenChange,
    toyCode,
    onComplete,
}: RegistrationDialogProps) {
    const [step, setStep] = useState<1 | 2>(1)

    const [email, setEmail] = useState("")
    const [secretKey, setSecretKey] = useState("")

    const [verificationCode, setVerificationCode] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ])

    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [seconds, setSeconds] = useState(300)

    const codeRefs = useRef<(HTMLInputElement | null)[]>([])

    /*
     * Сбрасываем Dialog при закрытии.
     */
    useEffect(() => {
        if (!open) {
            setStep(1)
            setEmail("")
            setSecretKey("")
            setVerificationCode(["", "", "", "", "", ""])
            setError("")
            setIsLoading(false)
            setSeconds(300)
        }
    }, [open])

    /*
     * Таймер для кода из email.
     */
    useEffect(() => {
        if (!open || step !== 2 || seconds <= 0) {
            return
        }

        const timer = setInterval(() => {
            setSeconds((value) => value - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [open, step, seconds])

    const formattedTime = `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0")}:${(seconds % 60)
            .toString()
            .padStart(2, "0")}`

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content')
    /*
     * Первый шаг:
     * email + secret key.
     *
     * Здесь позже заменишь setTimeout на запрос к backend.
     */
    async function handleContinue() {
        setError("")

        if (!email.trim()) {
            setError("Введите email")
            return
        }

        if (!email.includes("@")) {
            setError("Введите корректный email")
            return
        }

        if (!secretKey.trim()) {
            setError("Введите секретный ключ")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/registration/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                },
                body: JSON.stringify({
                    toy_code: toyCode,
                    email: email,
                    secret_key: secretKey

                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message ?? 'Произошла ошибка')
                return
            }

            await new Promise((resolve) => setTimeout(resolve, 700))

            setStep(2)
            setSeconds(300)

            setTimeout(() => {
                codeRefs.current[0]?.focus()
            }, 100)
        } catch {
            setError("Не удалось отправить код. Попробуйте ещё раз.")
        } finally {
            setIsLoading(false)
        }
    }

    /*
     * Ввод цифры email-кода.
     */
    function handleCodeChange(index: number, value: string) {
        const digit = value.replace(/\D/g, "").slice(-1)

        const next = [...verificationCode]
        next[index] = digit

        setVerificationCode(next)
        setError("")

        if (digit && index < 5) {
            codeRefs.current[index + 1]?.focus()
        }
    }

    /*
     * Backspace + стрелки.
     */
    function handleCodeKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) {
        if (e.key === "Backspace") {
            if (!verificationCode[index] && index > 0) {
                codeRefs.current[index - 1]?.focus()
            }

            return
        }

        if (e.key === "ArrowLeft" && index > 0) {
            codeRefs.current[index - 1]?.focus()
        }

        if (e.key === "ArrowRight" && index < 5) {
            codeRefs.current[index + 1]?.focus()
        }
    }

    /*
     * Вставка сразу всего кода.
     */
    function handleCodePaste(
        e: React.ClipboardEvent<HTMLInputElement>,
    ) {
        e.preventDefault()

        const value = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)

        if (!value) {
            return
        }

        const next = ["", "", "", "", "", ""]

        value.split("").forEach((digit, index) => {
            next[index] = digit
        })

        setVerificationCode(next)

        const nextIndex = Math.min(value.length, 5)

        setTimeout(() => {
            codeRefs.current[nextIndex]?.focus()
        }, 0)
    }

    /*
     * Подтверждение email-кода.
     */
    async function handleVerify() {
        const code = verificationCode.join("")

        if (code.length !== 6) {
            setError("Введите код полностью")
            return
        }

        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/registration/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": csrfToken ?? "",
                },
                body: JSON.stringify({
                    email,
                    code,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message ?? "Неверный код подтверждения")
                return
            }

            onComplete?.()
            onOpenChange(false)
        } catch {
            setError("Не удалось проверить код. Попробуйте ещё раз.")
        } finally {
            setIsLoading(false)
        }
    }

    /*
     * Повторная отправка email.
     */
    async function handleResend() {
        if (seconds > 0) {
            return
        }

        setError("")
        setIsLoading(true)

        try {

            await new Promise((resolve) => setTimeout(resolve, 700))

            setSeconds(300)
            setVerificationCode(["", "", "", "", "", ""])

            setTimeout(() => {
                codeRefs.current[0]?.focus()
            }, 100)
        } catch {
            setError("Не удалось отправить код")
        } finally {
            setIsLoading(false)
        }
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
                                    ? "Регистрация владельца"
                                    : "Подтвердите email"}
                            </DialogTitle>

                            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step === 1
                                    ? "Введите данные для активации коллекционной фигурки."
                                    : `Код подтверждения отправлен на ${maskEmail(email)}`}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Индикатор шагов */}
                    <div className="my-6 flex items-center gap-2">
                        <div
                            className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"
                                }`}
                        />

                        <div
                            className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"
                                }`}
                        />
                    </div>

                    {/* STEP 1 */}
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
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError("")
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
                                        onChange={(e) => {
                                            setSecretKey(e.target.value)
                                            setError("")
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

                            {error && (
                                <p
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

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={isLoading}
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

                    {/* STEP 2 */}
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

                            {/* OTP */}
                            <div className="flex justify-center gap-2">
                                {verificationCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(element) => {
                                            codeRefs.current[index] = element
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleCodeChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleCodeKeyDown(e, index)
                                        }
                                        onPaste={
                                            index === 0
                                                ? handleCodePaste
                                                : undefined
                                        }
                                        className="
                                            h-12
                                            w-10
                                            rounded-md
                                            border-border
                                            bg-background
                                            p-0
                                            text-center
                                            font-mono
                                            text-xl
                                            font-medium
                                            caret-primary
                                            transition-all
                                            focus:border-primary
                                            focus:bg-background
                                            focus:ring-2
                                            focus:ring-primary/20
                                            sm:h-14
                                            sm:w-12
                                        "
                                        aria-label={`Цифра ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p
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

                            <div className="text-center">
                                {seconds > 0 ? (
                                    <p className="font-mono text-xs text-muted-foreground">
                                        Код действителен{" "}
                                        <span className="text-foreground">
                                            {formattedTime}
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
                                        "
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />

                                        Отправить код повторно
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={
                                    verificationCode.some(
                                        (digit) => !digit,
                                    ) || isLoading
                                }
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

                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1)
                                    setError("")
                                }}
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

function maskEmail(email: string) {
    const [name, domain] = email.split("@")

    if (!name || !domain) {
        return email
    }

    const visible = name.slice(0, Math.min(2, name.length))

    return `${visible}${"*".repeat(
        Math.max(2, name.length - visible.length),
    )}@${domain}`
}

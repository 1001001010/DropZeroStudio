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

import {
    Mail,
    ShieldCheck,
    RefreshCw,
} from "lucide-react"

type ToyLoginDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: string
    onComplete?: () => void
}

export function ToyLoginDialog({
    open,
    onOpenChange,
    toyCode,
    onComplete,
}: ToyLoginDialogProps) {
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

    useEffect(() => {
        if (!open) {
            setVerificationCode([
                "",
                "",
                "",
                "",
                "",
                "",
            ])

            setError("")
            setIsLoading(false)
            setSeconds(300)
        }
    }, [open])

    useEffect(() => {
        if (!open || seconds <= 0) {
            return
        }

        const timer = setInterval(() => {
            setSeconds((value) => value - 1)
        }, 1000)

        return () => {
            clearInterval(timer)
        }
    }, [open, seconds])

    useEffect(() => {
        if (!open) {
            return
        }

        const timer = setTimeout(() => {
            codeRefs.current[0]?.focus()
        }, 100)

        return () => {
            clearTimeout(timer)
        }
    }, [open])

    const formattedTime = `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0")}:${(seconds % 60)
            .toString()
            .padStart(2, "0")}`

    function getCsrfToken() {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") ?? ""
        )
    }

    function handleCodeChange(
        index: number,
        value: string,
    ) {
        const digit = value
            .replace(/\D/g, "")
            .slice(-1)

        const next = [...verificationCode]

        next[index] = digit

        setVerificationCode(next)
        setError("")

        if (digit && index < 5) {
            codeRefs.current[index + 1]?.focus()
        }
    }

    function handleCodeKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) {
        if (event.key === "Backspace") {
            if (!verificationCode[index] && index > 0) {
                codeRefs.current[index - 1]?.focus()
            }

            return
        }

        if (
            event.key === "ArrowLeft" &&
            index > 0
        ) {
            event.preventDefault()

            codeRefs.current[index - 1]?.focus()
        }

        if (
            event.key === "ArrowRight" &&
            index < 5
        ) {
            event.preventDefault()

            codeRefs.current[index + 1]?.focus()
        }
    }

    function handleCodePaste(
        event: React.ClipboardEvent<HTMLInputElement>,
    ) {
        event.preventDefault()

        const value = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)

        if (!value) {
            return
        }

        const next = [
            "",
            "",
            "",
            "",
            "",
            "",
        ]

        value.split("").forEach((digit, index) => {
            next[index] = digit
        })

        setVerificationCode(next)
        setError("")

        const nextIndex = Math.min(value.length, 5)

        setTimeout(() => {
            codeRefs.current[nextIndex]?.focus()
        }, 0)
    }

    async function handleVerify() {
        const code = verificationCode.join("")

        if (code.length !== 6) {
            setError("Введите код полностью")
            return
        }

        setError("")
        setIsLoading(true)

        try {
            const response = await fetch(
                "/auth/login/confirm",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                    body: JSON.stringify({
                        toy_code: toyCode,
                        code,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.message ??
                    "Неверный код подтверждения",
                )

                return
            }

            onComplete?.()
            onOpenChange(false)
        } catch {
            setError(
                "Не удалось проверить код. Попробуйте ещё раз.",
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResend() {
        if (seconds > 0 || isLoading) {
            return
        }

        setError("")
        setIsLoading(true)

        try {
            const response = await fetch(
                "/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                    body: JSON.stringify({
                        toy_code: toyCode,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.message ??
                    "Не удалось отправить код",
                )

                return
            }

            setSeconds(300)

            setVerificationCode([
                "",
                "",
                "",
                "",
                "",
                "",
            ])

            setTimeout(() => {
                codeRefs.current[0]?.focus()
            }, 100)
        } catch {
            setError(
                "Не удалось отправить код. Попробуйте ещё раз.",
            )
        } finally {
            setIsLoading(false)
        }
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

                    <div className="my-6 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-primary" />

                        <div className="h-1 flex-1 rounded-full bg-primary" />
                    </div>

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

                        <div className="flex justify-center gap-2">
                            {verificationCode.map(
                                (digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(element) => {
                                            codeRefs.current[index] =
                                                element
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete={
                                            index === 0
                                                ? "one-time-code"
                                                : "off"
                                        }
                                        maxLength={1}
                                        value={digit}
                                        onChange={(event) =>
                                            handleCodeChange(
                                                index,
                                                event.target.value,
                                            )
                                        }
                                        onKeyDown={(event) =>
                                            handleCodeKeyDown(
                                                event,
                                                index,
                                            )
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
                                        aria-label={`Цифра ${index + 1
                                            }`}
                                    />
                                ),
                            )}
                        </div>

                        {error && (
                            <p
                                className="
                                    text-center
                                    font-mono
                                    text-xs
                                    text-destructive
                                "
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <div className="text-center">
                            {seconds > 0 ? (
                                <p
                                    className="
                                        font-mono
                                        text-xs
                                        text-muted-foreground
                                    "
                                >
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
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
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

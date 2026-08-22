'use client'

import {
    useState,
    useRef,
    type KeyboardEvent,
    type ClipboardEvent,
} from 'react'
import { router } from "@inertiajs/react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { RegistrationDialog } from "@/components/registration-dialog"

export default function RegisterPage() {
    const [prefix, setPrefix] = useState(['', ''])
    const [digits, setDigits] = useState(['', '', ''])
    const [error, setError] = useState('')
    const [isAnimating, setIsAnimating] = useState(false)
    const [registrationOpen, setRegistrationOpen] = useState(false)

    const prefixRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]
    const digitRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const allRefs = [...prefixRefs, ...digitRefs]

    function handlePrefixChange(index: number, value: string) {
        const upper = value.toUpperCase()
        if (upper && !/^[A-Z]$/.test(upper)) return
        const next = [...prefix]
        next[index] = upper
        setPrefix(next)
        setError('')
        if (upper && index < 1) {
            prefixRefs[index + 1]?.current?.focus()
        } else if (upper && index === 1) {
            digitRefs[0]?.current?.focus()
        }
    }

    function handleDigitChange(index: number, value: string) {
        if (value && !/^[0-9]$/.test(value)) return
        const next = [...digits]
        next[index] = value
        setDigits(next)
        setError('')
        if (value && index < 2) {
            digitRefs[index + 1]?.current?.focus()
        }
    }

    function handleKeyDown(
        e: KeyboardEvent<HTMLInputElement>,
        type: 'prefix' | 'digit',
        index: number,
    ) {
        if (e.key === 'Backspace') {
            if (type === 'prefix') {
                if (!prefix[index] && index > 0) {
                    prefixRefs[index - 1]?.current?.focus()
                }
                const next = [...prefix]
                next[index] = ''
                setPrefix(next)
            } else {
                if (!digits[index]) {
                    if (index > 0) {
                        digitRefs[index - 1]?.current?.focus()
                    } else {
                        prefixRefs[1]?.current?.focus()
                    }
                }
                const next = [...digits]
                next[index] = ''
                setDigits(next)
            }
            e.preventDefault()
        }
        if (e.key === 'ArrowLeft') {
            const allIndex = type === 'prefix' ? index : index + 2
            if (allIndex > 0) allRefs[allIndex - 1]?.current?.focus()
        }
        if (e.key === 'ArrowRight') {
            const allIndex = type === 'prefix' ? index : index + 2
            if (allIndex < 4) allRefs[allIndex + 1]?.current?.focus()
        }
    }

    function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
        e.preventDefault()
        const text = e.clipboardData.getData('text').trim().toUpperCase()
        const match = text.match(/^([A-Z]{2})-?(\d{3})$/)
        if (match) {
            setPrefix([match[1][0], match[1][1]])
            setDigits([match[2][0], match[2][1], match[2][2]])
            digitRefs[2]?.current?.focus()
            setError('')
        }
    }

    const code = `${prefix.join("")}-${digits.join("")}`
    console.log(code)

    async function handleSubmit() {
        if (prefix.some((c) => !c) || digits.some((d) => !d)) {
            setError('Введите код полностью')
            return
        }

        setError('')

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')

        try {
            const response = await fetch('/registration/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                },
                body: JSON.stringify({
                    toy_code: code,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message ?? 'Произошла ошибка')
                return
            }

            // Laravel ответил success: true
            if (data.success) {
                setRegistrationOpen(true)
            }
        } catch {
            setError('Не удалось связаться с сервером')
        }
    }

    const isComplete = prefix.every((c) => c) && digits.every((d) => d)
    const slotClass =
        'h-16 w-12 rounded-md border border-border bg-secondary text-center font-mono text-3xl font-medium text-foreground caret-primary transition-all duration-200 placeholder:text-muted-foreground/25 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 md:h-[4.5rem] md:w-14'

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
            <RegistrationDialog
                open={registrationOpen}
                onOpenChange={setRegistrationOpen}
                toyCode={`${prefix.join("")}-${digits.join("")}`}
                onComplete={() => {
                    const code = `${prefix.join("")}-${digits.join("")}`

                    setIsAnimating(true)

                    setTimeout(() => {
                        router.visit(`/toy/${code}`)
                    }, 600)
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.55_0.19_25/0.12),transparent_70%)]"
            />

            <Link
                href="/"
                className="absolute left-6 top-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                На главную
            </Link>

            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground">
                        DROPZERO Studio
                    </span>
                    <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
                        Активируйте свою коллекционную фигурку по серийному номеру
                    </p>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                            Авторизация
                        </span>
                        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                            XX-000
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-8 px-6 py-9">
                        <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            <span className="inline-block h-px w-8 bg-border" />
                            Введите код
                            <span className="inline-block h-px w-8 bg-border" />
                        </div>

                        <div
                            className={`flex items-center gap-2 transition-all duration-500 ${isAnimating
                                ? 'scale-95 opacity-0'
                                : 'scale-100 opacity-100'
                                }`}
                        >
                            <div className="flex gap-1.5">
                                {prefix.map((char, i) => (
                                    <input
                                        key={`prefix-${i}`}
                                        ref={prefixRefs[i]}
                                        type="text"
                                        inputMode="text"
                                        maxLength={1}
                                        value={char}
                                        onChange={(e) => handlePrefixChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'prefix', i)}
                                        onPaste={i === 0 ? handlePaste : undefined}
                                        className={`${slotClass} uppercase`}
                                        placeholder="X"
                                        aria-label={`Буква ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <span className="mx-1 select-none font-mono text-3xl font-light text-primary">
                                -
                            </span>

                            <div className="flex gap-1.5">
                                {digits.map((char, i) => (
                                    <input
                                        key={`digit-${i}`}
                                        ref={digitRefs[i]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={char}
                                        onChange={(e) => handleDigitChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'digit', i)}
                                        onPaste={i === 0 ? handlePaste : undefined}
                                        className={slotClass}
                                        placeholder="0"
                                        aria-label={`Цифра ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="-mt-3 font-mono text-sm text-destructive" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!isComplete || isAnimating}
                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-base font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isAnimating ? (
                                <>
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                    Активация...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-5 w-5" />
                                    Активировать фигурку
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    Код напечатан на дне упаковки вашей фигурки.
                    <br />
                    Формат:{' '}
                    <span className="font-mono text-foreground/70">XX-000</span>
                </p>
            </div>
        </main>
    )
}

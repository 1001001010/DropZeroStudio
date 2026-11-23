
import {
    useEffect,
    useRef,
    useState,
    type ClipboardEvent,
    type KeyboardEvent,
} from 'react'

import type { EmailVerificationCode } from '@/types'

const CODE_LENGTH = 6
const INITIAL_SECONDS = 300

const EMPTY_CODE: EmailVerificationCode = ['', '', '', '', '', '']

interface UseEmailCodeOptions {
    enabled: boolean
}

export function useEmailCode({ enabled }: UseEmailCodeOptions) {
    const [code, setCode] = useState<EmailVerificationCode>([
        ...EMPTY_CODE,
    ])

    const [seconds, setSeconds] = useState(INITIAL_SECONDS)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Собираем шесть цифр в одну строку для отправки на сервер.
    const codeValue = code.join('')

    const isComplete = code.every(Boolean)

    // Форматируем оставшееся время в MM:SS.
    const formattedTime = `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')}:${(seconds % 60)
            .toString()
            .padStart(2, '0')}`

    /**
     * Сохраняет ссылку на поле ввода по его индексу.
     */
    function setInputRef(
        index: number,
        element: HTMLInputElement | null,
    ) {
        inputRefs.current[index] = element
    }

    /**
     * Переводит фокус на указанное поле.
     */
    function focusInput(index: number) {
        inputRefs.current[index]?.focus()
    }

    /**
     * Очищает код и перезапускает пятиминутный таймер.
     */
    function resetCode() {
        setCode([...EMPTY_CODE])
        setSeconds(INITIAL_SECONDS)
    }

    /**
     * Повторно запускает таймер после отправки нового кода.
     */
    function restartTimer() {
        setSeconds(INITIAL_SECONDS)
    }

    /**
     * Обрабатывает ввод одной цифры и переводит фокус дальше.
     */
    function handleChange(index: number, value: string) {
        const digit = value.replace(/\D/g, '').slice(-1)

        setCode((current) => {
            const next = [...current] as EmailVerificationCode

            next[index] = digit

            return next
        })

        if (digit && index < CODE_LENGTH - 1) {
            focusInput(index + 1)
        }
    }

    /**
     * Обрабатывает навигацию между полями клавиатурой.
     */
    function handleKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) {
        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault()
            focusInput(index - 1)
            return
        }

        if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
            event.preventDefault()
            focusInput(index + 1)
            return
        }

        // Если поле пустое, Backspace возвращает фокус назад.
        if (
            event.key === 'Backspace' &&
            !event.currentTarget.value &&
            index > 0
        ) {
            event.preventDefault()
            focusInput(index - 1)
        }
    }

    /**
     * Позволяет вставить сразу весь шестизначный код.
     */
    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault()

        const digits = event.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, CODE_LENGTH)

        if (!digits) {
            return
        }

        const next = [...EMPTY_CODE] as EmailVerificationCode

        digits.split('').forEach((digit, index) => {
            next[index] = digit
        })

        setCode(next)

        // После вставки переводим фокус на последнее заполненное поле.
        focusInput(Math.min(digits.length, CODE_LENGTH - 1))
    }

    // Запускаем обратный отсчёт только на активном шаге подтверждения.
    useEffect(() => {
        if (!enabled || seconds <= 0) {
            return
        }

        const timer = window.setInterval(() => {
            setSeconds((current) => Math.max(0, current - 1))
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [enabled, seconds])

    // Автоматически фокусируем первое поле при открытии шага.
    useEffect(() => {
        if (!enabled) {
            return
        }

        const timer = window.setTimeout(() => {
            focusInput(0)
        }, 100)

        return () => {
            window.clearTimeout(timer)
        }
    }, [enabled])

    return {
        code,
        codeValue,
        isComplete,
        seconds,
        formattedTime,
        setInputRef,
        handleChange,
        handleKeyDown,
        handlePaste,
        resetCode,
        restartTimer,
    }
}


import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'

import {
    formatToyCode,
    isValidToyCodeDigit,
    isValidToyCodeLetter,
    parseToyCode,
} from '@/lib/auth/toy-code'

import type {
    ToyCodeDigits,
    ToyCodeInput,
    ToyCodePrefix,
} from '@/types/index.d'

const INPUT_COUNT = 5

const INITIAL_PREFIX: ToyCodePrefix = ['', '']
const INITIAL_DIGITS: ToyCodeDigits = ['', '', '']

export function useToyCode() {
    const [prefix, setPrefix] = useState<ToyCodePrefix>(INITIAL_PREFIX)
    const [digits, setDigits] = useState<ToyCodeDigits>(INITIAL_DIGITS)
    const [error, setError] = useState('')

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const code = formatToyCode({ prefix, digits })

    const isComplete =
        prefix.every(Boolean) && digits.every(Boolean)

    function focusInput(index: number) {
        inputRefs.current[index]?.focus()
    }

    function setInputRef(
        index: number,
        element: HTMLInputElement | null,
    ) {
        inputRefs.current[index] = element
    }

    function updatePrefix(index: number, value: string) {
        const character = value.toUpperCase()

        if (character && !isValidToyCodeLetter(character)) {
            return
        }

        setPrefix((current) => {
            const next: ToyCodePrefix = [...current]
            next[index] = character

            return next
        })

        setError('')

        if (character) {
            focusInput(index + 1)
        }
    }

    function updateDigit(index: number, value: string) {
        if (value && !isValidToyCodeDigit(value)) {
            return
        }

        setDigits((current) => {
            const next: ToyCodeDigits = [...current]
            next[index] = value

            return next
        })

        setError('')

        if (value && index < 2) {
            focusInput(index + 3)
        }
    }

    function handleKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) {
        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault()
            focusInput(index - 1)
            return
        }

        if (event.key === 'ArrowRight' && index < INPUT_COUNT - 1) {
            event.preventDefault()
            focusInput(index + 1)
            return
        }

        if (event.key === 'Backspace' && !event.currentTarget.value && index > 0) {
            event.preventDefault()
            focusInput(index - 1)
        }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault()

        const parsed = parseToyCode(
            event.clipboardData.getData('text'),
        )

        if (!parsed) {
            return
        }

        setPrefix(parsed.prefix)
        setDigits(parsed.digits)
        setError('')

        focusInput(INPUT_COUNT - 1)
    }

    function setCode(value: ToyCodeInput) {
        setPrefix(value.prefix)
        setDigits(value.digits)
        setError('')
    }

    function resetCode() {
        setPrefix(['', ''])
        setDigits(['', '', ''])
        setError('')
        focusInput(0)
    }

    return {
        prefix,
        digits,
        code,
        error,
        isComplete,
        setInputRef,
        setError,
        setCode,
        resetCode,
        updatePrefix,
        updateDigit,
        handleKeyDown,
        handlePaste,
    }
}

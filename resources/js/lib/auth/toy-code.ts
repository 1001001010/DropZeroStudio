
import type {
    ToyCode,
    ToyCodeInput,
} from '@/types/index.d'

/**
 * Проверяет, что символ является латинской буквой.
 */
export function isValidToyCodeLetter(value: string): boolean {
    return /^[A-Z]$/i.test(value)
}

/**
 * Проверяет, что символ является цифрой.
 */
export function isValidToyCodeDigit(value: string): boolean {
    return /^\d$/.test(value)
}

/**
 * Формирует код фигурки из отдельных символов.
 */
export function formatToyCode({ prefix, digits }: ToyCodeInput): ToyCode {
    return `${prefix.join('')}-${digits.join('')}`
}

/**
 * Разбирает строку кода фигурки.
 * Поддерживает форматы XE-123 и XE123.
 */
export function parseToyCode(value: string): ToyCodeInput | null {
    const normalized = value.trim().toUpperCase()
    const match = normalized.match(/^([A-Z]{2})-?(\d{3})$/)

    if (!match) {
        return null
    }

    const [, letters, numbers] = match

    if (!letters || !numbers) {
        return null
    }

    return {
        prefix: [letters[0], letters[1]],
        digits: [numbers[0], numbers[1], numbers[2]],
    }
}

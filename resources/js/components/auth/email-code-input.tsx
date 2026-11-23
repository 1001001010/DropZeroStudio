
import type { EmailCodeInputProps } from '@/types'

const INPUT_CLASS_NAME = `
    h-12 w-10
    rounded-md
    border border-border
    bg-background
    p-0
    text-center
    font-mono text-xl font-medium
    caret-primary
    transition-all duration-200
    focus:border-primary
    focus:ring-2 focus:ring-primary/20
    disabled:cursor-not-allowed
    disabled:opacity-40
    sm:h-14 sm:w-12
`

/**
 * Поля для ввода шестизначного кода подтверждения email.
 *
 * Логика ввода, навигации и вставки кода находится в useEmailCode.
 * Компонент отвечает только за отображение полей.
 */
export function EmailCodeInput({
    code,
    disabled = false,
    setInputRef,
    onChange,
    onKeyDown,
    onPaste,
}: EmailCodeInputProps) {
    return (
        <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
                <input
                    key={`email-code-${index}`}
                    ref={(element) => setInputRef(index, element)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    aria-label={`Цифра ${index + 1}`}
                    className={INPUT_CLASS_NAME}
                    onChange={(event) => {
                        onChange(index, event.target.value)
                    }}
                    onKeyDown={(event) => {
                        onKeyDown(event, index)
                    }}
                    onPaste={index === 0 ? onPaste : undefined}
                />
            ))}
        </div>
    )
}

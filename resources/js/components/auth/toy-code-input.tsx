
import type { ToyCodeInputProps } from '@/types'

const INPUT_CLASS_NAME = `
    h-16 w-14
    rounded-xl
    border border-white/10
    bg-white/[0.03]
    text-center text-2xl font-semibold uppercase
    text-white
    outline-none
    transition-all duration-200
    placeholder:text-white/20
    focus:border-[#AA141E]
    focus:bg-white/[0.06]
    focus:ring-2 focus:ring-[#AA141E]/20
    disabled:cursor-not-allowed disabled:opacity-50
`

export function ToyCodeInput({
    prefix,
    digits,
    error,
    disabled = false,
    setInputRef,
    onPrefixChange,
    onDigitChange,
    onKeyDown,
    onPaste,
}: ToyCodeInputProps) {
    return (
        <div className="flex flex-col items-center gap-6">
            {/* Подсказка перед полями ввода */}
            <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-white">
                    Введите код фигурки
                </p>

                <p className="text-xs text-white/40">
                    Код указан на вашей фигурке
                </p>
            </div>

            {/* Код состоит из двух букв и трёх цифр */}
            <div className="flex items-center gap-3">
                <div className="flex gap-2">
                    {prefix.map((value, index) => (
                        <input
                            key={`prefix-${index}`}
                            ref={(element) => setInputRef(index, element)}
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            maxLength={1}
                            value={value}
                            disabled={disabled}
                            aria-label={`Буква ${index + 1}`}
                            aria-invalid={Boolean(error)}
                            className={INPUT_CLASS_NAME}
                            onChange={(event) =>
                                onPrefixChange(index, event.target.value)
                            }
                            onKeyDown={(event) =>
                                onKeyDown(event, index)
                            }
                            onPaste={index === 0 ? onPaste : undefined}
                        />
                    ))}
                </div>

                <span className="text-xl font-medium text-white/30">
                    —
                </span>

                <div className="flex gap-2">
                    {digits.map((value, index) => (
                        <input
                            key={`digit-${index}`}
                            ref={(element) =>
                                setInputRef(index + 2, element)
                            }
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={1}
                            value={value}
                            disabled={disabled}
                            aria-label={`Цифра ${index + 1}`}
                            aria-invalid={Boolean(error)}
                            className={INPUT_CLASS_NAME}
                            onChange={(event) =>
                                onDigitChange(index, event.target.value)
                            }
                            onKeyDown={(event) =>
                                onKeyDown(event, index + 2)
                            }
                            onPaste={index === 0 ? onPaste : undefined}
                        />
                    ))}
                </div>
            </div>

            {/* Ошибка отображается только при её наличии */}
            {error && (
                <p
                    role="alert"
                    className="text-center text-sm text-red-500"
                >
                    {error}
                </p>
            )}
        </div>
    )
}

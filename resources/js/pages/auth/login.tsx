import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
    ArrowRight,
    Fingerprint,
    LoaderCircle,
    ShieldCheck,
} from 'lucide-react'

import { AuthHeader } from '@/components/auth/auth-header'
import { RegistrationDialog } from '@/components/auth/registration-dialog'
import { ToyLoginDialog } from '@/components/auth/toy-login-dialog'
import { ToyCodeInput } from '@/components/auth/toy-code-input'

import { useToyAuth } from '@/hooks/auth/use-toy-auth'
import { useToyCode } from '@/hooks/auth/use-toy-code'

import { Button } from '@/components/ui/button'

import type { AuthMode } from '@/types'
import MainLayout from '@/layouts/MainLayout'

export default function LoginPage() {
    // Состояние и обработчики полей кода фигурки.
    const toyCode = useToyCode()

    // Проверка кода и состояние загрузки.
    const toyAuth = useToyAuth()

    // Управление диалогами авторизации.
    const [authMode, setAuthMode] = useState<AuthMode | null>(null)

    /**
     * Проверяет код фигурки и определяет сценарий авторизации.
     */
    async function handleSubmit() {
        if (!toyCode.isComplete || toyAuth.isLoading) {
            return
        }

        const mode = await toyAuth.sendCode(toyCode.code)

        if (mode) {
            setAuthMode(mode)
        }
    }

    /**
     * Открывает страницу зарегистрированной фигурки.
     */
    function handleComplete() {
        router.visit(`/ toy / ${toyCode.code} `)
    }

    /**
     * Сбрасывает ошибки при изменении кода.
     */
    function clearErrors() {
        toyCode.setError('')
        toyAuth.setError('')
    }

    return (
        <MainLayout>
            <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#050505] text-white">
                {/* Фоновое оформление */}
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <div className="absolute left-1/2 top-[-20rem] size-[42rem] -translate-x-1/2 rounded-full bg-[#AA141E]/[0.07] blur-[140px]" />

                    <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />

                    <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#AA141E]/30 to-transparent" />
                </div>

                {/* Навигация */}
                <header className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 lg:px-12">
                    <AuthHeader />
                </header>

                {/* Основное содержимое */}
                <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
                    <div className="grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr_440px] lg:gap-20">
                        {/* Левая информационная часть */}
                        <div className="hidden max-w-xl lg:block">
                            <div className="mb-8 flex items-center gap-3">
                                <span className="h-px w-8 bg-[#AA141E]" />

                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#AA141E]">
                                    DropZeroStudio / Доступ к коллекции
                                </span>
                            </div>

                            <h1 className="max-w-lg text-6xl font-semibold uppercase leading-[0.92] tracking-[-0.055em] xl:text-7xl">
                                Ваша
                                <br />
                                коллекция.
                                <br />
                                <span className="text-white/35">
                                    Ваша идентичность.
                                </span>
                            </h1>

                            <p className="mt-8 max-w-sm text-sm leading-7 text-white/40">
                                Каждая фигурка — уникальный экземпляр со своей
                                историей, номером и цифровой идентичностью.
                                Введите код, чтобы открыть свою коллекцию.
                            </p>

                            <div className="mt-14 flex items-center gap-5 border-t border-white/10 pt-6">
                                <div className="flex size-11 items-center justify-center border border-white/10 bg-white/[0.025]">
                                    <Fingerprint className="size-5 text-[#AA141E]" />
                                </div>

                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                                        Уникальный код
                                    </p>

                                    <p className="mt-1 text-xs text-white/30">
                                        Один код — одна фигурка
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Карточка авторизации */}
                        <div className="w-full">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">
                                    Присоединяйся к колекции
                                </span>

                                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
                                    <span className="size-1.5 rounded-full bg-[#AA141E]" />
                                    Вход в аккаунт
                                </span>
                            </div>

                            <div className="relative border border-white/10 bg-[#0A0A0A]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-9">
                                {/* Декоративные углы */}
                                <span className="absolute left-0 top-0 h-8 w-px bg-[#AA141E]" />
                                <span className="absolute left-0 top-0 h-px w-8 bg-[#AA141E]" />
                                <span className="absolute bottom-0 right-0 h-8 w-px bg-[#AA141E]" />
                                <span className="absolute bottom-0 right-0 h-px w-8 bg-[#AA141E]" />

                                <div className="mb-8 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#AA141E]">
                                            Авторизация
                                        </p>

                                        <h2 className="mt-3 text-3xl font-semibold uppercase tracking-tight">
                                            Добро пожаловать
                                        </h2>

                                        <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">
                                            Введите уникальный код вашей фигурки,
                                            чтобы получить доступ к коллекции.
                                        </p>
                                    </div>

                                    <div className="hidden size-11 shrink-0 items-center justify-center border border-white/10 bg-white/[0.025] sm:flex">
                                        <Fingerprint className="size-5 text-white/50" />
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="mt-8 space-y-7">
                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                                                Уникальный код фигурки
                                            </label>

                                            <span className="font-mono text-[10px] text-white/25">
                                                XX-000
                                            </span>
                                        </div>

                                        <ToyCodeInput
                                            prefix={toyCode.prefix}
                                            digits={toyCode.digits}
                                            error={toyCode.error || toyAuth.error}
                                            disabled={toyAuth.isLoading}
                                            setInputRef={toyCode.setInputRef}
                                            onPrefixChange={(index, value) => {
                                                toyCode.updatePrefix(index, value)
                                                clearErrors()
                                            }}
                                            onDigitChange={(index, value) => {
                                                toyCode.updateDigit(index, value)
                                                clearErrors()
                                            }}
                                            onKeyDown={toyCode.handleKeyDown}
                                            onPaste={(event) => {
                                                toyCode.handlePaste(event)
                                                clearErrors()
                                            }}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={
                                            !toyCode.isComplete ||
                                            toyAuth.isLoading
                                        }
                                        className="h-12 w-full gap-3 rounded-none bg-[#AA141E] text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#8F1019] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {toyAuth.isLoading ? (
                                            <>
                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                                Проверяем код
                                            </>
                                        ) : (
                                            <>
                                                Продолжить
                                                <ArrowRight size={17} />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-5">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white/30" />

                                    <p className="text-[11px] leading-5 text-white/30">
                                        Код указан на вашей фигурке и используется
                                        для подтверждения её подлинности и доступа
                                        к цифровому профилю.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                                DropZeroStudio © {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Диалог первичной регистрации */}
                <RegistrationDialog
                    open={authMode === 'registration'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setAuthMode(null)
                        }
                    }}
                    toyCode={toyCode.code}
                    onComplete={handleComplete}
                />

                {/* Диалог входа для зарегистрированной фигурки */}
                <ToyLoginDialog
                    open={authMode === 'login'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setAuthMode(null)
                        }
                    }}
                    toyCode={toyCode.code}
                    onComplete={handleComplete}
                />
            </main>
        </MainLayout>
    )
}

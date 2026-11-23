
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ArrowRight, LoaderCircle } from 'lucide-react'

import { AuthCard } from '@/components/auth/auth-card'
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
    // Состояние и обработчики пяти полей кода фигурки.
    const toyCode = useToyCode()

    // Запрос проверки кода и состояние загрузки.
    const toyAuth = useToyAuth()

    // Управление диалогами регистрации и входа.
    const [authMode, setAuthMode] = useState<AuthMode | null>(null)

    /**
     * Проверяет код фигурки и определяет дальнейший сценарий.
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
     * Завершает авторизацию и открывает страницу фигурки.
     */
    function handleComplete() {
        router.visit(`/toy/${toyCode.code}`)
    }

    /**
     * Очищает ошибки обоих хуков при изменении кода.
     */
    function clearErrors() {
        toyCode.setError('')
        toyAuth.setError('')
    }

    return (
        <MainLayout>
            <main className="
            relative flex min-h-screen flex-col
            bg-[#050505] px-4 py-6 sm:px-8
            ">
                {/* Верхняя навигация */}
                <div className="mx-auto w-full max-w-6xl">
                    <AuthHeader />
                </div>

                {/* Центральная область авторизации */}
                <div className="
                flex flex-1 items-center justify-center
                py-16
                ">
                    <AuthCard
                        title="Добро пожаловать"
                        description="Введите уникальный код вашей фигурки, чтобы получить доступ к коллекции."
                        className="max-w-lg"
                    >
                        <div className="space-y-8">
                            {/* Поля ввода кода фигурки */}
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

                            {/* Кнопка проверки кода */}
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                    !toyCode.isComplete ||
                                    toyAuth.isLoading
                                }
                                className="
                            h-12 w-full gap-2
                            bg-[#AA141E] text-white
                            transition-colors
                            hover:bg-[#8F1019]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            "
                            >
                                {toyAuth.isLoading ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Проверяем код...
                                    </>
                                ) : (
                                    <>
                                        Продолжить
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Дополнительная информация */}
                        <p className="
                        mt-8 text-center text-xs
                        leading-relaxed text-white/30
                        ">
                            Используйте код, указанный на вашей фигурке.
                            <br />
                            Каждая фигурка имеет уникальный идентификатор.
                        </p>
                    </AuthCard>
                </div>

                {/* Диалог первичной регистрации фигурки */}
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

                {/* Диалог входа для уже зарегистрированной фигурки */}
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

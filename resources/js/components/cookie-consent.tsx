
import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'dropzero-cookie-consent'

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const savedConsent = localStorage.getItem(STORAGE_KEY)

        if (!savedConsent) {
            setVisible(true)
        }

        const openBanner = () => setVisible(true)

        window.addEventListener('cookie-consent:open', openBanner)

        return () => {
            window.removeEventListener('cookie-consent:open', openBanner)
        }
    }, [])

    const handleChoice = (choice: 'accepted' | 'rejected') => {
        localStorage.setItem(STORAGE_KEY, choice)
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-5 left-5 right-5 z-[9999] mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-2xl shadow-black/40 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex flex-1 gap-4 pr-6">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#AA141E]/10 text-[#AA141E]">
                            <Cookie size={22} />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-sm font-semibold text-white">
                                Мы используем cookie
                            </h3>

                            <p className="text-xs leading-relaxed text-white/55 sm:text-sm">
                                Cookie помогают обеспечить работу сайта и улучшить ваш опыт.
                                Подробнее — в{' '}
                                <a
                                    href="/legal/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white underline underline-offset-4 transition hover:text-[#AA141E]"
                                >
                                    Политике конфиденциальности
                                </a>.
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => handleChoice('rejected')}
                            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/5 sm:flex-none"
                        >
                            Отклонить
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChoice('accepted')}
                            className="flex-1 rounded-xl bg-[#AA141E] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#c01925] sm:flex-none"
                        >
                            Принять
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

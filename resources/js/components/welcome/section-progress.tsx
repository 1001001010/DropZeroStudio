
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const sections = [
    { id: 'home', number: '1', label: 'Главная' },
    { id: 'philosophy', number: '2', label: 'Философия' },
    { id: 'limited', number: '3', label: 'Серия' },
    { id: 'collection', number: '4', label: 'Коллекция' },
    { id: 'specs', number: '5', label: 'Спецификация' },
    { id: 'contact', number: '6', label: 'Заказать' },
] as const

type SectionId = (typeof sections)[number]['id']

export function SectionProgress() {
    const [activeSection, setActiveSection] = useState<SectionId>('home')

    const activeIndex = sections.findIndex(
        ({ id }) => id === activeSection,
    )

    useEffect(() => {
        let animationFrameId: number | null = null

        const updateActiveSection = () => {
            const viewportCenter = window.innerHeight / 2

            let closestSection: SectionId = 'home'
            let closestDistance = Infinity

            for (const section of sections) {
                const element = document.getElementById(section.id)

                if (!element) continue

                const rect = element.getBoundingClientRect()
                const sectionCenter = rect.top + rect.height / 2
                const distance = Math.abs(sectionCenter - viewportCenter)

                if (distance < closestDistance) {
                    closestDistance = distance
                    closestSection = section.id
                }
            }

            setActiveSection((current) =>
                current === closestSection ? current : closestSection,
            )
        }

        // Объединяем частые события прокрутки в одно обновление за кадр.
        const handleViewportChange = () => {
            if (animationFrameId !== null) return

            animationFrameId = window.requestAnimationFrame(() => {
                updateActiveSection()
                animationFrameId = null
            })
        }

        handleViewportChange()

        window.addEventListener('scroll', handleViewportChange, {
            passive: true,
        })

        window.addEventListener('resize', handleViewportChange)

        return () => {
            window.removeEventListener('scroll', handleViewportChange)
            window.removeEventListener('resize', handleViewportChange)

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId)
            }
        }
    }, [])

    const scrollToSection = (id: SectionId) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    const progress = Math.max(
        0,
        activeIndex / (sections.length - 1),
    )

    return (
        <nav
            aria-label="Навигация по секциям страницы"
            className="fixed right-8 top-1/2 z-[100] hidden -translate-y-1/2 lg:block"
        >
            <div className="relative flex flex-col gap-6">
                {/* Фоновая линия прогресса. */}
                <div className="absolute right-[5px] top-[5px] bottom-[5px] w-px bg-border" />

                {/* Заполнение линии в зависимости от активной секции. */}
                <div
                    aria-hidden="true"
                    className="absolute right-[5px] top-[5px] bottom-[5px] w-px origin-top bg-primary shadow-[0_0_12px_var(--primary)] transition-transform duration-500"
                    style={{
                        transform: `scaleY(${progress})`,
                    }}
                />

                {sections.map((section, index) => {
                    const isActive = section.id === activeSection
                    const isPassed = index < activeIndex

                    return (
                        <button
                            key={section.id}
                            type="button"
                            aria-label={`Перейти к секции: ${section.label}`}
                            aria-current={isActive ? 'location' : undefined}
                            onClick={() => scrollToSection(section.id)}
                            className="group relative flex items-center justify-end gap-4 text-right outline-none"
                        >
                            <span
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap font-mono text-sm transition-all duration-500',
                                    isActive
                                        ? '-translate-x-1 text-primary opacity-100'
                                        : 'text-foreground opacity-30 group-hover:opacity-80 group-focus-visible:opacity-100',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-[11px] uppercase tracking-widest opacity-0 transition-opacity duration-300',
                                        'group-hover:opacity-100 group-focus-visible:opacity-100',
                                    )}
                                >
                                    {section.label}
                                </span>

                                <span>{section.number}</span>
                            </span>

                            <span
                                aria-hidden="true"
                                className={cn(
                                    'relative z-10 flex h-[11px] w-[11px] shrink-0 rounded-full border transition-all duration-500',
                                    'group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background',
                                    isActive
                                        ? 'scale-125 border-primary bg-primary shadow-[0_0_15px_var(--primary)]'
                                        : isPassed
                                            ? 'border-primary/60 bg-primary/40'
                                            : 'border-border bg-background group-hover:border-primary/60',
                                )}
                            />
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const sections = [
    { id: 'home', number: '1', label: 'Главная' },
    { id: 'philosophy', number: '2', label: 'Философия' },
    { id: 'limited', number: '3', label: 'Серия' },
    { id: 'collection', number: '4', label: 'Коллекция' },
    { id: 'specs', number: '5', label: 'Спецификация' },
    { id: 'contact', number: '6', label: 'Заказать' },
]

export function SectionProgress() {
    const [activeSection, setActiveSection] = useState('home')

    useEffect(() => {
        const handleScroll = () => {
            const viewportCenter = window.innerHeight / 2
            let closestSection = 'home'
            let closestDistance = Infinity

            sections.forEach((section) => {
                const element = document.getElementById(section.id)
                if (!element) return

                const rect = element.getBoundingClientRect()
                const sectionCenter = rect.top + rect.height / 2
                const distance = Math.abs(sectionCenter - viewportCenter)

                if (distance < closestDistance) {
                    closestDistance = distance
                    closestSection = section.id
                }
            })

            setActiveSection(closestSection)
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    const activeIndex = sections.findIndex((s) => s.id === activeSection)

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    return (
        <nav
            aria-label="Прогресс по секциям"
            className="fixed right-8 top-1/2 z-[100] hidden -translate-y-1/2 lg:block"
        >
            <div className="relative flex flex-col gap-6">
                {/* background line */}
                <div className="absolute right-[5px] top-2 bottom-2 w-px bg-border" />

                {/* active line */}
                <div
                    className="absolute right-[5px] top-2 w-px bg-primary shadow-[0_0_12px_var(--primary)] transition-all duration-500"
                    style={{
                        height:
                            activeIndex <= 0
                                ? '0%'
                                : `${(activeIndex / (sections.length - 1)) * 100}%`,
                    }}
                />

                {sections.map((section, index) => {
                    const isActive = section.id === activeSection
                    const isPassed = index < activeIndex

                    return (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => scrollToSection(section.id)}
                            aria-label={section.label}
                            aria-current={isActive ? 'true' : undefined}
                            className="group relative flex items-center justify-end gap-4 text-right outline-none"
                        >
                            <span
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap font-mono text-sm transition-all duration-500',
                                    isActive
                                        ? '-translate-x-1 text-primary opacity-100'
                                        : 'text-foreground opacity-30 group-hover:opacity-80',
                                )}
                            >
                                <span className="text-[11px] uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    {section.label}
                                </span>
                                <span>{section.number}</span>
                            </span>

                            <span
                                className={cn(
                                    'relative z-10 flex h-[11px] w-[11px] shrink-0 rounded-full border transition-all duration-500',
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

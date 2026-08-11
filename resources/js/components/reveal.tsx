'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Reveal({
    children,
    className,
    delay = 0,
    as: Tag = 'div',
}: {
    children: ReactNode
    className?: string
    delay?: number
    as?: 'div' | 'section' | 'li' | 'span'
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const Component = Tag as 'div'

    return (
        <Component
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={cn(
                'transition-all duration-700 ease-out will-change-transform',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
                className,
            )}
        >
            {children}
        </Component>
    )
}


import { usePage } from '@inertiajs/react'

import { Collection } from '@/components/welcome/collection'
import { FinalCta, Footer } from '@/components/welcome/final-cta'
import { Hero } from '@/components/welcome/hero'
import { Limited } from '@/components/welcome/limited'
import { Philosophy } from '@/components/welcome/philosophy'
import { SectionProgress } from '@/components/welcome/section-progress'
import { SiteNav } from '@/components/welcome/site-nav'
import { Specs } from '@/components/welcome/specs'

import type { WelcomePageProps } from '@/types'

/**
 * Главная страница DropZeroStudio.
 * Собирает секции лендинга и передаёт статистику из Laravel.
 */
export default function Page() {
    const { stats } = usePage<WelcomePageProps>().props

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <SiteNav />
            <SectionProgress />

            <Hero />
            <Philosophy />
            <Limited />
            <Collection />
            <Specs stats={stats} />

            <FinalCta />
            <Footer />
        </main>
    )
}

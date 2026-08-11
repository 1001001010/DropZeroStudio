import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { Philosophy } from '@/components/philosophy'
import { Limited } from '@/components/limited'
import { Collection } from '@/components/collection'
import { Specs } from '@/components/specs'
import { FinalCta, Footer } from '@/components/final-cta'
import { SectionProgress } from '@/components/section-progress'

export default function Page() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <SiteNav />
            <SectionProgress />
            <Hero />
            <Philosophy />
            <Limited />
            <Collection />
            <Specs />
            <FinalCta />
            <Footer />
        </main>
    )
}

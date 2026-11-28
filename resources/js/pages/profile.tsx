
import { ToyNav } from '@/components/toy-nav'
import { CharacterCarousel } from '@/components/profile/character-carousel'
// import { CollectionMap } from '@/components/profile/collect  on-map'
import MainLayout from '@/layouts/MainLayout'
import { Footer } from '@/components/welcome/final-cta'
import { CollectorActivity } from '@/components/profile/collector-activity'

interface Skin {
    name: string
    description: string | null
    model_path: string | null
    primary_color: string | null
    secondary_color: string | null
    accent_color: string | null
}

interface Drop {
    name: string
    edition_size: number
    price: string | number
    skin: Skin
}

interface Toy {
    id: number
    code: string
    number: number
    claimed_at: string | null
    drop: Drop
}

interface Props {
    toys: Toy[]
    activeToyCode: string
}

export default function ToyPage({ toys, activeToyCode }: Props) {
    return (
        <MainLayout>
            <main className="min-h-dvh bg-[#050505] text-white">
                <ToyNav />

                <div className="w-full px-2 md:px-2">
                    <CharacterCarousel
                        toys={toys}
                        activeToyCode={activeToyCode}
                    />
                </div>


                <CollectorActivity />

                {/* <CollectionMap /> */}
                <Footer />
            </main>
        </MainLayout>
    )
}

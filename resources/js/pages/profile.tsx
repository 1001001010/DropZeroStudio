
import { ToyNav } from '@/components/toy-nav'
import { CharacterCarousel } from '@/components/character-carousel'

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
        <main className="min-h-dvh bg-[#050505] text-white">
            <ToyNav />

            <div className="mx-auto w-full max-w-[1480px] px-4 py-8 md:px-8 md:py-12">
                <CharacterCarousel
                    toys={toys}
                    activeToyCode={activeToyCode}
                />
            </div>
        </main>
    )
}

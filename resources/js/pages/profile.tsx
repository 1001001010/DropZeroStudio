import { ToyNav } from '@/components/toy-nav'
// import { ToyInfoPanel } from '@/components/toy-info-panel'
import { PreorderPanel } from '@/components/preorder-panel'
import { CharacterCarousel } from '@/components/character-carousel'
// import { lazy } from 'react'

// const Figure3D = lazy(() =>
//     import('@/components/figure-3d').then((m) => ({ default: m.Figure3D })),
// )

const toy = {
    code: 'DZ-014',
    number: 214,
    name: 'Crimson Sentinel',
    series: 'Core Collection',
    rarity: 'Rare',
    colorway: ['#AA141E', '#1A1A1A', '#E5E5E5'],
    artist: 'Studio Team',
    price: '$39.99',
    slots: 3000,
    taken: 890,
    purchaseDate: '25 фев 2026',
    material: 'PVC + ABS',
    height: '18 см',
    weight: '320 г',
    authenticity: 'Подтверждена',
    releaseDate: '2026-06-15T00:00:00',
}

export default function ToyPage() {
    return (
        <main className="min-h-dvh bg-[#050505] text-white">
            <ToyNav />

            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-12 px-4 py-8 md:px-8 md:py-12">
                <CharacterCarousel />

                <PreorderPanel
                    dropName={`${toy.series} Wave 2`}
                    price={toy.price}
                    slots={toy.slots}
                    taken={toy.taken}
                    releaseDate={toy.releaseDate}
                />
            </div>
        </main>
    )
}

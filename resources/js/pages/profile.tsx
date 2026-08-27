import { ToyNav } from '@/components/toy-nav'
import { ToyInfoPanel } from '@/components/toy-info-panel'
import { PreorderPanel } from '@/components/preorder-panel'
import { lazy } from 'react'

const Figure3D = lazy(() =>
    import('@/components/figure-3d').then((m) => ({ default: m.Figure3D })),
)

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
        <main className="min-h-dvh bg-background text-foreground">
            <ToyNav />

            <div className="mx-auto flex max-w-6xl flex-col gap-16 px-5 py-12 md:py-20">
                <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
                    <div className="flex-1 lg:sticky lg:top-24 lg:self-start">
                        <div className="h-[500px] w-full lg:h-[650px]">
                            <Figure3D />
                        </div>
                    </div>

                    <div className="flex-1 lg:max-w-md">
                        <ToyInfoPanel
                            code={toy.code}
                            name={toy.name}
                            series={toy.series}
                            rarity={toy.rarity}
                            edition={`${toy.number} / ${toy.slots}`}
                            purchaseDate={toy.purchaseDate}
                            material={toy.material}
                            height={toy.height}
                            weight={toy.weight}
                            artist={toy.artist}
                            authenticity={toy.authenticity}
                        />
                    </div>
                </div>

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

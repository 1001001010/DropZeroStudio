'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { lazy } from 'react'
import { ToyInfoPanel } from './toy-info-panel'

const Figure3D = lazy(() =>
    import('@/components/figure-3d').then((m) => ({ default: m.Figure3D })),
)
const characters = [
    {
        code: 'DZ-014', number: '214 / 3000', name: 'Crimson Sentinel', series: 'Core Collection', rarity: 'Rare',
        image: '/toys/crimson-sentinel.png', color: '#bd302d', accent: 'КРАСНЫЙ СТРАЖ', purchaseDate: '25 фев 2026', material: 'PVC + ABS', height: '18 см', weight: '320 г', artist: 'Studio Team', rating: '4.9', likes: '2.4k', price: '$39.99', slots: 3000, taken: 890, releaseDate: '15 июн 2026',
    },
    {
        code: 'DZ-022', number: '086 / 1800', name: 'Azure Ghost', series: 'Night Shift', rarity: 'Ultra Rare',
        image: '/toys/azure-ghost.png', color: '#527ba1', accent: 'ПРИЗРАК НОЧИ', purchaseDate: '12 апр 2026', material: 'PVC + ABS', height: '19 см', weight: '295 г', artist: 'Mika Tanaka', rating: '5.0', likes: '1.8k', price: '$44.99', slots: 1800, taken: 612, releaseDate: '28 июл 2026',
    },
    {
        code: 'DZ-031', number: '142 / 2400', name: 'Moss Keeper', series: 'Wild Things', rarity: 'Limited',
        image: '/toys/moss-keeper.png', color: '#6e815e', accent: 'ХРАНИТЕЛЬ ЛЕСА', purchaseDate: '03 июн 2026', material: 'PVC + ABS', height: '17 см', weight: '310 г', artist: 'Studio Team', rating: '4.8', likes: '986', price: '$39.99', slots: 2400, taken: 1086, releaseDate: '10 сен 2026',
    },
]

export function CharacterCarousel() {
    const [active, setActive] = useState(0)
    const touchStart = useRef<number | null>(null)
    const wheelLock = useRef(false)
    const character = characters[active]

    const change = useCallback((direction: number) => {
        setActive((current) => (current + direction + characters.length) % characters.length)
    }, [])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') change(-1)
            if (event.key === 'ArrowRight') change(1)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [change])

    const onWheel = (event: React.WheelEvent<HTMLElement>) => {
        if (wheelLock.current || Math.abs(event.deltaY) < 22) return
        wheelLock.current = true
        change(event.deltaY > 0 ? 1 : -1)
        window.setTimeout(() => { wheelLock.current = false }, 650)
    }

    return (
        <main
            className="toy-page min-h-dvh overflow-hidden text-[#1d211d]"
            style={{ '--toy-accent': character.color } as React.CSSProperties}
            onWheel={onWheel}
            onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }}
            onTouchEnd={(event) => {
                if (touchStart.current === null) return
                const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current
                if (Math.abs(delta) > 48) change(delta < 0 ? 1 : -1)
                touchStart.current = null
            }}
        >
            <div className="grain" aria-hidden="true" />
            <section id="collection" className="relative mx-auto flex min-h-[calc(100svh-84px)] max-w-[1440px] flex-col px-5 pb-8 md:px-12">
                <div className="relative z-10 flex items-center justify-between pt-3 md:pt-6">
                    <div>
                        <p className="mt-1 text-xs text-[#777a72]">Персонаж <span className="font-mono text-[#20241f]">0{active + 1}</span> <span className="px-1">/</span> 03</p>
                    </div>
                </div>
                <div className="relative grid flex-1 grid-cols-1 items-center gap-0 pt-2 md:grid-cols-[1.05fr_.95fr] md:gap-10 lg:gap-16">
                    <div className="flex flex-col">
                        <div className="figure-stage relative order-1 flex min-h-[390px] items-center justify-center md:min-h-[620px]">
                            <div className="stage-number" aria-hidden="true">{character.code}</div>

                            {characters.map((item, index) => {
                                const offset = (index - active + characters.length) % characters.length
                                const isCurrent = offset === 0
                                const position = offset === 1 ? 'next' : offset === 2 ? 'previous' : 'current'

                                return (
                                    <button
                                        className={`figure-card figure-${position}${isCurrent ? ' is-active' : ''}`}
                                        key={item.code}
                                        onClick={() => !isCurrent && setActive(index)}
                                        aria-label={isCurrent ? `${item.name}, выбран` : `Показать ${item.name}`}
                                        aria-current={isCurrent ? 'true' : undefined}
                                        tabIndex={isCurrent ? -1 : 0}
                                    >
                                        <Figure3D key={item.code} />
                                    </button>
                                )
                            })}

                            <nav className="absolute bottom-[-55px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-3"
                                aria-label="Персонажи коллекции"
                            >
                                <button className="arrow-button" onClick={() => change(-1)} aria-label="Предыдущий персонаж">
                                    <ArrowLeft />
                                </button>

                                <button className="arrow-button" onClick={() => change(1)} aria-label="Следующий персонаж">
                                    <ArrowRight />
                                </button>
                            </nav>
                        </div>
                    </div>

                    <article className="relative z-10 order-2 mx-auto w-full max-w-[510px] pb-8 md:mx-0 md:pb-0">
                        <ToyInfoPanel
                            code={character.code}
                            name={character.name}
                            series={character.series}
                            rarity={character.rarity}
                            edition={character.number}
                            purchaseDate={character.purchaseDate}
                            material={character.material}
                            height={character.height}
                            weight={character.weight}
                            artist={character.artist}
                            authenticity="Подтверждена"
                        />
                    </article>
                </div>
            </section>
        </main>
    )
}

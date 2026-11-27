
'use client'

import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useState,
    type CSSProperties,
} from 'react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel'
import { Spinner } from '@/components/ui/spinner'

import { ToyInfoPanel } from './toy-info-panel'

const Figure3D = lazy(() =>
    import('@/components/figure-3d').then((module) => ({
        default: module.Figure3D,
    })),
)

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

interface CharacterCarouselProps {
    toys: Toy[]
    activeToyCode: string
}

export function CharacterCarousel({
    toys,
    activeToyCode,
}: CharacterCarouselProps) {
    const initialIndex = Math.max(
        0,
        toys.findIndex((toy) => toy.code === activeToyCode),
    )

    const [activeIndex, setActiveIndex] = useState(initialIndex)
    const [api, setApi] = useState<CarouselApi>()

    const hasMultipleToys = toys.length > 1
    const character = toys[activeIndex]

    // Получаем API карусели.
    const handleApi = useCallback((carouselApi: CarouselApi) => {
        setApi(carouselApi)
    }, [])

    // Синхронизируем активную фигурку с текущим слайдом.
    useEffect(() => {
        if (!api) return

        const updateActiveIndex = () => {
            setActiveIndex(api.selectedScrollSnap())
        }

        updateActiveIndex()

        api.on('select', updateActiveIndex)
        api.on('reInit', updateActiveIndex)

        return () => {
            api.off('select', updateActiveIndex)
            api.off('reInit', updateActiveIndex)
        }
    }, [api])

    // Устанавливаем начальную фигурку.
    useEffect(() => {
        if (!api) return

        api.scrollTo(initialIndex)
    }, [api, initialIndex])

    if (!character) {
        return null
    }

    const skin = character.drop.skin

    const accentColor = skin.primary_color || '#AA141E'

    const purchaseDate = character.claimed_at
        ? new Date(character.claimed_at).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : 'Не указана'

    const edition = `${String(character.number).padStart(3, '0')} / ${character.drop.edition_size}`

    return (
        <section
            className="relative min-h-[calc(100svh-100px)] overflow-hidden bg-[#050505] text-white"
            style={
                {
                    '--toy-accent': accentColor,
                } as CSSProperties
            }
        >
            {/* Декоративный слой */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                aria-hidden="true"
            >
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.45%27/%3E%3C/svg%3E")',
                    }}
                />
            </div>

            <div
                id="collection"
                className="relative mx-auto flex min-h-[calc(100svh-100px)] flex-col px-5 pb-8 md:px-16"
            >
                <div className="relative grid flex-1 grid-cols-1 items-center gap-8 pt-2 md:grid-cols-[1.3fr_.7fr] md:gap-6 lg:grid-cols-[1.35fr_.65fr] lg:gap-8">

                    {/* Левая часть — 3D-карусель */}
                    <div className="flex min-w-0 flex-col items-center">
                        <div className="relative w-full max-w-full">
                            <Carousel
                                setApi={handleApi}
                                opts={{
                                    align: 'center',
                                    loop: hasMultipleToys,
                                    watchDrag: false,
                                }}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-4">
                                    {toys.map((toy) => (
                                        <CarouselItem
                                            key={toy.id}
                                            className="basis-1/2 pl-4"
                                        >
                                            <div className="mx-auto h-75 w-full md:h-125">
                                                <Suspense
                                                    fallback={
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Spinner className="size-8 text-primary" />
                                                        </div>
                                                    }
                                                >
                                                    <Figure3D
                                                        key={`${toy.code}-${toy.drop.skin.model_path ?? 'no-model'}`}
                                                        modelPath={toy.drop.skin.model_path}
                                                    />
                                                </Suspense>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>

                                {/* Кнопки навигации снизу */}
                                {hasMultipleToys && (
                                    <div className="mt-4 flex items-center justify-center gap-3">
                                        <CarouselPrevious className="static size-10 translate-y-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" />

                                        <CarouselNext className="static size-10 translate-y-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" />
                                    </div>
                                )}
                            </Carousel>

                            {/* Плавное затемнение и размытие краёв */}
                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-[#050505] to-transparent backdrop-blur-[2px] md:w-20"
                                aria-hidden="true"
                            />

                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-[#050505] to-transparent backdrop-blur-[2px] md:w-20"
                                aria-hidden="true"
                            />
                        </div>
                    </div>


                    {/* Правая часть — информация */}
                    <article className="relative z-10 mx-auto w-full max-w-127.5 pb-8 md:ml-auto md:mr-0 md:pb-0">
                        <ToyInfoPanel
                            key={character.code}
                            code={character.code}
                            name={skin.name}
                            series={character.drop.name}
                            edition={edition}
                            purchaseDate={purchaseDate}
                            material="—"
                            height="—"
                            weight="—"
                            artist="—"
                            authenticity="Подтверждена"
                        />
                    </article>
                </div>
            </div>
        </section>
    )
}

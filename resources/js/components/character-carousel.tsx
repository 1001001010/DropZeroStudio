
'use client'

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type TouchEvent,
    type WheelEvent,
} from 'react'
import { lazy } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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

    const [active, setActive] = useState(initialIndex)

    const touchStart = useRef<number | null>(null)
    const wheelLock = useRef(false)

    const hasMultipleToys = toys.length > 1

    const character = toys[active]

    const change = useCallback(
        (direction: number) => {
            if (!hasMultipleToys) return

            setActive((current) => {
                return (
                    current + direction + toys.length
                ) % toys.length
            })
        },
        [hasMultipleToys, toys.length],
    )

    useEffect(() => {
        if (!hasMultipleToys) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                change(-1)
            }

            if (event.key === 'ArrowRight') {
                change(1)
            }
        }

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [change, hasMultipleToys])

    const onWheel = (event: WheelEvent<HTMLElement>) => {
        if (!hasMultipleToys) return

        if (
            wheelLock.current ||
            Math.abs(event.deltaY) < 22
        ) {
            return
        }

        wheelLock.current = true

        change(event.deltaY > 0 ? 1 : -1)

        window.setTimeout(() => {
            wheelLock.current = false
        }, 650)
    }

    const onTouchStart = (event: TouchEvent<HTMLElement>) => {
        if (!hasMultipleToys) return

        touchStart.current =
            event.touches[0]?.clientX ?? null
    }

    const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
        if (
            !hasMultipleToys ||
            touchStart.current === null
        ) {
            return
        }

        const delta =
            (event.changedTouches[0]?.clientX ??
                touchStart.current) - touchStart.current

        if (Math.abs(delta) > 48) {
            change(delta < 0 ? 1 : -1)
        }

        touchStart.current = null
    }

    if (!character) {
        return null
    }

    const skin = character.drop.skin

    const accentColor = skin.primary_color || '#AA141E'

    const purchaseDate = character.claimed_at
        ? new Date(character.claimed_at).toLocaleDateString(
            'ru-RU',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        )
        : 'Не указана'

    const edition = `${String(character.number).padStart(3, '0')} / ${character.drop.edition_size}`

    return (
        <section
            className="toy-page relative min-h-[calc(100svh-100px)] overflow-hidden text-[#1d211d]"
            style={
                {
                    '--toy-accent': accentColor,
                } as CSSProperties
            }
            onWheel={hasMultipleToys ? onWheel : undefined}
            onTouchStart={
                hasMultipleToys ? onTouchStart : undefined
            }
            onTouchEnd={
                hasMultipleToys ? onTouchEnd : undefined
            }
        >
            <div
                className="grain"
                aria-hidden="true"
            />

            <section
                id="collection"
                className="relative mx-auto flex min-h-[calc(100svh-100px)] max-w-[1440px] flex-col px-5 pb-8 md:px-12"
            >
                <div className="relative grid flex-1 grid-cols-1 items-center gap-0 pt-2 md:grid-cols-[1.05fr_.95fr] md:gap-10 lg:gap-16">
                    {/* Левая часть — фигурки */}
                    <div className="flex flex-col">
                        <div className="figure-stage relative order-1 flex min-h-[390px] items-center justify-center md:min-h-[620px]">
                            {toys.map((item, index) => {
                                const offset =
                                    (index - active + toys.length) %
                                    toys.length

                                const isCurrent = offset === 0

                                // При одной игрушке всегда используем
                                // центральную позицию, а не previous.
                                const position = !hasMultipleToys
                                    ? 'current'
                                    : offset === 1
                                        ? 'next'
                                        : offset === toys.length - 1
                                            ? 'previous'
                                            : 'current'

                                if (!hasMultipleToys && !isCurrent) {
                                    return null
                                }

                                return (
                                    <button
                                        key={item.code}
                                        type="button"
                                        className={`figure-card figure-${position}${!hasMultipleToys ? ' figure-single' : ''}${isCurrent ? ' is-active' : ''}`}
                                        onClick={() => {
                                            if (!isCurrent) {
                                                setActive(index)
                                            }
                                        }}
                                        aria-label={
                                            isCurrent
                                                ? `${item.drop.skin.name}, выбрана`
                                                : `Показать ${item.drop.skin.name}`
                                        }
                                        aria-current={
                                            isCurrent ? 'true' : undefined
                                        }
                                        tabIndex={isCurrent ? -1 : 0}
                                        disabled={!hasMultipleToys}
                                    >
                                        <Figure3D
                                            key={`${item.code}-${item.drop.skin.model_path ?? 'no-model'}`}
                                            modelPath={item.drop.skin.model_path}
                                        />
                                    </button>
                                )
                            })}

                            {/* Стрелки только если игрушек больше одной */}
                            {hasMultipleToys && (
                                <nav
                                    className="absolute bottom-[-55px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-3"
                                    aria-label="Мои игрушки"
                                >
                                    <button
                                        type="button"
                                        className="arrow-button"
                                        onClick={() => change(-1)}
                                        aria-label="Предыдущая игрушка"
                                    >
                                        <ArrowLeft />
                                    </button>

                                    <button
                                        type="button"
                                        className="arrow-button"
                                        onClick={() => change(1)}
                                        aria-label="Следующая игрушка"
                                    >
                                        <ArrowRight />
                                    </button>
                                </nav>
                            )}
                        </div>
                    </div>

                    {/* Правая часть — информация */}
                    <article className="relative z-10 order-2 mx-auto w-full max-w-[510px] pb-8 md:mx-0 md:pb-0">
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
            </section>
        </section>
    )
}

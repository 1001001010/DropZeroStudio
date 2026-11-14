
import { Reveal } from '@/components/reveal'
import type { CollectionItem } from '@/types'

// Демонстрационные элементы коллекции.
// В дальнейшем данные можно получать из Laravel через Inertia.
const collection: CollectionItem[] = [
    {
        name: 'LYUCIX',
        number: '001',
        description: 'Повелитель падших. Хранитель ада.',
        image: '/storage/skins/previews/8SNiTSKgLVdsGmeWfJ5NXXMpB24xOKqHUM5CA23d.jpg',
    },
    {
        name: 'MIKHAEL',
        number: '002',
        description: 'Предводитель небес. Защитник света.',
        image: '/storage/skins/previews/wGicx2OHITfD4SjgEmdEDlamyDvDwyzx8Y9ajufD.jpg',
    },
]

export function Collection() {
    return (
        <section
            id="collection"
            aria-labelledby="collection-title"
            className="relative scroll-mt-20 border-t border-border py-28"
        >
            <div className="mx-auto max-w-7xl px-6">
                {/* Заголовок и описание коллекции */}
                <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                            / Коллекция
                        </p>

                        <h2
                            id="collection-title"
                            className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl"
                        >
                            The collection
                        </h2>
                    </div>

                    <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        Один мир. Ограниченный выпуск.
                    </p>
                </Reveal>

                {/* Карточки коллекционных фигурок */}
                <div className="mt-14 flex flex-wrap justify-center gap-5">
                    {collection.map((item, index) => (
                        <Reveal
                            key={item.name}
                            delay={index * 100}
                            className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
                        >
                            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/60">
                                {/* Изображение фигурки */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={`Коллекционная фигурка ${item.name}`}
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />

                                    <span className="absolute left-4 top-4 rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-xs tracking-widest backdrop-blur">
                                        №{item.number}
                                    </span>
                                </div>

                                {/* Название и описание фигурки */}
                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="text-2xl font-semibold tracking-tight">
                                        {item.name}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

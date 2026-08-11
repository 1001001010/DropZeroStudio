import { Link } from '@inertiajs/react'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const collection = [
    {
        name: 'Shadow',
        number: '001',
        description: 'Первая тень коллекции.',
        image: '/figures/shadow.png',
    },
    {
        name: 'Nightmare',
        number: '002',
        description: 'Рождённый из ночных кошмаров.',
        image: '/figures/nightmare.png',
    },
    {
        name: 'Void',
        number: '003',
        description: 'Там, где заканчивается свет.',
        image: '/figures/void.png',
    },
]

export function Collection() {
    return (
        <section id="collection" className="relative border-t border-border py-28">
            <div className="mx-auto max-w-7xl px-6">
                <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                            / Коллекция
                        </p>
                        <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                            The collection
                        </h2>
                    </div>
                    <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        Один мир. Ограниченный выпуск.
                    </p>
                </Reveal>

                <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {collection.map((item, i) => (
                        <Reveal key={item.name} delay={i * 100}>
                            <Link
                                href={`/shop/${item.name.toLowerCase()}`}
                                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/60"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {/* <Image
                                        src={item.image || '/placeholder.svg'}
                                        alt={`Коллекционная фигурка ${item.name}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    /> */}
                                    <img
                                        src={item.image}
                                        alt={`Коллекционная фигурка ${item.name}`}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <span className="absolute left-4 top-4 rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-xs tracking-widest backdrop-blur">
                                        №{item.number}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 p-6">
                                    <div>
                                        <h3 className="text-2xl font-semibold">{item.name}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

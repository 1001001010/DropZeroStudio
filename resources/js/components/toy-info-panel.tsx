type ToyInfoPanelProps = {
    code: string
    name: string
    series: string
    edition: string
    purchaseDate: string
    material: string
    height: string
    weight: string
    artist: string
    authenticity: string
}

export function ToyInfoPanel({
    code,
    name,
    series,
    edition,
    purchaseDate,
    authenticity,
}: ToyInfoPanelProps) {
    const specs = [
        { label: 'Экземпляр', value: edition },
        { label: 'Серия', value: series },
        { label: 'Материал', value: 'Плюш' },
        { label: 'Куплено', value: purchaseDate },
        { label: 'Подлинность', value: authenticity },
    ]

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <span className="border border-primary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                        {code}
                    </span>
                </div>

                <h1 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-balance md:text-5xl">
                    {name}
                </h1>

                <p className="max-w-md leading-relaxed text-muted-foreground">
                    Ручная роспись, нумерованный тираж и сертификат подлинности. Каждая
                    фигурка выпускается один раз и больше никогда не повторяется.
                </p>
            </div>

            <dl className="flex flex-col border-t border-border">
                {specs.map((spec) => (
                    <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-3"
                    >
                        <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                            {spec.label}
                        </dt>
                        <dd className="font-mono text-sm text-foreground">{spec.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}

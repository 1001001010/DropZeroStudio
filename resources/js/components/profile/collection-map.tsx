
export function CollectionMap() {
    return (
        <section
            className="relative mx-auto w-full max-w-[1800px] select-none px-2 py-12 md:px-4 md:py-20"
            onContextMenu={(event) => event.preventDefault()}
        >
            <div className="relative isolate overflow-hidden rounded-xl border border-white/[0.06] bg-[#080808]">

                {/* Основное изображение карты */}
                <img
                    src="/images/collection-map.webp"
                    alt="Мир коллекционера DropZeroStudio"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    onContextMenu={(event) => event.preventDefault()}
                    className="pointer-events-none block h-auto w-full object-cover"
                />

                {/* Начальный туман, скрывающий мир */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(ellipse at 15% 20%, rgba(210, 215, 225, 0.48) 0%, transparent 38%),
                            radial-gradient(ellipse at 48% 55%, rgba(190, 195, 205, 0.52) 0%, transparent 42%),
                            radial-gradient(ellipse at 85% 30%, rgba(205, 210, 220, 0.45) 0%, transparent 38%),
                            radial-gradient(ellipse at 65% 90%, rgba(190, 195, 205, 0.42) 0%, transparent 35%)
                        `,
                        filter: 'blur(35px)',
                        opacity: 0.9,
                    }}
                />

                {/* Общее затемнение */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-black/20"
                />
            </div>
        </section>
    )
}

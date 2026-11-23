
import { useEffect, useState } from 'react'
import axios from 'axios'
import { LoaderCircle, MapPin, Search } from 'lucide-react'
import type { CdekCity } from '@/types/index.d'

interface DeliveryCityFieldProps {
    value: string
    cityCode: number | null
    onChange: (city: CdekCity | null, query: string) => void
}
/**
 * Autocomplete поиска городов СДЭК.
 *
 * После выбора города передаёт родителю объект города,
 * содержащий название и код СДЭК.
 */
export function DeliveryCityField({
    value,
    cityCode,
    onChange,
}: DeliveryCityFieldProps) {
    const [query, setQuery] = useState(value)
    const [cities, setCities] = useState<CdekCity[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    /**
     * Синхронизация значения при внешнем изменении формы.
     */
    useEffect(() => {
        setQuery(value)
    }, [value])

    /**
     * Поиск городов с задержкой ввода.
     */
    useEffect(() => {
        const normalizedQuery = query.trim()

        if (normalizedQuery.length < 2 || cityCode !== null) {
            setCities([])
            setLoading(false)

            return
        }

        const controller = new AbortController()

        const timeout = setTimeout(async () => {
            setLoading(true)

            try {
                const response = await axios.get<{ data: CdekCity[] }>(
                    route('admin.cdek.cities'),
                    {
                        params: {
                            query: normalizedQuery,
                            country_code: 'RU',
                        },
                        signal: controller.signal,
                    },
                )

                setCities(response.data.data)
                setOpen(true)
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setCities([])
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }, 350)

        return () => {
            clearTimeout(timeout)
            controller.abort()
        }
    }, [query, cityCode])

    /**
     * Выбор города из результатов поиска.
     */
    const handleSelect = (city: CdekCity) => {
        setQuery(city.city)
        setCities([])
        setOpen(false)

        onChange(city, city.city)
    }

    /**
     * Изменение поискового запроса.
     */
    const handleChange = (value: string) => {
        setQuery(value)
        setOpen(true)

        onChange(null, value)
    }

    return (
        <div className="relative min-w-0 space-y-1.5">
            <label className="grid gap-1.5">
                <span className="text-xs text-muted-foreground">
                    Город
                </span>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={query}
                        onChange={(event) => handleChange(event.target.value)}
                        onFocus={() => {
                            if (cityCode === null && query.length >= 2) {
                                setOpen(true)
                            }
                        }}
                        onBlur={() => {
                            // Даём возможность обработать клик
                            // по результату поиска.
                            setTimeout(() => setOpen(false), 150)
                        }}
                        placeholder="Введите город"
                        autoComplete="off"
                        className="
                            h-9 w-full min-w-0 rounded-md border border-input
                            bg-background pl-9 pr-9 text-sm shadow-sm outline-none
                            transition-colors placeholder:text-muted-foreground
                            focus-visible:border-ring focus-visible:ring-2
                            focus-visible:ring-ring/30
                        "
                    />

                    {loading && (
                        <LoaderCircle className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
            </label>

            {/* Результаты поиска */}
            {open && cities.length > 0 && (
                <div className="
                    absolute z-50 mt-1 w-full overflow-hidden rounded-md
                    border bg-popover shadow-md
                ">
                    {cities.map((city) => (
                        <button
                            key={`${city.code}-${city.city}`}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSelect(city)}
                            className="
                                flex w-full items-start gap-2 px-3 py-2.5
                                text-left transition-colors
                                hover:bg-accent hover:text-accent-foreground
                            "
                        >
                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                            <span className="min-w-0">
                                <span className="block text-sm font-medium">
                                    {city.city}
                                </span>

                                <span className="block text-xs text-muted-foreground">
                                    {[city.region, city.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Пустой результат */}
            {open &&
                !loading &&
                query.trim().length >= 2 &&
                cities.length === 0 &&
                cityCode === null && (
                    <div className="
                        absolute z-50 mt-1 w-full rounded-md border
                        bg-popover px-3 py-3 text-sm text-muted-foreground
                        shadow-md
                    ">
                        Город не найден
                    </div>
                )}

            {cityCode !== null && (
                <p className="text-xs text-muted-foreground">
                    Код СДЭК: {cityCode}
                </p>
            )}
        </div>
    )
}

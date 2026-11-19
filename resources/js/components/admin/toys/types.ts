export type ToyStatus = 'produced' | 'available' | 'sold'

export type Toy = {
    id: number
    dropId: number
    dropName: string
    skinName?: string | null
    userId: number | null
    userName: string | null
    code: string
    number: number
    status: ToyStatus
    claimedAt: string | null
    deletedAt?: string | null
    toyPhoto: string
}

export type ToyDrop = {
    id: number
    name: string
    edition_size: number
}

export type ToyStatsType = {
    total: number
    produced: number
    available: number
    sold: number
    deleted: number
}

export type ToyFilters = {
    search: string
    status: string
    drop_id: string | number
}

export type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

export type PaginatedToys = {
    data: Toy[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: PaginationLink[]
    from: number | null
    to: number | null
}

export type ToyPageProps = {
    toys: PaginatedToys
    stats: ToyStatsType
    drops: ToyDrop[]
    filters: ToyFilters
}

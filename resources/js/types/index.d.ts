import { LucideIcon } from 'lucide-react'

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User
    }

    flash: {
        success?: string
        error?: string
        mode?: 'registration' | 'login'
    }
}
export interface Auth {
    user: User | null
}

export interface User {
    id: number
    email: string
    email_verified_at: string | null
    is_admin: boolean
    created_at: string
    updated_at: string
}

// Исправляем циклическую зависимость
export interface Skin {
    id: number
    name: string
    slug: string
    drops: Drop[]
    description: string | null
    model_path: string | null
    primary_color: string | null
    secondary_color: string | null
    accent_color: string | null
    preview_image: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    deleted_at: string | null
}

// Исправляем циклическую зависимость
export interface Drop {
    id: number
    skin_id: number
    skin: Omit<Skin, 'drop'>  // ← Используем Omit чтобы убрать поле drop
    name: string
    edition_size: number
    price: number
    production_started_at: string | null
    production_completed_at: string | null
    sale_started_at: string | null
    sale_ended_at: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type ToyStatus = 'produced' | 'available' | 'sold'

export interface Toy {
    id: number
    drop_id: number
    user_id: number | null
    code: string
    secret_hash: string
    number: number
    status: ToyStatus
    claimed_at: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface BreadcrumbItem {
    title: string
    href: string
}

export interface NavGroup {
    title: string
    items: NavItem[]
}

export interface NavItem {
    title: string
    url: string
    icon?: LucideIcon | null
    isActive?: boolean
}

export interface SharedData {
    name: string
    quote: {
        message: string
        author: string
    }
    auth: Auth
    [key: string]: unknown
}

export type DropForm = {
    name: string
    skinId: string
    editionSize: string
    price: string
    productionStartedAt: string
    productionCompletedAt: string
    saleStartedAt: string
    saleEndedAt: string
}

export type SkinForm = {
    name: string
    slug: string
    description: string
    modelPath: string | File | null
    primaryColor: string
    secondaryColor: string
    accentColor: string
    previewImage: string | File | null
    isActive: boolean
}

export type DropStatus =
    | "active"
    | "production"
    | "ready"
    | "ended"
    | "planned"


export type SkinStats = {
    total: number
    active: number
    inactive: number
    deleted: number
}

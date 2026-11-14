
import type { LucideIcon } from 'lucide-react'

// =============================================================================
// Shared / Application
// =============================================================================

export interface Flash {
    success?: string
    error?: string
    mode?: AuthMode
}

export type AuthMode = 'registration' | 'login'

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

/**
 * Общие данные, передаваемые Inertia на страницы приложения.
 */
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: Auth
    flash: Flash
}

export interface SharedData {
    name: string
    quote: {
        message: string
        author: string
    }
    auth: Auth
    flash: Flash
    [key: string]: unknown
}

// =============================================================================
// Authentication
// =============================================================================

/**
 * Код фигурки в формате XX-000.
 */
export type ToyCode = string

/**
 * Ответ сервера при проверке кода фигурки.
 */
export interface ToyCodeResponse {
    mode: AuthMode
}

/**
 * Props страницы регистрации и авторизации.
 */
export interface RegisterPageProps {
    [key: string]: unknown
}

// =============================================================================
// Welcome
// =============================================================================

export interface Stat {
    value: number | string
    label: string
}

export interface WelcomePageProps {
    [key: string]: unknown
    stats: Stat[]
}

// =============================================================================
// Skins
// =============================================================================

export interface Skin {
    id: number
    name: string
    slug: string
    drops: DropSkin[]
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

/**
 * Упрощённое представление Skin для вложенных отношений.
 */
export type DropSkin = Omit<Skin, 'drops'>

// =============================================================================
// Drops
// =============================================================================

export interface Drop {
    id: number
    skin_id: number
    skin: DropSkin
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

export type DropStatus =
    | 'active'
    | 'production'
    | 'ready'
    | 'ended'
    | 'planned'

// =============================================================================
// Toys
// =============================================================================

export type ToyStatus = 'produced' | 'available' | 'sold'

/**
 * Публичное представление фигурки.
 * Секретные ключи и их хеши не должны передаваться клиенту.
 */
export interface Toy {
    id: number
    drop_id: number
    user_id: number | null
    code: ToyCode
    number: number
    status: ToyStatus
    claimed_at: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

// =============================================================================
// Navigation
// =============================================================================

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

// =============================================================================
// Forms
// =============================================================================

export interface DropForm {
    name: string
    skinId: string
    editionSize: string
    price: string
    productionStartedAt: string
    productionCompletedAt: string
    saleStartedAt: string
    saleEndedAt: string
}

export interface SkinForm {
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

// =============================================================================
// Statistics
// =============================================================================

export interface SkinStats {
    total: number
    active: number
    inactive: number
    deleted: number
}

export interface DropStats {
    total: number
    active: number
    totalQuantity: number
    potentialRevenue: number
}

// =============================================================================
// Landing Page
// =============================================================================

export interface PhilosophyFeature {
    icon: LucideIcon
    title: string
    description: string
}

export interface CollectionItem {
    name: string
    number: string
    description: string
    image: string
}

export interface SpecsProps {
    stats: Stat[]
}

// =============================================================================
// Legal Documents
// =============================================================================

/**
 * Метаданные юридического документа из YAML frontmatter.
 */
export type LegalMetadata = Record<string, unknown>

/**
 * Отдельный раздел юридического документа.
 */
export interface LegalSection {
    id: string
    title: string
    description: string
    content: string
}

/**
 * Результат разбора Markdown-документа.
 */
export interface LegalDocumentData {
    metadata: LegalMetadata
    sections: LegalSection[]
}

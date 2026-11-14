
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type {
    ClipboardEvent,
    KeyboardEvent,
} from 'react'

// =============================================================================
// Shared / Application
// =============================================================================

export interface Flash {
    success?: string
    error?: string
    mode?: AuthMode
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

export type AuthMode = 'registration' | 'login'

import type {
    ClipboardEvent,
    KeyboardEvent,
} from 'react'

export interface ToyCodeInputProps {
    prefix: ToyCodePrefix
    digits: ToyCodeDigits
    error: string
    disabled?: boolean
    setInputRef: (
        index: number,
        element: HTMLInputElement | null,
    ) => void
    onPrefixChange: (index: number, value: string) => void
    onDigitChange: (index: number, value: string) => void
    onKeyDown: (
        event: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => void
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => void
}

/**
 * Код фигурки в формате XX-000.
 */
export type ToyCode = string

/**
 * Символы кода фигурки.
 */
export type ToyCodePrefix = [string, string]
export type ToyCodeDigits = [string, string, string]

/**
 * Состояние полей ввода кода фигурки.
 */
export interface ToyCodeInput {
    prefix: ToyCodePrefix
    digits: ToyCodeDigits
}

/**
 * Успешный ответ при проверке кода фигурки.
 */
export interface ToyCodeResponse {
    success: true
    mode: AuthMode
    message?: string
}

/**
 * Ошибка API.
 */
export interface ApiErrorResponse {
    success?: false
    message: string
}

/**
 * Общий успешный ответ API.
 */
export interface ApiSuccessResponse {
    success: true
    message?: string
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

export interface AuthCardProps {
    title?: string
    description?: string
    children: ReactNode
    className?: string
}


/**
 * Шестизначный код подтверждения email.
 */
export type EmailVerificationCode = [
    string,
    string,
    string,
    string,
    string,
    string,
]

/**
 * Props компонента ввода шестизначного email-кода.
 */
export interface EmailCodeInputProps {
    code: EmailVerificationCode
    disabled?: boolean
    setInputRef: (
        index: number,
        element: HTMLInputElement | null,
    ) => void
    onChange: (index: number, value: string) => void
    onKeyDown: (
        event: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => void
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => void
}

/**
 * Props диалога регистрации владельца фигурки.
 */
export interface RegistrationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: ToyCode
    onComplete?: () => void
}

/**
 * Props диалога входа владельца фигурки.
 */
export interface ToyLoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: ToyCode
    onComplete?: () => void
}

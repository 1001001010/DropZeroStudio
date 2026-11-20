import type { ClipboardEvent, KeyboardEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// =============================================================================
// Application / Shared
// =============================================================================

export type AuthMode = 'registration' | 'login'

/** Пользователь, авторизованный в приложении. */
export interface User {
    id: number
    email: string
    email_verified_at: string | null
    is_admin: boolean
    created_at: string
    updated_at: string
}

/** Данные авторизации, доступные на страницах Inertia. */
export interface Auth {
    user: User | null
}

/** Flash-сообщения, передаваемые Laravel через Inertia. */
export interface FlashProps {
    success?: string | null
    error?: string | null
    mode?: AuthMode
}

/** Совместимость с существующим названием Flash. */
export type Flash = FlashProps

/** Общие свойства страниц приложения. */
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: Auth
    flash: Flash
}

/** Общие данные Inertia-приложения. */
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

/** Дополнительные props основного публичного layout. */
export interface MainLayoutPageProps extends Record<string, unknown> {
    flash?: FlashProps
    url: string
}

// =============================================================================
// Authentication
// =============================================================================

/** Код фигурки в формате XX-000. */
export type ToyCode = string

/** Символы кода фигурки. */
export type ToyCodePrefix = [string, string]
export type ToyCodeDigits = [string, string, string]

/** Состояние полей ввода кода фигурки. */
export interface ToyCodeInput {
    prefix: ToyCodePrefix
    digits: ToyCodeDigits
}

/** Props компонента ввода кода фигурки. */
export interface ToyCodeInputProps {
    prefix: ToyCodePrefix
    digits: ToyCodeDigits
    error: string
    disabled?: boolean
    setInputRef: (index: number, element: HTMLInputElement | null) => void
    onPrefixChange: (index: number, value: string) => void
    onDigitChange: (index: number, value: string) => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>, index: number) => void
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => void
}

/** Успешный ответ при проверке кода фигурки. */
export interface ToyCodeResponse {
    success: true
    mode: AuthMode
    message?: string
}

/** Ответ API с ошибкой. */
export interface ApiErrorResponse {
    success?: false
    message: string
}

/** Общий успешный ответ API. */
export interface ApiSuccessResponse {
    success: true
    message?: string
}

/** Шестизначный код подтверждения email. */
export type EmailVerificationCode = [
    string,
    string,
    string,
    string,
    string,
    string,
]

/** Props компонента ввода email-кода. */
export interface EmailCodeInputProps {
    code: EmailVerificationCode
    disabled?: boolean
    setInputRef: (index: number, element: HTMLInputElement | null) => void
    onChange: (index: number, value: string) => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>, index: number) => void
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => void
}

/** Общие props карточки авторизации. */
export interface AuthCardProps {
    title?: string
    description?: string
    children: ReactNode
    className?: string
}

/** Props диалога регистрации владельца фигурки. */
export interface RegistrationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: ToyCode
    onComplete?: () => void
}

/** Props диалога входа владельца фигурки. */
export interface ToyLoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toyCode: ToyCode
    onComplete?: () => void
}

// =============================================================================
// Public Pages / Landing
// =============================================================================

export interface Stat {
    value: number | string
    label: string
}

export interface WelcomePageProps {
    [key: string]: unknown
    stats: Stat[]
}

export interface SpecsProps {
    stats: Stat[]
}

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

// =============================================================================
// Catalog / Skins
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

/** Упрощённое представление Skin для вложенных отношений. */
export type DropSkin = Omit<Skin, 'drops'>

// =============================================================================
// Catalog / Drops
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
// Catalog / Toys
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
// Forms / Catalog
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
// Legal Documents
// =============================================================================

/** Метаданные юридического документа из YAML frontmatter. */
export interface LegalMetadata {
    title?: string
    description?: string
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    robots?: string
    eyebrow?: string
    important_title?: string
    important_text?: string
    contact_title?: string
    contact_text?: string
    contact_email?: string
}

/** Отдельный раздел юридического документа. */
export interface LegalSection {
    id: string
    title: string
    description: string
    content: string
}

/** Результат разбора Markdown-документа. */
export interface LegalDocumentData {
    metadata: LegalMetadata
    sections: LegalSection[]
}

// =============================================================================
// Orders / Statuses
// =============================================================================

/** Допустимые статусы заказа. */
export type OrderStatus =
    | 'pending'
    | 'accepted'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'

/** Статусы оплаты заказа. */
export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded'

export type ShipmentStatus =
    | 'not_shipped'
    | 'preparing'
    | 'in_transit'
    | 'delivered'
    | 'returned'


/** Статусы доставки заказа. */
export type DeliveryStatus =
    | 'not_shipped'
    | 'preparing'
    | 'in_transit'
    | 'delivered'
    | 'returned'

// =============================================================================
// Orders / Data
// =============================================================================

/** Информация о покупателе в представлении заказа. */
export interface OrderCustomer {
    id: number
    name: string
    email: string | null
    phone: string | null
    telegramId: string | null
    telegramUsername: string | null
}

/**
 * Позиция в составе заказа.
 * Поля соответствуют сериализации модели OrderItem в Laravel.
 */
export interface OrderItem {
    id: number
    order_id: number

    drop_id: number | null
    skin_id: number | null
    toy_id: number | null

    product_name: string
    drop_name: string
    skin_name: string
    product_code: string

    quantity: number
    unit_price: number | string
    total_price: number | string

    metadata: Record<string, unknown> | null

    created_at: string
    updated_at: string
}

/** Информация об оплате заказа. */
export type OrderPayment = {
    id: number
    order_id: number

    amount: number | string
    currency: string
    status: PaymentStatus
    method: string
    provider: string | null
    transaction_id: string | null
    paid_at: string | null
    refunded_at: string | null

    metadata: Record<string, unknown> | null

    created_at: string
    updated_at: string
}
/** Информация о доставке заказа. */
export interface OrderDelivery {
    status: DeliveryStatus
    provider: string | null
    trackingNumber: string | null
    recipientName: string | null
    phone: string | null
    address: string | null
    rawResponse: Record<string, unknown> | null
}

/** Событие в истории заказа. */
export interface OrderHistoryEvent {
    id: number
    title: string
    description: string | null
    createdAt: string
    actor: string | null
}

/** Полная информация о заказе для интерфейса. */
export type Order = {
    id: number
    number: string

    customer_name: string
    telegram_id: number | null
    telegram_username: string | null
    telegram_url: string | null
    email: string | null
    phone: string | null

    currency: string
    comment: string | null
    admin_note: string | null

    status: OrderStatus

    subtotal: number | string
    delivery_price: number | string
    discount: number | string
    total: number | string

    paid_at: string | null
    completed_at: string | null
    cancelled_at: string | null

    created_at: string
    updated_at: string

    items: OrderItem[]
    payments: OrderPayment[]
    shipments: OrderShipment[]
}

/** Данные статистики заказов. */
export interface OrdersStats {
    total: number
    active: number
    completed: number
    revenue: number
}

export type OrderShipment = {
    id: number
    order_id: number

    provider: string | null
    provider_order_id: string | null
    tracking_number: string | null
    status: ShipmentStatus

    recipient_name: string
    phone: string

    country: string
    city: string
    postal_code: string | null
    address: string

    shipping_data: Record<string, unknown> | null

    shipped_at: string | null
    delivered_at: string | null

    created_at: string
    updated_at: string
}

// =============================================================================
// Orders / Drop Options
// =============================================================================

/** Скин, связанный с коллекцией Drop в форме заказа. */
export interface OrderDropSkin {
    id: number
    name: string
    slug: string
    description: string | null
    modelPath: string | null
    previewImage: string | null
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
}

/** Коллекция Drop, доступная для добавления в заказ. */
export interface OrderDropOption {
    id: number
    name: string
    price: number
    editionSize: number
    availableQuantity: number
    skin: OrderDropSkin
}

// =============================================================================
// Forms / Orders
// =============================================================================

/** Способ выбора фигурки при создании заказа. */
export type OrderItemSelectionMode = 'random' | 'number' | 'code'

/** Позиция заказа в форме создания. */
export interface StoreOrderItemData {
    drop_id: string
    selection_mode: OrderItemSelectionMode
    quantity: string
    toy_number: string
    toy_code: string
}

/** Данные формы создания заказа. */
export interface StoreOrderFormData {
    customer_name: string
    telegram_id: string
    telegram_username: string
    telegram_url: string
    email: string
    phone: string
    currency: string
    admin_note: string
    items: StoreOrderItemData[]
}

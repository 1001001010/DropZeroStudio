import { StoreOrderDialog } from '@/components/admin/orders/store-order-dialog/store-order-dialog'

import type { OrderDropOption } from '@/types/index.d'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/**
 * Заголовок страницы управления заказами.
 *
 * Содержит навигационные крошки, название раздела,
 * краткое описание и индикатор тестового режима.
 */
interface OrdersHeaderProps {
    drops?: OrderDropOption[]
}

/**
 * Заголовок страницы управления заказами.
 *
 * Содержит навигационные крошки, название раздела,
 * краткое описание и кнопку создания заказа.
 */
export function OrdersHeader({ drops }: OrdersHeaderProps) {
    return (
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={route('admin.index')}>
                                    Главная
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Заказы
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Заказы
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Управление заказами, оплатами и доставками.
                </p>
            </div>

            <StoreOrderDialog drops={drops} />
        </div>
    )
}

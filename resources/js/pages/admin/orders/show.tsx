import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, ListOrderedIcon } from 'lucide-react'

import { AdminNav } from '@/components/admin/admin-nav'

import { OrderGeneralInfo } from '@/components/admin/orders/order-general-info'
import { OrderCustomer } from '@/components/admin/orders/order-customer'
import { OrderItems } from '@/components/admin/orders/order-items'
import { OrderPayment } from '@/components/admin/orders/order-payment'
import { OrderDelivery } from '@/components/admin/orders/order-delivery'
import { OrderHistory } from '@/components/admin/orders/order-history'

import { Button } from '@/components/ui/button'

import type { Order } from '@/types/index.d'

interface OrderShowPageProps {
    order: Order
}

/**
 * Страница подробной информации о заказе.
 *
 * Получает данные заказа через Inertia из Laravel-контроллера.
 */
export default function OrderShowPage({ order }: OrderShowPageProps) {

    return (
        <>
            <Head title={`Заказ ${order.number}`} />

            <div className="min-h-screen bg-background">
                <AdminNav />

                <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Навигация и заголовок страницы */}
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 gap-2 text-muted-foreground"
                            asChild
                        >
                            <Link href="/admin/orders">
                                <ArrowLeft className="size-4" />
                                Назад к заказам
                            </Link>
                        </Button>

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ListOrderedIcon className="size-5 text-muted-foreground" />

                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        {order.number}
                                    </h1>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Подробная информация о заказе и его обработке.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Внутренний ID:
                                </span>

                                <span className="rounded-md border bg-muted/30 px-2 py-1 font-mono text-xs">
                                    #{order.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Основное содержимое страницы */}
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        {/* Основная колонка */}
                        <div className="min-w-0 space-y-6">
                            <OrderGeneralInfo order={order} />

                            <OrderItems
                                items={order.items}
                                currency={order.currency}
                            />

                            <OrderHistory events={order.history} />
                        </div>

                        {/* Боковая колонка */}
                        <aside className="min-w-0 space-y-6">
                            <OrderCustomer
                                order={order}
                                address={order.delivery?.address ?? null}
                            />

                            <OrderPayment
                                orderId={order.id}
                                payment={order.payment}
                                total={Number(order.total)}
                                currency={order.currency}
                            />

                            <OrderDelivery order={order} />
                        </aside>
                    </div>
                </main>
            </div>
        </>
    )
}

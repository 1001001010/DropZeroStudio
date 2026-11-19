
import { Head } from '@inertiajs/react'

import { AdminNav } from '@/components/admin/admin-nav'
import { OrdersHeader } from '@/components/admin/orders/orders-header'
import { OrdersStats } from '@/components/admin/orders/orders-stats'
import { OrdersTable } from '@/components/admin/orders/orders-table'

import type { Order } from '@/types/index.d'

interface OrdersIndexPageProps {
    orders: Order[]
}

/**
 * Главная страница раздела заказов.
 */
export default function OrdersIndexPage({ orders }: OrdersIndexPageProps) {
    const total = orders.length

    const active = orders.filter((order) =>
        ['pending', 'accepted', 'shipped'].includes(order.status),
    ).length

    const completed = orders.filter(
        (order) => order.status === 'completed',
    ).length

    const revenue = orders
        .filter((order) => order.payment.status === 'paid')
        .reduce((sum, order) => sum + order.total, 0)

    return (
        <>
            <Head title="Заказы" />

            <main className="min-h-screen bg-background">
                <AdminNav />

                <div className="space-y-8 p-6 lg:p-8">
                    <OrdersHeader />

                    <OrdersStats
                        total={total}
                        active={active}
                        completed={completed}
                        revenue={revenue}
                    />

                    <OrdersTable orders={orders} />
                </div>
            </main>
        </>
    )
}

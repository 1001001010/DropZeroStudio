
import { Head } from '@inertiajs/react'

import { AdminNav } from '@/components/admin/admin-nav'
import { OrdersHeader } from '@/components/admin/orders/orders-header'
import { OrdersStats } from '@/components/admin/orders/orders-stats'
import { OrdersTable } from '@/components/admin/orders/orders-table'

import type {
    Order,
    OrderDropOption,
} from '@/types'
import MainLayout from '@/layouts/MainLayout'

interface OrdersIndexPageProps {
    orders: Order[]
    drops: OrderDropOption[]
}

/**
 * Главная страница раздела заказов.
 */
export default function OrdersIndexPage({
    orders,
    drops,
}: OrdersIndexPageProps) {
    // Общее количество заказов.
    const total = orders.length

    // Количество активных заказов.
    const active = orders.filter((order) =>
        ['pending', 'accepted', 'shipped'].includes(order.status),
    ).length

    // Количество завершённых заказов.
    const completed = orders.filter(
        (order) => order.status === 'completed',
    ).length

    // Сумма заказов с успешно оплаченным платежом.
    const revenue = orders
        .filter((order) => order.payment?.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total), 0)

    return (
        <>
            <MainLayout>
                <Head title="Заказы" />

                <main className="min-h-screen bg-background">
                    <AdminNav />

                    <div className="space-y-8 p-6 lg:p-8">
                        <OrdersHeader drops={drops} />

                        <OrdersStats
                            total={total}
                            active={active}
                            completed={completed}
                            revenue={revenue}
                        />

                        <OrdersTable orders={orders} />
                    </div>
                </main>
            </MainLayout>
        </>
    )
}

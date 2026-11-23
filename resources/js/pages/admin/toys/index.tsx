import { Head } from '@inertiajs/react'

import { AdminNav } from '@/components/admin/admin-nav'
import { ToyHeader } from '@/components/admin/toys/toy-header'
import { ToyStats } from '@/components/admin/toys/toy-stats'
import { ToyTable } from '@/components/admin/toys/toy-table'

import type { ToyPageProps } from '@/components/admin/toys/types'
import MainLayout from '@/layouts/MainLayout'

export default function ToyPage({
    toys,
    stats,
    drops,
    filters,
}: ToyPageProps) {
    return (
        <>
            <MainLayout>
                <Head title="Игрушки" />
                <main className="min-h-screen bg-background">
                    <AdminNav />

                    <div className="space-y-8 p-6 lg:p-8">
                        <ToyHeader />

                        <ToyStats
                            total={stats.total}
                            produced={stats.produced}
                            available={stats.available}
                            sold={stats.sold}
                        />

                        <ToyTable
                            toys={toys}
                            drops={drops}
                            filters={filters}
                            deletedCount={stats.deleted}
                        />
                    </div>
                </main>
            </MainLayout>
        </>

    )
}

"use client"

import { Head } from '@inertiajs/react'

import { AdminNav } from "@/components/admin/admin-nav"
import { DropHeader } from "@/components/admin/drops/drop-header"
import { DropStats } from "@/components/admin/drops/drop-stats"
import { DropStats as DropStatsType } from "@/types/index"
import { DropTable } from "@/components/admin/drops/drop-table"

import type {
    Drop,
    Skin,
    PageProps
} from "@/types/index"


export default function DropPage({
    drops,
    skins,
    stats
}: PageProps<{
    drops: Drop[]
    skins: Skin[]
    stats: DropStatsType
}>) {
    return (
        <>
            <Head title="Дропы" />
            <main className="min-h-screen bg-background">
                <AdminNav />

                <div className="space-y-8 p-6 lg:p-8">
                    <DropHeader skins={skins} />

                    <DropStats
                        total={stats.total}
                        active={stats.active}
                        totalQuantity={stats.totalQuantity}
                        potentialRevenue={stats.potentialRevenue}
                    />

                    <DropTable
                        drops={drops}
                        skins={skins}
                    />
                </div>
            </main>
        </>
    )
}

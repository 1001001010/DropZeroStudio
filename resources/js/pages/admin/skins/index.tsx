"use client"

import { AdminNav } from "@/components/admin/admin-nav"
import {
    SkinHeader,
} from "@/components/admin/skins/skin-header"
import {
    SkinStats,
} from "@/components/admin/skins/skin-stats"
import {
    SkinTable,
} from "@/components/admin/skins/skin-table"
import { SkinStats as SkinStatsType } from "@/types/index"

import type {
    Skin,
    PageProps
} from "@/types/index"


export default function CollectionsPage({
    skins,
    stats
}: PageProps<{
    skins: Skin[]
    stats: SkinStatsType
}>) {
    return (
        <main className="min-h-screen bg-background">
            <AdminNav />

            <div className="space-y-8 p-6 lg:p-8">
                <SkinHeader />

                <SkinStats
                    total={stats.total}
                    active={stats.active}
                    inactive={stats.inactive}
                    deleted={stats.deleted}
                />

                <SkinTable
                    skins={skins}
                />
            </div>
        </main>
    )
}

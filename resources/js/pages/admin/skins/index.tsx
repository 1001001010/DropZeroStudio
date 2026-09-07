"use client"

//

import { AdminNav } from "@/components/admin/admin-nav"
// import {
//     SkinFormDialog,
// } from "@/components/admin/skins/store-skin-dialog"
import {
    SkinHeader,
} from "@/components/admin/skins/skin-header"
import {
    SkinStats,
} from "@/components/admin/skins/skin-stats"
import {
    SkinTable,
} from "@/components/admin/skins/skin-table"
// import {
//     DeleteSkinDialog,
// } from "@/components/admin/skins/delete-skin-dialog"

import type {
    Drop,
    // DropForm,
    Skin,
    PageProps
} from "@/types/index"

import { getStatus } from "@/lib/utils"

export default function CollectionsPage({
    drops,
    skins,
}: PageProps<{
    drops: Drop[]
    skins: Skin[]
}>) {
    // const emptyForm: DropForm = {
    //     name: "",
    //     skinId: "",
    //     editionSize: "",
    //     price: "",
    //     productionStartedAt: "",
    //     productionCompletedAt: "",
    //     saleStartedAt: "",
    //     saleEndedAt: "",
    // }

    // const [drops, setDrops] = useState<Drop[]>(initialDrops)
    //
    //
    // const [form, setForm] = useState<DropForm>(emptyForm)
    // const [editingDrop, setEditingDrop] = useState<Drop | null>(null)
    // const [deleteDrop, setDeleteDrop] = useState<Drop | null>(null)

    // // Создаем плоский список всех drops с ссылкой на skin
    // const allDropsWithSkin = useMemo(() => {
    //     console.log('🔄 Создаем allDropsWithSkin из skins:', skins);

    //     if (!skins || !Array.isArray(skins)) {
    //         console.warn('⚠️ skins не является массивом:', skins);
    //         return [];
    //     }

    //     const result = skins.flatMap(skin => {
    //         const drops = skin.drop || [];
    //         console.log(`📦 Skin "${skin.name}" имеет ${drops.length} дропов`);

    //         return drops.map(drop => ({
    //             ...drop,
    //             skin: skin
    //         }));
    //     });

    //     console.log('✅ Всего дропов с skin:', result.length);
    //     return result;
    // }, [skins]);

    // Применяем фильтры к allDropsWithSkin
    // const filteredDrops = useMemo(() => {
    //     const query = search.toLowerCase().trim();

    //     return allDropsWithSkin.filter((item) => {
    //         // Поиск по имени дропа или имени скина
    //         const matchesSearch =
    //             !query ||
    //             item.name?.toLowerCase().includes(query) ||
    //             item.skin?.name?.toLowerCase().includes(query);

    //         // Фильтр по статусу
    //         const status = getStatus(item);
    //         const matchesStatus =
    //             statusFilter === "all" ||
    //             status === statusFilter;

    //         return matchesSearch && matchesStatus;
    //     });
    // }, [allDropsWithSkin, search, statusFilter]);

    // Статистика
    const activeCount = drops.filter(
        (drop) => getStatus(drop) === "active"
    ).length;

    const totalEdition = drops.reduce(
        (sum, drop) => sum + drop.edition_size, 0
    );

    const totalValue = drops.reduce(
        (sum, drop) => sum + drop.edition_size * drop.price, 0
    );

    // function updateForm(field: keyof DropForm, value: string) {
    //     setForm((current) => ({
    //         ...current,
    //         [field]: value,
    //     }))
    // }

    // function openCreate() {
    //     setEditingDrop(null)
    //     setForm({ ...emptyForm })
    //     setFormOpen(true)
    // }

    // function openEdit(drop: Drop) {
    //     setEditingDrop(drop)
    //     setForm({
    //         name: drop.name,
    //         skinId: String(drop.skin.id),
    //         editionSize: String(drop.edition_size),
    //         price: String(drop.price),
    //         productionStartedAt: drop.production_started_at ?? "",
    //         productionCompletedAt: drop.production_completed_at ?? "",
    //         saleStartedAt: drop.sale_started_at ?? "",
    //         saleEndedAt: drop.sale_ended_at ?? "",
    //     })
    //     // setFormOpen(true)
    // }

    // function saveDrop() {
    //     if (!form.name.trim() || !form.skinId || !form.editionSize || !form.price) {
    //         return
    //     }

    //     const selectedSkin = skins.find(
    //         (skin: Skin) => skin.id === Number(form.skinId)
    //     )

    //     if (!selectedSkin) {
    //         return
    //     }

    //     const newDrop: Drop = {
    //         id: editingDrop?.id ?? Date.now(),
    //         skin_id: selectedSkin.id,
    //         skin: selectedSkin,
    //         name: form.name.trim(),
    //         edition_size: Number(form.editionSize),
    //         price: Number(form.price),
    //         production_started_at: form.productionStartedAt || null,
    //         production_completed_at: form.productionCompletedAt || null,
    //         sale_started_at: form.saleStartedAt || null,
    //         sale_ended_at: form.saleEndedAt || null,
    //         created_at: editingDrop?.created_at ?? new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //         deleted_at: null,
    //     }

    //     if (editingDrop) {
    //         setDrops((current) =>
    //             current.map((drop) =>
    //                 drop.id === editingDrop.id ? newDrop : drop
    //             )
    //         )
    //     } else {
    //         setDrops((current) => [newDrop, ...current])
    //     }

    //     closeForm()
    // }

    // function closeForm() {
    //     setFormOpen(false)
    //     setEditingDrop(null)
    //     setForm({ ...emptyForm })
    // }

    // Отладка перед рендером
    // console.log('🔍 Отладочная информация:');
    // console.log('  skins:', skins);
    // console.log('  allDropsWithSkin:', allDropsWithSkin);
    // console.log('  filteredDrops:', filteredDrops);
    // console.log('  filteredDrops.length:', filteredDrops.length);

    return (
        <main className="min-h-screen bg-background">
            <AdminNav />

            <div className="space-y-8 p-6 lg:p-8">
                <SkinHeader />

                <SkinStats
                    total={skins.length}
                    active={activeCount}
                    totalEdition={totalEdition}
                    totalValue={totalValue}
                />

                <SkinTable
                    skins={skins}
                // filteredDrops={filteredDrops}
                // search={search}
                // statusFilter={statusFilter}
                // onSearchChange={setSearch}
                // onStatusChange={setStatusFilter}
                // onEdit={openEdit}
                // onDelete={setDeleteDrop}
                />
            </div>
        </main>
    )
}

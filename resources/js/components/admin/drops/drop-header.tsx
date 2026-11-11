import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import StoreDropDialog from "@/components/admin/drops/store-drop-dialog"
import { Skin } from "@/types/index"

interface DropHeaderProps {
    skins: Skin[]
}

export function DropHeader({ skins }: DropHeaderProps) {
    return (
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={route('admin.index')}>Главная</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Дропы</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Дропы
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Управление дропами, просмотр информации о цене и сроках
                </p>
            </div>
            <StoreDropDialog skins={skins} />
        </div>
    )
}

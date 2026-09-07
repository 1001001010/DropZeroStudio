import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import StoreSkinDialog from "@/components/admin/skins/store-skin-dialog"

export function SkinHeader() {
    return (
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    {/* <Package className="size-4" />

                    <span>Каталог</span>

                    <span>/</span>

                    <span className="text-foreground">
                        Скины
                    </span> */}
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={route('admin.index')}>Каталог</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Скины</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Скины
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Управление скинами, просмотр информации о цене и сроках
                </p>
            </div>
            {/*
            <Button
                variant="outline"
                className="h-10"
            >
                <Plus className="mr-2 size-4" />

                Новый скин
            </Button> */}
            <StoreSkinDialog />
        </div>
    )
}

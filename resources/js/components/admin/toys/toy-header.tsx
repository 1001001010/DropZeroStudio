import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function ToyHeader() {
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
                                <BreadcrumbPage>Игрушки</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Игрушки
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Управление экземплярами коллекций, просмотр кодов,
                    статусов и информации о владельцах.
                </p>
            </div>
        </div>
    )
}

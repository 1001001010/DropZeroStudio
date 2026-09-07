import { Trash2 } from 'lucide-react'
import { useForm } from '@inertiajs/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import {
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Skin } from '@/types'

export function DeleteSkinDialog({
    skin,
}: {
    skin: Skin
}) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        delete: destroy,
        processing,
    } = useForm()

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()

        destroy(
            route('admin.skins.destroy', skin.id),
            {
                onSuccess: () => {
                    setIsOpen(false)
                },
            },
        )
    }

    return (
        <>
            <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(event) => {
                    event.preventDefault()
                    setIsOpen(true)
                }}
            >
                <Trash2 className="mr-2 size-4" />
                Удалить
            </DropdownMenuItem>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!processing) {
                        setIsOpen(open)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[430px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10">
                                <Trash2 className="size-5 text-destructive" />
                            </div>

                            <DialogTitle>
                                Удалить скин?
                            </DialogTitle>

                            <DialogDescription className="leading-6">
                                Вы действительно хотите удалить{' '}
                                <span className="font-medium text-foreground">
                                    «{skin.name}»
                                </span>
                                ?

                                <br />

                                Это действие нельзя будет отменить.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={processing}
                            >
                                Отмена
                            </Button>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                <Trash2 className="mr-2 size-4" />

                                {processing
                                    ? 'Удаление...'
                                    : 'Удалить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

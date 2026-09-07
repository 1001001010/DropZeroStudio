import { RotateCcw } from 'lucide-react'
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

import type { Skin } from '@/types'

export function RestoreSkinDialog({
    skin,
}: {
    skin: Skin
}) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        post,
        processing,
    } = useForm()

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()

        post(
            route('admin.skins.restore', skin.id),
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
                className="text-primary focus:text-primary"
                onSelect={(event) => {
                    event.preventDefault()
                    setIsOpen(true)
                }}
            >
                <RotateCcw className="mr-2 size-4" />
                Восстановить
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
                            <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
                                <RotateCcw className="size-5 text-primary" />
                            </div>

                            <DialogTitle>
                                Восстановить скин?
                            </DialogTitle>

                            <DialogDescription className="leading-6">
                                Вы действительно хотите восстановить{' '}
                                <span className="font-medium text-foreground">
                                    «{skin.name}»
                                </span>
                                ?
                                <br />
                                После восстановления скин снова станет
                                доступен в системе.
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
                                disabled={processing}
                            >
                                <RotateCcw className="mr-2 size-4" />

                                {processing
                                    ? 'Восстановление...'
                                    : 'Восстановить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

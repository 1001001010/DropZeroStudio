
import { useEffect, useState, type FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import { CreditCard, FileText, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import type {
    OrderPayment,
    PaymentStatus,
    StoreOrderPaymentFormData,
} from '@/types'

interface OrderPaymentDialogProps {
    orderId: number
    payment: OrderPayment | null
    total: number
    currency: string
}

/**
 * Форматирует дату для input[type="datetime-local"].
 */
function toDateTimeLocal(value: string | null): string {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    const offset = date.getTimezoneOffset() * 60_000

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16)
}

/**
 * Подготавливает начальные значения формы.
 */
function getInitialData(
    payment: OrderPayment | null,
    total: number,
    currency: string,
): StoreOrderPaymentFormData {
    return {
        amount: String(payment?.amount ?? total),
        currency: payment?.currency ?? currency,
        status: payment?.status ?? 'pending',
        method: payment?.method ?? 'bank_transfer',
        provider: payment?.provider ?? 'manual',
        transaction_id: payment?.transaction_id ?? '',
        paid_at: toDateTimeLocal(payment?.paid_at ?? null),
        metadata: payment?.metadata
            ? JSON.stringify(payment.metadata, null, 2)
            : '',
        receipt: null,
    }
}

/**
 * Диалог создания или редактирования оплаты заказа.
 */
export function OrderPaymentDialog({
    orderId,
    payment,
    total,
    currency,
}: OrderPaymentDialogProps) {
    const [open, setOpen] = useState(false)

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm<StoreOrderPaymentFormData>(
        getInitialData(payment, total, currency),
    )

    // Обновляем значения формы при открытии диалога.
    useEffect(() => {
        if (!open) return

        setData(getInitialData(payment, total, currency))
    }, [open, payment, total, currency])

    /**
     * Отправляет данные оплаты на сервер.
     */
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const options = {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                setOpen(false)
                reset()
            },
        }

        if (payment) {
            put(
                route('admin.orders.payments.update', orderId),
                options,
            )

            return
        }

        post(
            route('admin.orders.payments.store', orderId),
            options,
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CreditCard className="size-4" />
                    {payment ? 'Редактировать оплату' : 'Добавить оплату'}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="size-5 text-muted-foreground" />
                        {payment ? 'Редактирование оплаты' : 'Добавление оплаты'}
                    </DialogTitle>

                    <DialogDescription>
                        Заполните информацию об оплате заказа и при
                        необходимости прикрепите подтверждающий документ.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Сумма и валюта */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment-amount">Сумма</Label>

                            <Input
                                id="payment-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                            />

                            {errors.amount && (
                                <p className="text-sm text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-currency">Валюта</Label>

                            <Input
                                id="payment-currency"
                                value={data.currency}
                                onChange={(event) =>
                                    setData('currency', event.target.value)
                                }
                            />

                            {errors.currency && (
                                <p className="text-sm text-destructive">
                                    {errors.currency}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Статус оплаты */}
                    <div className="space-y-2">
                        <Label>Статус оплаты</Label>

                        <Select
                            value={data.status}
                            onValueChange={(value) =>
                                setData('status', value as PaymentStatus)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="pending">
                                    Ожидает оплаты
                                </SelectItem>
                                <SelectItem value="paid">
                                    Оплачено
                                </SelectItem>
                                <SelectItem value="failed">
                                    Ошибка оплаты
                                </SelectItem>
                                <SelectItem value="refunded">
                                    Возвращено
                                </SelectItem>
                                <SelectItem value="partially_refunded">
                                    Частичный возврат
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.status && (
                            <p className="text-sm text-destructive">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Способ оплаты и провайдер */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment-method">
                                Способ оплаты
                            </Label>

                            <Input
                                id="payment-method"
                                value={data.method}
                                onChange={(event) =>
                                    setData('method', event.target.value)
                                }
                                placeholder="bank_transfer"
                            />

                            {errors.method && (
                                <p className="text-sm text-destructive">
                                    {errors.method}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-provider">
                                Провайдер
                            </Label>

                            <Input
                                id="payment-provider"
                                value={data.provider}
                                onChange={(event) =>
                                    setData('provider', event.target.value)
                                }
                                placeholder="manual"
                            />

                            {errors.provider && (
                                <p className="text-sm text-destructive">
                                    {errors.provider}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Данные транзакции */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-transaction">
                            ID транзакции
                        </Label>

                        <Input
                            id="payment-transaction"
                            value={data.transaction_id}
                            onChange={(event) =>
                                setData('transaction_id', event.target.value)
                            }
                            placeholder="Введите ID транзакции"
                        />

                        {errors.transaction_id && (
                            <p className="text-sm text-destructive">
                                {errors.transaction_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-date">
                            Дата оплаты
                        </Label>

                        <Input
                            id="payment-date"
                            type="datetime-local"
                            value={data.paid_at}
                            onChange={(event) =>
                                setData('paid_at', event.target.value)
                            }
                        />

                        {errors.paid_at && (
                            <p className="text-sm text-destructive">
                                {errors.paid_at}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Дополнительные данные */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-metadata">
                            Дополнительные данные (JSON)
                        </Label>

                        <Textarea
                            id="payment-metadata"
                            value={data.metadata}
                            onChange={(event) =>
                                setData('metadata', event.target.value)
                            }
                            placeholder={'{\n  "comment": "..." \n}'}
                            rows={4}
                            className="font-mono text-sm"
                        />

                        {errors.metadata && (
                            <p className="text-sm text-destructive">
                                {errors.metadata}
                            </p>
                        )}
                    </div>

                    {/* Чек оплаты */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-receipt">
                            Подтверждающий документ
                        </Label>

                        <div className="flex items-center gap-3">
                            <Input
                                id="payment-receipt"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) =>
                                    setData(
                                        'receipt',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </div>

                        {data.receipt && (
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate text-sm">
                                        {data.receipt.name}
                                    </span>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setData('receipt', null)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        )}

                        {errors.receipt && (
                            <p className="text-sm text-destructive">
                                {errors.receipt}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Отмена
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Сохранение...'
                                : payment
                                    ? 'Сохранить изменения'
                                    : 'Добавить оплату'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


import { useState } from 'react'
import { toast } from 'sonner'
import { Package, Truck } from 'lucide-react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import type { Order } from '@/types/index.d'

import { DeliveryLocationForm } from './delivery-location-form'
import { DeliveryPackageForm } from './delivery-package-form'
import { DeliveryTariffs } from './delivery-tariffs'
import { DeliveryShipmentInfo } from './delivery-shipment-info'

import type {
    DeliveryTariff,
    PackageForm,
    RecipientForm,
    SenderForm,
} from '@/types/index'

interface OrderDeliveryProps {
    order: Order
}

/**
 * Основной блок управления доставкой заказа.
 *
 * Объединяет формы отправителя, получателя, посылки,
 * расчёт тарифов и информацию о созданном отправлении.
 */
export function OrderDelivery({ order }: OrderDeliveryProps) {
    // Данные отправителя.
    const [sender, setSender] = useState<SenderForm>({
        name: '',
        company: 'DropZeroStudio',
        phone: '',
        city: '',
        cityCode: null,
        deliveryType: 'pvz',
        address: '',
        pickupPoint: '',
    })

    // Данные получателя.
    const [recipient, setRecipient] = useState<RecipientForm>({
        name: '',
        phone: '',
        city: '',
        cityCode: null,
        deliveryType: 'pvz',
        address: '',
        pickupPoint: '',
    })

    // Параметры отправляемой посылки.
    const [packageData, setPackageData] = useState<PackageForm>({
        weight: 500,
        length: 20,
        width: 15,
        height: 10,
        comment: `Заказ #${order.id}`,
    })

    // Результаты расчёта доставки.
    const [tariffs, setTariffs] = useState<DeliveryTariff[]>([])
    const [selectedTariff, setSelectedTariff] = useState<number | null>(null)

    /**
     * Обновляет данные отправителя.
     */
    const updateSender = (
        key: keyof SenderForm | keyof RecipientForm,
        value: string | number | null,
    ) => {
        setSender((previous) => ({
            ...previous,
            [key]: value,
        }) as SenderForm)
    }

    /**
     * Обновляет данные получателя.
     */
    const updateRecipient = (
        key: keyof SenderForm | keyof RecipientForm,
        value: string | number | null,
    ) => {
        setRecipient((previous) => ({
            ...previous,
            [key]: value,
        }) as RecipientForm)
    }

    /**
     * Обновляет параметры посылки.
     */
    const updatePackage = (
        key: keyof PackageForm,
        value: string | number,
    ) => {
        setPackageData((previous) => ({
            ...previous,
            [key]: value,
        }) as PackageForm)
    }

    /**
     * Проверяет заполнение обязательных полей перед расчётом.
     */
    const validateDeliveryData = (): boolean => {
        if (!sender.name.trim() || !sender.phone.trim()) {
            toast.error('Заполните имя и телефон отправителя')
            return false
        }

        if (!sender.city.trim() || !sender.cityCode) {
            toast.error('Укажите город отправителя')
            return false
        }

        if (
            sender.deliveryType === 'pvz' &&
            !sender.pickupPoint.trim()
        ) {
            toast.error('Выберите пункт отправления СДЭК')
            return false
        }

        if (
            sender.deliveryType === 'address' &&
            !sender.address.trim()
        ) {
            toast.error('Укажите адрес отправителя')
            return false
        }

        if (!recipient.name.trim() || !recipient.phone.trim()) {
            toast.error('Заполните имя и телефон получателя')
            return false
        }

        if (!recipient.city.trim() || !recipient.cityCode) {
            toast.error('Укажите город получателя')
            return false
        }

        if (
            recipient.deliveryType === 'pvz' &&
            !recipient.pickupPoint.trim()
        ) {
            toast.error('Выберите пункт выдачи получателя')
            return false
        }

        if (
            recipient.deliveryType === 'address' &&
            !recipient.address.trim()
        ) {
            toast.error('Укажите адрес получателя')
            return false
        }

        const dimensions = [
            packageData.weight,
            packageData.length,
            packageData.width,
            packageData.height,
        ]

        if (dimensions.some((value) => value === '' || value <= 0)) {
            toast.error('Укажите корректные параметры посылки')
            return false
        }

        return true
    }

    /**
     * Запускает расчёт стоимости доставки.
     *
     * Здесь будет вызов Laravel endpoint с данными форм.
     */
    const handleCalculate = () => {
        if (!validateDeliveryData()) {
            return
        }

        setSelectedTariff(null)
        setTariffs([])

        toast.info('Следующий этап — подключение расчёта тарифов СДЭК')
    }

    /**
     * Обрабатывает создание отправления.
     *
     * Реальный запрос будет добавлен после подключения backend.
     */
    const handleCreateShipment = () => {
        if (selectedTariff === null) {
            toast.error('Сначала выберите тариф доставки')
            return
        }

        toast.info('Создание отправления подключим через Laravel API')
    }

    // Если отправление уже существует, показываем его данные.
    if (order.shipment) {
        return (
            <DeliveryShipmentInfo shipment={order.shipment} />
        )
    }

    return (
        <div className="space-y-6">
            {/* Отправитель */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Truck className="size-4 text-muted-foreground" />
                        Отправитель
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <DeliveryLocationForm
                        title="Данные отправителя"
                        form={sender}
                        isSender
                        onChange={updateSender}
                    />
                </CardContent>
            </Card>

            {/* Получатель */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Truck className="size-4 text-muted-foreground" />
                        Получатель
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <DeliveryLocationForm
                        title="Данные получателя"
                        form={recipient}
                        onChange={updateRecipient}
                    />
                </CardContent>
            </Card>

            {/* Параметры посылки */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="size-4 text-muted-foreground" />
                        Параметры посылки
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <DeliveryPackageForm
                        form={packageData}
                        onChange={updatePackage}
                    />
                </CardContent>
            </Card>

            {/* Тарифы доставки */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Расчёт доставки
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <DeliveryTariffs
                        tariffs={tariffs}
                        selectedTariff={selectedTariff}
                        loading={false}
                        onCalculate={handleCalculate}
                        onSelect={setSelectedTariff}
                    />

                    <Separator />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            После выбора тарифа можно будет создать отправление.
                        </p>

                        <Button
                            type="button"
                            disabled={selectedTariff === null}
                            onClick={handleCreateShipment}
                        >
                            Создать отправление
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

import { useState } from 'react'
import axios from 'axios'

import { Package, Truck } from 'lucide-react'

import { toast } from '@/components/ui/toast'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import type { Order } from '@/types'

import type {
    DeliveryTariff,
    PackageForm,
    RecipientForm,
    SenderForm,
} from '@/types/index'

import { DeliveryLocationForm } from './delivery-location-form'
import { DeliveryPackageForm } from './delivery-package-form'
import { DeliveryTariffs } from './delivery-tariffs'
import { DeliveryShipmentInfo } from './delivery-shipment-info'

interface OrderDeliveryProps {
    order: Order
}

/**
 * Формат ответа CdekCalculatorService.
 */
interface CdekTariffResponse {
    tariff_code: number
    tariff_name: string
    delivery_sum: number
    period_min: number | null
    period_max: number | null
}

/**
 * Основной блок управления доставкой заказа.
 *
 * Объединяет формы отправителя, получателя и посылки,
 * расчёт тарифов СДЭК и информацию о созданном отправлении.
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

    // Состояние загрузки расчёта тарифов.
    const [isCalculating, setIsCalculating] = useState(false)

    /**
     * Сбрасывает предыдущие результаты расчёта.
     */
    const resetTariffs = () => {
        setTariffs([])
        setSelectedTariff(null)
    }

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

        resetTariffs()
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

        resetTariffs()
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

        resetTariffs()
    }

    /**
     * Проверяет заполнение обязательных полей перед расчётом.
     */
    const validateDeliveryData = (): boolean => {
        if (!sender.name.trim() || !sender.phone.trim()) {
            toast.add({
                title: 'Заполните имя и телефон отправителя',
            })

            return false
        }

        if (!sender.city.trim() || !sender.cityCode) {
            toast.add({
                title: 'Укажите город отправителя',
            })

            return false
        }

        if (
            sender.deliveryType === 'pvz' &&
            !sender.pickupPoint.trim()
        ) {
            toast.add({
                title: 'Выберите пункт отправления СДЭК',
            })

            return false
        }

        if (
            sender.deliveryType === 'address' &&
            !sender.address.trim()
        ) {
            toast.add({
                title: 'Укажите адрес отправителя',
            })

            return false
        }

        if (!recipient.name.trim() || !recipient.phone.trim()) {
            toast.add({
                title: 'Заполните имя и телефон получателя',
            })

            return false
        }

        if (!recipient.city.trim() || !recipient.cityCode) {
            toast.add({
                title: 'Укажите город получателя',
            })

            return false
        }

        if (
            recipient.deliveryType === 'pvz' &&
            !recipient.pickupPoint.trim()
        ) {
            toast.add({
                title: 'Выберите пункт выдачи получателя',
            })

            return false
        }

        if (
            recipient.deliveryType === 'address' &&
            !recipient.address.trim()
        ) {
            toast.add({
                title: 'Укажите адрес получателя',
            })

            return false
        }

        const dimensions = [
            packageData.weight,
            packageData.length,
            packageData.width,
            packageData.height,
        ]

        if (
            dimensions.some(
                (value) => value === '' || Number(value) <= 0,
            )
        ) {
            toast.add({
                title: 'Укажите корректные параметры посылки',
            })

            return false
        }

        return true
    }

    /**
     * Формирует объект местоположения для API СДЭК.
     */
    const getLocationPayload = (
        cityCode: number,
        deliveryType: 'pvz' | 'address',
        address: string,
    ) => ({
        code: cityCode,
        ...(deliveryType === 'address' ? { address } : {}),
    })

    /**
     * Приводит ответ CdekCalculatorService к формату frontend.
     */
    const normalizeTariffs = (
        items: CdekTariffResponse[],
    ): DeliveryTariff[] => {
        return items.map((item) => ({
            code: Number(item.tariff_code),
            name: item.tariff_name,
            price: Number(item.delivery_sum),
            currency: 'RUB',
            deliveryMin: item.period_min,
            deliveryMax: item.period_max,
        }))
    }

    /**
     * Запускает расчёт стоимости доставки через Laravel API.
     */
    const handleCalculate = async () => {

        if (isCalculating || !validateDeliveryData()) {
            return
        }

        setIsCalculating(true)
        resetTariffs()

        try {
            const payload = {
                from_location: getLocationPayload(
                    sender.cityCode!,
                    sender.deliveryType,
                    sender.address,
                ),

                to_location: getLocationPayload(
                    recipient.cityCode!,
                    recipient.deliveryType,
                    recipient.address,
                ),

                packages: [
                    {
                        weight: Number(packageData.weight),
                        length: Number(packageData.length),
                        width: Number(packageData.width),
                        height: Number(packageData.height),
                    },
                ],

                ...(sender.deliveryType === 'pvz'
                    ? { shipment_point: sender.pickupPoint }
                    : {}),

                ...(recipient.deliveryType === 'pvz'
                    ? { delivery_point: recipient.pickupPoint }
                    : {}),
            }

            const response = await axios.post<{
                data: CdekTariffResponse[]
            }>(
                route('admin.cdek.calculate'),
                payload,
            )

            const calculatedTariffs = normalizeTariffs(
                response.data.data ?? [],
            )

            if (calculatedTariffs.length === 0) {
                toast.add({
                    title: 'Для указанного направления тарифы не найдены',
                })

                return
            }

            setTariffs(calculatedTariffs)

            toast.add({
                title: 'Тарифы доставки рассчитаны',
                description: `Найдено тарифов: ${calculatedTariffs.length}`,
            })
        } catch (error: unknown) {
            console.error('CDEK calculation failed:', error)

            if (axios.isAxiosError(error)) {
                console.error('HTTP status:', error.response?.status)
                console.error('Response data:', error.response?.data)

                const responseData = error.response?.data

                const message =
                    responseData?.message ??
                    responseData?.error ??
                    error.message ??
                    'Не удалось рассчитать стоимость доставки'

                toast.add({
                    title: 'Ошибка расчёта доставки',
                    description: String(message),
                })
            } else if (error instanceof Error) {
                toast.add({
                    title: 'Ошибка расчёта доставки',
                    description: error.message,
                })
            } else {
                toast.add({
                    title: 'Неизвестная ошибка расчёта доставки',
                    description: String(error),
                })
            }
        } finally {
            setIsCalculating(false)
        }
    }

    /**
     * Обрабатывает создание отправления.
     *
     * Подключим после завершения интеграции расчёта тарифов.
     */
    const handleCreateShipment = () => {
        if (selectedTariff === null) {
            toast.add({
                title: 'Сначала выберите тариф доставки',
            })

            return
        }

        toast.add({
            title: 'Создание отправления подключим следующим этапом',
        })
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
                        loading={isCalculating}
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

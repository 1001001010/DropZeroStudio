
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

import type {
    Order,
    DeliveryFormChangeValue,
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
 * Формат ответа при создании отправления.
 */
interface CdekShipmentResponse {
    message: string
    shipment: NonNullable<Order['shipment']>
}

/**
 * Основной блок управления доставкой заказа.
 *
 * Объединяет формы отправителя, получателя и посылки,
 * расчёт тарифов СДЭК и создание отправления.
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
        pickupPoint: null,
    })

    // Данные получателя.
    const [recipient, setRecipient] = useState<RecipientForm>({
        name: order.customer_name ?? '',
        phone: order.phone ?? '',
        city: '',
        cityCode: null,
        deliveryType: 'pvz',
        address: '',
        pickupPoint: null,
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

    // Состояния загрузки.
    const [isCalculating, setIsCalculating] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Локальное состояние отправления.
    const [shipment, setShipment] = useState(order.shipment)

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
        value: DeliveryFormChangeValue,
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
        value: DeliveryFormChangeValue,
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
     * Проверяет заполнение обязательных полей.
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

        if (sender.deliveryType === 'pvz' && !sender.pickupPoint) {
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

        if (recipient.deliveryType === 'pvz' && !recipient.pickupPoint) {
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
            // Города обязательны для СДЭК при любом способе доставки.
            // ПВЗ передаются дополнительно, если они выбраны.
            const payload = {
                from_location: {
                    code: sender.cityCode!,
                    ...(sender.deliveryType === 'address'
                        ? { address: sender.address }
                        : {}),
                },

                to_location: {
                    code: recipient.cityCode!,
                    ...(recipient.deliveryType === 'address'
                        ? { address: recipient.address }
                        : {}),
                },

                ...(sender.deliveryType === 'pvz'
                    ? {
                        shipment_point: sender.pickupPoint!.code,
                    }
                    : {}),

                ...(recipient.deliveryType === 'pvz'
                    ? {
                        delivery_point: recipient.pickupPoint!.code,
                    }
                    : {}),

                packages: [
                    {
                        weight: Number(packageData.weight),
                        length: Number(packageData.length),
                        width: Number(packageData.width),
                        height: Number(packageData.height),
                        comment: 'Коллекционная фигурка',
                    },
                ],
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

            toast.add({
                title: 'Ошибка расчёта доставки',
                description: getErrorMessage(error),
            })
        } finally {
            setIsCalculating(false)
        }
    }

    /**
     * Создаёт отправление в СДЭК.
     */
    const handleCreateShipment = async () => {
        if (isCreating) {
            return
        }

        if (selectedTariff === null) {
            toast.add({
                title: 'Сначала выберите тариф доставки',
            })

            return
        }

        if (!validateDeliveryData()) {
            return
        }

        const tariff = tariffs.find(
            (item) => item.code === selectedTariff,
        )

        if (!tariff) {
            toast.add({
                title: 'Выбранный тариф не найден',
                description: 'Повторите расчёт стоимости доставки.',
            })

            return
        }

        setIsCreating(true)

        try {
            const payload = {
                tariff_code: tariff.code,
                tariff_name: tariff.name,
                delivery_cost: tariff.price,
                currency: tariff.currency,

                delivery_mode: recipient.deliveryType,

                sender: {
                    name: sender.name,
                    company: sender.company,
                    phone: sender.phone,
                    city: sender.city,
                    city_code: sender.cityCode,

                    ...(sender.deliveryType === 'pvz'
                        ? {
                            shipment_point: sender.pickupPoint!.code,

                            // Сохраняем адрес выбранного пункта отправления.
                            address: sender.pickupPoint!.address_full
                                ?? sender.pickupPoint!.address
                                ?? '',

                            from_location: {
                                code: sender.cityCode!,
                            },
                        }
                        : {
                            address: sender.address,
                            from_location: {
                                code: sender.cityCode!,
                                address: sender.address,
                            },
                        }),
                },

                recipient: {
                    name: recipient.name,
                    phone: recipient.phone,
                    city: recipient.city,
                    city_code: recipient.cityCode,

                    ...(recipient.deliveryType === 'pvz'
                        ? {
                            delivery_point: recipient.pickupPoint!.code,
                            postal_code: recipient.pickupPoint!.postal_code,
                            address: recipient.pickupPoint!.address_full
                                ?? recipient.pickupPoint!.address,
                            to_location: {
                                code: recipient.cityCode!,
                            },
                        }
                        : {
                            address: recipient.address,
                            to_location: {
                                code: recipient.cityCode!,
                                address: recipient.address,
                            },
                        }),
                },

                packages: [
                    {
                        number: '1',
                        weight: Number(packageData.weight),
                        length: Number(packageData.length),
                        width: Number(packageData.width),
                        height: Number(packageData.height),
                        comment: 'Коллекционная фигурка',
                    },
                ],

                comment: packageData.comment,
            }

            const response = await axios.post<CdekShipmentResponse>(
                route('admin.cdek.shipments.store', {
                    order: order.id,
                }),
                payload,
            )

            setShipment(response.data.shipment)

            toast.add({
                title: 'Отправление создано',
                description: response.data.message,
            })
        } catch (error: unknown) {
            console.error('CDEK shipment creation failed:', error)

            toast.add({
                title: 'Не удалось создать отправление',
                description: getErrorMessage(error),
            })
        } finally {
            setIsCreating(false)
        }
    }

    /**
     * Извлекает понятное сообщение из ошибки Axios или Laravel.
     */
    const getErrorMessage = (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data

            // Laravel может вернуть ошибки валидации по отдельным полям.
            const validationErrors = responseData?.errors

            if (validationErrors && typeof validationErrors === 'object') {
                const firstError = Object.values(validationErrors)
                    .flat()
                    .find((message) => typeof message === 'string')

                if (firstError) {
                    return firstError
                }
            }

            return String(
                responseData?.message ??
                responseData?.error ??
                error.message ??
                'Неизвестная ошибка сервера',
            )
        }

        if (error instanceof Error) {
            return error.message
        }

        return 'Произошла неизвестная ошибка'
    }

    // Если отправление уже создано, показываем его данные.
    if (shipment) {
        return (
            <DeliveryShipmentInfo shipment={shipment} />
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
                            После выбора тарифа можно создать отправление в СДЭК.
                        </p>

                        <Button
                            type="button"
                            disabled={
                                selectedTariff === null ||
                                isCalculating ||
                                isCreating
                            }
                            onClick={handleCreateShipment}
                        >
                            {isCreating
                                ? 'Создание отправления...'
                                : 'Создать отправление'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

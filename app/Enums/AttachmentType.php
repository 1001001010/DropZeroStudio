<?php

namespace App\Enums;

enum AttachmentType: string
{
    /**
     * Подтверждение оплаты.
     */
    case PaymentReceipt = 'payment_receipt';

    /**
     * Документы, связанные с доставкой.
     */
    case ShippingDocument = 'shipping_document';

    /**
     * Фотография товара.
     */
    case ProductPhoto = 'product_photo';

    /**
     * Прочие файлы.
     */
    case Other = 'other';

    /**
     * Человекочитаемое название типа файла.
     */
    public function label(): string
    {
        return match ($this) {
            self::PaymentReceipt => 'Чек об оплате',
            self::ShippingDocument => 'Документ доставки',
            self::ProductPhoto => 'Фотография товара',
            self::Other => 'Другой файл',
        };
    }
}
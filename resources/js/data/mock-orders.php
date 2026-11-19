<?php

return [
    [
        'id' => 1,
        'number' => '#dzst-0001-ord',
        'status' => 'completed',
        'createdAt' => '2026-11-12T10:30:00+03:00',
        'updatedAt' => '2026-11-14T16:45:00+03:00',

        'customer' => [
            'id' => 1,
            'name' => 'Александр Иванов',
            'email' => 'alex@example.com',
            'phone' => '+7 900 123-45-67',
            'telegramId' => '123456789',
            'telegramUsername' => 'alexivanov',
        ],

        'items' => [
            [
                'id' => 1,
                'dropName' => 'Dark Collection',
                'figureName' => 'Darkling №001',
                'quantity' => 1,
                'unitPrice' => 1990,
                'totalPrice' => 1990,
                'imageUrl' => null,
            ],
        ],

        'payment' => [
            'status' => 'paid',
            'method' => 'Банковская карта',
            'provider' => 'ЮKassa',
            'transactionId' => 'txn_123456789',
            'currency' => 'RUB',
            'paidAt' => '2026-11-12T10:35:00+03:00',
            'rawResponse' => null,
        ],

        'delivery' => [
            'status' => 'delivered',
            'provider' => 'СДЭК',
            'trackingNumber' => '123456789012',
            'recipientName' => 'Александр Иванов',
            'phone' => '+7 900 123-45-67',
            'address' => 'Москва, ул. Примерная, д. 10',
            'rawResponse' => null,
        ],

        'subtotal' => 1990,
        'deliveryPrice' => 350,
        'discount' => 0,
        'total' => 2340,
        'comment' => 'Позвонить перед доставкой.',

        'history' => [
            [
                'id' => 1,
                'title' => 'Заказ создан',
                'description' => 'Покупатель оформил заказ.',
                'createdAt' => '2026-11-12T10:30:00+03:00',
                'actor' => null,
            ],
            [
                'id' => 2,
                'title' => 'Оплата получена',
                'description' => 'Платёж успешно подтверждён.',
                'createdAt' => '2026-11-12T10:35:00+03:00',
                'actor' => 'ЮKassa',
            ],
            [
                'id' => 3,
                'title' => 'Заказ доставлен',
                'description' => 'Посылка вручена получателю.',
                'createdAt' => '2026-11-14T16:45:00+03:00',
                'actor' => 'СДЭК',
            ],
        ],
    ],
];

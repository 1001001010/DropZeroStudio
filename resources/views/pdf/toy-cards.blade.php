<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">

    <style>
        @page {
            margin: 10mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            background: #ffffff;
            color: #111111;
        }

        .card {
            width: 100%;
            height: 175mm;
            border: 2px solid #111111;
            padding: 12mm;
            margin-bottom: 10mm;
            box-sizing: border-box;
            page-break-after: always;
            text-align: center;
        }

        .brand {
            font-size: 25px;
            font-weight: bold;
            letter-spacing: 4px;
        }

        .edition {
            margin-top: 35mm;
            color: #777777;
            font-size: 11px;
            letter-spacing: 2px;
        }

        .number {
            font-size: 34px;
            font-weight: bold;
            margin: 12px 0;
        }

        .code {
            font-size: 22px;
            color: #AA141E;
            font-weight: bold;
        }

        .secret-label {
            margin-top: 35mm;
            font-size: 11px;
            color: #777777;
        }

        .secret {
            margin-top: 12px;
            font-size: 23px;
            font-weight: bold;
            letter-spacing: 2px;
        }

        .warning {
            margin-top: 25px;
            font-size: 9px;
            color: #777777;
        }
    </style>
</head>

<body>

    @foreach ($toys as $toy)
        <div class="card">

            <div class="brand">
                DROPZERO
            </div>

            <div class="edition">
                LIMITED EDITION
            </div>

            <div class="number">
                № {{ str_pad($toy['number'], 3, '0', STR_PAD_LEFT) }}
                / {{ str_pad($editionSize, 3, '0', STR_PAD_LEFT) }}
            </div>

            <div class="code">
                {{ $toy['code'] }}
            </div>

            <div class="secret-label">
                YOUR SECRET ACTIVATION KEY
            </div>

            <div class="secret">
                {{ $toy['secret'] }}
            </div>

            <div class="warning">
                Keep this card safe. Do not share your secret.
            </div>

        </div>
    @endforeach

</body>

</html>

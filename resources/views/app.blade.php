<!DOCTYPE html>
<html lang="ru">

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="theme-color" content="#050505">

    <meta name="description"
        content="DropZeroStudio — лимитированная коллекция коллекционных фигурок. Уникальные дизайны, ограниченные серии и цифровая регистрация владельца.">

    <meta name="keywords"
        content="DropZeroStudio, коллекционные фигурки, коллекционные игрушки, плюшевые фигурки, лимитированные фигурки, коллекционирование">

    <meta name="author" content="DropZeroStudio">   

    <meta name="robots" content="index, follow">

    {{-- Open Graph --}}

    <meta property="og:type" content="website">

    <meta property="og:locale" content="ru_RU">

    <meta property="og:site_name" content="DropZeroStudio">

    <meta property="og:title" content="DropZeroStudio — Коллекционные фигурки">

    <meta property="og:description"
        content="Лимитированные коллекционные фигурки DropZeroStudio. Открой свою коллекцию.">

    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">

    <meta property="og:image:width" content="1200">

    <meta property="og:image:height" content="630">

    <meta property="og:image:alt" content="DropZeroStudio — коллекционные фигурки">

    {{-- Twitter --}}

    <meta name="twitter:card" content="summary_large_image">

    <meta name="twitter:title" content="DropZeroStudio — Коллекционные фигурки">

    <meta name="twitter:description" content="Лимитированные коллекционные фигурки DropZeroStudio.">

    <meta name="twitter:image" content="{{ asset('images/og-image.jpg') }}">

    {{-- Favicon --}}

    <link rel="icon" href="{{ asset('images/icon.svg') }}" type="image/svg+xml">

    <link rel="apple-touch-icon" href="{{ asset('images/apple-icon.png') }}">

    {{-- Fonts --}}

    <link rel="preconnect" href="https://fonts.bunny.net">

    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet">

    <title inertia>
        {{ config('app.name', 'DropZeroStudio') }}
    </title>

    @routes

    @viteReactRefresh

    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

    @inertiaHead
</head>

<body class="font-sans antialiased bg-[#050505] text-white">

    @inertia

</body>

</html>

<!DOCTYPE html>
<html lang="ru">

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="theme-color" content="#050505">

    <meta name="author" content="DropZeroStudio">

    {{-- Open Graph --}}

    <meta property="og:type" content="website">

    <meta property="og:locale" content="ru_RU">

    <meta property="og:site_name" content="DropZeroStudio">

    <meta property="og:image:width" content="1200">

    <meta property="og:image:height" content="630">

    <meta property="og:image:alt" content="DropZeroStudio — коллекционные фигурки">

    {{-- Twitter --}}

    <meta name="twitter:card" content="summary_large_image">

    {{-- Favicon --}}

    <link rel="icon" href="{{ asset('images/icon.svg') }}" type="image/svg+xml">

    <link rel="apple-touch-icon" href="{{ asset('images/apple-icon.png') }}">

    {{-- Fonts --}}

    <link rel="preload" href="/fonts/instrument-sans/InstrumentSans-Regular.woff2" as="font" type="font/woff2"
        crossorigin>

    <title inertia>DropZeroStudio</title>

    @routes

    @viteReactRefresh

    <script>
        (() => {
            try {
                const appearance = localStorage.getItem('appearance') || 'system';

                const isDark = appearance === 'dark' ||
                    (
                        appearance === 'system' &&
                        window.matchMedia('(prefers-color-scheme: dark)').matches
                    );

                document.documentElement.classList.toggle('dark', isDark);
            } catch {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    @inertiaHead
</head>

<body class="font-sans antialiased bg-[#050505] text-white">

    @inertia

</body>

</html>

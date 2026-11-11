import "../css/app.css"

import { createInertiaApp } from "@inertiajs/react"
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers"
import { hydrateRoot } from 'react-dom/client';
import { route as routeFn } from "ziggy-js"

import { initializeTheme } from "./hooks/use-appearance"
declare global {
    const route: typeof routeFn
}


createInertiaApp({
    title: (title) => title,

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob("./pages/**/*.tsx")
        ),

    setup({ el, App, props }) {
        hydrateRoot(el, <App {...props} />);
    },

    progress: {
        color: "#AA141E",
    },
})

initializeTheme()

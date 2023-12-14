/** @type {import("prettier").Config} */
export default {
    /* Konfiguracja główna - skopiowana z poziomu najwyższego */

    arrowParens: 'avoid',
    semi: false,
    tabWidth: 4,
    singleQuote: true,

    /* Konfiguracja dla UI */

    // plugin tailwindcss musi być ostatni
    plugins: [
        'prettier-plugin-svelte',
        'prettier-plugin-organize-imports',
        'prettier-plugin-tailwindcss',
    ],
    overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
}

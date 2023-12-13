/** @type {import("prettier").Config} */
export default {
    /* Konfiguracja główna - skopiowana z poziomu najwyższego */

    arrowParens: 'avoid',
    semi: false,
    tabWidth: 4,
    singleQuote: true,

    /* Konfiguracja dla UI */

    plugins: ['prettier-plugin-svelte'],
    overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
}

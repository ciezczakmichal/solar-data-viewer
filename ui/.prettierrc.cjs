module.exports = {
    /* Konfiguracja główna - skopiowana z poziomu najwyższego */

    arrowParens: 'avoid',
    semi: false,
    tabWidth: 4,
    singleQuote: true,

    /* Konfiguracja dla UI */

    plugins: ['prettier-plugin-svelte'],
    pluginSearchDirs: ['.'],
    overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
}

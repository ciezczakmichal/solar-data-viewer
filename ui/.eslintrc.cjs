module.exports = {
    root: true,
    extends: ['../.eslintrc', 'plugin:svelte/recommended'],
    ignorePatterns: ['*.cjs'],
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        extraFileExtensions: ['.svelte'],
    },
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
}

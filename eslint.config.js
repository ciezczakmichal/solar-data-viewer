import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import svelteConfig from './ui/svelte.config.js'

export default ts.config(
    js.configs.recommended,
    ...ts.configs.recommendedTypeChecked,
    ...svelte.configs.recommended,
    prettier,
    ...svelte.configs.prettier,
    perfectionist.configs['recommended-natural'],
    {
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
                projectService: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/unbound-method': [
                'error',
                {
                    ignoreStatic: true,
                },
            ],
        },
    },
    {
        files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig,
            },
        },
    },
    {
        // konieczne z uwagi na nierozpoznawanie przez ESLint typów komponentów
        // https://github.com/sveltejs/eslint-plugin-svelte/issues/298
        files: ['**/*.svelte'],
        ...ts.configs.disableTypeChecked,
    },
    {
        files: ['**/*.svelte'],
        rules: {
            'svelte/sort-attributes': [
                'error',
                {
                    order: [
                        // this musi być na początku, ponieważ koliduje z prettier-plugin-svelte; nie obejmuje to bind:this
                        // https://github.com/sveltejs/prettier-plugin-svelte/issues/443
                        'this',
                        {
                            match: '/^.*/u',
                            sort: 'alphabetical',
                        },
                    ],
                },
            ],
        },
    },
    {
        ignores: [
            '**/build/',
            '**/dist/',
            '**/.svelte-kit/',
            '**/.prettierrc.js',
            '**/*.config.js',
            '**/*.config.ts',
            '**/vitest-setup-client.ts',

            // lokalne
            'schema/**/generated/*.js',
        ],
    },
    {
        rules: {
            // wyłączenia konfliktowe dla eslint-plugin-perfectionist
            'import/order': 'off',
            'sort-imports': 'off',
            'react/jsx-sort-props': 'off',
            '@typescript-eslint/adjacent-overload-signatures': 'off',
            '@typescript-eslint/sort-type-constituents': 'off',

            'perfectionist/sort-classes': 'off',
            'perfectionist/sort-enums': 'off',
            'perfectionist/sort-interfaces': 'off',
            'perfectionist/sort-modules': 'off',
            'perfectionist/sort-objects': 'off',
            'perfectionist/sort-imports': [
                'error',
                {
                    type: 'natural',
                    newlinesBetween: 'never',
                    ignoreCase: true,
                },
            ],
        },
    },
    {
        rules: {
            'no-duplicate-imports': 2,
        },
    },
)

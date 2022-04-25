// w przyszłości to się może przydać:
// https://daveceddia.com/svelte-typescript-jest/
// https://dev.to/robole/testing-svelte-components-with-jest-and-vite-219d
export default {
    preset: 'ts-jest/presets/default-esm',
    rootDir: '.',
    testEnvironment: 'jsdom', // zmienione (z node)
    setupFilesAfterEnv: ['jest-extended'],
    testPathIgnorePatterns: ['public'], // zmienione (z dist)

    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
}

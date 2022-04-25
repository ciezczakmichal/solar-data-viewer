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

export default {
    preset: 'ts-jest/presets/default-esm',
    rootDir: '.',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
    testPathIgnorePatterns: ['dist'],

    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
}

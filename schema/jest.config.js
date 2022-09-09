export default {
    preset: 'ts-jest/presets/default-esm',
    rootDir: '.',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
    testPathIgnorePatterns: ['dist'],

    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}
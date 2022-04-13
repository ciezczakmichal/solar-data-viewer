export default {
    preset: 'ts-jest',
    rootDir: '.',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
    testPathIgnorePatterns: ['dist'],
}

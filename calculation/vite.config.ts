import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./src/utils/dayjs-import.ts'],
    },
})

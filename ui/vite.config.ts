import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        setupFiles: ['./src/lib/global/dayjs-import.ts'],
    },
})

/// <reference types="vitest" />
import { defineConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/lib/global/dayjs-import.ts'],
    },
})

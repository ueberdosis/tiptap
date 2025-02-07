import path from 'path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@tiptap/extension-bold': path.join(__dirname, 'packages/extension-bold/src'),
      '@tiptap/extension-document': path.join(__dirname, 'packages/extension-document/src'),
      '@tiptap/extension-paragraph': path.join(__dirname, 'packages/extension-paragraph/src'),
      '@tiptap/extension-text': path.join(__dirname, 'packages/extension-text/src'),
    },
    preserveSymlinks: true,
  },
}) satisfies UserConfig

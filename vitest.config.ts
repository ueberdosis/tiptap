import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      // @tiptap/foo -> <root>/packages/foo/src
      { find: /^@tiptap\/([^/]+)$/, replacement: path.resolve(__dirname, 'packages/$1/src') },
      // @tiptap/foo/anything -> <root>/packages/foo/anything
      { find: /^@tiptap\/([^/]+)\/(.*)$/, replacement: path.resolve(__dirname, 'packages/$1/$2') },
    ],
  },
  test: {
    environment: 'happy-dom',
    // only pick tests from packages/*
    include: ['packages/*/**/*.{test,spec}.{ts,tsx,js}'],
    // make sure vitest treats repo root as the root
    root: __dirname,

    coverage: {
      include: ['packages/**/*'],
    },
  },
})

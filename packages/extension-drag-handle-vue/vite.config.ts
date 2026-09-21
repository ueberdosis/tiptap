import { defineConfig } from 'vite-plus'
import { basePackConfig } from '../../pack.config.mjs'

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    ...basePackConfig(),
  },
})

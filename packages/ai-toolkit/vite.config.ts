import { defineConfig } from 'vite-plus'
import { basePackConfig } from '../../pack.config.mjs'

export default defineConfig({
  pack: {
    entry: ['src/index.ts', 'src/streaming-reveal.ts'],
    ...basePackConfig(),
    // Keep lazy collaboration peers in the same module format as the editor.
    outputOptions: { dynamicImportInCjs: false },
  },
})

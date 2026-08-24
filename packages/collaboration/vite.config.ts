import { defineConfig } from 'vite-plus'
import { basePackConfig, tsupCompatibleExtensions } from '../../pack.config.mjs'

export default defineConfig({
  pack: [
    {
      ...basePackConfig(),
      entry: ['src/index.ts'],
      outDir: 'dist',
    },
    {
      ...basePackConfig(),
      entry: ['src/caret/index.ts'],
      outDir: 'dist/caret',
      clean: false,
      // self-references and third-party deps stay external so nothing is duplicated
      deps: { neverBundle: [/^[^./]/] },
      outExtensions: tsupCompatibleExtensions,
    },
  ],
})

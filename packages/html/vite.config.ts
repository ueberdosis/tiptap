import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

export default defineConfig({
  pack: {
    entry: ['src/index.ts', 'src/server/index.ts'],
    tsconfig: '../../tsconfig.build.json',
    outDir: 'dist',
    dts: true,
    clean: true,
    splitting: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    outExtensions: tsupCompatibleExtensions,
  },
})

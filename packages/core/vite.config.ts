import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

export default defineConfig({
  pack: [
    {
      entry: ['src/index.ts'],
      tsconfig: '../../tsconfig.build.json',
      outDir: 'dist',
      dts: { sourcemap: true },
      clean: true,
      sourcemap: true,
      target: 'es2022',
      format: ['esm', 'cjs'],
      outExtensions: tsupCompatibleExtensions,
    },
    {
      entry: ['src/jsx-runtime.ts'],
      tsconfig: '../../tsconfig.build.json',
      outDir: 'dist/jsx-runtime',
      dts: { sourcemap: true },
      clean: true,
      sourcemap: true,
      target: 'es2022',
      format: ['esm', 'cjs'],
      outExtensions: tsupCompatibleExtensions,
    },
  ],
})

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: false, // TODO: Fix TypeScript errors and re-enable
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
})

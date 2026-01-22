import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: false,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  external: [/^[^./]/],
})

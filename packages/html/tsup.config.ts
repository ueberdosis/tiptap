import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/server/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: false,
  clean: true,
  splitting: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
})

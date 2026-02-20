import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/server/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  target: false,
})

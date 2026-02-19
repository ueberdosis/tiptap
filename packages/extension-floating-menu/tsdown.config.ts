import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  target: false,
  external: [/^@floating-ui/],
})

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  // purposefully not using the build tsconfig, so @tiptap/core's types can be resolved correctly
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
})

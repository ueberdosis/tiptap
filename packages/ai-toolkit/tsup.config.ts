import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', 'streaming-reveal': 'src/streaming-reveal.ts' },
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
})

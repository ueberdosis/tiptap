import { defineConfig } from 'tsup'

export default defineConfig(options => {
  return {
    entry: options.entry,
    outDir: options.outDir,
    dts: true,
    splitting: true,
    clean: true,
    format: [
      'esm',
      'cjs',
    ],
  }
})

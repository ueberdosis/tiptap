import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    // purposefully not using the build tsconfig, so @dibdab/core's types can be resolved correctly
    outDir: 'dist',
    // Temporarily disabled DTS generation due to TypeScript module augmentation issues
    // TODO: Fix TypeScript errors in command files and re-enable
    dts: false,
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
  {
    entry: ['src/jsx-runtime.ts'],
    tsconfig: '../../tsconfig.build.json',
    outDir: 'dist/jsx-runtime',
    // Temporarily disabled DTS generation due to TypeScript module augmentation issues
    // TODO: Fix TypeScript errors and re-enable
    dts: false,
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
])

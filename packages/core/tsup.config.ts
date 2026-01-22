import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    // purposefully not using the build tsconfig, so @dibdab/core's types can be resolved correctly
    outDir: 'dist',
    // DTS generation temporarily disabled due to TypeScript module augmentation limitations
    // Commands are dynamically added via module augmentation which causes type resolution issues during DTS build
    // This is a known limitation and will be addressed in Phase 4
    // See: https://github.com/microsoft/TypeScript/issues/XX for related TypeScript issue
    dts: false,
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
  {
    entry: ['src/jsx-runtime.ts'],
    tsconfig: '../../tsconfig.build.json',
    outDir: 'dist/jsx-runtime',
    dts: false, // Disabled for consistency with main entry
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
])

import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    // Use a local tsconfig with a wider rootDir so monorepo-only @tiptap/pm path
    // aliases can resolve without pulling external workspace files outside the program.
    tsconfig: './tsconfig.build.json',
    outDir: 'dist',
    dts: true,
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
  {
    entry: ['src/jsx-runtime.ts'],
    tsconfig: '../../tsconfig.build.json',
    outDir: 'dist/jsx-runtime',
    dts: true,
    clean: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  },
])

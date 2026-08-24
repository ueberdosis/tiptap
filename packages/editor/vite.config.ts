import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

export default defineConfig({
  pack: [
    {
      entry: ['src/index.ts'],
      // Use a local tsconfig with a wider rootDir so monorepo-only @tiptap/pm path
      // aliases can resolve without pulling external workspace files outside the program.
      tsconfig: './tsconfig.build.json',
      outDir: 'dist',
      dts: { sourcemap: true },
      clean: true,
      sourcemap: true,
      target: 'es2019',
      format: ['esm', 'cjs'],
      outExtensions: tsupCompatibleExtensions,
    },
    {
      entry: ['src/jsx-runtime.ts'],
      tsconfig: '../../tsconfig.build.json',
      outDir: 'dist/jsx-runtime',
      dts: { sourcemap: true },
      clean: true,
      sourcemap: true,
      target: 'es2019',
      format: ['esm', 'cjs'],
      outExtensions: tsupCompatibleExtensions,
    },
  ],
})

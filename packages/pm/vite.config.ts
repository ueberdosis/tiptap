import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

export default defineConfig({
  pack: {
    entry: [
      'changeset/index.ts',
      'commands/index.ts',
      'dropcursor/index.ts',
      'gapcursor/index.ts',
      'history/index.ts',
      'inputrules/index.ts',
      'keymap/index.ts',
      'model/index.ts',
      'schema-list/index.ts',
      'state/index.ts',
      'tables/index.ts',
      'transform/index.ts',
      'view/index.ts',
    ],
    tsconfig: '../../tsconfig.build.json',
    outDir: 'dist',
    dts: true,
    splitting: true,
    clean: true,
    format: ['esm', 'cjs'],
    outExtensions: tsupCompatibleExtensions,
  },
})

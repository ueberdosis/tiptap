import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'changeset/index.ts',
    'collab/index.ts',
    'commands/index.ts',
    'dropcursor/index.ts',
    'gapcursor/index.ts',
    'history/index.ts',
    'inputrules/index.ts',
    'keymap/index.ts',
    'markdown/index.ts',
    'menu/index.ts',
    'model/index.ts',
    'schema-basic/index.ts',
    'schema-list/index.ts',
    'state/index.ts',
    'tables/index.ts',
    'trailing-node/index.ts',
    'transform/index.ts',
    'view/index.ts',
  ],
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: true,
  splitting: true,
  clean: true,
  format: [
    'esm',
    'cjs',
  ],
})

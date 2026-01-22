import { defineConfig } from 'tsup'

export default defineConfig(
  [
    'src/bullet-list/index.ts',
    'src/item/index.ts',
    'src/keymap/index.ts',
    'src/kit/index.ts',
    'src/ordered-list/index.ts',
    'src/task-item/index.ts',
    'src/task-list/index.ts',
    'src/index.ts',
  ].map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: false,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
  })),
)

import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

const entries = [
  'src/bullet-list/index.ts',
  'src/item/index.ts',
  'src/keymap/index.ts',
  'src/kit/index.ts',
  'src/ordered-list/index.ts',
  'src/task-item/index.ts',
  'src/task-list/index.ts',
  'src/index.ts',
]

export default defineConfig({
  pack: entries.map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
    outExtensions: tsupCompatibleExtensions,
  })),
})

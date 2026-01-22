import { defineConfig } from 'tsup'

export default defineConfig(
  ['src/index.ts', 'src/menus/index.ts'].map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: false, // TODO: Fix TypeScript errors and re-enable
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
  })),
)

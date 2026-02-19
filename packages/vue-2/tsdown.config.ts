import { defineConfig } from 'tsdown'

export default defineConfig(
  ['src/menus/index.ts', 'src/index.ts'].map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
  })),
)

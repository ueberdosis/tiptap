import { defineConfig } from 'vite-plus'
import { tsupCompatibleExtensions } from '../../pack.config.mjs'

const entries = ['src/menus/index.ts', 'src/index.ts']

export default defineConfig({
  pack: entries.map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: { sourcemap: true },
    sourcemap: true,
    target: 'es2019',
    format: ['esm', 'cjs'],
    outExtensions: tsupCompatibleExtensions,
  })),
})

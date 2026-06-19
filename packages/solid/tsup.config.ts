import { solidPlugin } from 'esbuild-plugin-solid'
import { defineConfig } from 'tsup'

export default defineConfig(
  ['src/index.tsx', 'src/menus/index.tsx'].map(entry => ({
    entry: [entry],
    tsconfig: './tsconfig.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
    esbuildPlugins: [solidPlugin()],
  })),
)

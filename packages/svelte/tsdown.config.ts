import { type UserConfig, defineConfig } from 'tsdown'

export default defineConfig(
  ['src/components/menus/index.ts', 'src/index.ts'].map<UserConfig>(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist/${entry.replace('src/', '').replace('components/', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/, /\.svelte(\.(ts|js))?$/],
  })),
)

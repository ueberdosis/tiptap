import { type UserConfig, defineConfig } from 'tsdown'

export default defineConfig(
  ['src/index.ts', 'src/menus/index.ts'].map<UserConfig>(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
  })),
)

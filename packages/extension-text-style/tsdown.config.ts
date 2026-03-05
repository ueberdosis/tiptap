import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    'src/background-color/index.ts',
    'src/color/index.ts',
    'src/font-family/index.ts',
    'src/font-size/index.ts',
    'src/line-height/index.ts',
    'src/text-style/index.ts',
    'src/text-style-kit/index.ts',
    'src/index.ts',
  ].map(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist${entry.replace('src', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
  })),
)

import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    'src/json/html-string/index.ts',
    'src/json/react/index.ts',
    'src/json/renderer.ts',
    'src/pm/react/index.ts',
    'src/pm/html-string/index.ts',
    'src/pm/markdown/index.ts',
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

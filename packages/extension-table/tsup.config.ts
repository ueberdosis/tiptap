import { defineConfig } from 'tsup'

export default defineConfig(
  [
    'src/table/index.ts',
    'src/table-cell/index.ts',
    'src/table-header/index.ts',
    'src/table-kit/index.ts',
    'src/table-row/index.ts',
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

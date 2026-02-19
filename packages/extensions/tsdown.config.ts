import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    'src/character-count/index.ts',
    'src/drop-cursor/index.ts',
    'src/focus/index.ts',
    'src/gap-cursor/index.ts',
    'src/undo-redo/index.ts',
    'src/placeholder/index.ts',
    'src/selection/index.ts',
    'src/trailing-node/index.ts',
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

import { defineConfig } from 'vite-plus'
import { basePackConfig, tsupCompatibleExtensions } from '../../pack.config.mjs'

/** Keep in sync with the `exports` map in package.json. */
const subExports = [
  'extensions/character-count',
  'extensions/drop-cursor',
  'extensions/focus',
  'extensions/gap-cursor',
  'extensions/placeholder',
  'extensions/selection',
  'extensions/trailing-node',
  'extensions/undo-redo',
  'pm/changeset',
  'pm/commands',
  'pm/dropcursor',
  'pm/gapcursor',
  'pm/history',
  'pm/inputrules',
  'pm/keymap',
  'pm/model',
  'pm/schema-list',
  'pm/state',
  'pm/tables',
  'pm/transform',
  'pm/view',
]

export default defineConfig({
  pack: [
    {
      ...basePackConfig(),
      entry: ['src/index.ts'],
      outDir: 'dist',
    },
    {
      ...basePackConfig(),
      entry: ['src/jsx-runtime.ts'],
      outDir: 'dist/jsx-runtime',
    },
    ...subExports.map(subpath => ({
      ...basePackConfig(),
      entry: [`src/${subpath}/index.ts`],
      outDir: `dist/${subpath}`,
      clean: false,
      // self-references and third-party deps stay external so nothing is duplicated
      deps: { neverBundle: [/^[^./]/] },
      outExtensions: tsupCompatibleExtensions,
    })),
  ],
})

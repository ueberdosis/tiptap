import { defineConfig } from 'vite-plus'
import { basePackConfig, tsupCompatibleExtensions } from '../../pack.config.mjs'

const pmSubExports = [
  'changeset',
  'commands',
  'dropcursor',
  'gapcursor',
  'history',
  'inputrules',
  'keymap',
  'model',
  'schema-list',
  'state',
  'tables',
  'transform',
  'view',
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
    ...pmSubExports.map(name => ({
      ...basePackConfig(),
      entry: [`src/pm/${name}/index.ts`],
      outDir: `dist/pm/${name}`,
      clean: false,
      // keep self-references and prosemirror imports external so nothing is duplicated
      deps: { neverBundle: [/^[^./]/] },
      outExtensions: tsupCompatibleExtensions,
    })),
  ],
})

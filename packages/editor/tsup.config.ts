import { defineConfig } from 'tsup'

const entries = [
  'src/index.ts',
  'src/react/index.ts',
  'src/nodes/document.ts',
  'src/nodes/paragraph.ts',
  'src/nodes/text.ts',
  'src/nodes/heading.ts',
  'src/nodes/blockquote.ts',
  'src/nodes/code-block.ts',
  'src/nodes/bullet-list.ts',
  'src/nodes/ordered-list.ts',
  'src/nodes/list-item.ts',
  'src/marks/bold.ts',
  'src/marks/italic.ts',
  'src/marks/strike.ts',
  'src/marks/code.ts',
  'src/marks/link.ts',
  'src/extensions/history.ts',
  'src/extensions/dropcursor.ts',
  'src/extensions/gapcursor.ts',
  'src/extensions/placeholder.ts',
  'src/extensions/character-count.ts',
  'src/kits/starter.ts',
]

export default defineConfig(
  entries.map(entry => {
    const segments = entry.replace(/^src\//, '').split('/')
    const fileName = segments.pop()!.replace(/\.tsx?$/, '')
    const outDir = `dist${segments.length ? `/${segments.join('/')}` : ''}`

    return {
      entry: { [fileName]: entry },
      tsconfig: '../../tsconfig.build.json',
      outDir,
      dts: true,
      sourcemap: true,
      format: ['esm', 'cjs'],
      external: [/^[^./]/],
    }
  }),
)

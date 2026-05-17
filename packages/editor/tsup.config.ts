import { defineConfig } from 'tsup'

type Entry = {
  /** Filename basename (no extension). Becomes the dist output file name. */
  name: string
  /** Path to the entrypoint, relative to the package root. */
  input: string
  /** Output directory, relative to the package root. */
  outDir: string
}

const entries: Entry[] = [
  // Root + framework adapter
  { name: 'index', input: 'src/index.ts', outDir: 'dist' },
  { name: 'index', input: 'src/react/index.ts', outDir: 'dist/react' },

  // Nodes (flat, except those that need supporting files)
  { name: 'document', input: 'src/nodes/document.ts', outDir: 'dist/nodes' },
  { name: 'paragraph', input: 'src/nodes/paragraph.ts', outDir: 'dist/nodes' },
  { name: 'text', input: 'src/nodes/text.ts', outDir: 'dist/nodes' },
  { name: 'heading', input: 'src/nodes/heading.ts', outDir: 'dist/nodes' },
  { name: 'blockquote', input: 'src/nodes/blockquote.tsx', outDir: 'dist/nodes' },
  { name: 'code-block', input: 'src/nodes/code-block.ts', outDir: 'dist/nodes' },
  { name: 'hard-break', input: 'src/nodes/hard-break.ts', outDir: 'dist/nodes' },
  { name: 'horizontal-rule', input: 'src/nodes/horizontal-rule.ts', outDir: 'dist/nodes' },
  { name: 'bullet-list', input: 'src/nodes/bullet-list.ts', outDir: 'dist/nodes' },
  { name: 'ordered-list', input: 'src/nodes/ordered-list/index.ts', outDir: 'dist/nodes' },
  { name: 'list-item', input: 'src/nodes/list-item.ts', outDir: 'dist/nodes' },
  { name: 'task-list', input: 'src/nodes/task-list.ts', outDir: 'dist/nodes' },
  { name: 'task-item', input: 'src/nodes/task-item.ts', outDir: 'dist/nodes' },

  // Marks
  { name: 'bold', input: 'src/marks/bold.tsx', outDir: 'dist/marks' },
  { name: 'italic', input: 'src/marks/italic.ts', outDir: 'dist/marks' },
  { name: 'strike', input: 'src/marks/strike.ts', outDir: 'dist/marks' },
  { name: 'code', input: 'src/marks/code.ts', outDir: 'dist/marks' },
  { name: 'underline', input: 'src/marks/underline.ts', outDir: 'dist/marks' },
  { name: 'link', input: 'src/marks/link/index.ts', outDir: 'dist/marks' },

  // Extensions
  { name: 'history', input: 'src/extensions/history.ts', outDir: 'dist/extensions' },
  { name: 'dropcursor', input: 'src/extensions/dropcursor.ts', outDir: 'dist/extensions' },
  { name: 'gapcursor', input: 'src/extensions/gapcursor.ts', outDir: 'dist/extensions' },
  { name: 'placeholder', input: 'src/extensions/placeholder.ts', outDir: 'dist/extensions' },
  { name: 'character-count', input: 'src/extensions/character-count.ts', outDir: 'dist/extensions' },
  { name: 'focus', input: 'src/extensions/focus.ts', outDir: 'dist/extensions' },
  { name: 'selection', input: 'src/extensions/selection.ts', outDir: 'dist/extensions' },
  { name: 'trailing-node', input: 'src/extensions/trailing-node.ts', outDir: 'dist/extensions' },
  { name: 'list-keymap', input: 'src/extensions/list-keymap/index.ts', outDir: 'dist/extensions' },

  // Kits
  { name: 'starter', input: 'src/kits/starter.ts', outDir: 'dist/kits' },
  { name: 'list', input: 'src/kits/list.ts', outDir: 'dist/kits' },
]

export default defineConfig(
  entries.map(entry => ({
    entry: { [entry.name]: entry.input },
    tsconfig: '../../tsconfig.build.json',
    outDir: entry.outDir,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    external: [/^[^./]/],
  })),
)
